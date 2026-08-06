#!/usr/bin/env python3
"""On-box watchdog for proclubshq.com. Runs from cron; emails only on change.

**This does not replace an external uptime monitor, and cannot.** A process on
the box can say nothing about the box being unreachable — if the host is down,
so is this. The two layers catch different things:

    external pinger  -> "the site is not answering"
    this             -> "the site is answering, and something is still wrong"

The second category is the one that goes unnoticed for weeks: a TLS certificate
that quietly stopped renewing, Atlas dropping the server from its IP access
list, a disk filling with logs, or a nightly backup that has silently produced
nothing since a config change. That last one is why this exists — the Ghost
backup broke on 2026-08-06 when the domain moved, and it was found by accident
rather than by an alert.

Alerts go out over the same Resend SMTP credentials the app uses, read from
/opt/clubs27-api/.env. Mail only became possible on 2026-08-06 (#13); before
that a watchdog had nowhere to shout.

Noise is the thing that kills a monitor: one that emails every run gets
filtered, and then it is worse than nothing because it looks like coverage.
So this emails on **transitions** — when a check starts failing, and again when
it recovers — never on steady state.
"""
import json
import os
import shutil
import smtplib
import ssl
import subprocess
import sys
import time
import urllib.request
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path

ENV_FILE = Path("/opt/clubs27-api/.env")
STATE_FILE = Path("/var/lib/clubs27-watchdog/state.json")
CERT = Path("/etc/letsencrypt/proclubshq.com_ecc/fullchain.cer")
BACKUP_DIR = Path("/var/backups/clubs27")

CERT_WARN_DAYS = 21        # Let's Encrypt renews at ~30 days left
DISK_WARN_PCT = 85
BACKUP_MAX_AGE_H = 36      # nightly at 03:30, so >36h means a run was missed


def load_env(path: Path) -> dict:
    env = {}
    if not path.exists():
        return env
    for line in path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k] = v.strip().strip('"')
    return env


# ---------------------------------------------------------------- checks ----
# Each returns (ok, detail). Detail is shown in the alert, so it should say
# what is wrong specifically enough to act on without logging into the box.

