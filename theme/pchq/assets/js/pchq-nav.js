/* The app's header, Guides sheet and dock, on the blog (#485, owner 10 Oct
   2026: "one single suite"; ClubsUI docs/BLOG_APP.md). The markup is
   ops/app-chrome.mjs; this brings it to life, as the app's own would:
     - the Guides door opens the sheet (a history step: Back closes it, as in
       the app's lib/sheetHistory), a tab per section, the current page lit;
     - the account corner: the avatar when the app's sign-in is in this
       browser (same origin: the app's token), else Log in -> My HQ with
       ?next= back to this page;
     - Inbox's count and the Lobby door (only while the lobby is on for this
       visitor - the app's "off means absent"), from the app's own API;
     - inside the store apps (their WebView: "ProClubsHQ/x.y.z" in the user
       agent) every outside payment link comes off the page (store rules).
   Taps into the app are counted through the app's beacon (blog-*). */
(function () {
    var ua = navigator.userAgent || '';
    var inApp = /ProClubsHQ\/\d+\.\d+\.\d+ \((ios|android);/.test(ua);
    if (inApp) document.documentElement.classList.add('pq-in-app');
    function evt(what) {
        try {
            var s = sessionStorage.getItem('pchq_sid');
            if (!s) {
                s = Array.from(crypto.getRandomValues(new Uint8Array(8)), function (x) { return x.toString(16).padStart(2, '0'); }).join('');
                sessionStorage.setItem('pchq_sid', s);
            }
            var body = JSON.stringify({ path: '/evt/' + what, sid: s });
            if (navigator.sendBeacon) navigator.sendBeacon('/api/metrics/view', new Blob([body], { type: 'application/json' }));
            else fetch('/api/metrics/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
        } catch (e) {}
    }
    var token = null, guest = null;
    try { token = localStorage.getItem('clubs_auth_token'); guest = localStorage.getItem('clubs_guest_id'); } catch (e) {}
    function api(path) {
        var h = { Accept: 'application/json' };
        if (token) h.Authorization = 'Bearer ' + token;
        else if (guest) h['X-Guest-Id'] = guest;
        return fetch('/api' + path, { headers: h, credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    }
    var here = location.pathname;

    /* the dock: taps counted, nothing lit (a blog page is none of the five) */
    Array.prototype.forEach.call(document.querySelectorAll('[data-dock]'), function (a) {
        a.addEventListener('click', function () { evt('blog-dock-tap'); });
    });

    /* the Guides sheet */
    var sheet = document.getElementById('pq-gs');
    var scrim = document.getElementById('pq-gs-scrim');
    var door = document.querySelector('[data-door="guides"]');
    if (sheet && scrim && door) {
        var tabs = Array.prototype.slice.call(sheet.querySelectorAll('.pq-gs-tab'));
        var mine = here.replace(/\/*$/, '/');
        var home = null;
        Array.prototype.forEach.call(sheet.querySelectorAll('.pq-gs-p a[href]'), function (a) {
            if (a.host !== location.host || a.pathname.replace(/\/*$/, '/') !== mine) return;
            a.classList.add('cur');
            a.setAttribute('aria-current', 'page');
            if (!home) home = a.closest('.pq-gs-p').id.replace('pq-gs-', '');
        });
        function show(key) {
            tabs.forEach(function (t) {
                var on = t.getAttribute('data-tab') === key;
                t.classList.toggle('on', on);
                t.setAttribute('aria-selected', String(on));
            });
            Array.prototype.forEach.call(sheet.querySelectorAll('.pq-gs-p'), function (p) { p.hidden = p.id !== 'pq-gs-' + key; });
            reveal();
        }
        /* the open section's chip in view (the row scrolls on a narrow phone) */
        function reveal() {
            var on = sheet.querySelector('.pq-gs-tab.on');
            if (on && !sheet.hidden) on.parentNode.scrollLeft = Math.max(0, on.offsetLeft - 16);
        }
        if (home) show(home);
        var opened = false;
        function open() {
            if (opened) return;
            opened = true;
            sheet.hidden = false;
            scrim.hidden = false;
            door.setAttribute('aria-expanded', 'true');
            document.documentElement.style.overflow = 'hidden';
            sheet.querySelector('.pq-gs-body').scrollTop = 0;
            reveal();
            try { history.pushState({ pqSheet: 1 }, ''); } catch (e) {}
            evt('blog-guides-open');
        }
        function shut(fromBack) {
            if (!opened) return;
            opened = false;
            sheet.hidden = true;
            scrim.hidden = true;
            door.setAttribute('aria-expanded', 'false');
            document.documentElement.style.overflow = '';
            if (!fromBack && history.state && history.state.pqSheet) history.back();
        }
        door.addEventListener('click', function () { if (opened) shut(false); else open(); });
        scrim.addEventListener('click', function () { shut(false); });
        tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.getAttribute('data-tab')); }); });
        window.addEventListener('popstate', function () { if (opened) shut(true); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(false); });
        /* a link inside it leaves the page: its history entry is left behind
           harmlessly, as the app's sheets do */
    }

    /* the account corner */
    var acct = document.querySelector('[data-door="account"]');
    if (acct && !token) acct.href = acct.href + (acct.href.indexOf('?') >= 0 ? '&' : '?') + 'next=' + encodeURIComponent(here);
    if (acct && token) {
        api('/auth/me').then(function (me) {
            if (!me) return;
            acct.setAttribute('aria-label', 'Account');
            acct.setAttribute('title', me.handle ? '@' + me.handle : 'Account');
            var pic = me.picture_url || me.picture;
            if (pic) {
                var img = document.createElement('img');
                img.src = pic; img.alt = ''; img.referrerPolicy = 'no-referrer';
                acct.textContent = ''; acct.appendChild(img);
            } else if (me.handle) {
                var b = document.createElement('b');
                b.textContent = me.handle.charAt(0).toUpperCase();
                acct.textContent = ''; acct.appendChild(b);
            }
            /* Inbox: the unread count, as the app's bell */
            api('/notifications?lobby=3').then(function (n) {
                var u = n && n.unread;
                var badge = document.querySelector('[data-door="inbox"] .pq-ad-n');
                if (badge && u > 0) { badge.textContent = u > 9 ? '9+' : String(u); badge.hidden = false; }
            });
        });
    }

    /* the Lobby door: its place held until the lobby answers, gone when off */
    var lobby = document.querySelector('[data-door="lobby"]');
    if (lobby) {
        api('/lobby/status').then(function (st) {
            if (!st || !st.enabled) { lobby.remove(); return; }
            lobby.classList.remove('pq-ad-held');
            if (st.me && st.me.room && st.me.room.id) lobby.href = lobby.href.replace(/\/lobby(\?|$)/, '/lobby/r/' + encodeURIComponent(st.me.room.id) + '$1');
            var open = st.open ? Object.keys(st.open).reduce(function (n, k) { return n + (+st.open[k] || 0); }, 0) : 0;
            if (open > 0 || (st.me && st.me.room)) lobby.querySelector('.pq-ad-dot').hidden = false;
        });
    }

    /* inside the store apps: no outside payment link, anywhere on the page */
    if (inApp) {
        Array.prototype.forEach.call(document.querySelectorAll('a[href*="buymeacoffee.com"], a[href*="paypal.com"], a[href*="patreon.com"], a[href*="ko-fi.com"]'), function (a) {
            var box = a.closest('.pq-tip, .pq-support, .kg-button-card') || a;
            box.remove();
        });
    }
})();

