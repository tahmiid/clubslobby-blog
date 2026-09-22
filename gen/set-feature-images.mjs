// Uploads the generated feature images and assigns each to its post.
// Feature images are composed from the app's own archetype icons (see
// assets/feat-*.png) so the blog and the builder share one visual language.
// Idempotent: re-uploading produces a new URL but re-assigning is harmless.
// Runs ON the server next to ghost-admin.mjs.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { call } from './ghost-admin.mjs';

const MAP = [
  ['feat-a1.png', 'pro-clubs-archetypes-explained', 'All 13 Pro Clubs archetype icons'],
  ['feat-a2.png', 'pro-clubs-archetypes-compared', 'Pro Clubs archetypes compared by attribute ceiling'],
  ['feat-a3.png', 'which-pro-clubs-archetype-should-i-play', 'Choosing between Pro Clubs archetypes'],
  ['feat-a4.png', 'pro-clubs-accelerate-explosive-lengthy-controlled', 'Controlled, Explosive and Lengthy acceleration compared'],
  ['feat-fc27-grounds.jpg', 'fc27-the-grounds-pro-clubs-explained', "EA SPORTS FC 27's The Grounds: a cage pitch and crowd in the social hub"],
  ['feat-fc27-platforms.jpg', 'fc27-clubs-platforms-ps4-xbox-one-switch', 'PS4, Xbox One and Switch struck through; PS5, Series X|S, PC and Switch 2 supported'],
  ['feat-a8.png', 'pro-clubs-playstyle-requirements', 'Two thresholds cleared and one missed'],
  ['feat-a9.png', 'pro-clubs-specializations-unlock-planner', 'One archetype branching into three specializations'],
  ['feat-a10.png', 'pro-clubs-level-rewards', 'The climb to level 100 with milestone steps'],
  ['feat-a11.png', 'pro-clubs-attribute-upgrade-costs', 'Attribute point prices rising into a cost wall'],
  ['feat-a12.png', 'pro-clubs-archetypes-head-to-head', 'Two archetypes compared across the halfway line'],
  ['feat-fc27-masteries.jpg', 'fc27-masteries-explained', 'EA SPORTS FC 27 key art with MASTERIES across it'],
  ['feat-fc27-amps.jpg', 'fc27-amps-explained', 'EA SPORTS FC 27 key art with AMPS across it'],
  ['feat-fc27-archetypes.jpg', 'fc27-archetype-changes', 'EA SPORTS FC 27 key art with ARCHETYPES across it'],
  ['feat-fc27-tournaments.jpg', 'fc27-clubs-live-tournaments', 'The Bernabéu in FC 27\u2019s The Grounds, with TOURNAMENTS across it'],
  ['feat-fc27-objectives.jpg', 'fc27-club-objectives', 'A club flag draped over a building in FC 27\u2019s The Grounds, with OBJECTIVES across it'],
  // The four FC 27 pieces also leave the generated-geometry set (2026-08-08):
  // EA's official FC 27 key art carrying each article's biggest keyword, by
  // gen/make-fc27-feats.py. Masteries earned the only real search traffic the
  // blog had, so these are the pages worth dressing properly. The platforms
  // cover deliberately answers "does my PS4 run it" rather than staging a
  // console rivalry — the research notes say The Grounds is new-gen only.
  // The 13 archetype spoke pages carry official EA SPORTS FC 26 in-game art
  // with the archetype's name in large type — the same treatment as the FC 27
  // set, composed by gen/make-spoke-covers.py (2026-08-08). The art is chosen
  // by the archetype's position, so a keeper article looks like one.
  //
  // This replaced the FC 26 studio key art with a badged glyph: one purple
  // poster on all thirteen, which read as dated beside the FC 27 covers.
  // make-spoke-feats.py still owns feat-spokes.jpg, the in-body cover figure.
  ...['magician', 'shot-stopper', 'sweeper-keeper', 'progressor', 'boss', 'engine', 'marauder',
    'recycler', 'maestro', 'creator', 'spark', 'finisher', 'target']
    .map((a) => [`feat-spoke-${a}.jpg`, `pro-clubs-${a}-build`,
      `Official EA SPORTS FC 26 in-game art with ${a.replace(/-/g, ' ').toUpperCase()} in large type`]),
  // a31-a35, the roundup set (gen/make-group-feats.py, 2026-08-11): the four
  // position pages reuse the spoke set's position stills — deliberate, one
  // visual language per position — and the tier list takes the FC 26 studio
  // key art, whose five posed players read as the lineup a tier list is.
  ['feat-a31.jpg', 'best-pro-clubs-archetypes', 'Official EA SPORTS FC 26 key art with TIER LIST in large type'],
  ['feat-a32.jpg', 'pro-clubs-striker-archetypes', 'Official EA SPORTS FC 26 art with STRIKERS in large type'],
  ['feat-a33.jpg', 'pro-clubs-midfielder-archetypes', 'Official EA SPORTS FC 26 art with MIDFIELD in large type'],
  ['feat-a34.jpg', 'pro-clubs-defender-archetypes', 'Official EA SPORTS FC 26 defenders art with DEFENDERS in large type'],
  ['feat-a35.jpg', 'pro-clubs-goalkeeper-archetypes', 'Official EA SPORTS FC 26 goalkeeper art with KEEPERS in large type'],
  // The 35 player-page covers (a72–a106). These rows lived only on the box
  // until 2026-09-15, when the generated block below made the repo copy the
  // one that ships; ported back so the two files are one file again.
  ['feat-player-vinicius.jpg', 'vinicius-pro-clubs-build', 'Vinícius Júnior Pro Clubs build cover'],
  ['feat-player-de-bruyne.jpg', 'de-bruyne-pro-clubs-build', 'Kevin De Bruyne Pro Clubs build cover'],
  ['feat-player-harry-kane.jpg', 'harry-kane-pro-clubs-build', 'Harry Kane Pro Clubs build cover'],
  ['feat-player-lewandowski.jpg', 'lewandowski-pro-clubs-build', 'Robert Lewandowski Pro Clubs build cover'],
  ['feat-player-modric.jpg', 'modric-pro-clubs-build', 'Luka Modrić Pro Clubs build cover'],
  ['feat-player-kroos.jpg', 'kroos-pro-clubs-build', 'Toni Kroos Pro Clubs build cover'],
  ['feat-player-ronaldo-r9.jpg', 'ronaldo-r9-pro-clubs-build', 'Ronaldo R9 Pro Clubs build cover'],
  ['feat-player-pele.jpg', 'pele-pro-clubs-build', 'Pelé Pro Clubs build cover'],
  ['feat-player-roberto-carlos.jpg', 'roberto-carlos-pro-clubs-build', 'Roberto Carlos Pro Clubs build cover'],
  ['feat-player-kaka.jpg', 'kaka-pro-clubs-build', 'Kaká Pro Clubs build cover'],
  ['feat-player-ibrahimovic.jpg', 'ibrahimovic-pro-clubs-build', 'Zlatan Ibrahimović Pro Clubs build cover'],
  ['feat-player-saka.jpg', 'saka-pro-clubs-build', 'Bukayo Saka Pro Clubs build cover'],
  ['feat-player-foden.jpg', 'foden-pro-clubs-build', 'Phil Foden Pro Clubs build cover'],
  ['feat-player-musiala.jpg', 'musiala-pro-clubs-build', 'Jamal Musiala Pro Clubs build cover'],
  ['feat-player-wirtz.jpg', 'wirtz-pro-clubs-build', 'Florian Wirtz Pro Clubs build cover'],
  ['feat-player-leao.jpg', 'leao-pro-clubs-build', 'Rafael Leão Pro Clubs build cover'],
  ['feat-player-bruno-fernandes.jpg', 'bruno-fernandes-pro-clubs-build', 'Bruno Fernandes Pro Clubs build cover'],
  ['feat-player-neuer.jpg', 'neuer-pro-clubs-build', 'Manuel Neuer Pro Clubs build cover'],
  ['feat-player-davies.jpg', 'davies-pro-clubs-build', 'Alphonso Davies Pro Clubs build cover'],
  ['feat-player-son.jpg', 'son-pro-clubs-build', 'Son Heung-min Pro Clubs build cover'],

  // The ORIGINAL fifteen player pages (a72-a86). Their covers were generated
  // alongside the rest and have been sitting in assets/ the whole time, but
  // only the second batch of twenty was ever added to this map - so fifteen
  // published articles ran with NO feature image. Found 2026-08-23 by
  // auditing Ghost's posts table, which is the only place it shows.
  ['feat-player-cristiano.jpg', 'cristiano-ronaldo-pro-clubs-build', 'Cristiano Ronaldo Pro Clubs build cover'],
  ['feat-player-messi.jpg', 'messi-pro-clubs-build', 'Lionel Messi Pro Clubs build cover'],
  ['feat-player-neymar.jpg', 'neymar-pro-clubs-build', 'Neymar Jr Pro Clubs build cover'],
  ['feat-player-mbappe.jpg', 'mbappe-pro-clubs-build', 'Kylian Mbappé Pro Clubs build cover'],
  ['feat-player-haaland.jpg', 'haaland-pro-clubs-build', 'Erling Haaland Pro Clubs build cover'],
  ['feat-player-zidane.jpg', 'zidane-pro-clubs-build', 'Zinedine Zidane Pro Clubs build cover'],
  ['feat-player-ronaldinho.jpg', 'ronaldinho-pro-clubs-build', 'Ronaldinho Pro Clubs build cover'],
  ['feat-player-salah.jpg', 'salah-pro-clubs-build', 'Mohamed Salah Pro Clubs build cover'],
  ['feat-player-van-dijk.jpg', 'van-dijk-pro-clubs-build', 'Virgil van Dijk Pro Clubs build cover'],
  ['feat-player-isak.jpg', 'isak-pro-clubs-build', 'Alexander Isak Pro Clubs build cover'],
  ['feat-player-henry.jpg', 'thierry-henry-pro-clubs-build', 'Thierry Henry Pro Clubs build cover'],
  ['feat-player-maradona.jpg', 'maradona-pro-clubs-build', 'Diego Maradona Pro Clubs build cover'],
  ['feat-player-yamal.jpg', 'lamine-yamal-pro-clubs-build', 'Lamine Yamal Pro Clubs build cover'],
  ['feat-player-bellingham.jpg', 'bellingham-pro-clubs-build', 'Jude Bellingham Pro Clubs build cover'],
  ['feat-player-usain-bolt.jpg', 'usain-bolt-pro-clubs-build', 'Usain Bolt Pro Clubs build cover'],
  // ── BEGIN generated by gen/fc27-howtos.mjs — do not edit by hand ──────────
  ['feat-howto-directional-nutmeg.jpg', 'fc27-how-to-directional-nutmeg', 'EA SPORTS FC 27 key art with NUTMEG across it'],
  ['feat-howto-open-up-fake-shot.jpg', 'fc27-how-to-open-up-fake-shot', 'EA SPORTS FC 27 key art with FAKE SHOT across it'],
  ['feat-howto-flick-up-for-volley.jpg', 'fc27-how-to-flick-up-for-volley', 'EA SPORTS FC 27 key art with FOR VOLLEY across it'],
  ['feat-howto-first-time-feint-turn.jpg', 'fc27-how-to-first-time-feint-turn', 'EA SPORTS FC 27 key art with FEINT TURN across it'],
  ['feat-howto-feint-forward-and-turn.jpg', 'fc27-how-to-feint-forward-and-turn', 'EA SPORTS FC 27 key art with FEINT & TURN across it'],
  ['feat-howto-body-feint.jpg', 'fc27-how-to-body-feint', 'EA SPORTS FC 27 key art with BODY FEINT across it'],
  ['feat-howto-stepover.jpg', 'fc27-how-to-stepover', 'EA SPORTS FC 27 key art with STEPOVER across it'],
  ['feat-howto-reverse-stepover.jpg', 'fc27-how-to-reverse-stepover', 'EA SPORTS FC 27 key art with REVERSE STEPOVER across it'],
  ['feat-howto-ball-roll.jpg', 'fc27-how-to-ball-roll', 'EA SPORTS FC 27 key art with BALL ROLL across it'],
  ['feat-howto-drag-back.jpg', 'fc27-how-to-drag-back', 'EA SPORTS FC 27 key art with DRAG BACK across it'],
  ['feat-howto-heel-flick.jpg', 'fc27-how-to-heel-flick', 'EA SPORTS FC 27 key art with HEEL FLICK across it'],
  ['feat-howto-roulette.jpg', 'fc27-how-to-roulette', 'EA SPORTS FC 27 key art with ROULETTE across it'],
  ['feat-howto-fake-and-go.jpg', 'fc27-how-to-fake-and-go', 'EA SPORTS FC 27 key art with & GO across it'],
  ['feat-howto-heel-chop.jpg', 'fc27-how-to-heel-chop', 'EA SPORTS FC 27 key art with HEEL CHOP across it'],
  ['feat-howto-feint-and-exit.jpg', 'fc27-how-to-feint-and-exit', 'EA SPORTS FC 27 key art with & EXIT across it'],
  ['feat-howto-stutter-feint.jpg', 'fc27-how-to-stutter-feint', 'EA SPORTS FC 27 key art with STUTTER FEINT across it'],
  ['feat-howto-ball-hop.jpg', 'fc27-how-to-ball-hop', 'EA SPORTS FC 27 key art with BALL HOP across it'],
  ['feat-howto-ball-roll-drag.jpg', 'fc27-how-to-ball-roll-drag', 'EA SPORTS FC 27 key art with ROLL DRAG across it'],
  ['feat-howto-drag-back-turn.jpg', 'fc27-how-to-drag-back-turn', 'EA SPORTS FC 27 key art with BACK TURN across it'],
  ['feat-howto-heel-to-heel.jpg', 'fc27-how-to-heel-to-heel', 'EA SPORTS FC 27 key art with TO HEEL across it'],
  ['feat-howto-rainbow-flick.jpg', 'fc27-how-to-rainbow-flick', 'EA SPORTS FC 27 key art with RAINBOW FLICK across it'],
  ['feat-howto-spin.jpg', 'fc27-how-to-spin', 'EA SPORTS FC 27 key art with SPIN across it'],
  ['feat-howto-stop-and-turn.jpg', 'fc27-how-to-stop-and-turn', 'EA SPORTS FC 27 key art with & TURN across it'],
  ['feat-howto-ball-roll-cut.jpg', 'fc27-how-to-ball-roll-cut', 'EA SPORTS FC 27 key art with ROLL CUT across it'],
  ['feat-howto-fake-pass.jpg', 'fc27-how-to-fake-pass', 'EA SPORTS FC 27 key art with FAKE PASS across it'],
  ['feat-howto-quick-ball-rolls.jpg', 'fc27-how-to-quick-ball-rolls', 'EA SPORTS FC 27 key art with BALL ROLLS across it'],
  ['feat-howto-lane-change.jpg', 'fc27-how-to-lane-change', 'EA SPORTS FC 27 key art with LANE CHANGE across it'],
  ['feat-howto-three-touch-roulette.jpg', 'fc27-how-to-three-touch-roulette', 'EA SPORTS FC 27 key art with 3-TOUCH ROULETTE across it'],
  ['feat-howto-drag-back-spin.jpg', 'fc27-how-to-drag-back-spin', 'EA SPORTS FC 27 key art with BACK SPIN across it'],
  ['feat-howto-drag-to-heel.jpg', 'fc27-how-to-drag-to-heel', 'EA SPORTS FC 27 key art with TO HEEL across it'],
  ['feat-howto-heel-to-ball-roll.jpg', 'fc27-how-to-heel-to-ball-roll', 'EA SPORTS FC 27 key art with BALL ROLL across it'],
  ['feat-howto-drag-to-chop.jpg', 'fc27-how-to-drag-to-chop', 'EA SPORTS FC 27 key art with TO CHOP across it'],
  ['feat-howto-advanced-heel-flick.jpg', 'fc27-how-to-advanced-heel-flick', 'EA SPORTS FC 27 key art with HEEL FLICK across it'],
  ['feat-howto-flair-nutmegs.jpg', 'fc27-how-to-flair-nutmegs', 'EA SPORTS FC 27 key art with FLAIR NUTMEGS across it'],
  ['feat-howto-elastico.jpg', 'fc27-how-to-elastico', 'EA SPORTS FC 27 key art with ELASTICO across it'],
  ['feat-howto-reverse-elastico.jpg', 'fc27-how-to-reverse-elastico', 'EA SPORTS FC 27 key art with REVERSE ELASTICO across it'],
  ['feat-howto-hocus-pocus.jpg', 'fc27-how-to-hocus-pocus', 'EA SPORTS FC 27 key art with HOCUS POCUS across it'],
  ['feat-howto-triple-elastico.jpg', 'fc27-how-to-triple-elastico', 'EA SPORTS FC 27 key art with TRIPLE ELASTICO across it'],
  ['feat-howto-ball-roll-and-flick.jpg', 'fc27-how-to-ball-roll-and-flick', 'EA SPORTS FC 27 key art with ROLL & FLICK across it'],
  ['feat-howto-heel-flick-turn.jpg', 'fc27-how-to-heel-flick-turn', 'EA SPORTS FC 27 key art with HEEL FLICK across it'],
  ['feat-howto-sombrero-flick.jpg', 'fc27-how-to-sombrero-flick', 'EA SPORTS FC 27 key art with SOMBRERO FLICK across it'],
  ['feat-howto-turn-and-spin.jpg', 'fc27-how-to-turn-and-spin', 'EA SPORTS FC 27 key art with & SPIN across it'],
  ['feat-howto-ball-roll-fake.jpg', 'fc27-how-to-ball-roll-fake', 'EA SPORTS FC 27 key art with ROLL FAKE across it'],
  ['feat-howto-ball-roll-fake-turn.jpg', 'fc27-how-to-ball-roll-fake-turn', 'EA SPORTS FC 27 key art with ROLL FAKE across it'],
  ['feat-howto-rabona-fake.jpg', 'fc27-how-to-rabona-fake', 'EA SPORTS FC 27 key art with RABONA FAKE across it'],
  ['feat-howto-elastico-chop.jpg', 'fc27-how-to-elastico-chop', 'EA SPORTS FC 27 key art with ELASTICO CHOP across it'],
  ['feat-howto-spin-flick.jpg', 'fc27-how-to-spin-flick', 'EA SPORTS FC 27 key art with SPIN FLICK across it'],
  ['feat-howto-flick-over.jpg', 'fc27-how-to-flick-over', 'EA SPORTS FC 27 key art with FLICK OVER across it'],
  ['feat-howto-tornado-spin.jpg', 'fc27-how-to-tornado-spin', 'EA SPORTS FC 27 key art with TORNADO SPIN across it'],
  ['feat-howto-heel-fake.jpg', 'fc27-how-to-heel-fake', 'EA SPORTS FC 27 key art with HEEL FAKE across it'],
  ['feat-howto-cancel-celebration.jpg', 'fc27-cancel-celebration', 'EA SPORTS FC 27 key art with CANCEL across it'],
  ['feat-howto-knee-slide.jpg', 'fc27-knee-slide-celebration', 'EA SPORTS FC 27 key art with KNEE SLIDE across it'],
  ['feat-howto-motorbike.jpg', 'fc27-motorbike-celebration', 'EA SPORTS FC 27 key art with MOTORBIKE across it'],
  ['feat-howto-walk.jpg', 'fc27-walk-celebration', 'EA SPORTS FC 27 key art with WALK across it'],
  ['feat-howto-power-slide.jpg', 'fc27-power-slide-celebration', 'EA SPORTS FC 27 key art with POWER SLIDE across it'],
  ['feat-howto-jump-dance.jpg', 'fc27-jump-dance-celebration', 'EA SPORTS FC 27 key art with JUMP DANCE across it'],
  ['feat-howto-nap.jpg', 'fc27-nap-celebration', 'EA SPORTS FC 27 key art with NAP across it'],
  ['feat-howto-chair.jpg', 'fc27-chair-celebration', 'EA SPORTS FC 27 key art with CHAIR across it'],
  ['feat-howto-balance.jpg', 'fc27-balance-celebration', 'EA SPORTS FC 27 key art with BALANCE across it'],
  ['feat-howto-time-check.jpg', 'fc27-time-check-celebration', 'EA SPORTS FC 27 key art with TIME CHECK across it'],
  ['feat-howto-backflips.jpg', 'fc27-backflips-celebration', 'EA SPORTS FC 27 key art with BACKFLIPS across it'],
  ['feat-howto-guitar.jpg', 'fc27-guitar-celebration', 'EA SPORTS FC 27 key art with GUITAR across it'],
  ['feat-howto-boxing.jpg', 'fc27-boxing-celebration', 'EA SPORTS FC 27 key art with BOXING across it'],
  ['feat-howto-kiss-the-ring.jpg', 'fc27-kiss-the-ring-celebration', 'EA SPORTS FC 27 key art with KISS THE RING across it'],
  ['feat-howto-chicken-dance.jpg', 'fc27-chicken-dance-celebration', 'EA SPORTS FC 27 key art with CHICKEN DANCE across it'],
  ['feat-howto-phone.jpg', 'fc27-phone-celebration', 'EA SPORTS FC 27 key art with PHONE across it'],
  ['feat-howto-point-to-sky.jpg', 'fc27-point-to-sky-celebration', 'EA SPORTS FC 27 key art with POINT TO SKY across it'],
  ['feat-howto-spanish-dance.jpg', 'fc27-spanish-dance-celebration', 'EA SPORTS FC 27 key art with SPANISH DANCE across it'],
  ['feat-howto-hypnosis.jpg', 'fc27-hypnosis-celebration', 'EA SPORTS FC 27 key art with HYPNOSIS across it'],
  ['feat-howto-dance.jpg', 'fc27-dance-celebration', 'EA SPORTS FC 27 key art with DANCE across it'],
  ['feat-howto-ice-skating.jpg', 'fc27-ice-skating-celebration', 'EA SPORTS FC 27 key art with ICE SKATING across it'],
  ['feat-howto-golf-swing.jpg', 'fc27-golf-swing-celebration', 'EA SPORTS FC 27 key art with GOLF SWING across it'],
  ['feat-howto-darts.jpg', 'fc27-darts-celebration', 'EA SPORTS FC 27 key art with DARTS across it'],
  ['feat-howto-matador.jpg', 'fc27-matador-celebration', 'EA SPORTS FC 27 key art with MATADOR across it'],
  ['feat-howto-eye-of-the-storm.jpg', 'fc27-eye-of-the-storm-celebration', 'EA SPORTS FC 27 key art with STORM across it'],
  ['feat-howto-pigeon.jpg', 'fc27-pigeon-celebration', 'EA SPORTS FC 27 key art with PIGEON across it'],
  ['feat-howto-show-respect.jpg', 'fc27-show-respect-celebration', 'EA SPORTS FC 27 key art with SHOW RESPECT across it'],
  ['feat-howto-flex.jpg', 'fc27-flex-celebration', 'EA SPORTS FC 27 key art with FLEX across it'],
  ['feat-howto-windmill.jpg', 'fc27-windmill-celebration', 'EA SPORTS FC 27 key art with WINDMILL across it'],
  ['feat-howto-heart-symbol.jpg', 'fc27-heart-symbol-celebration', 'EA SPORTS FC 27 key art with HEART SYMBOL across it'],
  // ── END generated ──────────────────────────────────────────────────────────
  // The FC 27 wave and the skill cluster shipped with no feature image at
  // all — nineteen published articles, audited 2026-08-20 against Ghost's
  // posts table rather than against this repo. Google shows this image in
  // results and Discover, so an article without one competes short-handed.
  // Art by gen/make-missing-feats.py; keywords cut to one or two words
  // because the type is sized to fill the width.
  ['feat-fc27-all13.jpg', 'fc27-archetypes', "EA SPORTS FC 27 key art with ALL 13 across it"],
  ['feat-fc27-specs.jpg', 'fc27-best-specializations', "EA SPORTS FC 27 key art with SPECIALIZATIONS across it"],
  ['feat-fc27-controls.jpg', 'fc27-control-changes', "EA SPORTS FC 27 key art with CONTROLS across it"],
  // The controls suite (2026-08-20).
  ['feat-fc27-controls-hub.jpg', 'fc27-controls', "EA SPORTS FC 27 key art with ALL CONTROLS across it"],
  ['feat-fc27-basic-controls.jpg', 'fc27-basic-controls', "EA SPORTS FC 27 key art with BASIC CONTROLS across it"],
  ['feat-fc27-skill-moves.jpg', 'fc27-skill-moves', "EA SPORTS FC 27 key art with SKILL MOVES across it"],
  ['feat-fc27-celebrations.jpg', 'fc27-celebrations', "EA SPORTS FC 27 key art with CELEBRATIONS across it"],
  ['feat-fc27-disruptor.jpg', 'fc27-disruptor-build', "EA SPORTS FC 27 key art with DISRUPTOR across it"],
  ['feat-fc27-level40.jpg', 'fc27-level-40-builds', "EA SPORTS FC 27 key art with LEVEL 40 across it"],
  ['feat-fc27-skills.jpg', 'fc27-new-skill-moves', "EA SPORTS FC 27 key art with SKILL MOVES across it"],
  ['feat-skill-giant-fake-shot.jpg', 'fc27-how-to-giant-fake-shot', "EA SPORTS FC 27 key art with FAKE SHOT across it"],
  ['feat-skill-stop-and-go.jpg', 'fc27-how-to-stop-and-go', "EA SPORTS FC 27 key art with STOP & GO across it"],
  ['feat-skill-drag-to-drag.jpg', 'fc27-how-to-drag-to-drag', "EA SPORTS FC 27 key art with DRAG TO DRAG across it"],
  ['feat-skill-foot-to-foot.jpg', 'fc27-how-to-foot-to-foot', "EA SPORTS FC 27 key art with FOOT TO FOOT across it"],
  ['feat-skill-lateral-heel-to-heel.jpg', 'fc27-how-to-lateral-heel-to-heel', "EA SPORTS FC 27 key art with HEEL TO HEEL across it"],
  ['feat-skill-drag-turn.jpg', 'fc27-how-to-drag-turn', "EA SPORTS FC 27 key art with DRAG TURN across it"],
  ['feat-skill-standing-scoop-turn.jpg', 'fc27-how-to-standing-scoop-turn', "EA SPORTS FC 27 key art with SCOOP TURN across it"],
  ['feat-skill-flair-roulette.jpg', 'fc27-how-to-flair-roulette', "EA SPORTS FC 27 key art with ROULETTE across it"],
  ['feat-skill-four-touch-skill.jpg', 'fc27-how-to-four-touch-skill', "EA SPORTS FC 27 key art with FOUR TOUCH across it"],
  ['feat-skill-skilled-bridge.jpg', 'fc27-how-to-skilled-bridge', "EA SPORTS FC 27 key art with SKILLED BRIDGE across it"],
  ['feat-skill-first-time-spin.jpg', 'fc27-how-to-first-time-spin', "EA SPORTS FC 27 key art with FIRST TIME SPIN across it"],
  ['feat-skill-alternate-elastico-chop.jpg', 'fc27-how-to-alternate-elastico-chop', "EA SPORTS FC 27 key art with ELASTICO CHOP across it"],
  ['feat-skill-running-fake-drag.jpg', 'fc27-how-to-running-fake-drag', "EA SPORTS FC 27 key art with FAKE DRAG across it"],
  // The five "best builds by position" pages (gen/make-fc27-role-feats.py, 2026-09-22).
  ['feat-fc27-strikers.jpg', 'best-pro-clubs-striker-builds', "EA SPORTS FC 27 key art with STRIKERS across it"],
  ['feat-fc27-wingers.jpg', 'best-pro-clubs-winger-builds', "EA SPORTS FC 27 key art with WINGERS across it"],
  ['feat-fc27-midfield.jpg', 'best-pro-clubs-midfielder-builds', "EA SPORTS FC 27 key art with MIDFIELD across it"],
  ['feat-fc27-defenders.jpg', 'best-pro-clubs-defender-builds', "EA SPORTS FC 27 key art with DEFENDERS across it"],
  ['feat-fc27-keepers.jpg', 'best-pro-clubs-goalkeeper-builds', "EA SPORTS FC 27 key art with KEEPERS across it"],
];

