# Setup for Ghost(Pro) Starter

Ghost strips `<script>` (and inline `<style>`) from HTML cards. Starter has no
per-post code injection, only site-wide. So the CSS and JS for **all four
tools** go in the site-wide injection once, and each post carries only its
markup.

**Verified end to end** on Ghost 6.54.1 with exactly this arrangement: styles
apply, scripts run, and the quiz returns correct results.

## One-time setup

Settings → **Code injection**:

| Field | Paste |
|---|---|
| Site header | `site-header.html` (14.3KB) |
| Site footer | `site-footer.html` (17.2KB) |

Save. That's every tool's CSS and JS loaded site-wide — about 31KB inline,
roughly 8KB gzipped, with no extra network requests.

Loading all four everywhere is safe by design: each script begins

```js
var R = document.querySelector('[data-qz27]'); if (!R || R.dataset.on) return;
```

so on a page without that widget it exits immediately. Class names are prefixed
per widget (`ab27`, `hm27`, `qz27`, `ac27`), so nothing collides.

## Per post

Paste the matching `*.card.html` from `widgets-split/` into an **HTML card**
(`/html`) right after the first paragraph. Markup only — no `<style>`, no
`<script>`; those are already loaded site-wide.

| Card file | Post |
|---|---|
| `1-archetype-browser.card.html` | Archetypes Explained: All 13 |
| `2-comparison-heatmap.card.html` | Archetypes Compared: Every Ceiling |
| `3-archetype-quiz.card.html` | Which Archetype Should You Play? |
| `4-accelerate-calculator.card.html` | Explosive, Lengthy or Controlled *(draft)* |

Delete the flattened text the import left behind, between the opening paragraph
and the first `<h2>`.

## Checking it worked

- The card renders as a bordered box, not plain text → CSS is loading
- Clicking a chip changes the results instantly → JS is running
- If it's styled but unresponsive, the CSS is applying and the JS isn't — check
  the footer field saved correctly

## As you add more tools

This grows: every new tool adds its CSS and JS to the same two fields. Two
things to do before it becomes a problem:

1. **Factor out the shared base.** All four widgets repeat the same card chrome
   and theme tokens under different class prefixes — roughly 6KB of the 14KB CSS
   is duplication. One shared `.pcl-w` base class would cut that.
2. **Watch the total.** Past ~60KB, move to an external stylesheet and script
   hosted on a CDN and reference them from the injection instead of inlining.

## Why the markup stays in the post

The card's text — archetype names, attribute numbers, perk descriptions — is
server-rendered and therefore crawlable. Article 1 renders 1,979 crawlable
words, article 2 renders 1,400. Generating that markup from JavaScript instead
would be simpler to deploy and would make it invisible to search engines, which
defeats the point of the whole exercise.
