// FC 27 platform eligibility. High-intent, low-competition query: last-gen
// players are a large slice of the Clubs audience and the answer is bad news,
// which nobody has bothered to write plainly. Everything here is EA-confirmed —
// this is the one FC 27 article with no reporting or speculation in it.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { BRAND, esc, kg, baseCss, appCta} from './common.mjs';

const P = 'pl27';

// ok: 1 = full experience, 0 = game runs, this part of it doesn't.
const PLATFORMS = [
  ['PlayStation 5', 1, 'ps5'],
  ['Xbox Series X|S', 1, 'xsx'],
  ['PC', 1, 'pc'],
  ['Nintendo Switch 2', 1, 'ns2'],
  ['PlayStation 4', 0, 'ps4'],
  ['Xbox One', 0, 'xb1'],
  ['Nintendo Switch', 0, 'ns1'],
];

const YES = `<b class="v ok">You're fine.</b><p>The Grounds and the full Clubs experience are both confirmed for this platform. Nothing here changes what you already play.</p>`;
const NO = `<b class="v no">This is the year it ends.</b><p>FC 27 releases on this platform, but The Grounds and the full Clubs experience are not part of it. If Clubs is why you buy the game, buying it on this platform is not going to give you Clubs as you know it.</p>`;

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .out{margin-top:14px;padding:14px;border:1px solid var(--ring);border-radius:9px;background:var(--bar)}
.${P} .v{display:block;font-size:16px;font-weight:650;margin-bottom:4px}
.${P} .v.ok{color:var(--good)}
.${P} .v.no{color:var(--bad)}
.${P} .out p{margin:0;font-size:13.5px;color:var(--ink2);max-width:60ch}
.${P} .tbl{margin-top:16px;width:100%;border-collapse:collapse;font-size:13.5px}
.${P} .tbl th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);
  font-weight:600;padding:0 0 7px;border-bottom:1px solid var(--grid)}
.${P} .tbl td{padding:8px 0;border-bottom:1px solid var(--grid)}
.${P} .tbl td:last-child{text-align:right;font-weight:600;white-space:nowrap}
.${P} .y{color:var(--good)}
.${P} .n{color:var(--bad)}
</style>
<p class="hd">Do you get The Grounds and full Clubs in FC 27?</p>
<p class="sub">Pick where you play. All of this is confirmed by EA — no reporting, no guesswork.</p>
<div class="chips" role="group" aria-label="Choose your platform">
${PLATFORMS.map(([n, ok, id], i) => `<button type="button" class="chip" data-p="${id}" data-ok="${ok}"${i ? '' : ' aria-pressed="true"'}>${esc(n)}</button>`).join('')}
</div>
<div class="out" data-out>${YES}</div>
<table class="tbl">
<thead><tr><th>Platform</th><th>The Grounds &amp; full Clubs</th></tr></thead>
<tbody>
${PLATFORMS.map(([n, ok]) => `<tr><td>${esc(n)}</td><td class="${ok ? 'y' : 'n'}">${ok ? 'Yes' : 'No'}</td></tr>`).join('')}
</tbody></table>
<p class="foot">Confirmed platform availability, tracked by ${BRAND}.</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var Y=${JSON.stringify(YES)},N=${JSON.stringify(NO)};
R.addEventListener('click',function(e){var c=e.target.closest('.chip');if(!c)return;
  R.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed',String(x===c))});
  R.querySelector('[data-out]').innerHTML=(c.dataset.ok==='1')?Y:N;});})();
</script>
</div>`);

const html = `<p>If you play Clubs on a PS4, an Xbox One or the original Nintendo Switch: <strong>FC 27 is where that stops.</strong></p>
<p>The game still releases on those platforms. The Grounds — and with it the full Clubs experience — does not. Check yours:</p>

${widget}

<h2>What EA has actually confirmed</h2>
<p>The Grounds and the full Clubs experience are available on <strong>PlayStation 5, Xbox Series X|S, PC and Nintendo Switch 2</strong>. They are not included in the PlayStation 4, Xbox One or original Nintendo Switch versions.</p>
<p>This is unusually clean as FC 27 information goes. Most of what's circulating about the new Clubs is preview reporting; this part came directly from EA, in writing, attached to the platform availability notes.</p>

<h2>What "not included" leaves you with</h2>
<p>Here we have to be careful, because EA has been precise about what's missing and vague about what remains. The Grounds is confirmed absent. The full Clubs experience is confirmed absent. Whether some reduced form of Clubs exists on last-gen — and what it would be missing — has not been spelled out.</p>
<p>We're not going to guess at it. What we can say is that the mode is being built around a shared social hub that last-gen hardware isn't getting, so any last-gen version would be a different thing wearing the same name.</p>

<h2>Switch 2 is the surprise</h2>
<p>The original Switch is cut, but <strong>Nintendo Switch 2 gets the full version</strong> — The Grounds included. That's the first time a Nintendo platform has been included at this level, and it makes Switch 2 a genuine Clubs platform rather than a cut-down port.</p>

<h2>If you're on last-gen, your options</h2>
<ol>
<li><strong>Stay on FC 26.</strong> It keeps working, and the Clubs in it is the Clubs you already know. Our archetype guides and build tools are FC 26 data and stay accurate for it.</li>
<li><strong>Upgrade the hardware.</strong> Any of PS5, Series X|S, Switch 2 or a PC gets you the full mode.</li>
<li><strong>Buy FC 27 on last-gen anyway</strong> — reasonable if you mainly play Ultimate Team or Career, much less so if Clubs is the reason you buy the game at all.</li>
</ol>
<p>The one thing worth avoiding is pre-ordering a last-gen copy expecting Clubs to work as it does now. That's the mistake this page exists to prevent.</p>


${appCta({
  href: '/explore?year=27',
  kicker: 'FC 27 in the app',
  head: 'Try FC 27 builds now',
  body: '70+ ready-made level-40 builds — open one, copy it and make it yours. If the numbers move at launch, everything re-prices automatically.',
  label: 'Browse FC 27 builds',
})}

<h2>Frequently asked questions</h2>
<h3>Can you play FC 27 Pro Clubs on PS4?</h3>
<p>No. The Grounds and the full Clubs experience are not included in the PlayStation 4 version. The game itself does release on PS4.</p>
<h3>Can you play FC 27 Pro Clubs on Xbox One?</h3>
<p>No, for the same reason. Xbox One does not get The Grounds or the full Clubs experience.</p>
<h3>Is FC 27 Clubs on Nintendo Switch?</h3>
<p>On Nintendo Switch 2, yes — the full version. On the original Switch, no.</p>
<h3>Which platforms get The Grounds?</h3>
<p>PlayStation 5, Xbox Series X|S, PC and Nintendo Switch 2.</p>
<h3>Is there crossplay between them?</h3>
<p>EA has not published the FC 27 crossplay rules for Clubs yet. We'll update this page when it does.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a6.html'), html);
console.log('a6: platforms |', PLATFORMS.length, 'platforms |',
  PLATFORMS.filter((p) => p[1]).length, 'supported |', 'bytes', html.length);
