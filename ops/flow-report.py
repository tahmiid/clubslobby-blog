#!/usr/bin/env python3
"""Where readers actually go next — article to article, and release to release.

The owner's hypothesis, 2026-08-24: *"no one will ever go from an FC 27 article
to an FC 26 article. But people will definitely go from FC 26 content to FC 27
content."* Today's traffic is almost entirely FC 26 players, and FC 27 is where
the audience has to end up before 18 September. If the hypothesis holds, then
internal linking should be **directional** — FC 26 pages feed FC 27 pages, and
not the other way round — and the FC 27 pages worth feeding are the ones that
answer "what is different in the new game".

Search Console cannot answer this: it reports how people ARRIVE, never where
they go next. `ops/link-graph.mjs` reports which links EXIST. This reports
which links are actually **used**, from nginx's referrer column.

**Parsing is deliberately identical to `funnel-report.py`** — same line regex,
same bot pattern, same internal-traffic rules (INTERNAL_IPS and the
`pchq_int` cookie column). CLAUDE.md's instrumentation rule: the two are
twinned, and a judgement that differs between them makes both untrustworthy.

Release is read from Ghost's own tags, not guessed from slugs: `fc27-*` covers
most FC 27 articles but not all, and a slug is not a source of truth.

    ssh clubs "cd /root/publish && python3 flow-report.py --days 14"
    ssh clubs "cd /root/publish && python3 flow-report.py --days 14 --to fc27"
"""
import argparse
import gzip
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from glob import glob

LOG_GLOB = '/var/log/nginx/access.log*'
HOST = 'proclubshq.com'
API_ENV = '/opt/clubs27-api/.env'

LINE = re.compile(
    r'(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] "(?P<req>[^"]*)" '
    r'(?P<status>\d{3}) \S+ "(?P<ref>[^"]*)" "(?P<ua>[^"]*)"'
    r'(?: "(?P<internal>[^"]*)")?')
REQ = re.compile(r'(?P<method>[A-Z]+) (?P<path>\S+) HTTP/')
BOT_UA = re.compile(
    r'bot|crawl|spider|slurp|preview|externalhit|whatsapp|telegram|discord|'
    r'python|curl|wget|go-http|httpx|okhttp|scrapy|scan|monitor|uptime|'
    r'headless|lighthouse|pingdom|dataprovider|semrush|ahrefs|mj12|petal|'
    # mediapartners (the AdSense crawler) and google-inspectiontool carry no
    # generic bot word, so every earlier version of this pattern counted them
    # as people. Taught to all FOUR copies together, 2026-09-02 (app #185).
    r'mediapartners|google-inspectiontool',
    re.I)
POST = re.compile(r'^/blog/([a-z0-9][a-z0-9-]*)/?$')


def internal_ips():
    raw = os.environ.get('INTERNAL_IPS')
    if raw is None:
        try:
            with open(API_ENV) as fh:
                for line in fh:
                    if line.startswith('INTERNAL_IPS='):
                        raw = line.split('=', 1)[1].strip().strip('"\'')
                        break
        except OSError:
            pass
    return frozenset(ip.strip() for ip in (raw or '').split(',') if ip.strip())


def releases():
    """slug -> 'fc26' | 'fc27' | '-' from Ghost's tags, which is where the
    release actually lives. Falls back to the slug prefix only if MySQL is
    unavailable, and says so."""
    q = ("SELECT p.slug, GROUP_CONCAT(t.name) FROM posts p "
         "LEFT JOIN posts_tags pt ON pt.post_id=p.id "
         "LEFT JOIN tags t ON t.id=pt.tag_id "
         "WHERE p.status='published' GROUP BY p.slug;")
    out = {}
    try:
        raw = subprocess.run(['mysql', '-N', '-B', 'ghost_prod', '-e', q],
                             capture_output=True, text=True, timeout=30).stdout
        for line in raw.splitlines():
            parts = line.split('\t')
            if len(parts) < 2:
                continue
            slug, tags = parts[0], (parts[1] or '')
            out[slug] = ('fc27' if 'FC 27' in tags else
                         'fc26' if 'FC 26' in tags else '-')
    except Exception:
        print("  (Ghost tags unavailable - falling back to slug prefixes)")
        return None
    return out