def check_api():
    """The app's own health route: 200 only when Atlas answers, else 503."""
    try:
        with urllib.request.urlopen("http://127.0.0.1:8001/api/health", timeout=15) as r:
            body = r.read().decode()
            if r.status == 200 and '"database": "ok"' in body.replace('":"', '": "'):
                return True, "200, database ok"
            return False, f"HTTP {r.status}: {body[:120]}"
    except urllib.error.HTTPError as e:
        # 503 here is the designed signal that Atlas is unreachable - most
        # often the server IP has fallen off the Atlas access list.
        return False, f"HTTP {e.code} - {e.read().decode()[:120]}"
    except Exception as e:
        return False, f"{type(e).__name__}: {e}"


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """Ghost answers the loopback with a 301 to its canonical public URL, and
    it keeps the port - so following it means opening TLS against plain-HTTP
    2368 and failing with WRONG_VERSION_NUMBER. A 301 *is* Ghost answering,
    which is the only thing this check needs to establish."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def check_ghost():
    opener = urllib.request.build_opener(_NoRedirect)
    try:
        with opener.open("http://127.0.0.1:2368/blog/", timeout=15) as r:
            return r.status < 400, f"HTTP {r.status}"
    except urllib.error.HTTPError as e:
        # anything that speaks HTTP is alive; only 5xx means Ghost is broken
        return e.code < 500, f"HTTP {e.code}"
    except Exception as e:
        return False, f"{type(e).__name__}: {e}"


def check_service(unit):
    r = subprocess.run(["systemctl", "is-active", unit],
                       capture_output=True, text=True)
    state = r.stdout.strip()
    return state == "active", state


def check_cert():
    """Cert expiry. acme.sh renews itself, so this catches renewal *failing* -
    which is silent until the day browsers start refusing the site."""
    if not CERT.exists():
        return False, f"{CERT} missing"
    r = subprocess.run(["openssl", "x509", "-enddate", "-noout", "-in", str(CERT)],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return False, "could not read certificate"
    raw = r.stdout.strip().split("=", 1)[1]
    exp = datetime.strptime(raw, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
    days = (exp - datetime.now(timezone.utc)).days
    return days >= CERT_WARN_DAYS, f"{days} days left (expires {exp:%Y-%m-%d})"


def check_disk():
    usage = shutil.disk_usage("/")
    pct = round(usage.used / usage.total * 100)
    return pct < DISK_WARN_PCT, f"{pct}% used, {usage.free // 2**30}GB free"


def check_backup():
    """Newest backup artefact. Catches the failure mode where the cron still
    runs and exits 0 but produces nothing usable."""
    if not BACKUP_DIR.exists():
        return False, f"{BACKUP_DIR} missing"
    files = list(BACKUP_DIR.glob("ghost-*"))
    if not files:
        return False, "no backup artefacts at all"
    newest = max(files, key=lambda p: p.stat().st_mtime)
    age_h = (time.time() - newest.stat().st_mtime) / 3600
    return age_h <= BACKUP_MAX_AGE_H, f"newest {newest.name}, {age_h:.0f}h old"


CHECKS = [
    ("api",     check_api),
    ("ghost",   check_ghost),
    ("nginx",   lambda: check_service("nginx")),
    ("api-svc", lambda: check_service("clubs27-api")),
    ("mysql",   lambda: check_service("mysql")),
    ("cert",    check_cert),
    ("disk",    check_disk),
    ("backup",  check_backup),
]


def send_alert(subject, body, env):
    host = env.get("SMTP_HOST")
    if not host:
        print("no SMTP_HOST - cannot alert", file=sys.stderr)
        return False
    msg = EmailMessage()
    msg["From"] = env.get("EMAIL_FROM", "watchdog@proclubshq.com")
    msg["To"] = env.get("WATCHDOG_ALERT_TO", "a.tahmiid@gmail.com")
    msg["Subject"] = subject
    msg.set_content(body)
    try:
        with smtplib.SMTP(host, int(env.get("SMTP_PORT", 587)), timeout=25) as s:
            s.ehlo()
            s.starttls(context=ssl.create_default_context())
            s.ehlo()
            if env.get("SMTP_USERNAME"):
                s.login(env["SMTP_USERNAME"], env.get("SMTP_PASSWORD", ""))
            s.send_message(msg)
        return True
    except Exception as e:
        print(f"alert send failed: {type(e).__name__}: {e}", file=sys.stderr)
        return False


def main():
    env = load_env(ENV_FILE)
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    try:
        previous = json.loads(STATE_FILE.read_text())
    except Exception:
        previous = {}

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%SZ")
    results, failing = {}, []
    for name, fn in CHECKS:
        try:
            ok, detail = fn()
        except Exception as e:
            ok, detail = False, f"check raised {type(e).__name__}: {e}"
        results[name] = ok
        line = f"[{'OK ' if ok else 'FAIL'}] {name:8} {detail}"
        print(f"{now} {line}")
        if not ok:
            failing.append(line)

    # Transitions only. Steady state - good or bad - stays silent, because a
    # monitor that mails every run gets filtered and then silently means nothing.
    newly_broken = [n for n in results if not results[n] and previous.get(n, True)]
    recovered = [n for n in results if results[n] and previous.get(n) is False]

    if newly_broken:
        send_alert(
            f"[proclubshq] FAILING: {', '.join(newly_broken)}",
            f"Checked {now}\n\n"
            + "\n".join(failing)
            + "\n\nBox: 91.99.52.207\n"
              "Runbook: ~/Sites/proclubslobby-blog/DEPLOYMENT.md\n"
              "This is the on-box watchdog; it cannot tell you the host is down.\n",
            env,
        )
    elif recovered:
        send_alert(
            f"[proclubshq] recovered: {', '.join(recovered)}",
            f"Checked {now}\n\nBack to normal: {', '.join(recovered)}\n",
            env,
        )

    STATE_FILE.write_text(json.dumps(results, indent=2))
    return 1 if failing else 0


if __name__ == "__main__":
    sys.exit(main())
