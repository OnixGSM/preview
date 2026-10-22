/*!
 * bs-lite — inlocuieste bootstrap.bundle.min.js (80 KB + Popper) cu ce folosim efectiv:
 * collapse (meniu mobil + acordeoane FAQ) si dropdown (navbar).
 * Aceleasi atribute `data-bs-*` si aceleasi clase ca Bootstrap 5.3, deci markup-ul
 * paginilor ramane neschimbat. Expune si `window.bootstrap.Collapse` pentru codul
 * existent din js/main.js.
 */
(function () {
    'use strict';

    var SHOW = 'show', COLLAPSE = 'collapse', COLLAPSING = 'collapsing', COLLAPSED = 'collapsed';

    function reflow(el) { el.offsetHeight; }

    // Ruleaza `done` la finalul tranzitiei, dar si daca tranzitia nu exista deloc
    // (prefers-reduced-motion pune `transition:none` pe .collapsing).
    function afterTransition(el, done) {
        // getComputedStyle normalizeaza mereu in secunde ("0.35s", "0s").
        var ms = (parseFloat(getComputedStyle(el).transitionDuration) || 0) * 1000;
        var fired = false;
        function finish() { if (fired) return; fired = true; el.removeEventListener('transitionend', onEnd); done(); }
        function onEnd(e) { if (e.target === el && e.propertyName === 'height') finish(); }
        if (ms <= 0) { requestAnimationFrame(finish); return; }
        el.addEventListener('transitionend', onEnd);
        setTimeout(finish, ms + 60);
    }

    function targetOf(trigger) {
        var sel = trigger.getAttribute('data-bs-target') || trigger.getAttribute('href');
        if (!sel || sel.charAt(0) === '#' && sel.length === 1) return null;
        try { return document.querySelector(sel); } catch (e) { return null; }
    }

    /* ---------------------------------------------------------------- COLLAPSE */

    function triggersFor(el) {
        var out = [];
        var all = document.querySelectorAll('[data-bs-toggle="collapse"]');
        for (var i = 0; i < all.length; i++) if (targetOf(all[i]) === el) out.push(all[i]);
        return out;
    }

    function markTriggers(el, isOpen) {
        triggersFor(el).forEach(function (t) {
            t.classList.toggle(COLLAPSED, !isOpen);
            t.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    function isShown(el) { return el.classList.contains(SHOW); }
    function isBusy(el) { return el.classList.contains(COLLAPSING); }

    function collapseShow(el) {
        if (isBusy(el) || isShown(el)) return;

        // Acordeon: `data-bs-parent` pe elementul colapsabil inchide fratii deschisi.
        var parentSel = el.getAttribute('data-bs-parent');
        if (parentSel) {
            var parent = document.querySelector(parentSel);
            if (parent) {
                var sibs = parent.querySelectorAll('[data-bs-parent="' + parentSel + '"]');
                for (var i = 0; i < sibs.length; i++) if (sibs[i] !== el && isShown(sibs[i])) collapseHide(sibs[i]);
            }
        }

        el.classList.remove(COLLAPSE);
        el.classList.add(COLLAPSING);
        el.style.height = '';           // .collapsing are height:0 din CSS
        markTriggers(el, true);
        reflow(el);
        el.style.height = el.scrollHeight + 'px';
        afterTransition(el, function () {
            el.classList.remove(COLLAPSING);
            el.classList.add(COLLAPSE, SHOW);
            el.style.height = '';
        });
    }

    function collapseHide(el) {
        if (isBusy(el) || !isShown(el)) return;
        el.style.height = el.getBoundingClientRect().height + 'px';
        reflow(el);
        el.classList.add(COLLAPSING);
        el.classList.remove(COLLAPSE, SHOW);
        markTriggers(el, false);
        el.style.height = '';           // inapoi la height:0 din .collapsing
        afterTransition(el, function () {
            el.classList.remove(COLLAPSING);
            el.classList.add(COLLAPSE);
        });
    }

    function collapseToggle(el) { isShown(el) ? collapseHide(el) : collapseShow(el); }

    /* ---------------------------------------------------------------- DROPDOWN */

    function menuOf(toggle) {
        var parent = toggle.parentElement;
        var menu = parent && parent.querySelector(':scope > .dropdown-menu');
        return menu || (parent && parent.nextElementSibling && parent.nextElementSibling.classList.contains('dropdown-menu')
            ? parent.nextElementSibling : null);
    }

    function dropdownHide(toggle) {
        var menu = menuOf(toggle);
        toggle.classList.remove(SHOW);
        toggle.setAttribute('aria-expanded', 'false');
        if (menu) { menu.classList.remove(SHOW); menu.removeAttribute('data-bs-popper'); }
    }

    function dropdownHideAll(except) {
        var open = document.querySelectorAll('[data-bs-toggle="dropdown"].show');
        for (var i = 0; i < open.length; i++) if (open[i] !== except) dropdownHide(open[i]);
    }

    function dropdownShow(toggle) {
        var menu = menuOf(toggle);
        if (!menu) return;
        dropdownHideAll(toggle);
        toggle.classList.add(SHOW);
        toggle.setAttribute('aria-expanded', 'true');
        menu.classList.add(SHOW);
        // Bootstrap pune atributul asta prin Popper; regula `.dropdown-menu[data-bs-popper]`
        // din CSS ii da top/left. Pe mobil meniul e `position:static`, deci n-are efect.
        menu.setAttribute('data-bs-popper', 'static');
    }

    function dropdownToggle(toggle) {
        toggle.classList.contains(SHOW) ? dropdownHide(toggle) : dropdownShow(toggle);
    }

    function menuItems(toggle) {
        var menu = menuOf(toggle);
        return menu ? Array.prototype.slice.call(menu.querySelectorAll('.dropdown-item:not(.disabled):not(:disabled)')) : [];
    }

    /* ---------------------------------------------------------------- EVENIMENTE */

    document.addEventListener('click', function (e) {
        if (!e.target || !e.target.closest) return;
        var dt = e.target.closest('[data-bs-toggle="dropdown"]');
        if (dt) {
            e.preventDefault();     // toggle-urile din navbar sunt <a href="...">
            dropdownToggle(dt);
            return;
        }

        var ct = e.target.closest('[data-bs-toggle="collapse"]');
        if (ct) {
            var target = targetOf(ct);
            if (target) {
                if (ct.tagName === 'A') e.preventDefault();
                collapseToggle(target);
            }
        }

        // Click in afara: inchide dropdown-urile deschise. Click *in* meniu il lasa
        // sa navigheze normal, dar tot inchide.
        dropdownHideAll(null);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            var open = document.querySelector('[data-bs-toggle="dropdown"].show');
            if (open) { dropdownHideAll(null); open.focus(); }
            return;
        }
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        if (!e.target || !e.target.closest) return;

        var toggle = e.target.closest('[data-bs-toggle="dropdown"]');
        var item = e.target.closest('.dropdown-item');
        if (!toggle && item) {
            var holder = item.closest('.dropdown, .nav-item');
            toggle = holder && holder.querySelector('[data-bs-toggle="dropdown"]');
        }
        if (!toggle) return;

        e.preventDefault();
        if (!toggle.classList.contains(SHOW)) dropdownShow(toggle);
        var items = menuItems(toggle);
        if (!items.length) return;
        var idx = items.indexOf(document.activeElement);
        idx = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx <= 0 ? items.length - 1 : idx - 1);
        items[idx].focus();
    });

    // Starea initiala a declansatoarelor, ca in constructorul Bootstrap.
    document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(function (t) {
        var target = targetOf(t);
        if (target) markTriggers(target, isShown(target));
    });

    /* ------------------------------------------- shim minim pentru js/main.js */

    function Collapse(el) { this._el = typeof el === 'string' ? document.querySelector(el) : el; }
    Collapse.prototype.show = function () { if (this._el) collapseShow(this._el); };
    Collapse.prototype.hide = function () { if (this._el) collapseHide(this._el); };
    Collapse.prototype.toggle = function () { if (this._el) collapseToggle(this._el); };
    Collapse.getOrCreateInstance = function (el) { return new Collapse(el); };

    function Dropdown(el) { this._el = typeof el === 'string' ? document.querySelector(el) : el; }
    Dropdown.prototype.show = function () { if (this._el) dropdownShow(this._el); };
    Dropdown.prototype.hide = function () { if (this._el) dropdownHide(this._el); };
    Dropdown.prototype.toggle = function () { if (this._el) dropdownToggle(this._el); };
    Dropdown.getOrCreateInstance = function (el) { return new Dropdown(el); };

    window.bootstrap = window.bootstrap || {};
    window.bootstrap.Collapse = Collapse;
    window.bootstrap.Dropdown = Dropdown;
})();
