/* The dock: each icon opens its section's menu (a drop-down under the header
   on a computer, a sheet above the dock on a phone). The menus are plain
   links in the page; this only shows and hides them and lights the section
   the current page belongs to. */
(function () {
    var menu = document.getElementById('pq-menu');
    var head = document.getElementById('pq-head');
    var scrim = document.getElementById('pq-scrim');
    if (!menu || !scrim) return;
    var btns = Array.prototype.slice.call(document.querySelectorAll('.pq-di'));
    var cur = null;
    var home = null;
    var here = location.pathname.replace(/\/*$/, '/');
    Array.prototype.forEach.call(menu.querySelectorAll('a[href]'), function (a) {
        if (home || a.host !== location.host) return;
        if (a.pathname.replace(/\/*$/, '/') !== here) return;
        a.classList.add('cur');
        a.setAttribute('aria-current', 'page');
        home = a.closest('.pq-mp').id.replace('pq-m-', '');
    });
    function paint() {
        btns.forEach(function (b) {
            var m = b.getAttribute('data-m');
            b.classList.toggle('on', cur ? m === cur : m === home);
            b.setAttribute('aria-expanded', String(m === cur));
        });
    }
    function close() {
        cur = null;
        menu.classList.remove('open');
        scrim.classList.remove('open');
        paint();
    }
    function open(m) {
        cur = m;
        Array.prototype.forEach.call(menu.querySelectorAll('.pq-mp'), function (p) {
            p.classList.toggle('on', p.id === 'pq-m-' + m);
        });
        /* Under the header wherever it is (an announcement bar can sit above
           it); on a phone the CSS pins the sheet above the dock instead. */
        menu.style.top = head && window.matchMedia('(min-width:761px)').matches
            ? Math.max(0, Math.round(head.getBoundingClientRect().bottom)) + 'px' : '';
        menu.classList.add('open');
        scrim.classList.add('open');
        menu.scrollTop = 0;
        paint();
    }
    btns.forEach(function (b) {
        b.addEventListener('click', function () {
            var m = b.getAttribute('data-m');
            if (cur === m) close(); else open(m);
        });
    });
    scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    paint();
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
