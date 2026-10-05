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
