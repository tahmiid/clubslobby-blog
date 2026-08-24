// The FC 26 -> FC 27 bridge, and the FC 27 -> FC 27 rail.
//
// ── What the flow data actually said (ops/flow-report.py, 14 days to 24 Aug)
//
// The owner's rule was that readers move FC 26 -> FC 27 but never back. The
// direction is right; the volume was the surprise:
//
//     FC 26 -> FC 26   155        FC 26 -> FC 27    2
//     FC 27 -> FC 27     9        FC 27 -> FC 26    2
//
// Cross-release movement is not "one-directional". It is **not happening**.
// And it is not for want of a link: all thirteen spokes have carried an FC 27
// callout since 16 Aug, and between them it produced two clicks in a
// fortnight. A link in a box below the fold of a long guide is not a bridge.
//
// Two facts point at what does work:
//
//   1. **Hub pages are the engine.** Every meaningful transition starts at a
//      roundup - `best-pro-clubs-archetypes` alone sent ~74 readers onward to
//      spokes. People who land on a roundup are still choosing; people deep in
//      a spoke have already chosen. So the bridge belongs on the roundups.
//
//   2. **FC 27 pages are terminal.** `fc27-club-objectives` took 95 entries
//      and sent 0 onward; `fc27-skill-moves` 69 and 0; `fc27-amps-explained`
//      41 and 0. Search is already delivering FC 27 readers - roughly 380
//      entries in a fortnight - and every one of them leaves from where they
//      landed. That is the cheaper win, because the audience is already there.
//
// ── What each block says
//
// The owner named what would pull an FC 26 player across, and the reasoning is
// that an existing player wants to know **what is different**, not what is the
// same: how progression changes, what Masteries are, and the Disruptor, which
// is the one genuinely new archetype and therefore the headline of the game.
//
// Ordered by that logic, not by what we happen to have written.
import { esc, kg } from './common.mjs';

// The FC 27 pages worth crossing for, in the order an FC 26 player cares.
// `why` is written for someone who has never played FC 27 and is asking what
// changed - never a summary of the article's own contents.
export const FC27_DRAWS = [
  ['fc27-disruptor-build',
   'The Disruptor',
   'The only brand-new archetype in FC 27 — a ball-winning midfielder built on Roy Keane, with a finished level-40 build.'],
  ['fc27-masteries-explained',
   'Masteries',
   'A permanent progression layer FC 26 does not have: every archetype you level grants attribute points to every build on your account.'],
  ['fc27-archetype-changes',
   'What changed for your archetype',
   'One signature PlayStyle instead of four, level-gated perks, and a different specialization structure.'],
  ['fc27-level-40-builds',
   'Level 40 builds',
   'FC 27 starts you at a 40-level cap with a far tighter budget, so the whole spending order changes.'],
  ['fc27-best-specializations',
   'The specializations worth unlocking',
   'Which ones pay for themselves at the new cap, and which are traps.'],
];

const CSS = `
.f27b{margin:2em 0;padding:18px 20px;border:1px solid rgba(201,162,39,.45);
  border-radius:12px;background:rgba(58,47,16,.35)}
.f27b .k{margin:0 0 3px;font:700 11.5px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif;
  letter-spacing:.1em;text-transform:uppercase;color:#c9a227}
.f27b h3{margin:0 0 10px;font:800 18px/1.25 system-ui,-apple-system,'Segoe UI',sans-serif;color:#f2f3f7}
.f27b ul{margin:0;padding:0;list-style:none}
.f27b li{margin:0 0 9px;font:400 14px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif;color:#d9dce3}
.f27b li:last-child{margin-bottom:0}
.f27b a{color:#7fb0ff;font-weight:700;text-decoration:none}
.f27b a:hover{text-decoration:underline}`;

const block = (kicker, head, items) => kg(`<div class="f27b">
<style>${CSS}</style>
<p class="k">${esc(kicker)}</p>
<h3>${esc(head)}</h3>
<ul>
${items.map(([slug, label, why]) =>
  `<li><a href="/blog/${slug}/">${esc(label)}</a> — ${esc(why)}</li>`).join('\n')}
</ul>
</div>`);

/**
 * For FC 26 pages. Placed HIGH on roundups - the flow data says a roundup
 * reader is still choosing, and the existing below-the-fold spoke callout
 * earned two clicks in two weeks.
 *
 * `n` is deliberately small: three things a reader might click beats five
 * they skim past.
 */
export const fc26ToFc27 = (n = 3) =>
  block('Playing FC 27 next', 'What actually changes in FC 27',
        FC27_DRAWS.slice(0, n));

/**
 * For FC 27 pages, which the flow data shows are dead ends: search delivers
 * the reader and nothing carries them onward. Excludes the page it is on.
 */
export const fc27Rail = (currentSlug, n = 4) => {
  const items = FC27_DRAWS.filter(([slug]) => slug !== currentSlug).slice(0, n);
  if (!items.length) return '';
  return block('More on FC 27', 'The rest of what is new', items);
};
