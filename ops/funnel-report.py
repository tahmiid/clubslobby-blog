#!/usr/bin/env python3
# The blog->app funnel, read straight out of nginx's access logs.
#
#   Run ON THE BOX:   funnel-report.py            # everything the logs hold
#                     funnel-report.py --days 7
#
# EDITING THIS FILE IS HALF THE CHANGE. The copy that runs is
# /usr/local/bin/funnel-report.py and it is NOT synced from the repo
# (DEPLOYMENT.md's funnel section, same rule as the watchdog). ops/funnel-
# snapshot.sh runs the DEPLOYED copy, so a snapshot taken after editing here
# and before the scp below is the old report wearing today's date — it does
# not error, it just silently lacks whatever you added:
#
#   scp -i ~/.ssh/proclubslobby_ed25519 ops/funnel-report.py \
#       root@91.99.52.207:/usr/local/bin/
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
#
# Internal traffic (ported BACK from the collector, 2026-08-20): the owner's
# own browsing sat in every number here while the collector had been dropping
# it since the 14th — the two reports disagreed by 500–1,100 lines a day and
# the difference was us. Same two marks as the collector: any IP in
# INTERNAL_IPS, and any line whose trailing `$cookie_pchq_int` column reads
# "1" (a browser gets that cookie by ever holding an admin session). The
# dropped count is printed on the report, so a run where the filter had
# nothing to bite on is visibly different from a run where it worked.
#
# Three OUTPUT changes on 2026-08-28, all from the traffic-behaviour audit
# (reports/traffic-behaviour-2026-08-28.md §5). None of them touches a parsing
# judgement — those are twinned with the app collector and move in one sitting:
#
# - **The tables below the day rows ignored `--days`.** They were accumulated
#   over every parsed line while `--days` sliced `all_days` at print time, so
#   `--days 7` printed seven day rows above a fortnight of article totals and
#   said "(whole range)" over both. They are keyed by day now, aggregated over
#   the selected window, and every title names the window it covers.
# - **`?src=` was never joined to the referring article.** The tag counters are
#   site-wide-per-day and the article table has no tag split, so the number the
#   grid rollout was decided on — grid 32% vs card 10% of article views, the
#   comparison CLAUDE.md requires because a baked grid never hydrates — could
#   not be recomputed by anything in this repo. Both halves were already in
#   scope at the same point in the loop; they are joined now.
# - **A tag can fail in two opposite directions and both were silent.** Emitted
#   but not counted is the reel card reading dead for three days (see `src=card`
#   below). Counted but not emitted is `src=digest`: nothing in this repo emits
#   it (grepped 2026-08-28, gen/ widgets/ data/ out/ — zero hits outside this
#   file), so `dgst` reads 0 by construction and a reader cannot tell that from
#   "the digest sent no traffic". The report censuses the `src=` values actually
#   present and names both directions instead of leaving either to be read as a
#   measurement.
import argparse
import gzip
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime
from glob import glob

LOG_GLOB = '/var/log/nginx/access.log*'
HOST = 'proclubshq.com'
API_ENV = '/opt/clubs27-api/.env'

# Combined log format, with one optional trailing column: "$cookie_pchq_int",
# which deploy/analytics/ (app repo) appends. Optional so logs from before
# that nginx change, and any other combined-format log, still parse.
LINE = re.compile(
    r'(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] "(?P<req>[^"]*)" '
    r'(?P<status>\d{3}) \S+ "(?P<ref>[^"]*)" "(?P<ua>[^"]*)"'
    r'(?: "(?P<internal>[^"]*)")?')
REQ = re.compile(r'(?P<method>[A-Z]+) (?P<path>\S+) HTTP/')


def internal_ips():
    """INTERNAL_IPS from the environment, else from the API's .env — the
    box's authoritative env file — else empty. Comma-separated."""
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

# Read for the census and the per-article join only. The day-row columns keep
# their own substring tests below, each with the incident that taught it — that
# is the judgement twinned with the app collector and it is not restated here.
SRC_TAG = re.compile(r'[?&]src=([^&]*)')
UNTAGGED = '(none)'

