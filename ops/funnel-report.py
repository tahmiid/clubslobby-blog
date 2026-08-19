#!/usr/bin/env python3
# The blog->app funnel, read straight out of nginx's access logs.
#
#   Run ON THE BOX:   funnel-report.py            # everything the logs hold
#                     funnel-report.py --days 7
#
# Why logs and not a tracker: the app deliberately ships no telemetry, and
# the answer to "how many readers cross to the app" is already recorded —
# every click from a /blog/ page to an app page carries a Referer, and the
# combined log format keeps it. This stays true only while Ghost and the app
# share one origin; a blog on its own (sub)domain would need its own pass.
#
# What a "crossing" is: a GET for an app PAGE (not /api/, not a static
# asset) whose Referer is a /blog/ URL on our own host. The build-card
# widgets also call /api/builds/<id>/public from blog pages — those are
# hydrations (the card loading), counted separately as an engagement signal,
# never as clicks. Session-level attribution (this reader registered) is
# not possible from logs and is not attempted: register/login counts are
# whole-app daily numbers, shown beside the funnel for shape, not causation.
#
# Two honesty caveats, printed on the report itself:
# - IPs are Cloudflare edge addresses (real client IPs are not logged), so
#   "visitors" = distinct (IP, UA) pairs — directional, not exact.
# - Rotation keeps ~14 days. Older days silently age out of the report.
#
# A third caveat, learned the hard way on 2026-08-12: **this report only sees
# what the access log distinguishes.** Google SSO shipped on the 11th through
# a new endpoint, `/api/auth/google`, which answered 200 whether it created an
# account or signed one into an existing one. Registrations here read zero for
# two days while the database gained four — and nothing failed, nothing was
# logged as an error, the number just went quiet. It was caught because the
# user happened to mention seeing new accounts.
#
# So: when an auth path is added, added here in the same change. And prefer
# giving the API a distinguishing status code (that endpoint now returns 201
# on create) over inferring intent from a path — a path can serve two jobs,
# and a log cannot tell which one it did.
#
# PORTED: the app repo's backend/scripts/analytics_collect.py (its #102)
# carries these same rules — bot pattern, static/article/crossing judgements,
# the auth accounting above — into a nightly Mongo rollup for the admin
# dashboard. The two files move together: change a rule here, change it
# there in the same sitting (its test suite pins the shared judgements).
import argparse
import gzip
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime
from glob import glob

LOG_GLOB = '/var/log/nginx/access.log*'
HOST = 'proclubshq.com'

# Combined log format. Request line is parsed separately: scanners send
# garbage there, and a line whose request does not parse is theirs.
LINE = re.compile(
    r'(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] "(?P<req>[^"]*)" '
    r'(?P<status>\d{3}) \S+ "(?P<ref>[^"]*)" "(?P<ua>[^"]*)"')
REQ = re.compile(r'(?P<method>[A-Z]+) (?P<path>\S+) HTTP/')

BOT_UA = re.compile(
    r'bot|crawl|spider|slurp|preview|externalhit|whatsapp|telegram|discord|'
    r'python|curl|wget|go-http|httpx|okhttp|scrapy|scan|monitor|uptime|'
    r'headless|lighthouse|pingdom|dataprovider|semrush|ahrefs|mj12|petal',
    re.I)

STATIC = re.compile(
    r'\.(js|css|map|png|jpe?g|svg|gif|webp|ico|txt|xml|json|webmanifest|'
    r'woff2?|ttf)(\?|$)', re.I)

# Blog paths that are not articles. Tags/authors/pagination are navigation;
# everything Ghost serves under these prefixes is machinery.
BLOG_NOT_ARTICLE = ('/blog/content/', '/blog/assets/', '/blog/ghost/',
                    '/blog/members/', '/blog/public/', '/blog/sitemap',
                    '/blog/robots', '/blog/favicon', '/blog/rss',
                    '/blog/tag/', '/blog/author/', '/blog/page/')


def app_entry(path):
    """Bucket an app page path for the entry-point table."""
    if path == '/' or path == '':
        return '/ (home)'
    seg = '/' + path.split('/')[1]
    if seg in ('/b', '/edit', '/u'):
        return seg + '/…'
    return seg