def parse_time(s):
    return datetime.strptime(s.split()[0], '%d/%b/%Y:%H:%M:%S').replace(tzinfo=timezone.utc)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--days', type=int, default=14)
    ap.add_argument('--to', help='only transitions INTO this release (fc26/fc27)')
    args = ap.parse_args()

    since = datetime.now(timezone.utc) - timedelta(days=args.days)
    rel = releases() or {}
    own = internal_ips()

    hops = Counter()            # (from_slug, to_slug) -> n
    entries = Counter()         # slug -> arrivals from OUTSIDE the blog
    onward = Counter()          # slug -> clicks TO another article
    to_app = Counter()          # slug -> clicks into the app
    dropped = 0

    for path in sorted(glob(LOG_GLOB)):
        op = gzip.open if path.endswith('.gz') else open
        try:
            fh = op(path, 'rt', errors='replace')
        except OSError:
            continue
        with fh:
            for line in fh:
                m = LINE.match(line)
                if not m or m['status'] not in ('200', '304'):
                    continue
                if BOT_UA.search(m['ua'] or ''):
                    continue
                if m['ip'] in own or m['internal'] == '1':
                    dropped += 1
                    continue
                try:
                    if parse_time(m['time']) < since:
                        continue
                except ValueError:
                    continue
                r = REQ.match(m['req'] or '')
                if not r or r['method'] != 'GET':
                    continue
                target = POST.match(r['path'].split('?')[0])
                ref = m['ref'] or ''
                src = None
                if HOST in ref:
                    rp = ref.split(HOST, 1)[1].split('?')[0]
                    sm = POST.match(rp)
                    src = sm.group(1) if sm else None
                    if not target and src and not rp.startswith('/blog'):
                        pass
                if target:
                    to = target.group(1)
                    if src and src != to:
                        hops[(src, to)] += 1
                        onward[src] += 1
                    elif not src:
                        entries[to] += 1
                elif src and not r['path'].startswith('/blog'):
                    to_app[src] += 1

    tag = lambda s: rel.get(s, 'fc27' if s.startswith('fc27') else '-')

    print(f"\nREADER FLOW - last {args.days} days, bots and internal traffic excluded "
          f"({dropped} internal lines dropped)\n")

    matrix = defaultdict(int)
    for (a, b), n in hops.items():
        matrix[(tag(a), tag(b))] += n
    print("RELEASE CROSSINGS  (does FC 26 feed FC 27?)")
    order = ['fc26', 'fc27', '-']
    print(f"  {'from \\\\ to':10} " + " ".join(f"{c:>7}" for c in order))
    for a in order:
        print(f"  {a:10} " + " ".join(f"{matrix[(a,b)]:>7}" for b in order))
    c2627, c2726 = matrix[('fc26', 'fc27')], matrix[('fc27', 'fc26')]
    print(f"\n  FC 26 -> FC 27: {c2627}     FC 27 -> FC 26: {c2726}")
    if c2627 or c2726:
        print(f"  the owner's rule holds at {100*c2627/(c2627+c2726):.0f}% "
              f"of cross-release movement" if (c2627 + c2726) else "")

    print(f"\nTOP TRANSITIONS ACTUALLY USED")
    shown = [(n, a, b) for (a, b), n in hops.items()
             if not args.to or tag(b) == args.to]
    for n, a, b in sorted(shown, reverse=True)[:16]:
        print(f"  {n:>4}  /{a[:34]:34} -> [{tag(b)}] /{b[:30]}")

    print(f"\nDEAD ENDS - most-entered articles nobody leaves onward from")
    rows = []
    for slug, ent in entries.most_common(40):
        if ent < 20:
            continue
        out_n, app_n = onward[slug], to_app[slug]
        rows.append((100 * (out_n + app_n) / ent, ent, out_n, app_n, slug))
    for rate, ent, out_n, app_n, slug in sorted(rows)[:12]:
        print(f"  [{tag(slug):4}] {slug[:38]:38} {ent:>5} entries  "
              f"{out_n:>4} onward  {app_n:>4} to app   {rate:>5.1f}%")


if __name__ == '__main__':
    main()
