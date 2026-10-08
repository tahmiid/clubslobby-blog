"""URL Inspection for a list of URLs, plus each URL's 28-day impressions.
Run on the box (the GSC key lives only there), URLs on stdin, one per line:

    ssh clubs 'cd /opt/clubs27-api && URLS="$(cat)" venv/bin/python -' < inspect_urls.py   # see SKILL.md

Prints: state | last crawl | impressions 28d | url. Read-only.
"""
import os, sys, json, datetime, urllib.parse
sys.path.insert(0, 'scripts')
from dotenv import load_dotenv; load_dotenv('.env')
import analytics_collect as a

urls = [u.strip() for u in os.environ.get('URLS', '').split() if u.strip()]
key = os.environ['GSC_KEY_FILE']; site = os.environ['GSC_SITE_URL']
tok = a.gsc_access_token(key)
H = {"Authorization": f"Bearer {tok}"}
end = datetime.date.today() - datetime.timedelta(days=2)
q = a._post_json(
    f"https://www.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(site, safe='')}/searchAnalytics/query",
    {"startDate": str(end - datetime.timedelta(days=27)), "endDate": str(end),
     "dimensions": ["page"], "rowLimit": 25000}, H).get('rows', [])
imp = {}
for r in q:
    p = r['keys'][0].split('?')[0]; imp[p] = imp.get(p, 0) + r['impressions']
for u in urls:
    try:
        res = a._post_json("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
                           {"inspectionUrl": u, "siteUrl": site}, H)['inspectionResult']['indexStatusResult']
        state, crawl = res.get('coverageState', '?'), (res.get('lastCrawlTime') or '-')[:16]
    except Exception as e:
        state, crawl = f'ERR {str(e)[:40]}', '-'
    print(f"{state[:38]:<38} | {crawl:<16} | {imp.get(u, 0):>6} | {u}")
