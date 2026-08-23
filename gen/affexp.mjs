// The affiliate PLACEMENT experiment — three arms, one beacon, real numbers.
//
// The owner, 2026-08-23: "experiment with the advertisements a bit so that from
// these pages we know which advertisement model helps us the best... and store
// the data from the clicks so that we can decide which one works."
//
// ── What is being tested ───────────────────────────────────────────────────
// Not the merchant, not the copy — the PLACEMENT, because that is the thing we
// can act on afterwards and the thing MONETIZATION.md has an opinion about:
//
//   lede    a card block high on the page, under the lead widget. Most seen,
//           least earned — the reader has not yet been given anything.
//   inline  a single line inside the body, at the moment the need appears
//           ("you will want the game to try this"). Least seen, best timed.
//   footer  the classic block below the closing app CTA — the placement the
//           18 factory articles already use, and therefore the control arm.
//
// One arm per article, assigned deterministically from the slug so a
// regeneration never reshuffles the experiment mid-flight, and printed by
// `arms()` so the assignment is reviewable rather than buried.
//
// ── How the clicks come back ───────────────────────────────────────────────
// An outbound affiliate click never touches our nginx, which is why the
// Amazon `tag` exists at all (spoke.mjs) — but a per-placement tag would only
// answer the question inside Amazon's dashboard, and only for Amazon. So the
// click also fires the app's OWN beacon: the blog is same-origin with the API,
// the endpoint and its closed event vocabulary already exist (#128), and three
// new constants in `metrics.py` are the entire server-side change.
//
// The beacon reuses `sessionStorage['pchq_sid']` — the app's key, the app's
// shape — so a session that reads an article and then opens the app is ONE
// session in `page_views` rather than two. That is the whole reason to reuse
// the app's collector instead of growing a second one.
//
// Nothing here identifies a person: a random per-tab id, an event name, and a
// timestamp, exactly as PrivacyPage.jsx already describes.
//
// ── Reading the result ─────────────────────────────────────────────────────
// `ops/affiliate-experiment.py` divides each arm's clicks by the views of the
// articles carrying it. Clicks-per-view, per arm — the same measure that
// settled the grid experiment (32% against 10%).
import { affiliateSection } from './affiliate.mjs';
import { kg } from './common.mjs';

export const ARMS = ['lede', 'inline', 'footer'];

// Deterministic AND balanced. A hash of the slug is deterministic but not
// balanced - the first run came out 8 footer / 4 inline / 3 lede, which wastes
// the smaller arms' statistical power for no reason. Round-robin over the
// SORTED slug list gives equal arms and still never moves an article between
// them, as long as the set of articles is stable. Adding an article reshuffles
// from its insertion point, so add in a batch and note the date.
export const assign = (slugs) => {
  const sorted = [...slugs].sort();
  return new Map(sorted.map((s, i) => [s, ARMS[i % ARMS.length]]));
};

// Kept for callers that have one slug and the same list every time.
export const armFor = (slug, slugs) => assign(slugs).get(slug);

// One script per page, not per link: it delegates from the document, so a
// block rendered anywhere (and any number of blocks) is covered by the same
// nine lines. Fires on the capture phase because the anchor navigates away.
export const affBeacon = () => kg(`<script>
(function(){
  if (window.__pchqAff) return; window.__pchqAff = 1;
  function sid(){
    try{
      var k='pchq_sid', v=sessionStorage.getItem(k);
      if(!v){
        var b=(window.crypto&&crypto.getRandomValues)
          ? Array.from(crypto.getRandomValues(new Uint8Array(8)))
          : Array.from({length:8},function(){return Math.floor(Math.random()*256);});
        v=b.map(function(x){return x.toString(16).padStart(2,'0');}).join('');
        sessionStorage.setItem(k,v);
      }
      return v;
    }catch(e){ return null; }
  }
  function send(ev){
    var s = sid(); if(!s) return;
    try{
      var body = JSON.stringify({ path: '/evt/' + ev, sid: s });
      if(navigator.sendBeacon){
        navigator.sendBeacon('/api/metrics/view', new Blob([body], {type:'application/json'}));
      } else {
        fetch('/api/metrics/view', {method:'POST', headers:{'Content-Type':'application/json'},
          body: body, keepalive: true});
      }
    }catch(err){}
  }
  // The denominator: one impression per article view, on load, if a block is
  // on the page at all. Not scroll-triggered - "was it seen" is a different
  // and harder question than "was it served", and the arms are compared
  // against each other, so the same simple measure on all three is enough.
  var first = document.querySelector('.pchq-aff[data-arm]');
  if (first) send('aff-seen-' + first.getAttribute('data-arm'));
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest && e.target.closest('.pchq-aff a[href]');
    if(!a) return;
    var box = a.closest('.pchq-aff');
    var arm = box && box.getAttribute('data-arm');
    var s = sid();
    if(!arm) return;
    send('aff-' + arm);
  }, true);
})();
</script>`);

// The block itself. `affiliateSection` still does the work — the merchant
// gating, the disclosure invariant, the markup — and this only stamps the arm
// on it so the beacon can read it back. A pending merchant still emits
// nothing, so an article on a pending arm is byte-identical to one with no
// affiliate key at all.
export const affArm = (arm, opts) => {
  const html = affiliateSection(opts);
  if (!html) return '';
  return html.replace('data-aff="1"', `data-aff="1" data-arm="${arm}"`);
};

// Printed by the generator so the assignment is visible in the build log and
// in reports/affiliate/, rather than being something you have to re-derive.
export const arms = (slugs) => {
  const m = assign(slugs);
  return [...m].map(([s, a]) => `${s.padEnd(24)} ${a}`);
};