def parse_time(s):
    return datetime.strptime(s.split()[0], '%d/%b/%Y:%H:%M:%S')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--days', type=int, default=None,
                    help='only the last N days (default: all the logs hold)')
    ap.add_argument('--glob', default=LOG_GLOB, help=argparse.SUPPRESS)
    args = ap.parse_args()

    days = defaultdict(Counter)          # day -> metric counts
    ref_articles = Counter()             # blog article -> crossings
    entries = Counter()                  # app entry bucket -> crossings
    blog_visitors = defaultdict(set)     # day -> {(ip, ua)}
    app_visitors = defaultdict(set)
    top_articles = Counter()             # article -> human views

    for f in sorted(glob(args.glob)):
        opener = gzip.open if f.endswith('.gz') else open
        with opener(f, 'rt', errors='replace') as fh:
            for line in fh:
                m = LINE.match(line)
                if not m:
                    continue
                r = REQ.match(m['req'])
                if not r:
                    continue
                ua = m['ua']
                if not ua or ua == '-' or BOT_UA.search(ua):
                    continue
                path_q = r['path']
                path = path_q.split('?', 1)[0]
                status = int(m['status'])
                day = parse_time(m['time']).strftime('%Y-%m-%d')
                ref = m['ref']
                key = (m['ip'], ua)
                blog_ref = f'{HOST}/blog' in ref

                # -- auth, counted whatever the referer ---------------------
                if r['method'] == 'POST' and status < 300:
                    if path == '/api/auth/register':
                        days[day]['registers'] += 1
                    elif path == '/api/auth/login':
                        days[day]['logins'] += 1
                    elif path == '/api/auth/google':
                        # One endpoint doing both jobs. It answered 200 to
                        # each of them until 2026-08-12, so this report read
                        # zero new users for the two days after SSO shipped
                        # while the database gained four — the headline number
                        # silently empty, with nothing broken enough to notice.
                        #
                        # `app/api/auth.py` now returns **201 when it created
                        # an account** and 200 when it signed one in. Linking
                        # a password account to Google counts as a sign-in:
                        # that person already counted the day they registered.
                        # The status code is the only part of this exchange an
                        # access log can see, so the contract is load-bearing
                        # across both repos — a test in the app pins it.
                        if status == 201:
                            days[day]['registers'] += 1
                            days[day]['google_reg'] += 1
                        else:
                            days[day]['logins'] += 1
                    continue
                if r['method'] != 'GET' or status >= 400:
                    continue

                # -- widget hydration: blog article loading a build card ----
                if path.startswith('/api/builds/') and path.endswith('/public'):
                    if blog_ref:
                        days[day]['hydrations'] += 1
                    continue
                if path.startswith('/api/'):
                    continue
                if STATIC.search(path_q):
                    continue

                # -- blog article views -------------------------------------
                if path.startswith('/blog'):
                    blog_visitors[day].add(key)
                    if (path.startswith('/blog/') and path != '/blog/'
                            and not path.startswith(BLOG_NOT_ARTICLE)):
                        days[day]['blog_views'] += 1
                        top_articles[path] += 1
                    continue

                # -- app page views -----------------------------------------
                app_visitors[day].add(key)
                days[day]['app_views'] += 1
                if 'ref=proclubshq.com' in path_q:
                    days[day]['ref_tagged'] += 1
                # The spokes' reel card tags its links `?src=card` (blog repo
                # gen/spoke.mjs) rather than ref=, so it went uncounted here
                # from the 14th and the card read as dead for three days. Same
                # lesson as the /auth/google 201 above: when a surface invents
                # a tag, teach it to this report in the same change.
                if 'src=card' in path_q:
                    days[day]['card_clicks'] += 1
                if 'src=grid' in path_q:
                    days[day]['grid_clicks'] += 1
                if 'src=digest' in path_q:
                    days[day]['digest_clicks'] += 1
                if blog_ref:
                    days[day]['crossings'] += 1
                    ref_path = ref.split(HOST, 1)[1].split('?', 1)[0]
                    ref_articles[ref_path] += 1
                    entries[app_entry(path)] += 1

    if not days:
        sys.exit('no parseable log lines found')

    all_days = sorted(days)
    if args.days:
        all_days = all_days[-args.days:]

    print(f'Blog→app funnel — {HOST}  ({all_days[0]} → {all_days[-1]}, '
          f'bots excluded)')
    print('"Visitors" are distinct (IP, UA) pairs on Cloudflare edge IPs — '
          'directional, not exact.')
    print('"goog" is the subset of "reg" that signed up through Google '
          '(201 on /auth/google).\n')
    hdr = (f'{"day":<12}{"blog views":>11}{"blog vis.":>10}{"→app":>6}'
           f'{"app views":>10}{"app vis.":>9}{"hydr.":>7}{"card":>6}{"grid":>6}{"dgst":>6}'
           f'{"reg":>5}{"goog":>6}{"login":>7}')
    print(hdr)
    print('-' * len(hdr))
    tot = Counter()
    for d in all_days:
        c = days[d]
        tot.update(c)
        tot['blog_vis'] += len(blog_visitors[d])
        tot['app_vis'] += len(app_visitors[d])
        print(f'{d:<12}{c["blog_views"]:>11}{len(blog_visitors[d]):>10}'
              f'{c["crossings"]:>6}{c["app_views"]:>10}'
              f'{len(app_visitors[d]):>9}{c["hydrations"]:>7}'
              f'{c["card_clicks"]:>6}{c["grid_clicks"]:>6}{c["digest_clicks"]:>6}{c["registers"]:>5}'
              f'{c["google_reg"]:>6}{c["logins"]:>7}')
    print('-' * len(hdr))
    print(f'{"total":<12}{tot["blog_views"]:>11}{tot["blog_vis"]:>10}'
          f'{tot["crossings"]:>6}{tot["app_views"]:>10}{tot["app_vis"]:>9}'
          f'{tot["hydrations"]:>7}{tot["card_clicks"]:>6}{tot["grid_clicks"]:>6}{tot["digest_clicks"]:>6}'
          f'{tot["registers"]:>5}{tot["google_reg"]:>6}{tot["logins"]:>7}')
    if tot['ref_tagged']:
        print(f'\n(ref=proclubshq.com tagged app hits in range: '
              f'{tot["ref_tagged"]} — subset/overlap of →app)')

    def table(title, counter, n=12):
        if not counter:
            return
        print(f'\n{title}')
        for path, count in counter.most_common(n):
            print(f'  {count:>5}  {path}')

    table('Blog articles sending readers to the app (whole range):',
          ref_articles)
    table('Where they land in the app:', entries)
    table('Most-read articles (human views, whole range):', top_articles, 10)


if __name__ == '__main__':
    main()
