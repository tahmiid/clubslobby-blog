// Renders the 13 archetype cheat sheets (gen/cheatsheet.mjs; the roster is
// SHEETS there). The Disruptor sheet keeps what only its launch article said:
// the "only new archetype" opening, what the Disruptor is, building one at
// level 40, two questions and the FC 27 rail.
//
//     ~/.local/node22/bin/node gen/cheatsheets.mjs            # all 13
//     ~/.local/node22/bin/node gen/cheatsheets.mjs 18 64      # some
import { renderCheatSheet, SHEETS } from './cheatsheet.mjs';
import { fc27Rail } from './fc27bridge.mjs';
import { FC27_ARCH, psName } from './fc27grid.mjs';
import { BUDGET, CAP_LEVEL, assert, fmt, specName } from './archetype-stats.mjs';

const disruptor = () => {
  const a = FC27_ARCH.find((x) => x.id === 'disruptor');
  assert(psName(a.signature[0]) === 'Jockey', 'the Disruptor signature is Jockey');
  const crit = (id) => { const s = a.specializations.find((x) => x.id === id); assert(s, `disruptor has ${id}`); return [specName(s.name), s.criteria.map(([n]) => n).join('/')]; };
  const [dp, de, an] = [crit('disruptor-plus'), crit('destroyer'), crit('anchor')];
  return {
    tags: ['Guides', 'Builds', 'FC 27'],
    intro: `<p><strong>Disruptor is the only new archetype in FC 27</strong> — EA's own reveal names it, models it on Roy Keane, and hands it the central-midfield destroyer job: win the ball, set the tempo, let someone else take the bow. Below are the Disruptor builds people copy most, to open, copy and play with right now.</p>`,
    aboutExtra: `<h3 class="csh3">What the Disruptor is</h3>
<p>A ball-winner first. Its signature PlayStyle is <strong>Jockey</strong>, its stat spine is aggression, interceptions and stamina, and its ceilings reward the player who reads passes rather than chases them. It replaces FC 26's Engine — same slot in the midfield group, a much nastier job description — with shooting kept deliberately modest. Engine mains will feel at home in the shape and surprised by the teeth.</p>
<h3 class="csh3">Building one at level ${CAP_LEVEL}</h3>
<p>At the level-${CAP_LEVEL} cap you have ${fmt(BUDGET)} AP to spend. The specializations all ask for attributes in the 90s, so a level-${CAP_LEVEL} Disruptor picks one identity: ${dp[1]} for ${dp[0]}, ${de[1]} for ${de[0]}, or ${an[1]} for ${an[0]}. Our builds pay the PlayStyle floors first — Bruiser, Intercept and Press Proven all have attribute gates — then spend the rest down the player's real profile.</p>
<p style="margin-top:8px">The job is winning the ball, so the buttons that matter are on the <a href="/blog/fc27-basic-controls/">Defending page of the FC 27 controls</a>, animated.</p>`,
    faqExtra: [
      ['Is Disruptor new in FC 27?', "Yes — it's the only new archetype in FC 27. FC 26's Engine is gone from the lineup, and Disruptor is its aggressive replacement: same midfield slot, a ball-winner's brief."],
      ['Can I make a Disruptor build now?', "Yes — FC 27 is in our builder with the game's own numbers. If EA retunes anything in a title update, your builds re-price automatically; nothing you make is lost."],
    ],
    rail: fc27Rail('fc27-disruptor-build'),
  };
};
const EXTRA = { disruptor };

if (import.meta.url === `file://${process.argv[1]}`) {
  const only = new Set(process.argv.slice(2).map(Number));
  for (const s of SHEETS) if (!only.size || only.has(s.n)) renderCheatSheet({ ...s, ...(EXTRA[s.archId]?.() ?? {}) });
}
