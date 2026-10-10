// The app's header, Guides sheet and dock, drawn by the blog (#485, owner
// 10 Oct 2026: "make it look like one single suite"; ClubsUI
// docs/BLOG_APP.md). ops/build-theme.mjs writes them into
// partials/pchq-nav.hbs; assets/js/pchq-nav.js brings them to life and
// assets/css/pchq.css draws them.
//
// They are COPIES of the app's own (ClubsUI frontend: components/AppHeader,
// AuthControl, guides/GuidesControl, BottomDock) - the same sizes, icons,
// words and order, measured from the running app on 10 Oct 2026. A change to
// the app's header or dock is a change here too: re-measure, then rebuild.
//
//   - The header: the HQ mark (the app's Home), then the doors - Lobby (only
//     when the lobby is on for this visitor), Companion, Guides (lit: this IS
//     the Guides), Controls, Inbox - and the account (avatar, or Log in).
//   - The Guides sheet: the app's sheet, its six sections from
//     gen/site-nav.mjs, every page a real link in the HTML (they were the old
//     dock's menus: Google still reads them), "All guides" -> /blog/.
//   - The dock: Home, Find Builds, Builder, Meta, My HQ, none lit.
//
// Every link into the app carries ?ref=proclubshq.com, the blog->app tag both
// log parsers count (gen/site-nav.mjs `hrefOf`). Home adds dock=home: a
// first landing on the app's `/` opens Builder (its index.js), and a reader
// who taps Home means Home.
import { NAV, hrefOf } from '../gen/site-nav.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const icon = (paths, { size = 21, stroke = 2, cls = '' } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${cls ? ` class="${cls}"` : ''}>${paths}</svg>`;

// lucide, as the app ships them (lucide-react)
export const ICON = {
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  gamepad: '<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  userRound: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  trending: '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  heart: '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>',
};
// My HQ's club shield with "FC" (the app's BottomDock draws its own)
const SHIELD = `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M12 22.2c-5.2-2-8.6-5.4-8.6-10.6V4.3c2.9-.2 5.8-1 8.6-2.5 2.8 1.5 5.7 2.3 8.6 2.5v7.3c0 5.2-3.4 8.6-8.6 10.6z"/><text x="12" y="14.6" text-anchor="middle" font-size="8.4" font-weight="900" fill="currentColor" stroke="none" font-family="inherit" letter-spacing="0.2">FC</text></svg>`;

// Relative (path + query): the same host on production, on a lane and in the
// store apps' WebView, whatever the host is called (www or not).
const rel = (href) => { const u = new URL(href); return u.pathname + u.search; };
const app = (path) => rel(hrefOf(`app:${path}`));

export function header() {
  return `<header class="pq-ah" id="pq-ah">
    <a class="pq-ah-home" href="${esc(app('/?dock=home'))}" aria-label="Pro Clubs HQ home" data-dock="home"><img src="/icons/logo-128.png" alt="Pro Clubs HQ" width="36" height="36" draggable="false"></a>
    <span class="pq-ah-sp"></span>
    <div class="pq-ah-doors">
        <a class="pq-ad pq-ad-held" href="${esc(app('/lobby'))}" data-door="lobby" aria-label="Play">${icon(ICON.users)}<i class="pq-ad-dot" hidden></i></a>
        <a class="pq-ad" href="${esc(app('/companion'))}" data-door="companion" aria-label="Companion" title="Companion">${icon(ICON.timer)}</a>
        <button class="pq-ad on" type="button" data-door="guides" aria-label="Guides" aria-current="page" aria-controls="pq-gs" aria-expanded="false">${icon(ICON.book, { stroke: 2.4 })}</button>
        <a class="pq-ad" href="${esc(app('/controls'))}" data-door="controls" aria-label="Controls">${icon(ICON.gamepad)}</a>
        <a class="pq-ad" href="${esc(app('/inbox'))}" data-door="inbox" aria-label="Inbox">${icon(ICON.bell)}<b class="pq-ad-n" hidden></b></a>
        <a class="pq-acct" href="${esc(app('/my-builds'))}" data-door="account" aria-label="Log in" title="Log in">${icon(ICON.userRound, { size: 16, stroke: 2.2 })}</a>
    </div>
</header>`;
}

export function sheet() {
  const tabs = NAV.map((s, i) => `<button type="button" role="tab" class="pq-gs-tab${i ? '' : ' on'}" data-tab="${s.key}" aria-selected="${i ? 'false' : 'true'}" aria-controls="pq-gs-${s.key}">${esc(s.label)}</button>`).join('');
  const panels = NAV.map((s, i) => `<section class="pq-gs-p" id="pq-gs-${s.key}" role="tabpanel"${i ? ' hidden' : ''}>
            <p class="pq-gs-blurb">${esc(s.blurb)}</p>
${s.groups.map(([g, items]) => `            <div class="pq-gs-g"><h3>${esc(g)}</h3>${items.map(([l, h]) => {
    const inApp = h.startsWith('app:');
    return `<a class="pq-gs-r" href="${esc(inApp ? rel(hrefOf(h)) : h)}"><span><b>${esc(l.replace(/\s*→$/, ''))}</b>${inApp ? '<small>In the app</small>' : ''}</span>${icon(ICON.chevron, { size: 17 })}</a>`;
  }).join('')}</div>`).join('\n')}
        </section>`).join('\n        ');
  return `<div class="pq-gs-scrim" id="pq-gs-scrim" hidden></div>
<div class="pq-gs" id="pq-gs" role="dialog" aria-modal="true" aria-labelledby="pq-gs-t" hidden>
    <div class="pq-gs-grab" aria-hidden="true"></div>
    <div class="pq-gs-head"><h2 id="pq-gs-t">Guides</h2></div>
    <div class="pq-gs-body">
        <form class="pq-gs-find" action="/explore" method="get" role="search">${icon(ICON.search, { size: 18 })}<input type="search" name="q" placeholder="Search guides and builds" aria-label="Search guides and builds" enterkeyhint="search" autocomplete="off"><input type="hidden" name="ref" value="proclubshq.com"></form>
        <div class="pq-gs-tabs" role="tablist" aria-label="Guides">${tabs}</div>
        ${panels}
        <a class="pq-gs-r pq-gs-all" href="/blog/"><span><b>All guides</b><small>Every page on the blog</small></span>${icon(ICON.chevron, { size: 17 })}</a>
    </div>
</div>`;
}

export function dock() {
  const tab = (key, path, label, ic) => `<a class="pq-dk" href="${esc(app(path))}" data-dock="${key}">${ic}<span>${label}</span><i></i></a>`;
  return `<nav class="pq-adk" id="pq-adk" aria-label="Primary">
    ${tab('home', '/?dock=home', 'Home', icon(ICON.house))}
    ${tab('find', '/explore', 'Find Builds', icon(ICON.search))}
    <a class="pq-dk pq-dk-make" href="${esc(app('/create'))}" data-dock="builder"><b aria-hidden="true"><s></s><s></s><em>${icon(ICON.plus, { size: 20, stroke: 2.6 })}</em></b><span>Builder</span></a>
    ${tab('meta', '/meta', 'Meta', icon(ICON.trending))}
    ${tab('myhq', '/my-builds', 'My HQ', SHIELD)}
</nav>`;
}
