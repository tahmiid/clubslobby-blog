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
    var at = c.querySelector('.pchq-aff');
    while (at && at.parentNode !== c) at = at.parentNode;
    if (at && at.previousElementSibling && /^H[23]$/.test(at.previousElementSibling.tagName)) at = at.previousElementSibling;
    var d = document.createElement('div');
    d.className = 'pq-tip';
    d.innerHTML = '<div class="pq-tip-cup" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h1.500a2.500 2.500 0 0 1 0 5H17"/><path d="M8 3v3M12 3v3"/></svg></div>'
        + '<div class="pq-tip-tx"><b>Keep Pro Clubs HQ free</b><span>No paywall, no pop-ups. Tips pay for the servers, the EA match data and every FC 27 update.</span></div>'
        + '<a class="pq-tip-btn" href="https://buymeacoffee.com/proclubshq" target="_blank" rel="noopener">☕ Buy us a coffee</a>';
    if (at) c.insertBefore(d, at); else c.appendChild(d);
})();
