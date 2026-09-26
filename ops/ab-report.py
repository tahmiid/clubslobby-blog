# Grid-card A/B result (gen/cardab.mjs, ops/ab-inject.mjs): human clicks
# from blog grid cards into the app, src=grid-a (old card) vs src=grid-b
# (new card), since the test went live 2026-09-26 09:40 UTC. Read-only.
#
#     ssh clubs 'python3 -' < ops/ab-report.py
import re,glob,gzip,collections,datetime
BOT_UA = re.compile(
    r'bot|crawl|spider|slurp|preview|externalhit|whatsapp|telegram|discord|'
    r'python|curl|wget|go-http|httpx|okhttp|scrapy|scan|monitor|uptime|'
    r'headless|lighthouse|pingdom|dataprovider|semrush|ahrefs|mj12|petal|'
    # mediapartners (the AdSense crawler) and google-inspectiontool carry no
    # generic bot word, so every earlier version of this pattern counted them
    # as people. Taught to all FOUR copies together, 2026-09-02 (app #185).
    r'mediapartners|google-inspectiontool|'
    # Our own tooling (app #189): 14,954 lines, 7.1% of everything logged,
    # `node` alone 11,268. Of the 354 UA strings this newly catches, only two
    # do not name Claude-User - bare `node` and bare `Mozilla/5.0`. No real
    # browser matches: `^mozilla/5\.0$` is exact-anchored.
    # `linksweep` is ours too (ops/link-sweep.mjs). Zero lines in the current
    # window - it has rotated out since the 25 Aug audit counted 416 - but it
    # runs after every publish, so catch it before it comes back rather than
    # rediscovering it in a month.
    r'^node$|^node/|claude-user|linksweep|^mozilla/5\.0$',
    re.I)

START=datetime.datetime(2026,9,26,9,40,tzinfo=datetime.timezone.utc)
c=collections.Counter(); per=collections.Counter(); days=collections.Counter()
for f in glob.glob('/var/log/nginx/access.log*'):
    op=gzip.open if f.endswith('.gz') else open
    for l in op(f,'rt',errors='ignore'):
        m=re.search(r'src=grid-([ab])',l)
        if not m or 'pchq_int' in l: continue
        q=l.split('"')
        if len(q)<6 or BOT_UA.search(q[5]): continue
        t=re.search(r'\[([^\]]+)\]',l)
        ts=datetime.datetime.strptime(t.group(1),'%d/%b/%Y:%H:%M:%S %z')
        if ts<START or not q[1].startswith('GET /b/'): continue
        v=m.group(1); c[v]+=1; days[(ts.date().isoformat(),v)]+=1
        ref=re.search(r'/blog/([^/?"]+)',q[3]); per[(ref.group(1) if ref else '?',v)]+=1
a,b=c['a'],c['b']; n=a+b
print(f'A (old) {a}  B (new) {b}  total {n}')
if n:
    import math; z=(b-n/2)/math.sqrt(n/4); print(f'B share {b/n:.1%}  z={z:+.2f} (|z|>1.96 = clear at 95%)')
for d in sorted({k[0] for k in days}): print(d, days[(d,'a')], days[(d,'b')])
for p in sorted({k[0] for k in per}): print(f'{per[(p,"a")]:4} {per[(p,"b")]:4}  {p}')