// Optional filter: `node set-feature-images.mjs a8 a12` assigns only those.
const only = new Set(process.argv.slice(2));

// No API upload. This script runs on the box as root, so it writes each image
// straight into Ghost's content/images — the exact directory the uploader
// would use — and assigns that URL. Ghost serves and resizes it identically,
// it's idempotent (same name overwrites, no -1 -2 litter), and it removes the
// one multipart call that the box->Cloudflare->box loop used to 520 on.
const GHOST_CONTENT = '/var/www/proclubslobby/content/images';
// Bump when re-issuing art under an existing name: image URLs carry
// max-age=31536000 and Cloudflare caches them, so a same-URL replacement
// serves stale renders (especially the /size/ variants) more or less forever.
const VERSION = '-v7';
const placeDirect = (file) => {
  const served = file.replace(/(\.\w+)$/, `${VERSION}$1`);
  const now = new Date();
  const sub = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  mkdirSync(`${GHOST_CONTENT}/${sub}`, { recursive: true });
  writeFileSync(`${GHOST_CONTENT}/${sub}/${served}`,
    readFileSync(path.join(import.meta.dirname, 'assets', file)), { mode: 0o644 });
  return `https://proclubshq.com/blog/content/images/${sub}/${served}`;
};

for (const [file, slug, alt] of MAP) {
  if (only.size && !only.has(slug) && !only.has(file.replace('feat-', '').replace(/\.(png|jpg)$/, ''))) continue;
  try {
    const url = placeDirect(file);
    const f = await call(`/posts/slug/${slug}/`);
    if (!f.ok) throw new Error(`post not found (${f.status})`);
    const p = (await f.json()).posts[0];
    const r = await call(`/posts/${p.id}/`, { method: 'PUT',
      body: JSON.stringify({ posts: [{ feature_image: url, feature_image_alt: alt, updated_at: p.updated_at }] }) });
    if (!r.ok) throw new Error(`assign ${r.status} ${JSON.stringify(await r.json()).slice(0, 120)}`);
    console.log(`  ok    ${slug} -> ${url}`);
  } catch (e) {
    console.log(`  FAIL  ${slug} — ${String(e.message || e).slice(0, 140)}`);
  }
}