/* The discussion at a post's end (#485, owner 10 Oct 2026: comments "the
   same as we have in the app ... reply, heart, report"). Here: the count,
   the two newest first comments and "Join the discussion", which opens the
   app's own page (/discussion/<slug>) - the reel's thread, the app's
   sign-in. A cheat sheet's own discussion (#450) gives up its place to this
   one; it is the same thread (its archetype's), so nothing said is lost. A
   page the app's index does not list (the blog home, an old draft) shows
   nothing. */
(function () {
    var c = document.querySelector('.post-template .gh-content, .page-template .gh-content');
    if (!c) return;
    var slug = location.pathname.replace(/^\/blog\/|\/$/g, '');
    if (!/^[a-z0-9-]+$/.test(slug)) return;
    var token = null, guest = null;
    try { token = localStorage.getItem('clubs_auth_token'); guest = localStorage.getItem('clubs_guest_id'); } catch (e) {}
    var h = { Accept: 'application/json' };
    if (token) h.Authorization = 'Bearer ' + token; else if (guest) h['X-Guest-Id'] = guest;
    var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (x) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[x]; }); };
    var ago = function (iso) {
        var s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
        if (s < 60) return 'now';
        var m = Math.round(s / 60); if (m < 60) return m + 'm';
        var hr = Math.round(m / 60); if (hr < 24) return hr + 'h';
        var d = Math.round(hr / 24); if (d < 7) return d + 'd';
        var w = Math.round(d / 7); if (w < 5) return w + 'w';
        return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    };
    var USER = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';
    var HEART = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>';
    fetch('/api/guides/' + slug + '/comments', { headers: h, credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (!d) return;
        var tops = (d.comments || []).filter(function (x) { return !x.parentId; }).slice(0, 2);
        var href = '/discussion/' + slug;
        var who = function (x) { return x.anonymous ? '@anonymous' : x.author && x.author.handle ? '@' + x.author.handle : (x.name || '@someone'); };
        var face = function (x) {
            if (!x.anonymous && x.author && x.author.picture) return '<span class="pq-talk-f"><img src="' + esc(x.author.picture) + '" alt="" loading="lazy" referrerpolicy="no-referrer"></span>';
            if (!x.anonymous && x.author && x.author.handle) return '<span class="pq-talk-f">' + esc(x.author.handle.charAt(0).toUpperCase()) + '</span>';
            return '<span class="pq-talk-f">' + USER + '</span>';
        };
        var box = document.createElement('section');
        box.className = 'pq-talk';
        box.id = 'discussion';
        box.innerHTML = '<h2>Discussion</h2><p class="pq-talk-n">' + (d.count ? d.count + (d.count === 1 ? ' comment' : ' comments') : 'No comments yet. Start it.') + '</p>'
            + tops.map(function (x) {
                return '<a class="pq-talk-c" href="' + href + '" style="text-decoration:none">' + face(x) + '<span class="pq-talk-m"><span class="pq-talk-w' + (x.anonymous ? ' anon' : '') + '">' + esc(who(x)) + '</span><span class="pq-talk-t">' + esc(ago(x.created_at)) + '</span>'
                    + '<p class="pq-talk-b">' + esc(x.body) + '</p></span><span class="pq-talk-h">' + HEART + (x.likeCount > 0 ? x.likeCount : '') + '</span></a>';
            }).join('')
            + '<a class="pq-talk-go" href="' + href + '">' + (d.count ? 'Join the discussion' : 'Start the discussion') + '</a>';
        Array.prototype.forEach.call(box.querySelectorAll('a'), function (a) {
            a.addEventListener('click', function () {
                try {
                    var s = sessionStorage.getItem('pchq_sid');
                    if (s && navigator.sendBeacon) navigator.sendBeacon('/api/metrics/view', new Blob([JSON.stringify({ path: '/evt/blog-discussion-open', sid: s })], { type: 'application/json' }));
                } catch (e) {}
            });
        });
        /* a cheat sheet's own discussion card: replaced where it stood */
        var old = c.querySelector('#discussion');
        if (old) {
            var top = old; while (top.parentNode && top.parentNode !== c) top = top.parentNode;
            if (top.parentNode === c) { c.replaceChild(box, top); return; }
        }
        c.appendChild(box);
    });
})();

