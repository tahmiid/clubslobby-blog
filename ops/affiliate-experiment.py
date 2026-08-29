#!/usr/bin/env python3
"""Which affiliate placement earns the click — clicks per view, per arm.

The experiment is described in `gen/affexp.mjs`: two placements, one per
article, assigned round-robin so the arms are equal. A page carrying a block
fires one impression on load, and a click on the block fires another beacon,
both into `page_views`.

**The arms are LOADED here, never typed.** This file used to carry
`ARMS = ["lede", "inline", "footer"]` and a fifteen-slug roster. Both were
true when they were typed; both were wrong from 2026-08-23, when the owner
rejected those three placements (they put a block above the build and
mid-argument, neither of which is in MONETIZATION.md §3's slot map) and the
roster grew to 35. So the report printed three empty rows for arms nothing
emits, while every real afterLead/pageEnd click sat in the same query and was
never displayed. Nothing errored — the report just answered "no effect" to a
question it had not asked, for five days.

`gen/players.mjs` now writes `data/affiliate-arms.json` at generation time —
the arms, the fixed non-experiment blocks, the per-slug assignment and the
beacon's own path shapes — and this reads it. A missing file is a hard stop
rather than a fallback: a guessed constant here is precisely the failure
above.

The measure is **clicks per view**, the same one that settled the grid
experiment — a raw click count would just reward whichever arm happens to sit
on the better-read articles.

Views come from the same collection, so both halves are one query against one
source. Run it on the box, where the database is — and copy BOTH files, this
script included. The copy on the box is the one with the three dead arm names
hardcoded: land the new arms file beside the old script and it is ignored,
three empty rows print, the exit code is 0, and the five-day silent failure
above repeats with the fix sitting in the same directory.

    scp -i ~/.ssh/proclubslobby_ed25519 \\
        ops/affiliate-experiment.py data/affiliate-arms.json \\
        root@91.99.52.207:/root/publish/
    ssh clubs 'cd /opt/clubs27-api && venv/bin/python /root/publish/affiliate-experiment.py'
    ssh clubs 'cd /opt/clubs27-api && venv/bin/python /root/publish/affiliate-experiment.py --days 30'

The default window runs from the day the current assignment came into force
(`startedAt`), not from a fixed 30 days: these pages went live on 2026-08-23,
and a 30-day default silently counted 20 days in which they did not exist.

**Read it with the sample size in view.** At ~250 views/day across the player
pages, a week is tens of clicks at best; anything under a few hundred views
per arm is a direction, not a verdict.
"""
import argparse
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone

sys.path.insert(0, "/opt/clubs27-api")

ARMS_FILE = "affiliate-arms.json"
HERE = os.path.dirname(os.path.abspath(__file__))


def load_arms(path=None):
    """The assignment as the generator wrote it. Returns (data, path used).

    Looked for beside this script first, because on the box the whole of
    /root/publish is flat, then in a repo checkout. There is deliberately no
    default-if-missing: see the module docstring.
    """
    # An explicit --arms is used alone: falling through from a path somebody
    # named to one they did not is how you report on last week's assignment.
    tried = [path] if path else [
        p for p in (os.environ.get("PCHQ_ARMS"),
                    os.path.join(HERE, ARMS_FILE),
                    os.path.join(HERE, "..", "data", ARMS_FILE)) if p]
    for p in tried:
        if os.path.exists(p):
            with open(p) as fh:
                return json.load(fh), p
    sys.exit(f"no {ARMS_FILE} found — looked in:\n" +
             "".join(f"    {p}\n" for p in tried) +
             "Run `node gen/players.mjs` in the blog repo and copy\n"
             f"data/{ARMS_FILE} next to this script. Do not hand-write the arms:\n"
             "a transcribed arm list is what made this report read zero.")


def classify(path, events):
    """A beacon path -> ('impression'|'click', arm), or (None, None).

    The impression prefix is tested FIRST because it starts with the click
    prefix: `/evt/aff-seen-pageEnd` matches `^/evt/aff-` too, and an
    impression counted as a click would inflate the numerator with the
    denominator. The old code recovered the impression's arm with
    `rsplit("-", 1)[-1]`, which worked only while every arm name was a single
    token — an arm called `after-lead` would have been bucketed as `lead`,
    silently, into an arm the report does not print.
    """
    seen = events["path"] + events["impression"]
    click = events["path"] + events["click"]
    if path.startswith(seen):
        return "impression", path[len(seen):]
    if path.startswith(click):
        return "click", path[len(click):]
    return None, None


