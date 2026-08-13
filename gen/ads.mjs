// Ad slots — markers only. **Nothing in this file loads an ad.**
//
// The switch is deliberately not here. A generator emits an empty
// `<div class="pchq-ad" data-ad="…">`, which renders as nothing at all: no
// height, no box, no request. It stays that way until the Ghost code
// injection gives the class a height and fills it (`ops/adsense-block.html`,
// applied with `ops/ads-switch.sh`). So an article can carry its slots for
// weeks before any ad exists, and turning ads off is one command that leaves
// the articles untouched.
//
// **Why the marker and the ad are separated at all.** Reserving the height in
// the injection's CSS — which lands in `<head>` — means the space exists
// before first paint, and the `<ins>` that arrives later drops into a box that
// is already the right size. Insert the container from JavaScript instead and
// every line below it moves, which is Cumulative Layout Shift, which is a
// ranking signal on a site that lives entirely on rankings (MONETIZATION.md
// §4). The empty div is what buys that.
//
// The slot map is MONETIZATION.md §3 and the positions are argued there. The
// two that are not negotiable:
//
//   · **A never precedes the lead widget.** The tool is why the page ranks.
//   · **C sits below the app CTA, never above it.** One click into the app is
//     worth more than a hundred impressions.
//
// §8 turns on A and D first and holds B and C for 30 days of measured RPM and
// Core Web Vitals, so expect the two to be live and the others not.
import { kg } from './common.mjs';

// Ghost's HTML→Lexical converter unwraps bare markup and drops the container,
// so the kg() card markers are load-bearing here exactly as they are for the
// widgets — without them the div this whole design rests on does not survive
// the trip into a post.
export const adSlot = (id) => kg(`<div class="pchq-ad" data-ad="${id}"></div>`);

// Named rather than passed as bare letters, so a misplaced slot is a
// TypeError at generation time instead of a silent no-op in a live article.
export const AD_A = adSlot('a'); // after the lead widget and its first section
export const AD_B = adSlot('b'); // mid-article, on an <h2> boundary
export const AD_C = adSlot('c'); // below the closing app CTA