/* The tip card (owner, 5 Oct 2026): "no one will ever see" a footer link, so
   every article carries a card with a coffee cup BEFORE its affiliate links
   (or at its end when it has none). Website only: the store apps never show
   a blog page, and their user agent is checked anyway (ProClubsHQ/x.y.z). */
(function () {
    var c = document.querySelector('.post-template .gh-content');
    if (!c || document.querySelector('.pq-tip')) return;
    if (/ProClubsHQ\/\d+\.\d+\.\d+ \((ios|android);/.test(navigator.userAgent)) return;
    /* Where it goes (owner, 5 Oct 2026):
       - a cheat sheet: between the price list and the AP calculator;
       - "FC 27 archetypes" (all 13): where the list of 13 ends;
       - a tool or a stats page: right after the tool, its first widget;
       - every other article: right before the FAQ;
       - no FAQ: before the affiliate links, else at the end. */
    var top = function (el) { while (el && el.parentNode !== c) el = el.parentNode; return el; };
    var slug = location.pathname.replace(/^\/blog\/|\/$/g, '');
    var TOOLS = ['pro-clubs-attribute-upgrade-costs', 'lengthy-vs-controlled-vs-explosive', 'pro-clubs-height-and-weight',
        'pro-clubs-archetypes-head-to-head', 'pro-clubs-archetypes-compared', 'pro-clubs-level-rewards',
        'fc27-masteries-explained', 'pro-clubs-playstyle-requirements', 'pro-clubs-accelerate-explosive-lengthy-controlled'];
    var at = null;
    if (c.querySelector('#calculator')) {
        at = top(c.querySelector('#calculator'));
    } else if (slug === 'fc27-archetypes') {
        at = top(c.querySelector('#what-changed-from-fc-26'));
    } else if (TOOLS.indexOf(slug) >= 0 || /^pro-clubs-[a-z-]+-stats$/.test(slug)) {
        /* the first top-level block that holds the tool itself */
        var kids = c.children;
        for (var i = 0; i < kids.length; i++) {
            if (kids[i].matches('.pchq-updated, style, script') || kids[i].querySelector('.pchq-updated')) continue;
            if (kids[i].querySelector('input, select, button, table, canvas, svg, [role="table"]')) { at = kids[i].nextElementSibling; break; }
        }
    }
    if (!at) {
        var hs = c.querySelectorAll('h2');
        for (var j = 0; j < hs.length; j++) if (/^frequently asked|questions$/i.test(hs[j].textContent.trim())) { at = top(hs[j]); break; }
    }
    if (!at) {
        at = top(c.querySelector('.pchq-aff'));
        if (at && at.previousElementSibling && /^H[23]$/.test(at.previousElementSibling.tagName)) at = at.previousElementSibling;
    }
    var d = document.createElement('div');
    d.className = 'pq-tip';
    /* The recognised shape (owner, 5 Oct: "usually it's just a coffee cup",
       not a banner): one quiet line, then the yellow button with the cup and
       the script lettering people know from Buy Me a Coffee. No box. */
    var f = document.createElement('link');
    f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Cookie&display=swap';
    document.head.appendChild(f);
    d.innerHTML = '<span>Pro Clubs HQ is free. Tips pay for the servers.</span>'
        + '<a class="pq-tip-btn" href="https://buymeacoffee.com/proclubshq" target="_blank" rel="noopener">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h12l-1.200 11.500a2 2 0 0 1-2 1.500H8.200a2 2 0 0 1-2-1.500z"/><path d="M4 8l1-3h12l1 3"/><path d="M8 5l.500-2h5l.500 2"/></svg>'
        + 'Buy us a coffee</a>';
    if (at) c.insertBefore(d, at); else c.appendChild(d);
})();

/* The Android app bar (owner, 6 Oct 2026, design A: "the smaller icon is
   better"). Android phones only - never iPhone/iPad, never inside the app
   (its WebView appends "ProClubsHQ/<version>", MOBILE.md §3; the app opens
   /blog in the phone's browser anyway). Desktops (owner yes, 6 Oct) get a one-line strip with the
   Google Play badge instead; the listing's web page installs to their phone.
   ✕ hides it for one hour (owner: "we have to push it", the app is the revenue). The Play link carries the page
   as utm_content so Play Console shows which pages send installs. */
(function () {
    var ua = navigator.userAgent || '';
    var android = /Android/i.test(ua);
    var ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    if (ios || /ProClubsHQ\//.test(ua) || (!android && /Mobi/i.test(ua))) return;
    try { if (+localStorage.getItem('pq_app_bar_x') > Date.now()) return; } catch (e) {}
    var page = location.pathname.replace(/^\/blog\/?|\/$/g, '') || 'home';
    var href = 'https://play.google.com/store/apps/details?id=com.proclubshq.app&referrer='
        + encodeURIComponent('utm_source=blog&utm_medium=' + (android ? 'app_bar' : 'desktop_strip') + '&utm_content=' + page);
    // Shows, Get taps and ✕ go to the app's own beacon (same origin, the
    // app's per-tab sid, metrics.py EVENTS) - Play Console reports two days
    // late (owner, 6 Oct 2026: "we must check the interaction here").
    var kind = android ? 'appbar' : 'deskstrip';
    function sid() {
        try {
            var v = sessionStorage.getItem('pchq_sid');
            if (!v) {
                v = Array.from(crypto.getRandomValues(new Uint8Array(8)), function (x) { return x.toString(16).padStart(2, '0'); }).join('');
                sessionStorage.setItem('pchq_sid', v);
            }
            return v;
        } catch (e) { return null; }
    }
    function evt(what) {
        var s = sid(); if (!s) return;
        try {
            var body = JSON.stringify({ path: '/evt/blog-' + kind + '-' + what, sid: s });
            if (navigator.sendBeacon) navigator.sendBeacon('/api/metrics/view', new Blob([body], { type: 'application/json' }));
            else fetch('/api/metrics/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
        } catch (e) {}
    }
    var PLAY = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">'
        + '<path fill="#2DE2C5" d="M4 2.5v19l10-9.5z"/><path fill="#FFDD00" d="M14 12l3.2 3 3.6-2a1.1 1.1 0 0 0 0-2l-3.6-2z"/>'
        + '<path fill="#4f8bff" d="M4 2.5L14 12l3.2-3z"/><path fill="#FF6B8A" d="M4 21.5L14 12l3.2 3z"/></svg>';
    /* A wide desktop (#485, 10 Oct 2026): the app's QR card (#484) at the
       bottom left, where the app's own pages show it - one look on both
       sides. Wide = the card fits beside a 720px column with 24px each side
       (the app's SidePanel test). Its taps and closes count as blog-deskcard-*. */
    if (!android && window.innerWidth >= 1416) {
        kind = 'deskcard';
        var card = document.createElement('aside');
        card.className = 'pq-qrcard';
        var qhref = 'https://play.google.com/store/apps/details?id=com.proclubshq.app&referrer='
            + encodeURIComponent('utm_source=blog&utm_medium=desktop_qr&utm_content=' + page);
        card.innerHTML = '<a href="' + qhref + '" target="_blank" rel="noopener noreferrer">'
            + '<span class="pq-qrcard-m"><img src="/assets/play-qr.svg" alt="" width="146" height="146" loading="lazy"></span>'
            + '<span class="pq-qrcard-b"><span class="pq-qrcard-t">Get the app</span><b class="pq-qrcard-h" style="display:block">On your phone?</b>'
            + '<span class="pq-qrcard-l" style="display:block">Scan with your phone\'s camera to install Pro Clubs HQ for Android.</span>'
            + '<span class="pq-qrcard-c">' + PLAY.replace('width="24" height="24"', 'width="18" height="18"') + 'Get it on Google Play</span></span></a>'
            + '<button class="pq-qrcard-x" type="button" aria-label="Close">✕</button>';
        card.querySelector('a').addEventListener('click', function () { evt('tap'); });
        card.querySelector('.pq-qrcard-x').addEventListener('click', function () {
            evt('close');
            card.remove();
            try { localStorage.setItem('pq_app_bar_x', String(Date.now() + 36e5)); } catch (e) {}
        });
        document.body.appendChild(card);
        evt('shown');
        return;
    }
    var bar = document.createElement('div');
    var x = '<button class="pq-appbar-x" type="button" aria-label="Close">✕</button>';
    // One design everywhere (owner, 7 Oct 2026: the phone bar performs far
    // better than the old desktop strip). The beacons and utm_medium still say
    // which device it was shown on.
    bar.className = 'pq-appbar';
    bar.innerHTML = '<span class="pq-appbar-ic">' + PLAY + '</span>'
        + '<span class="pq-appbar-tx"><b>Better in the app</b><span>Full screen, one tap from your home screen</span></span>'
        + '<a class="pq-appbar-get" href="' + href + '" target="_blank" rel="noopener">Get</a>' + x;
    bar.querySelector('a').addEventListener('click', function () { evt('tap'); });
    bar.querySelector('.pq-appbar-x').addEventListener('click', function () {
        evt('close');
        bar.remove();
        setH();
        try { localStorage.setItem('pq_app_bar_x', String(Date.now() + 36e5)); } catch (e) {}
    });
    document.body.insertBefore(bar, document.body.firstChild);
    // Sticky until closed, like the app's bar (owner, 7 Oct 2026). Its height
    // goes in --pq-bar-h so the desktop header and menus sit under it.
    function setH() { document.documentElement.style.setProperty('--pq-bar-h', (bar.isConnected ? bar.offsetHeight : 0) + 'px'); }
    setH();
    window.addEventListener('resize', setH);
    evt('shown');
})();

/* The in-article app card (owner, 6 Oct 2026; brief: ClubsUI-main
   docs/store/get-app/BLOG-BRIEF.md, image approved "as is"). Build articles
   only (tag Builds), Android only, never inside the app. Never at the top:
   readers came for the grid, so it goes after the grid and one section. It is one screen tall so whoever scrolls past
   sees it, and nothing sticks. Beacons blog-card-shown (half in view, once)
   and blog-card-tap, through the app's own collector like the bar's. */
(function () {
    var ua = navigator.userAgent || '';
    if (!/Android/i.test(ua) || /ProClubsHQ\//.test(ua)) return;
    if (!document.body.classList.contains('tag-builds')) return;
    // Pages differ (cheat sheets and player pages wrap everything in one div),
    // so place by document order: the second heading after the first grid,
    // as that heading's own sibling - the grid, one section, then the card.
    var c = document.querySelector('.gh-content');
    var grid = c && c.querySelector('.grid, .cs-feed');
    if (!grid) return;
    var w = grid; while (w.parentNode !== c) w = w.parentNode;
    var after = Array.prototype.filter.call(c.querySelectorAll('h2, h3'), function (h) {
        // Only the article's own headings: directly in the article, or in a
        // section wrapper of the grid's kind (.a72, .cs) - never one inside a
        // panel such as the affiliate box.
        var p = h.parentNode;
        return (p === c || (p.parentNode === c && p.classList.contains(w.classList[0])))
            && grid.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING && !grid.contains(h);
    });
    var h2 = after[1];
    if (!h2) return;
    function evt(what) {
        try {
            var s = sessionStorage.getItem('pchq_sid');
            if (!s) {
                s = Array.from(crypto.getRandomValues(new Uint8Array(8)), function (x) { return x.toString(16).padStart(2, '0'); }).join('');
                sessionStorage.setItem('pchq_sid', s);
            }
            var body = JSON.stringify({ path: '/evt/blog-card-' + what, sid: s });
            if (navigator.sendBeacon) navigator.sendBeacon('/api/metrics/view', new Blob([body], { type: 'application/json' }));
            else fetch('/api/metrics/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
        } catch (e) {}
    }
    var slug = location.pathname.replace(/^\/blog\/?|\/$/g, '');
    var card = document.createElement('div');
    card.className = 'pq-appcard kg-width-full';
    card.innerHTML = '<a href="https://play.google.com/store/apps/details?id=com.proclubshq.app&referrer='
        + encodeURIComponent('utm_source=blog&utm_medium=card&utm_content=' + slug) + '" rel="noopener">'
        + '<img src="/blog/assets/images/get-app-1080.jpg" width="1080" height="1080" loading="lazy" alt="Pro Clubs HQ for Android: build scanning, ready-to-use builds, easy copy, build sharing, price and AP comparison, meta suggestions, match stats, match companion and Discord, free."></a>';
    card.querySelector('a').addEventListener('click', function () { evt('tap'); });
    // Between sections, never inside one: before the heading's own section
    // box when it has one (keeps an eyebrow such as "TOOL" with its heading).
    var at = h2.parentNode === c ? h2 : h2.parentNode;
    c.insertBefore(card, at);
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
            if (es[0].isIntersecting) { evt('shown'); io.disconnect(); }
        }, { threshold: 0.5 });
        io.observe(card);
    }
})();

/* The blog's own page view (app #477, owner 8 Oct 2026): nginx counts every
   request, people and the bots that pass for them; this is the page that RAN.
   Into the app's collector (/api/metrics/blog-view, its own collection, never
   the app's page numbers), with the app's per-tab sid and per-browser vid -
   same origin, same ids - and the referring SITE on the visit's first page.
   Our own browsers (pchq_internal) send nothing. */
(function () {
    try {
        if (localStorage.getItem('pchq_internal') === '1') return;
        var hex = function (n) { return Array.from(crypto.getRandomValues(new Uint8Array(n)), function (x) { return x.toString(16).padStart(2, '0'); }).join(''); };
        var sid = sessionStorage.getItem('pchq_sid'); if (!sid) { sid = hex(8); sessionStorage.setItem('pchq_sid', sid); }
        var vid = localStorage.getItem('pchq_vid'); if (!vid || !/^[a-f0-9]{16,32}$/.test(vid)) { vid = hex(16); localStorage.setItem('pchq_vid', vid); }
        var ref = null;
        if (!sessionStorage.getItem('pchq_ref')) {
            sessionStorage.setItem('pchq_ref', '1');
            try { var h = document.referrer ? new URL(document.referrer).hostname : ''; if (h && h !== location.hostname) ref = h; } catch (e) {}
        }
        var body = JSON.stringify({ path: location.pathname, sid: sid, vid: vid, ref: ref });
        if (navigator.sendBeacon) navigator.sendBeacon('/api/metrics/blog-view', new Blob([body], { type: 'application/json' }));
        else fetch('/api/metrics/blog-view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
    } catch (e) {}
})();

/* Website display ads on the blog (app #477, owner 8 Oct 2026): Media.net in
   slot A only (after the grid - `gen/ads.mjs` markers), switched on and off in
   the app's admin -> Money (the same `/api/app/config` webAds as Find and
   Meta). Never in the store apps, never for our own browsers, never where the
   cookie bar asks first (the same over-inclusive test as the bar: any
   Europe/* timezone or UTC), never on the articles listed under "No ad on". */
(function () {
    try {
        if (/ProClubsHQ\//.test(navigator.userAgent || '') || localStorage.getItem('pchq_internal') === '1') return;
        var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
        if (/^Europe\//.test(tz) || /^(UTC|Etc\/UTC|GMT|Etc\/GMT)$/.test(tz) || tz === 'Atlantic/Reykjavik' || tz === 'Atlantic/Canary' || tz === 'Atlantic/Madeira' || tz === 'Atlantic/Azores') return;
        var slot = document.querySelector('.pchq-ad[data-ad="a"]');
        if (!slot) return;
        var slug = location.pathname.replace(/^\/blog\/?|\/$/g, '');
        fetch('/api/app/config', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (cfg) {
            var w = cfg && cfg.webAds, u = w && w.units && w.units.blog;
            if (!u || (w.blogSkip || []).indexOf(slug) >= 0) return;
            var size = u.size || '300x250', hgt = +size.split('x')[1] || 250;
            window._mNHandle = window._mNHandle || {}; window._mNHandle.queue = window._mNHandle.queue || [];
            window.medianet_versionId = '3121199';
            var s = document.createElement('script'); s.async = true;
            s.src = 'https://contextual.media.net/dmedianet.js?cid=' + encodeURIComponent(w.cid);
            document.head.appendChild(s);
            var div = document.createElement('div'); div.id = 'mn-blog-a';
            slot.style.minHeight = hgt + 'px'; slot.style.display = 'flex'; slot.style.justifyContent = 'center'; slot.style.margin = '1.5em 0';
            slot.appendChild(div);
            window._mNHandle.queue.push(function () { try { window._mNDetails.loadTag('mn-blog-a', size, u.crid); } catch (e) {} });
        }).catch(function () {});
    } catch (e) {}
})();
