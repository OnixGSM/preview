/*!
 * Cautare pe tot site-ul, peste indexul static Pagefind (/pagefind/).
 * - pe cauta.html: formularul din pagina;
 * - pe restul paginilor: lupa din navbar deschide un overlay cu acelasi motor.
 * Indexul (~30 KB) se descarca abia la prima cautare, nu la incarcarea paginii.
 */
(function () {
    'use strict';

    var pagefind = null, loading = null;

    function loadPagefind() {
        if (pagefind) return Promise.resolve(pagefind);
        if (loading) return loading;
        // Calea e absoluta: site-ul e servit din radacina domeniului.
        loading = import('/pagefind/pagefind.js')
            .then(function (mod) { pagefind = mod; mod.init(); return mod; })
            .catch(function (e) { loading = null; throw e; });
        return loading;
    }

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    var MAX = 8;

    // Leaga un input + o lista de rezultate de motorul de cautare.
    function wire(input, list, status, opts) {
        opts = opts || {};
        var timer = null, seq = 0;

        function render(query) {
            var mine = ++seq;
            if (!query || query.trim().length < 2) {
                list.innerHTML = '';
                status.textContent = '';
                return;
            }
            status.textContent = 'Caut…';

            loadPagefind().then(function (pf) {
                return pf.search(query);
            }).then(function (res) {
                if (mine !== seq) return;                       // a tastat mai departe
                return Promise.all(res.results.slice(0, MAX).map(function (r) { return r.data(); }))
                    .then(function (hits) {
                        if (mine !== seq) return;
                        if (!res.results.length) {
                            list.innerHTML = '';
                            status.textContent = 'Niciun rezultat pentru „' + query + '”. ' +
                                'Scrie-ne pe WhatsApp și îți răspundem noi.';
                            return;
                        }
                        var total = res.results.length;
                        status.textContent = total === 1 ? 'Un rezultat.' :
                            (total > MAX ? 'Primele ' + MAX + ' din ' + total + ' rezultate.' : total + ' rezultate.');
                        list.innerHTML = hits.map(function (h) {
                            return '<li class="search-hit"><a class="search-hit-link" href="' + esc(h.url) + '">' +
                                '<span class="search-hit-title">' + esc(h.meta && h.meta.title ? h.meta.title : h.url) + '</span>' +
                                '<span class="search-hit-excerpt">' + h.excerpt + '</span>' +
                                '</a></li>';
                        }).join('');
                    });
            }).catch(function () {
                if (mine !== seq) return;
                list.innerHTML = '';
                status.textContent = 'Căutarea nu e disponibilă acum. Folosește meniul de sus sau scrie-ne pe WhatsApp.';
            });
        }

        input.addEventListener('input', function () {
            clearTimeout(timer);
            var q = input.value;
            timer = setTimeout(function () { render(q); }, 180);
        });
        // Prima apasare pe tasta porneste descarcarea indexului, in paralel cu tastatul.
        input.addEventListener('focus', function () { loadPagefind().catch(function () {}); }, { once: true });

        if (opts.initial) { input.value = opts.initial; render(opts.initial); }
        return render;
    }

    /* ------------------------------------------------- pagina cauta.html */

    var form = document.getElementById('searchForm');
    if (form) {
        var input = document.getElementById('searchInput');
        var list = document.getElementById('searchResults');
        var status = document.getElementById('searchStatus');
        var q = new URLSearchParams(location.search).get('q') || '';
        var render = wire(input, list, status, { initial: q });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            render(input.value);
            // Pastreaza interogarea in URL, ca sa se poata da share / refresh.
            var url = input.value ? 'cauta.html?q=' + encodeURIComponent(input.value) : 'cauta.html';
            history.replaceState(null, '', url);
        });
        input.focus();
        return;
    }

    /* -------------------------------------------- overlay pe restul paginilor */

    var trigger = document.querySelector('.nav-search');
    if (!trigger) return;

    var overlay = null, lastFocus = null;

    function build() {
        overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Caută pe site');
        overlay.innerHTML =
            '<div class="search-overlay-panel">' +
              '<form class="search-form" role="search" action="cauta.html" method="get">' +
                '<label class="visually-hidden" for="searchOverlayInput">Ce cauți?</label>' +
                '<i class="bi bi-search search-form-icon" aria-hidden="true"></i>' +
                '<input class="search-input" type="search" id="searchOverlayInput" name="q" placeholder="Ce cauți?" autocomplete="off" autocapitalize="off" spellcheck="false">' +
                '<button class="search-close" type="button" aria-label="Închide căutarea">Esc</button>' +
              '</form>' +
              '<p class="search-status" role="status" aria-live="polite"></p>' +
              '<ol class="search-results"></ol>' +
            '</div>';
        document.body.appendChild(overlay);

        var oi = overlay.querySelector('.search-input');
        var ol = overlay.querySelector('.search-results');
        var os = overlay.querySelector('.search-status');
        var render = wire(oi, ol, os);

        overlay.querySelector('form').addEventListener('submit', function (e) {
            e.preventDefault();
            render(oi.value);
        });
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target.closest('.search-close')) close();
        });
        overlay.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });
    }

    function open() {
        if (!overlay) build();
        lastFocus = document.activeElement;
        overlay.classList.add('is-open');
        document.body.classList.add('search-open');
        overlay.querySelector('.search-input').focus();
    }

    function close() {
        if (!overlay) return;
        overlay.classList.remove('is-open');
        document.body.classList.remove('search-open');
        if (lastFocus) lastFocus.focus();
    }

    trigger.addEventListener('click', function (e) {
        e.preventDefault();     // fara JS, linkul duce la cauta.html
        open();
    });

    // Ctrl/Cmd+K, ca peste tot.
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            overlay && overlay.classList.contains('is-open') ? close() : open();
        }
    });
})();
