#!/usr/bin/env python3
"""Which affiliate placement earns the click — clicks per view, per arm.

The experiment is described in `gen/affexp.mjs`: three placements (lede,
inline, footer), one per article, assigned round-robin so the arms are equal.
A click fires the app's own beacon into `page_views` as `/evt/aff-<arm>`.

The measure is **clicks per view**, the same one that settled the grid
experiment — a raw click count would just reward whichever arm happens to sit
on the better-read articles.

Views come from the same collection, so both halves are one query against one
source. Run it on the box, where the database is:

    ssh clubs 'cd /opt/clubs27-api && venv/bin/python - ' < ops/affiliate-experiment.py
    ssh clubs 'cd /opt/clubs27-api && venv/bin/python /root/publish/affiliate-experiment.py --days 30'

**Read it with the sample size in view.** At ~250 views/day across fifteen
articles, a week is tens of clicks at best; anything under a few hundred views
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

ARMS = ["lede", "inline", "footer"]
# Kept in step with gen/players.mjs by hand: the assignment is round-robin over
# the SORTED slug list, so it is reproducible without importing JavaScript.
SLUGS = ["bellingham", "cristiano-ronaldo", "haaland", "isak", "lamine-yamal",
         "maradona", "mbappe", "messi", "neymar", "ronaldinho", "salah",
         "thierry-henry", "usain-bolt", "van-dijk", "zidane"]


def arm_of(slug):
    return ARMS[sorted(SLUGS).index(slug) % len(ARMS)]


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--days", type=int, default=30)
    args = ap.parse_args()

    from app.db import get_db
    db = get_db()
    since = datetime.now(timezone.utc) - timedelta(days=args.days)

    clicks = defaultdict(int)
    for row in db.page_views.aggregate([
        {"$match": {"ts": {"$gte": since}, "path": {"$regex": "^/evt/aff-"}}},
        {"$group": {"_id": "$path", "n": {"$sum": 1}}},
    ]):
        # `/evt/aff-seen-lede` also matches `^/evt/aff-`, so the impressions
        # have to be excluded from the click count explicitly.
        name = row["_id"][len("/evt/aff-"):]
        if not name.startswith("seen-"):
            clicks[name] = row["n"]

    # The denominator is the article's OWN impression beacon, not the nightly
    # collector: that keeps site-wide blog views only, with no per-article
    # number to divide by. One impression per article view, same script.
    views = defaultdict(int)
    for row in db.page_views.aggregate([
        {"$match": {"ts": {"$gte": since}, "path": {"$regex": "^/evt/aff-seen-"}}},
        {"$group": {"_id": "$path", "n": {"$sum": 1}}},
    ]):
        views[row["_id"].rsplit("-", 1)[-1]] = row["n"]

    print(f"\nAffiliate placement — last {args.days} days\n")
    print(f"  {'arm':8} {'articles':>9} {'shown':>8} {'clicks':>7} {'per 100 shown':>14}")
    for arm in ARMS:
        n_articles = sum(1 for s in SLUGS if arm_of(s) == arm)
        v, c = views[arm], clicks[arm]
        rate = f"{100 * c / v:.1f}" if v else "—"
        print(f"  {arm:8} {n_articles:>9} {v:>8} {c:>7} {rate:>14}")
    total_v = sum(views.values())
    if total_v < 300:
        print(f"\n  {total_v} impressions across all arms — too early to call. "
              f"A few hundred per arm is where this starts to mean something.")
    print()


if __name__ == "__main__":
    main()
