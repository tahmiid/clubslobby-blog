# Widgets, split for Ghost(Pro)

Ghost strips `<script>` from HTML cards — a deliberate XSS protection, not a
plan limit. So each widget is split into the three pieces Ghost does accept.

## Do this first (10 seconds)

Paste `0-TEST-paste-this-first.html` into an HTML card in any draft post.

- **You see a red bordered box** → markup survives. Continue below.
- **You see only plain text** → markup is stripped too. Stop, and tell me;
  the answer then is an iframe, and I'll build that instead.

Everything below assumes the red box appeared.

## Per post, three pastes

| Piece | Where it goes |
|---|---|
| `*.card.html` | An **HTML card** in the post body, right after the first paragraph |
| `*.head.html` | Post settings → **Code injection** → *Post header* |
| `*.foot.html` | Post settings → **Code injection** → *Post footer* |

Code injection is per-post, in the post settings sidebar (the gear icon), not
the site-wide one under Settings. Site-wide would load every widget's CSS on
every page, which you don't want.

| File set | Post |
|---|---|
| `1-archetype-browser.*` | Archetypes Explained: All 13, Side by Side |
| `2-comparison-heatmap.*` | Archetypes Compared: Every Ceiling |
| `3-archetype-quiz.*` | Which Archetype Should You Play? |
| `4-accelerate-calculator.*` | Explosive, Lengthy or Controlled *(keep as draft)* |

Remember to delete the flattened text the import left behind, between the
opening paragraph and the first `<h2>`.

## Why the markup stays in the post body

It would be simpler to put everything in code injection. Don't. The markup in
the card is server-rendered into the page, so its text — archetype names,
attribute numbers, perk descriptions, specialization requirements — is
crawlable. That indexed text is the entire reason these tools help the site
rank. Move it into a script and it becomes invisible to search engines.

## If code injection is unavailable on Starter

Check the post settings sidebar for a Code injection section. If it isn't there,
say so — the fallback is hosting each widget as a standalone page (GitHub Pages
or Cloudflare Pages, both free) and embedding it in an `<iframe>`, which Ghost
does allow. That works reliably, at the cost of the widget's text no longer
counting toward the post's indexed content.