def window(arms, days=None):
    """(since, label). Default: the day the current assignment came into force."""
    now = datetime.now(timezone.utc)
    if days:
        return now - timedelta(days=days), f"last {days} days"
    start = arms.get("startedAt") or arms["generatedAt"]
    since = datetime.strptime(start, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    return since, f"since {start} ({(now - since).days + 1} days)"


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--days", type=int, default=None,
                    help="override the window; the default runs from the "
                         "assignment's startedAt")
    ap.add_argument("--arms", help=f"path to {ARMS_FILE} "
                                   "(default: beside this script, then ../data)")
    args = ap.parse_args()

    arms, arms_path = load_arms(args.arms)
    events, articles = arms["events"], arms["articles"]
    experiment, fixed = arms["experiment"], arms["fixed"]
    measured = set(arms["measured"])

    from app.db import get_db
    db = get_db()
    since, label = window(arms, args.days)

    # One query for both halves, `classify` the only thing separating them.
    # The prefixes are BOTH named in the alternation rather than relying on
    # `aff-seen-` happening to start with `aff-`: that coincidence is a
    # property of today's two strings, not of the design, and the whole point
    # of loading the vocabulary from the generator is that renaming an event
    # reaches this report instead of silencing it. Under the one-prefix form
    # a renamed impression event dropped every `shown` row and the report
    # answered "no effect" — the same failure this file was rewritten to end.
    prefixes = sorted({events["impression"], events["click"]})
    clicks, views = defaultdict(int), defaultdict(int)
    for row in db.page_views.aggregate([
        {"$match": {"ts": {"$gte": since},
                    "path": {"$regex": "^(" + "|".join(
                        re.escape(events["path"] + p) for p in prefixes) + ")"}}},
        {"$group": {"_id": "$path", "n": {"$sum": 1}}},
    ]):
        kind, arm = classify(row["_id"], events)
        if kind == "click":
            clicks[arm] += row["n"]
        elif kind == "impression":
            views[arm] += row["n"]

    # Pages are counted from what each article actually RENDERED, not from the
    # assignment: a pending merchant emits no block at all, so an arm can be
    # assigned to eighteen articles and be on none of them.
    pages = {arm: sum(1 for a in articles.values() if arm in a["blocks"])
             for arm in experiment + fixed}

    def row(arm):
        v, c = views[arm], clicks[arm]
        if arm in measured:
            rate = f"{100 * c / v:.1f}" if v else "—"
            return f"  {arm:10} {pages[arm]:>6} {v:>8} {c:>7} {rate:>15}"
        return f"  {arm:10} {pages[arm]:>6} {'—':>8} {c:>7} {'no denominator':>15}"

    print(f"\nAffiliate placement — {label}")
    print(f"  arms from {arms_path}, in force since {arms.get('startedAt', '?')}\n")
    print(f"  {'arm':10} {'pages':>6} {'shown':>8} {'clicks':>7} {'per 100 shown':>15}")
    for arm in experiment:
        print(row(arm))

    if fixed:
        print("\n  Not part of the experiment:")
        for arm in fixed:
            print(row(arm))

    # The rule spelled out on the report itself, so nobody "fixes" the blank
    # column by dividing these clicks into another arm's impressions.
    blind = [a for a in experiment + fixed if a not in measured and pages[a]]
    if blind:
        print(f"\n  * {', '.join(blind)} has clicks and no denominator: the beacon sends ONE\n"
              "    impression per page view, for the FIRST .pchq-aff[data-arm] block on\n"
              "    the page (gen/affexp.mjs), and the experiment block always precedes\n"
              "    it — so it is never the block counted. A rate against another arm's\n"
              "    impressions would be the clicks-per-hydration mistake again\n"
              "    (CLAUDE.md, 2026-08-18): a ratio that reads as a number and means\n"
              "    nothing.")

    if not sum(pages.values()):
        print("\n  No article rendered an affiliate block at all — every merchant is\n"
              "  `pending` in data/affiliate-merchants.json, so there is nothing to\n"
              "  click and nothing here is evidence about placement.")

    stray = sorted((set(clicks) | set(views)) - set(experiment) - set(fixed))
    if stray:
        print(f"\n  Arms in the data this assignment does not name: {', '.join(stray)}\n"
              "  (a --days window reaching back past startedAt spans an older\n"
              "  assignment; those clicks are not comparable with the rows above)")

    total_v = sum(views[arm] for arm in experiment)
    if sum(pages.values()) and total_v < 300:
        print(f"\n  {total_v} impressions across the experiment arms — too early to "
              f"call.\n  A few hundred per arm is where this starts to mean something.")
    print()


if __name__ == "__main__":
    main()