# `src=` value -> the day-counter key that already has a column, so the
# vocabulary check can tell a tag that measured zero from a tag nothing emits.
# A counter added below without a row here shows up in the check as a tag with
# no column, which is the safe direction to be wrong in.
SRC_COLUMNS = {'card': 'card_clicks', 'grid': 'grid_clicks',
               'guide': 'guide_clicks', 'digest': 'digest_clicks'}


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

    # Everything here is keyed by DAY, including the three that were not until
    # 2026-08-28 — a counter that is not day-keyed cannot honour --days, and
    # nothing on the report said which of the two ranges it was showing.
    days = defaultdict(Counter)          # day -> metric counts
    ref_articles = defaultdict(Counter)  # day -> blog article -> crossings
    entries = defaultdict(Counter)       # day -> app entry bucket -> crossings
    blog_visitors = defaultdict(set)     # day -> {(ip, ua)}
    app_visitors = defaultdict(set)
    top_articles = defaultdict(Counter)  # day -> article -> human views
    article_tags = defaultdict(Counter)  # day -> (article, src tag) -> crossings
    src_seen = defaultdict(Counter)      # day -> src= value -> tagged app hits
    own_ips = internal_ips()
    internal_dropped = 0

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
                if m['ip'] in own_ips or m['internal'] == '1':
                    internal_dropped += 1
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
                        top_articles[day][path] += 1
                    continue

                # -- app page views -----------------------------------------
                app_visitors[day].add(key)
                days[day]['app_views'] += 1
                # The census: every `src=` value actually present, whether or
                # not a column below knows the name. Read strictly (`[?&]src=`)
                # and kept apart from the columns on purpose — the columns'
                # substring tests are the twinned judgement and stay as they
                # are; this only exists so neither failure direction is silent.
                hit = SRC_TAG.search(path_q)
                src_tag = hit.group(1) if hit else UNTAGGED
                if hit:
                    src_seen[day][src_tag] += 1
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
                # `?src=guide` — the archetype guides' closing CTA (#154),
                # repointed from an empty editor to the filtered feed. A new
                # tag has to reach BOTH parsers or it reads as zero forever.
                if 'src=guide' in path_q:
                    days[day]['guide_clicks'] += 1
                if 'src=digest' in path_q:
                    days[day]['digest_clicks'] += 1
                if blog_ref:
                    days[day]['crossings'] += 1
                    ref_path = ref.split(HOST, 1)[1].split('?', 1)[0]
                    ref_articles[day][ref_path] += 1
                    entries[day][app_entry(path)] += 1
                    # The tag and the article that sent it have always been in
                    # scope on the same line and were never joined, which is
                    # why grid 32% vs card 10% (CLAUDE.md, 18-21 Aug) could not
                    # be recomputed from this report a week later.
                    article_tags[day][(ref_path, src_tag)] += 1

    if not days:
        sys.exit('no parseable log lines found')

    all_days = sorted(days)
    if args.days:
        all_days = all_days[-args.days:]
    window = (f'{all_days[0]} → {all_days[-1]}' if len(all_days) > 1
              else all_days[0])

    def over_days(by_day):
        """One counter for the SELECTED days, and nothing outside them."""
        c = Counter()
        for d in all_days:
            c.update(by_day.get(d, ()))
        return c

    print(f'Blog→app funnel — {HOST}  ({all_days[0]} → {all_days[-1]}, '
          f'bots excluded)')
    print('"Visitors" are distinct (IP, UA) pairs on Cloudflare edge IPs — '
          'directional, not exact.')
    print('"goog" is the subset of "reg" that signed up through Google '
          '(201 on /auth/google).')
    print(f'Internal (our own) traffic excluded: {internal_dropped} lines '
          f'dropped (pchq_int cookie mark; {len(own_ips)} listed ips).\n')
    hdr = (f'{"day":<12}{"blog views":>11}{"blog vis.":>10}{"→app":>6}'
           f'{"app views":>10}{"app vis.":>9}{"hydr.":>7}{"card":>6}{"grid":>6}{"guide":>7}{"dgst":>6}'
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
              f'{c["card_clicks"]:>6}{c["grid_clicks"]:>6}{c["guide_clicks"]:>7}{c["digest_clicks"]:>6}{c["registers"]:>5}'
              f'{c["google_reg"]:>6}{c["logins"]:>7}')
    print('-' * len(hdr))
    print(f'{"total":<12}{tot["blog_views"]:>11}{tot["blog_vis"]:>10}'
          f'{tot["crossings"]:>6}{tot["app_views"]:>10}{tot["app_vis"]:>9}'
          f'{tot["hydrations"]:>7}{tot["card_clicks"]:>6}{tot["grid_clicks"]:>6}{tot["guide_clicks"]:>7}{tot["digest_clicks"]:>6}'
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

    views = over_days(top_articles)
    table(f'Blog articles sending readers to the app ({window}):',
          over_days(ref_articles))
    table(f'Where they land in the app ({window}):', over_days(entries))
    table(f'Most-read articles (human views, {window}):', views, 10)

    def article_views(art):
        """Views of a referring article. The referrer string and the request
        path are two spellings of one page — Ghost canonicalises to a trailing
        slash, a referrer can arrive without one — so try both rather than
        print a confident 0 into the ratio column."""
        if art in views:
            return views[art]
        return views.get(art[:-1] if art.endswith('/') else art + '/', 0)

    # -- which surface earned the click, per article --------------------------
    art_tags = over_days(article_tags)
    if art_tags:
        per_article, per_tag = Counter(), Counter()
        for (art, tag), n in art_tags.items():
            per_article[art] += n
            per_tag[tag] += n
        cols = [t for t in SRC_COLUMNS if per_tag[t]]
        cols += [t for t, _ in per_tag.most_common()
                 if t not in SRC_COLUMNS and t != UNTAGGED][:4]
        cols.append(UNTAGGED)

        print(f'\nCrossings by referring article × ?src= tag ({window}):')
        print('  The tag columns in the day rows are site-wide; these are the '
              'same clicks split by')
        print('  the page that sent them. Only a crossing carries a referrer, '
              'and referer-less')
        print('  clients arrive untagged, so every cell is a floor.')
        hdr2 = ('  ' + f'{"article":<42}' + ''.join(f'{t[:7]:>8}' for t in cols)
                + f'{"total":>7}{"views":>7}{"clk/vw":>8}')
        print(hdr2)
        print('  ' + '-' * (len(hdr2) - 2))
        for art, total in per_article.most_common(12):
            v = article_views(art)
            rate = f'{100 * total / v:>7.1f}%' if v else f'{"—":>8}'
            print('  ' + f'{art[:42]:<42}'
                  + ''.join(f'{art_tags[(art, t)]:>8}' for t in cols)
                  + f'{total:>7}{v:>7}{rate}')

        # Clicks per ARTICLE VIEW, not per hydration: the grid is baked HTML
        # and calls nothing, so its hydrations went to 0 the day it shipped
        # while clicks tripled and the ratio read 306% (2026-08-18). This is
        # the one denominator both layouts have.
        # The denominator is the articles that PRODUCED a click with this tag
        # in the window — not the articles carrying the layout, which a log
        # cannot know: a baked grid that nobody clicked is indistinguishable
        # from a page with no grid on it. So a quiet page carrying the tag is
        # missing from both halves and every rate here reads high. Treat these
        # as an upper bound and a comparison BETWEEN tags, never as a layout's
        # true conversion rate.
        print('\n  Per tag, over the articles that PRODUCED a click with it — '
              'clicks per ARTICLE VIEW:')
        for tag in cols:
            if not per_tag[tag]:
                continue
            arts = {a for (a, t) in art_tags if t == tag}
            v = sum(article_views(a) for a in arts)
            rate = f'{100 * per_tag[tag] / v:.1f}%' if v else '—'
            where = f'{len(arts)} page' + ('' if len(arts) == 1 else 's')
            print(f'    {tag[:9]:<10}{per_tag[tag]:>6} clicks  {v:>6} views '
                  f'of {where:<10}{rate:>7}')
        print('    An article emitting two tags has its views counted in both '
              'rows; where one')
        print('    layout owns a page the row is the layout, which is how the '
              'grid was judged.')
        print('    A page carrying the tag that drew no click in the window is '
              'in neither half,')
        print('    so these rates are upper bounds — compare tags against each '
              'other, not to 100%.')

    # -- does the vocabulary match what the pages actually emit? --------------
    seen = over_days(src_seen)
    unknown = sorted(((n, t) for t, n in seen.items() if t not in SRC_COLUMNS),
                     reverse=True)
    dead = [t for t in SRC_COLUMNS if not seen.get(t)]
    print(f'\n?src= vocabulary check ({window}):')
    for n, t in unknown:
        print(f'  {n:>5}  src={t} — in the logs, counted by no column here. A '
              f'tag has to reach BOTH')
        print('         parsers in the same change or it reads as zero forever '
              '(the reel card).')
    for t in dead:
        print(f'  {"0":>5}  src={t} ({SRC_COLUMNS[t]}) — a column with no hits: '
              f'NO EMITTER SEEN.')
    if dead:
        print('         A log cannot tell a tag nothing emits from a tag nobody '
              'clicked — both')
        print('         read 0 — so a flagged column is unmeasured, never '
              'measured-zero.')
    if 'digest' in dead:
        print('         Nothing in this repo has ever emitted src=digest '
              '(grepped 2026-08-28);')
        print('         the column stays because dropping a shared tag on one '
              'side only is the')
        print('         twin drift CLAUDE.md forbids. It announces itself '
              'instead.')
    if not unknown and not dead:
        print('  every tag seen has a column, and every column had hits.')


if __name__ == '__main__':
    main()
