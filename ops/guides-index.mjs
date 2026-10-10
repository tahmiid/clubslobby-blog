// The blog's index for the app (#485; ClubsUI docs/BLOG_APP.md "Round 1" 5):
// the six sections (gen/site-nav.mjs, the ONE list) and every live article,
// written by ops/build-theme.mjs to out/guides-index.json and published to
// Ghost's files next to the archetype stats (ops/theme-deploy.mjs):
//
//     /var/www/proclubslobby/content/files/data/guides-index.json
//     = https://proclubshq.com/blog/content/files/data/guides-index.json
//
// The app's API reads it (app/guides.py: the Guides sheet, Find's Guides
// results, which pages have a discussion) and the app bundles a copy
// (frontend/src/data/guidesIndex.json, `--app` copies it there).
//
//   nav:      [{key, label, blurb, groups: [{label, items: [{label, href}]}]}]
//             href: '/blog/<slug>/' or an app path ('/meta'), never a full URL
//   articles: [{slug, title, section, thread}]
//             thread: the discussion - a cheat sheet's archetype id (its #450
//             thread, so nothing said there is lost), else 'post-<slug>'
import { NAV } from '../gen/site-nav.mjs';
import { SHEETS, sheetHref } from '../gen/cheatsheet.mjs';

const appPath = (href) => (href.startsWith('app:') ? new URL(href.slice(4), 'https://proclubshq.com').pathname + new URL(href.slice(4), 'https://proclubshq.com').search : href);
const slugOf = (href) => (href.match(/^\/blog\/([a-z0-9-]+)\/$/) ?? [])[1] ?? null;

export function guidesIndex({ list, playerHrefs = [], skillHrefs = [] }) {
  const nav = NAV.map((s) => ({
    key: s.key, label: s.label, blurb: s.blurb,
    groups: s.groups.map(([label, items]) => ({ label, items: items.map(([l, h]) => ({ label: l.replace(/\s*→$/, ''), href: appPath(h) })) })),
  }));
  const sectionOf = new Map();
  for (const s of NAV) for (const [, items] of s.groups) for (const [, h] of items) if (!sectionOf.has(h)) sectionOf.set(h, s.label);
  for (const h of playerHrefs) if (!sectionOf.has(h)) sectionOf.set(h, 'Player builds');
  for (const h of skillHrefs) if (!sectionOf.has(h)) sectionOf.set(h, 'Skill moves');
  const sheetThread = new Map(SHEETS.map((s) => [sheetHref(s.archId), s.archId]));
  const articles = list.map(({ href, title }) => {
    const slug = slugOf(href);
    if (!slug) return null;
    return { slug, title, section: sectionOf.get(href) ?? 'Guides', thread: sheetThread.get(href) ?? `post-${slug}` };
  }).filter(Boolean);
  const bad = articles.filter((a) => !/^[a-z0-9-]+$/.test(a.slug));
  if (bad.length) throw new Error(`guides-index: odd slugs ${bad.map((a) => a.slug).join(', ')}`);
  return { v: 1, built: new Date().toISOString(), nav, articles };
}
