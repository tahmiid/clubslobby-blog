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
   /blog in the phone's browser anyway). Desktops get nothing here: the footer
   badge covers them. ✕ hides it for 14 days. The Play link carries the page
   as utm_content so Play Console shows which pages send installs. */
(function () {
    var ua = navigator.userAgent || '';
    if (!/Android/i.test(ua) || /ProClubsHQ\//.test(ua)) return;
    try { if (+localStorage.getItem('pq_app_bar_x') > Date.now()) return; } catch (e) {}
    var page = location.pathname.replace(/^\/blog\/?|\/$/g, '') || 'home';
    var href = 'https://play.google.com/store/apps/details?id=com.proclubshq.app&referrer='
        + encodeURIComponent('utm_source=blog&utm_medium=app_bar&utm_content=' + page);
    var bar = document.createElement('div');
    bar.className = 'pq-appbar';
    bar.innerHTML = '<span class="pq-appbar-ic"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">'
        + '<path fill="#2DE2C5" d="M4 2.5v19l10-9.5z"/><path fill="#FFDD00" d="M14 12l3.2 3 3.6-2a1.1 1.1 0 0 0 0-2l-3.6-2z"/>'
        + '<path fill="#4f8bff" d="M4 2.5L14 12l3.2-3z"/><path fill="#FF6B8A" d="M4 21.5L14 12l3.2 3z"/></svg></span>'
        + '<span class="pq-appbar-tx"><b>Better in the app</b><span>Full screen, one tap from your home screen</span></span>'
        + '<a class="pq-appbar-get" href="' + href + '" rel="noopener">Get</a>'
        + '<button class="pq-appbar-x" type="button" aria-label="Close">✕</button>';
    bar.querySelector('.pq-appbar-x').addEventListener('click', function () {
        bar.remove();
        try { localStorage.setItem('pq_app_bar_x', String(Date.now() + 14 * 864e5)); } catch (e) {}
    });
    document.body.insertBefore(bar, document.body.firstChild);
})();
