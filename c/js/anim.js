/*!
 * anim.js — stratul de coregrafie al site-ului.
 *
 * GSAP se descarca DOAR daca merita:
 *   1. pagina chiar are ceva de animat  ([data-anim])
 *   2. utilizatorul n-a cerut mai putina miscare  (prefers-reduced-motion)
 *   3. pagina s-a incarcat deja  (nu concuram cu LCP-ul)
 * Cele ~60 de pagini de model n-au [data-anim], deci nu descarca nimic.
 *
 * Plasa de siguranta: daca GSAP nu ajunge in 2,5 s (retea proasta, fisier lipsa,
 * blocat de o extensie), scoatem `html.anim` si continutul apare normal.
 * Site-ul nu depinde niciodata de o biblioteca ca sa fie citibil.
 *
 * Efectele legate de pozitia de derulare (parallax) NU sunt aici: sunt in CSS,
 * cu `animation-timeline: view()` — zero octeti. Vezi css/style.css.
 */
(function () {
    'use strict';

    var root = document.documentElement;
    var BASE = 'assets/js/gsap/';
    var VER = '3.15.0';                  // se schimba odata cu .tools/build-gsap.sh

    function unhide() { root.classList.remove('anim'); }

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !document.querySelector('[data-anim]')) { unhide(); return; }

    var bail = setTimeout(unhide, 2500);

    function loadScript(file) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = BASE + file + '?v=' + VER;
            s.async = true;
            s.onload = resolve;
            s.onerror = function () { reject(new Error(file)); };
            document.head.appendChild(s);
        });
    }

    function whenIdle(fn) {
        var go = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 1); })(fn); };
        if (document.readyState === 'complete') go();
        else window.addEventListener('load', go, { once: true });
    }

    whenIdle(function () {
        loadScript('gsap.min.js')
            .then(function () { return loadScript('SplitText.min.js'); })
            .then(boot)
            .catch(function () { unhide(); });
    });

    /* ------------------------------------------------------------------ */

    // Declanseaza `fn` cand elementul intra in ecran. O singura data.
    // Folosim IntersectionObserver in loc de ScrollTrigger: e deja in browser,
    // face exact ce ne trebuie si ne scuteste de 18 KB.
    function onEnter(el, fn) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                io.unobserve(e.target);
                fn(e.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        io.observe(el);
    }

    function boot() {
        clearTimeout(bail);
        var gsap = window.gsap;
        if (!gsap) { unhide(); return; }

        var hero = document.querySelector('[data-anim="hero"]');
        var titles = document.querySelectorAll('[data-anim="title"]');
        var grids = document.querySelectorAll('[data-anim="items"]');
        var counts = document.querySelectorAll('[data-anim="count"]');

        // Starea de plecare se pune inline, in acelasi task in care scoatem clasa
        // `anim`: browserul nu apuca sa deseneze intre cele doua, deci nu clipeste.
        if (hero) {
            gsap.set(hero.querySelectorAll('.hero-eyebrow, .hero-title, .hero-sub, .hero-cta, .hero-trust'),
                { opacity: 0, y: 22 });
            gsap.set(hero.querySelectorAll('.hero-stage'), { opacity: 0, scale: 0.96 });
        }
        gsap.set(titles, { opacity: 0, y: 20 });
        grids.forEach(function (g) { gsap.set(g.children, { opacity: 0, y: 22 }); });
        unhide();

        if (hero) heroTimeline(gsap, hero);
        titles.forEach(function (t) { onEnter(t, function () { titleIn(gsap, t); }); });
        grids.forEach(function (g) { onEnter(g, function () { itemsIn(gsap, g); }); });
        counts.forEach(function (c) { onEnter(c, function () { countUp(gsap, c); }); });
    }

    /* ---- hero: singura animatie „mare", o data pe pagina ---- */
    function heroTimeline(gsap, hero) {
        var q = function (sel) { return hero.querySelector(sel); };
        var title = q('.hero-title');
        var split = null;

        // Titlul intra cuvant cu cuvant. `revert()` la final pune markup-ul la loc,
        // ca efectul de typing din js/main.js sa scrie intr-un element curat.
        if (title && window.SplitText) {
            try {
                split = new window.SplitText(title, { type: 'words' });
                gsap.set(title, { opacity: 1, y: 0 });
                gsap.set(split.words, { opacity: 0, yPercent: 60 });
            } catch (e) { split = null; }
        }

        var tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: function () {
                if (split) { split.revert(); gsap.set(title, { clearProps: 'opacity,transform' }); }
                document.dispatchEvent(new CustomEvent('onix:hero-done'));
            }
        });

        tl.to(q('.hero-eyebrow'), { opacity: 1, y: 0, duration: 0.45 });

        if (split) tl.to(split.words, { opacity: 1, yPercent: 0, duration: 0.55, stagger: 0.04 }, '-=0.2');
        else tl.to(title, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2');

        tl.to(q('.hero-sub'), { opacity: 1, y: 0, duration: 0.5 }, '-=0.35')
          .to(q('.hero-cta'), { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
          .to(q('.hero-trust'), { opacity: 1, y: 0, duration: 0.5 }, '-=0.35')
          // Doar containerul .hero-stage primeste transform. Cardurile din el au
          // deja animatii CSS de plutire pe transform — daca le-am atinge, s-ar bate.
          .to(q('.hero-stage'), { opacity: 1, scale: 1, duration: 0.75, ease: 'power2.out' }, 0.2);
    }

    /* ---- titluri de sectiune: un singur element animat pe ecran ---- */
    function titleIn(gsap, el) {
        var split = null;
        // SplitText imparte titlul in randuri de tip bloc. Pe un titlu `inline-block`
        // asta ii schimba cutia si pagina sare (0,0071 CLS masurat pe service.html).
        // Acolo animam titlul intreg — diferenta vizuala e neglijabila.
        var display = getComputedStyle(el).display;
        var splittable = display === 'block' || display === 'flow-root';
        if (splittable && window.SplitText) {
            try {
                split = new window.SplitText(el, { type: 'lines' });
                gsap.set(el, { opacity: 1, y: 0 });
                gsap.set(split.lines, { opacity: 0, yPercent: 55 });
            } catch (e) { split = null; }
        }
        if (!split) { gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }); return; }
        gsap.to(split.lines, {
            opacity: 1, yPercent: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out',
            onComplete: function () { split.revert(); gsap.set(el, { clearProps: 'opacity,transform' }); }
        });
    }

    /* ---- grile de carduri: decalaj real, nu nth-child (care se oprea la al 6-lea) ---- */
    function itemsIn(gsap, grid) {
        gsap.to(grid.children, {
            opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out',
            clearProps: 'transform'
        });
    }

    /* ---- preturi care se numara ---- */
    function countUp(gsap, el) {
        var target = parseFloat(String(el.textContent).replace(/[^\d.]/g, ''));
        if (!isFinite(target)) return;
        var state = { v: 0 };
        gsap.to(state, {
            v: target, duration: 1, ease: 'power2.out',
            onUpdate: function () { el.textContent = Math.round(state.v); },
            onComplete: function () { el.textContent = String(target); }
        });
    }
})();
