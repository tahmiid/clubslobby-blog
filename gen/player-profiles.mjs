// "How he plays" — the one section on each player page that no other page has.
//
// Added 2026-10-07 after the URL Inspection read: 24 of the 35 player pages
// were not indexed (17 "unknown to Google", 6 "discovered - not indexed"),
// and about 70% of each page's text lines were identical to every other
// player page. Google skips pages that read as copies of each other; this is
// the part that makes each one about its player.
//
// Rules for this file:
// - Real-football style only: how the player moves, where he receives, what
//   he does with the ball. No current club (transfers move faster than we
//   regenerate), no game mechanics (verify-gameplay rule), no numbers the
//   build doc does not print.
// - Two short paragraphs: how he plays, then what a Pro Clubs player is
//   really copying when he copies the build.
export const PROFILES = {
  'lamine-yamal': [
    `Yamal plays as a right winger who wants the ball to his feet, wide and early. He holds the touchline, invites the full-back to commit, then goes inside onto his left foot, where the curled shot, the disguised through ball and the outside-of-the-boot cross all come from the same body shape. Defenders cannot read which one is coming, which is the whole point.`,
    `Copying the build means copying that habit: receive wide, beat one man, cut in. It is a role for a player who likes the ball under pressure and takes on the full-back again after losing the first duel, not for one who wants to run in behind.`,
  ],
  bellingham: [
    `Bellingham is a midfielder who arrives. He starts deeper than a number ten, carries the ball through the middle with long strides and his body between man and ball, and then turns up in the box at the moment the defence is looking at the winger. Headers, late runs and finishes from the edge are a big part of his game for a midfielder.`,
    `The build suits a Pro Clubs player who does not want to sit: someone who links play, wins second balls and still makes the run into the box every attack. It asks for engine and timing more than tricks.`,
  ],
  'bruno-fernandes': [
    `Fernandes is the attacking midfielder who keeps trying the difficult pass. He drifts between the lines and into the half-spaces, plays forward the first time whenever he can, and shoots from distance when the pass is not on. He takes free kicks and penalties, and he loses the ball more than safer players because he aims higher.`,
    `In Pro Clubs that is the creator a team builds its attack around: the player who wants every ball in the final third and accepts the turnovers that come with it.`,
  ],
  'cristiano-ronaldo': [
    `Late in his career Ronaldo plays as a pure centre-forward. He does little of the build-up, saves his running for the box, attacks crosses with a famous leap and shoots the moment he sees the goal. The stepovers of his early years have given way to movement: the near-post dart, the drift to the back post, the finish with either foot or his head.`,
    `Copying the build is copying that end product. It is a striker for a club that gets the ball wide and crosses, and for a player who is happy to touch the ball less and finish more.`,
  ],
  davies: [
    `Davies is a left-back who plays like a winger. His acceleration lets him recover almost any lost duel, so he can push high, overlap the winger and carry the ball the length of the pitch on his own. Defensively he relies on that recovery pace more than positioning.`,
    `The build is for a full-back who wants to attack: overlap, deliver, then sprint back. It suits a club whose wide midfielder tucks inside and leaves the flank to the full-back.`,
  ],
  'de-bruyne': [
    `De Bruyne is the best crosser and through-ball passer of his generation. He receives in the right half-space, takes one touch to set the ball and whips it across the six-yard box or between centre-backs with either foot. He also shoots from the edge of the area with real power.`,
    `A Pro Clubs player copying the build is copying the final ball: a central midfielder who looks forward first and wants his strikers making runs before he has even received.`,
  ],
  foden: [
    `Foden plays wherever the space is between the lines: on the left, through the middle or as a false nine. Low centre of gravity, close control in tight areas, quick one-twos and a left foot that finishes from the edge of the box. He drifts inside from the wing rather than going round his full-back.`,
    `The build fits a creative player who wants to roam and combine in small spaces rather than hold a position or run in behind.`,
  ],
  haaland: [
    `Haaland touches the ball very little and scores anyway. He lives on the shoulder of the last defender, runs in behind with huge strides, and finishes with power, usually first time and usually low across the keeper. He is strong enough to hold off centre-backs and dangerous in the air, but his game is movement and finishing, not link-up play.`,
    `Copying the build is copying the number nine who waits. It suits a club with midfielders who play through balls early and a striker happy to go ten minutes without a touch.`,
  ],
  'harry-kane': [
    `Kane is a striker and a playmaker in one. He drops deep to receive, turns and plays long diagonal passes to runners, then is back in the box to finish. He is one of the cleanest strikers of the ball in the game, from penalties to long-range efforts, and strong enough to hold play up under pressure.`,
    `The build is for a striker who wants to be involved: link play, create for the wingers, and still score. It suits clubs whose wide players run in behind.`,
  ],
  ibrahimovic: [
    `Ibrahimović was a tall striker with a smaller player's technique: control with any surface, flicks and back-heels, spectacular volleys and the strength to shrug off defenders. He dropped deep to link play as often as he attacked the box, and his confidence was part of his game.`,
    `The build copies the target man who can also play: hold the ball up, bring others in, and finish the chances nobody else would try.`,
  ],
  isak: [
    `Isak is a tall striker who moves like a winger. He drifts wide to receive, dribbles at centre-backs with long strides and close control, and finishes calmly, often by opening his body and passing the ball into the corner. He also links play with clever touches around the box.`,
    `The build suits a striker who wants to dribble and move, not just stand between the centre-backs, and a club that lets its number nine roam.`,
  ],
  kaka: [
    `Kaká was the midfielder who ran through teams. He received in the middle third, accelerated past the first press with huge strides and kept going, finishing the move himself or playing the last pass at full speed. His dribbling was about pace and direction, not tricks.`,
    `Copying the build is copying the carrier: an attacking midfielder who drives forward with the ball and gets into scoring positions himself.`,
  ],
  kroos: [
    `Kroos ran games without running much. He received deep, often dropping between or beside the centre-backs, and controlled the tempo with short and long passing that almost never went astray. Switches of play, set pieces and calm decisions under pressure were his game; dribbling and tackling were not.`,
    `The build is for the deep playmaker who wants every ball and keeps possession for the club. It needs teammates who move, because its strength is the pass.`,
  ],
  leao: [
    `Leão is a left winger who beats players with long strides rather than quick feet. He gets the ball wide, runs at the full-back, and once he gets a yard on him he is gone. He cuts inside to shoot or drives to the byline, and he can look quiet for spells and then decide a game in one run.`,
    `The build copies that direct, straight-line wide player: get it wide, run at the defence, finish or set up.`,
  ],
  lewandowski: [
    `Lewandowski is the complete box striker. His movement is the skill: losing his marker at the near post, peeling off to the back post, arriving at the right moment. He finishes with either foot and his head, holds the ball up well and has scored a huge number of goals across his career.`,
    `Copying the build means copying the finisher who also links play: a striker who scores most of his goals inside the box and still helps the team keep the ball.`,
  ],
  maradona: [
    `Maradona carried the ball like no one else: a low centre of gravity, the ball glued to his left foot, and the strength to stay on it through challenges. He dribbled through whole teams, played passes nobody else saw and scored from free kicks and from impossible angles.`,
    `The build is for the playmaker-dribbler who wants the ball all the time and makes the difference on his own.`,
  ],
  mbappe: [
    `Mbappé is the fastest elite attacker in the world, and he plays like it. He starts on the left or through the middle, attacks the space behind the defence, and finishes with power and placement, often across the keeper after cutting inside from the left. He can dribble at speed and in tight spaces, but his biggest weapon is the run in behind.`,
    `Copying the build is copying pace aimed at goal: a forward who wants through balls, runs in behind and finishes first time.`,
  ],
  messi: [
    `Messi drifts from the right into the middle, receives in pockets nobody is marking, and from there does everything: the slalom through three defenders, the curled shot to the far corner, the through ball no one else saw. He walks a lot, then decides the game in a few seconds, and he is one of the greatest passers the game has seen as well as one of the greatest dribblers.`,
    `The build copies the playmaker-forward who wants the ball to feet and makes the final decision of every attack.`,
  ],
  modric: [
    `Modrić is the midfielder who plays the outside-of-the-boot pass everyone remembers. He receives under pressure, turns away from it, and plays forward with either foot, with clever disguise. He keeps working out of possession well into his late thirties, and his passing range covers every distance.`,
    `The build is for the central midfielder who links defence and attack: keep the ball, turn, find the forward pass.`,
  ],
  musiala: [
    `Musiala is a dribbler in tight spaces. He receives between the lines, keeps the ball close with constant tiny touches, slips between two defenders and keeps going into the box. Good balance and quick changes of direction make him very hard to knock off the ball.`,
    `Copying the build is copying the attacking midfielder who dribbles first: take on the press in the middle of the pitch and get into the box.`,
  ],
  neuer: [
    `Neuer changed what a goalkeeper does. He plays high, often far outside his box, to sweep up balls played over his defence, and he passes like an outfield player. On the line he is still an elite shot-stopper, with big reach and fast reactions one-on-one.`,
    `The build is for a keeper who wants to be part of the build-up and cover the space behind a high line, not just stay on his line.`,
  ],
  neymar: [
    `Neymar is pure skill: stepovers, flicks, rainbows and constant changes of direction, usually starting from the left. He draws fouls, beats defenders in tight spaces and plays as a creator as much as a finisher, with clever passes and set pieces.`,
    `Copying the build is copying the flair winger: take players on, create chances, and enjoy the skill moves.`,
  ],
  pele: [
    `Pelé could do everything a forward does: both feet, the header, the dribble and the finish, combined with great athleticism. He scored from anywhere and also played as a creator behind the striker.`,
    `The build is a complete forward: a player who wants to score and create in equal measure, with nothing missing from his game.`,
  ],
  'roberto-carlos': [
    `Roberto Carlos was the most attacking left-back of his era. He bombed forward all game, crossed from deep, and is remembered for powerful left-foot free kicks and long-range shots. His pace let him get back after every overlap.`,
    `The build copies the attacking full-back with a shot: overlap, cross, and hit it from distance when the chance comes.`,
  ],
  'ronaldo-r9': [
    `Ronaldo Nazário, R9, was the original explosive striker. He picked the ball up deep or wide, ran at defenders at full speed, beat them with the elastico or a stepover and finished calmly, often by rounding the keeper. Strength, acceleration and close control at top speed made him almost impossible to stop one-on-one.`,
    `The build copies the striker who scores on his own: drop in, turn, run at the back line and finish.`,
  ],
  ronaldinho: [
    `Ronaldinho played with a smile and the ball. Elasticos, no-look passes, flicks and free kicks: he invented moves, and he used them to create and score, not just to show off. He started on the left and drifted everywhere.`,
    `The build is for the player who learned skill moves to beat people, wants every ball and plays to entertain.`,
  ],
  saka: [
    `Saka is a right winger on his left foot. He receives wide, takes on his full-back over and over, and cuts in to shoot or crosses with his left. He works back hard, draws fouls and creates as many chances as he scores.`,
    `Copying the build is copying the hard-working inverted winger: a player who takes on his man every time and helps his full-back defend.`,
  ],
  salah: [
    `Salah plays from the right and thinks like a striker. He starts wide, cuts inside onto his left foot and either curls it into the far corner or makes a diagonal run behind the full-back. Most of his goals come from inside the box, and he scores them year after year.`,
    `The build copies the goalscoring winger: a wide player whose first thought is the goal.`,
  ],
  son: [
    `Son is genuinely two-footed. He starts on the left, runs in behind, and finishes with either foot from almost any angle, often across the keeper. He is very fast in a straight line and works hard without the ball.`,
    `The build is for the wide forward who wants to score: run in behind, cut inside on either side, and shoot.`,
  ],
  'thierry-henry': [
    `Henry started wide on the left, drifted inside, and finished by passing the ball into the far corner with his right foot. He combined elite pace with close control, and he was a creator too, often the one making the final pass.`,
    `The build copies the fast, elegant forward who starts wide and finishes inside.`,
  ],
  'usain-bolt': [
    `Bolt is a sprinter, not a footballer, and this build is a what-if: the fastest man in history as a Pro Clubs player.`,
    `Copy it for fun or to see how pace alone plays. Do not expect it to replace a finished build from the guides.`,
  ],
  'van-dijk': [
    `Van Dijk is a tall, calm centre-back. He reads the game early, wins aerial duels, rarely has to tackle and passes out from the back with long diagonals. Few attackers ever dribble past him, because he slows them down and shows them where he wants them to go.`,
    `The build copies the leader of a back line: win the header, read the pass, start the attack.`,
  ],
  vinicius: [
    `Vinícius Júnior plays on the left and gets a defender one-on-one as often as possible. He dribbles with quick changes of direction and pace, drives to the byline or cuts in onto his right foot, and he has become a regular goalscorer as well as a creator.`,
    `The build copies the dribbling left winger who wins the game by beating his man again and again.`,
  ],
  wirtz: [
    `Wirtz is a creative attacking midfielder who plays between the lines. He receives on the half-turn, beats the first press with a touch, and plays through balls and one-twos with timing beyond his years. He scores and assists in equal measure.`,
    `The build is for the playmaker who wants to receive in the pocket, turn and create the final pass.`,
  ],
  zidane: [
    `Zidane controlled games from midfield with elegance: the roulette, the first touch that killed any ball, and the vision to pick the pass. Tall and strong for a playmaker, he held the ball under pressure and scored in the biggest finals.`,
    `The build copies the elegant central playmaker: close control, vision and the frame to hold the ball under pressure.`,
  ],
};
