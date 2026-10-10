// The blog's navigation: the six dock sections and every page each menu
// lists. ONE list, read by ops/build-theme.mjs (which writes the theme's
// partials/pchq-nav.hbs) and checked there against the publish roster and the
// app's router, so a slug is typed once and a dead menu link stops the build.
//
// Owner, 5 Oct 2026: "I cannot navigate it ... a dock or something where they
// can see like tools, builds, archetypes" - icons, each opening a menu of that
// section's pages. On a phone the dock sits at the bottom like the app's.
//
// Rules:
//   - A blog page is '/blog/<slug>/'; an app page is 'app:<path>' and gets
//     ?ref=proclubshq.com, the tag both log parsers count as a blog->app click
//     (Ghost adds it to links in a post, never to the theme's).
//   - The 35 real-player pages are NOT in any menu (owner, 5 Oct).
//   - "The Grounds" never appears in a label (owner, SEO.md).
//   - A page listed in two sections lights the first one it appears in.
import { SHEETS, sheetHref } from './cheatsheet.mjs';
import { FC27_ARCH } from './fc27grid.mjs';

const arch = (id) => FC27_ARCH.find((a) => a.id === id);
const sheets = (position) => SHEETS.filter((s) => arch(s.archId).position === position).map((s) => [arch(s.archId).name, sheetHref(s.archId)]);
const b = (slug) => `/blog/${slug}/`;

export const NAV = [
  { key: 'sheets', label: 'Cheat sheets', blurb: 'Everything about one archetype: builds, prices, levels and match numbers.',
    icon: '<path d="M4 4h12l4 4v12H4z"/><path d="M8 11h8M8 15h6"/>',
    groups: [
      ['Keeper', sheets('Keeper')],
      ['Defender', sheets('Defender')],
      ['Midfielder', sheets('Midfielder')],
      ['Forward', sheets('Forward')],
      ['All archetypes', [['All 13 explained', b('fc27-archetypes')], ['Which should I play? Quiz', b('which-pro-clubs-archetype-should-i-play')]]],
    ] },
  { key: 'builds', label: 'Builds', blurb: 'Finished builds to copy, by position.',
    icon: '<path d="M12 3l8 4v6c0 4-3.5 7-8 8-4.500-1-8-4-8-8V7z"/>',
    groups: [
      ['Attack', [['Strikers', b('best-pro-clubs-striker-builds')], ['Wingers', b('best-pro-clubs-winger-builds')], ['CAMs', b('best-pro-clubs-cam-builds')]]],
      ['Midfield', [['Midfielders', b('best-pro-clubs-midfielder-builds')], ['CMs', b('best-pro-clubs-cm-builds')], ['CDMs', b('best-pro-clubs-cdm-builds')]]],
      ['Defence', [['Defenders', b('best-pro-clubs-defender-builds')], ['Centre-backs', b('best-pro-clubs-cb-builds')], ['Full-backs', b('best-pro-clubs-fullback-builds')], ['Goalkeepers', b('best-pro-clubs-goalkeeper-builds')]]],
      ['More', [['Formations and line-ups', b('best-pro-clubs-formations')], ['Archetype duos', b('best-pro-clubs-archetype-duos')], ['Level-40 builds', b('fc27-level-40-builds')], ['Specialized builds', b('fc27-best-specializations')], ['Find any build in the app →', 'app:/explore?year=27']]],
    ] },
  { key: 'tools', label: 'Tools', blurb: 'Calculators and tables that work on the page.',
    icon: '<path d="M14 6a4 4 0 0 0-5 5l-5 5 3 3 5-5a4 4 0 0 0 5-5l-2 2-2-1-1-2z"/>',
    groups: [
      ['Build maths', [['AP costs, all 13 archetypes', b('pro-clubs-attribute-upgrade-costs')], ['AcceleRATE calculator', b('lengthy-vs-controlled-vs-explosive')],
        ['Height and weight', b('pro-clubs-height-and-weight')], ['Head to head', b('pro-clubs-archetypes-head-to-head')], ['Every ceiling compared', b('pro-clubs-archetypes-compared')]]],
      ['Progression', [['Level rewards', b('pro-clubs-level-rewards')], ['Masteries', b('fc27-masteries-explained')], ['PlayStyle requirements', b('pro-clubs-playstyle-requirements')]]],
      ['In the app', [['Builder', 'app:/create'], ['Match tracker', b('pro-clubs-match-tracker')], ['Build from a photo', b('pro-clubs-build-from-a-photo')]]],
    ] },
  { key: 'meta', label: 'Meta', blurb: 'What is working right now.',
    icon: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    groups: [
      ['Meta', [['Meta board XI', 'app:/meta?year=27'], ['Archetype tier list', b('best-pro-clubs-archetypes')]]],
      ['Archetype stats', [['Magician stats', b('pro-clubs-magician-stats')], ['Spark stats', b('pro-clubs-spark-stats')], ['Finisher stats', b('pro-clubs-finisher-stats')],
        ['Maestro stats', b('pro-clubs-maestro-stats')], ['Disruptor stats', b('pro-clubs-disruptor-stats')]]],
      ['By position', [['Striker archetypes', b('pro-clubs-striker-archetypes')], ['Midfielder archetypes', b('pro-clubs-midfielder-archetypes')],
        ['Defender archetypes', b('pro-clubs-defender-archetypes')], ['Goalkeeper archetypes', b('pro-clubs-goalkeeper-archetypes')]]],
    ] },
  { key: 'guides', label: 'Guides', blurb: 'How FC 27 Clubs works.',
    icon: '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h8"/>',
    groups: [
      ['The game', [['FC 27 archetypes', b('fc27-archetypes')], ['What changed for archetypes', b('fc27-archetype-changes')], ['AcceleRATE explained', b('pro-clubs-accelerate-explosive-lengthy-controlled')],
        ['Where is Pro Clubs?', b('fc27-the-grounds-pro-clubs-explained')], ['Club objectives', b('fc27-club-objectives')], ['Club tournaments', b('fc27-clubs-live-tournaments')],
        ['Amps', b('fc27-amps-explained')], ['Platforms', b('fc27-clubs-platforms-ps4-xbox-one-switch')]]],
      ['Controls', [['All controls', b('fc27-controls')], ['Skill moves', b('fc27-skill-moves')], ['New skill moves', b('fc27-new-skill-moves')],
        ['Celebrations', b('fc27-celebrations')], ['Basic controls', b('fc27-basic-controls')], ['What changed in controls', b('fc27-control-changes')]]],
    ] },
  { key: 'lobby', label: 'Lobby', blurb: 'Find teammates who show their build first.',
    icon: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.500"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M15 15c3 0 6 1.500 6 4"/>',
    groups: [
      ['Play', [['Drop-in lobby', 'app:/lobby'], ['How the lobby works', b('pro-clubs-find-teammates')], ['Find drop-in teammates', b('pro-clubs-drop-in-teammates')]]],
      ['Pro Clubs HQ', [['The app', b('pro-clubs-hq-app')], ['About', b('about')]]],
    ] },
];

export const APP = 'https://proclubshq.com';
export const hrefOf = (h) => {
  if (!h.startsWith('app:')) return h;
  const u = new URL(h.slice(4), APP);
  u.searchParams.set('ref', 'proclubshq.com');
  return u.href;
};
export const navLinks = () => NAV.flatMap((s) => s.groups.flatMap(([, items]) => items.map(([label, href]) => ({ section: s.key, label, href }))));
