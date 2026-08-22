// Structured data the generators can attach to a page (#queue item 5,
// 2026-08-22). Ghost already emits Article/Person/Organization JSON-LD in
// ghost_head for every post - never duplicate those types here. What Ghost
// cannot know is what a page IS beyond an article, and that's this module:
//
// - breadcrumbLd: the trail (blog root -> section -> page). Breadcrumbs are
//   the one rich result still broadly displayed; Ghost has no concept of our
//   hub-and-spoke sections.
// - howToLd: for the skill-move pages, whose steps live in the controls
//   dataset. Google retired HowTo *display* for most sites in 2023 - this is
//   entity clarity and Bing, not a promised rich result; it costs a few
//   hundred bytes. Text comes from the dataset's guidedCombo (PlayStation
//   notation, the stored truth) - never hand-written steps (CONTROLS.md).
// - itemListLd: for list pages (a full controls list, the hub, the pillar's
//   children) - name + position (+ url when the item has its own page).
//
// Emitted as a kg html card carrying a single <script type="application/
// ld+json"> - Ghost preserves script tags in html cards (the build-card
// widget relies on it), and Google reads JSON-LD anywhere in the document.
import { kg } from './common.mjs';

const BLOG = 'https://proclubshq.com/blog';

// JSON-LD must not be able to close its own script tag from data.
const ld = (obj) =>
  kg(`<script type="application/ld+json">${
    JSON.stringify(obj).replace(/</g, '\\u003c')
  }</script>`);

/** Plain text from the dataset's starred token notation:
 *  "Hold *L2* and push *R* down then up" -> "Hold L2 and push R down then up" */
export const plainCombo = (s) => String(s ?? '').replace(/\*([^*]+)\*/g, '$1');

/** items: [[name, url|null], ...] - urls absolute or /blog/... */
export const breadcrumbLd = (items) =>
  ld({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      ...(url ? { item: url.startsWith('http') ? url : `${BLOG}${url}` } : {}),
    })),
  });

/** One skill move as a HowTo. `steps` are plain strings, already de-starred. */
export const howToLd = ({ name, description, steps }) =>
  ld({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    ...(description ? { description } : {}),
    step: steps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text,
    })),
  });

/** items: [{name, url?}] */
export const itemListLd = ({ name, items }) =>
  ld({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.url ? { url: it.url.startsWith('http') ? it.url : `${BLOG}${it.url}` } : {}),
    })),
  });
