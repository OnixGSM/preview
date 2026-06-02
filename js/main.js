// === OnixGSM — Main JS ===

// THEME TOGGLE
(function() {
    const saved = localStorage.getItem('onix-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);

    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.theme-toggle');
        if (!btn) return;
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('onix-theme', next);
        // Update particles
        if (window.updateParticleColors) window.updateParticleColors();
    });
})();

// PARTICLE BACKGROUND (adapts to theme)
(function() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [], w, h;

    function getColors() {
        const s = getComputedStyle(document.documentElement);
        return {
            dot: s.getPropertyValue('--particle-c').trim() || 'rgba(0,212,170,.07)',
            line: s.getPropertyValue('--particle-l').trim() || 'rgba(0,212,170,.03)'
        };
    }
    let colors = getColors();
    window.updateParticleColors = function() { colors = getColors(); };

    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(50, Math.floor(window.innerWidth * window.innerHeight / 25000));
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * (w || 1), y: Math.random() * (h || 1),
            vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
            r: Math.random() * 1.2 + .4
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = colors.dot; ctx.fill();
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x, dy = p.y - p2.y, d = dx * dx + dy * dy;
                if (d < 14400) { // 120^2
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = colors.line;
                    ctx.lineWidth = .5; ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

// SCROLL REVEAL
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// NAVBAR SCROLL
window.addEventListener('scroll', function() {
    const nav = document.getElementById('mainNav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const t = document.querySelector(href);
        if (t) {
            e.preventDefault();
            window.scrollTo({ top: t.offsetTop - 80, behavior: 'smooth' });
            const nc = document.querySelector('.navbar-collapse.show');
            if (nc) new bootstrap.Collapse(nc).hide();
        }
    });
});

// OPEN/CLOSED STATUS
(function() {
    const b = document.getElementById('statusBadge');
    if (!b) return;
    const now = new Date(), day = now.getDay(), t = now.getHours() + now.getMinutes() / 60;
    const open = day >= 1 && day <= 5 && t >= 10 && t < 20;
    b.innerHTML = open ? '<span class="open-dot"></span> Deschi\u0219i acum' : '<span class="closed-dot"></span> \u00CEnchis';
    b.classList.add(open ? 'status-open' : 'status-closed');
})();

// HERO TYPING
(function() {
    const el = document.getElementById('heroTyping');
    if (!el) return;
    const phrases = ['nu pot.', 'refuz\u0103.', 'nu \u0219tiu.', 'nu \u00EEncearc\u0103.'];
    let i = 0;
    setInterval(() => {
        i = (i + 1) % phrases.length;
        el.style.opacity = '0'; el.style.transform = 'translateY(8px)';
        setTimeout(() => { el.textContent = phrases[i]; el.style.opacity = '1'; el.style.transform = 'none'; }, 300);
    }, 3000);
})();

// LAZY MAP
window.loadMap = function() {
    const c = document.getElementById('mapPlaceholder');
    if (c) c.innerHTML = '<iframe src="https://maps.google.com/maps?q=Roka+Premium+Center,+Str.+Eroilor+17,+Floresti,+Cluj,+Romania&t=m&z=16&ie=UTF8&output=embed" width="100%" height="300" style="border:0;border-radius:12px" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
};

// DATE MIN
(function() { const d = document.querySelector('input[name="preferred_date"]'); if (d) d.min = new Date().toISOString().split('T')[0]; })();

// SCROLL TOP
(function() { const b = document.getElementById('scrollTop'); if (!b) return; window.addEventListener('scroll', () => b.classList.toggle('visible', window.scrollY > 300)); })();

// COOKIE
(function() {
    if (localStorage.getItem('cookieOk')) return;
    const n = document.getElementById('cookieNotice');
    if (!n) return;
    n.classList.add('visible');
    document.getElementById('cookieAccept').addEventListener('click', () => { localStorage.setItem('cookieOk', '1'); n.classList.remove('visible'); });
})();

// CONFIGURATOR DE REPARA\u021AIE \u2014 single source: window.ONIX_PRICES (js/data/pricing.js)
(function () {
    const root = null; // configurator interactiv mutat in js/configurator.js
    if (!root || !window.ONIX_PRICES) return;
    const DATA = window.ONIX_PRICES;
    const WA = DATA.meta.whatsapp;

    const el = id => document.getElementById(id);
    const elBrands = el('cfgBrands'), elModelStep = el('cfgModelStep'), elModel = el('cfgModel'),
          elModelList = el('cfgModelList'), elModelHint = el('cfgModelHint'), elPartsStep = el('cfgPartsStep'),
          elParts = el('cfgParts'), elLines = el('cfgLines'), elExpressRow = el('cfgExpressRow'),
          elExpress = el('cfgExpress'), elTotalRow = el('cfgTotalRow'), elTotal = el('cfgTotal'),
          elDisclaimer = el('cfgDisclaimer'), elActions = el('cfgActions'), elWa = el('cfgWa'),
          elCopy = el('cfgCopy'), elShare = el('cfgShare');

    // Quote-on-inspection categories (no fixed total)
    const EVAL = {
        laptop: { label: 'Laptop / Tablet\u0103', icon: 'bi-laptop', msg: 'Laptop & tablet\u0103: display, tastatur\u0103, cur\u0103\u021Bare, plac\u0103, port \u2014 pre\u021B dup\u0103 evaluare gratuit\u0103.' },
        micro:  { label: 'Microsoldering', icon: 'bi-cpu', msg: 'Microsoldering / plac\u0103 de baz\u0103 / recuperare date \u2014 pre\u021B dup\u0103 evaluare. De la 299 lei.' }
    };

    let state = { brand: null, model: null, sel: {}, express: false, evalMode: null };
    const fmt = n => n.toLocaleString('ro-RO');

    function partInfo(bk, model, key) {
        const def = DATA.partDefs[key];
        const raw = DATA.brands[bk].models[model][key];
        if (raw === null || raw === undefined) return null;
        let price, label = def.label, full = false;
        if (typeof raw === 'object') { price = raw.v; full = !!raw.full; } else price = raw;
        if (key === 'cap' && full) label = 'Carcas\u0103 complet\u0103 (ram\u0103+capac)';
        return { id: key, label: label, note: def.note, icon: def.icon, price: price, from: false };
    }

    function setActive(key) {
        Array.prototype.forEach.call(elBrands.children, c => {
            const on = c.dataset.brand === key;
            c.classList.toggle('is-active', on);
            c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
    }

    // ---- BRAND BUTTONS ----
    function brandBtn(key, label, icon, handler) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'cfg-brand-btn';
        b.setAttribute('aria-pressed', 'false');
        b.dataset.brand = key;
        b.innerHTML = '<i class="bi ' + icon + '"></i> ' + label;
        b.addEventListener('click', handler);
        elBrands.appendChild(b);
    }
    Object.keys(DATA.brands).forEach(bk => brandBtn(bk, DATA.brands[bk].label, DATA.brands[bk].icon, () => selectBrand(bk)));
    Object.keys(EVAL).forEach(ek => brandBtn('_' + ek, EVAL[ek].label, EVAL[ek].icon, () => selectEval(ek)));

    function selectBrand(bk) {
        state = { brand: bk, model: null, sel: {}, express: false, evalMode: null };
        setActive(bk); elExpress.checked = false;
        const models = Object.keys(DATA.brands[bk].models);
        elModelList.innerHTML = models.map(m => '<option value="' + m + '">').join('');
        elModel.value = ''; elModelStep.hidden = false; elPartsStep.hidden = true; elModelHint.hidden = true;
        elModel.focus();
        renderSummary(); syncHash();
    }

    function selectEval(type) {
        state = { brand: '_' + type, model: null, sel: {}, express: false, evalMode: type };
        setActive('_' + type); elExpress.checked = false;
        elModelStep.hidden = true; elPartsStep.hidden = true; elModelHint.hidden = true;
        const e = EVAL[type];
        elLines.innerHTML = '<p class="small mb-0">' + e.msg + '</p>';
        elExpressRow.hidden = true; elTotalRow.hidden = true;
        elDisclaimer.hidden = false; elDisclaimer.textContent = 'Pentru aceste servicii d\u0103m pre\u021B dup\u0103 evaluare gratuit\u0103.';
        elActions.hidden = false;
        elWa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Bun\u0103 ziua! Doresc o evaluare pentru ' + e.label + '. Detalii: ');
        syncHash();
    }

    function selectModel(m) {
        if (!state.brand || state.evalMode) return;
        if (m === state.model) return;
        const models = DATA.brands[state.brand].models;
        if (!models[m]) { elModelHint.hidden = false; elPartsStep.hidden = true; state.model = null; renderSummary(); return; }
        elModelHint.hidden = true; state.model = m; state.sel = {};
        renderParts(); elPartsStep.hidden = false; renderSummary(); syncHash();
    }

    function renderParts() {
        elParts.innerHTML = '';
        DATA.brands[state.brand].order.forEach(key => {
            const info = partInfo(state.brand, state.model, key);
            if (info) elParts.appendChild(partCard(info));
        });
        DATA.addons.forEach(a => elParts.appendChild(partCard({ id: a.id, label: a.label, note: a.note, icon: a.icon, price: a.price, from: true })));
    }

    function partCard(info) {
        const id = 'p_' + info.id;
        const wrap = document.createElement('label');
        wrap.className = 'cfg-part'; wrap.setAttribute('for', id);
        wrap.innerHTML =
            '<input type="checkbox" id="' + id + '" data-id="' + info.id + '">' +
            '<i class="bi ' + info.icon + ' cfg-part-icon"></i>' +
            '<span class="cfg-part-body"><span class="cfg-part-name">' + info.label + '</span>' +
            (info.note ? '<span class="cfg-part-note">' + info.note + '</span>' : '') + '</span>' +
            '<span class="cfg-part-price">' + (info.from ? 'de la ' : '') + fmt(info.price) + ' lei</span>';
        const cb = wrap.querySelector('input');
        if (state.sel[info.id]) { cb.checked = true; wrap.classList.add('is-selected'); }
        cb.addEventListener('change', () => {
            wrap.classList.toggle('is-selected', cb.checked);
            if (cb.checked) state.sel[info.id] = info; else delete state.sel[info.id];
            renderSummary(); syncHash();
        });
        return wrap;
    }

    const selectedItems = () => Object.keys(state.sel).map(k => state.sel[k]);
    function computeTotal(items) { let t = 0; items.forEach(it => t += it.price); if (state.express) t += 99; return t; }

    function renderSummary() {
        if (state.evalMode) return;
        const items = selectedItems();
        if (!state.model || items.length === 0) {
            elLines.innerHTML = '<p class="text-muted small mb-0">' + (state.model ? 'Bifeaz\u0103 cel pu\u021Bin o repara\u021Bie.' : 'Alege modelul \u0219i piesele pentru o estimare instant.') + '</p>';
            elExpressRow.hidden = !state.model; elTotalRow.hidden = true; elDisclaimer.hidden = true; elActions.hidden = true;
            return;
        }
        const approx = items.some(it => it.from);
        let html = '<div class="cfg-line cfg-line--head"><span>' + state.model + '</span></div>';
        items.forEach(it => { html += '<div class="cfg-line"><span>' + it.label + '</span><span>' + (it.from ? 'de la ' : '') + fmt(it.price) + ' lei</span></div>'; });
        if (state.express) html += '<div class="cfg-line"><span>Serviciu Express</span><span>+99 lei</span></div>';
        elLines.innerHTML = html;
        elExpressRow.hidden = false;
        const total = computeTotal(items);
        elTotal.textContent = (approx ? 'de la ' : '~') + fmt(total) + ' lei';
        elTotalRow.hidden = false; elDisclaimer.hidden = false; elDisclaimer.textContent = DATA.meta.disclaimer;
        elActions.hidden = false;
        elWa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(buildMessage(items, total, approx));
    }

    function buildMessage(items, total, approx) {
        const L = ['Bun\u0103 ziua! Doresc o estimare pentru repara\u021Bie:', '', 'Dispozitiv: ' + state.model, '', 'Repara\u021Bii selectate:'];
        items.forEach(it => L.push('- ' + it.label + ': ' + (it.from ? 'de la ' : '') + fmt(it.price) + ' lei'));
        if (state.express) L.push('- Serviciu Express: +99 lei');
        L.push('', 'Total estimativ: ' + (approx ? 'de la ' : '~') + fmt(total) + ' lei (TVA inclus)', 'Trimis din configuratorul onixgsm.ro');
        return L.join('\n');
    }
    function plainQuote() { const it = selectedItems(); return buildMessage(it, computeTotal(it), it.some(x => x.from)); }

    elExpress.addEventListener('change', () => { state.express = elExpress.checked; renderSummary(); syncHash(); });
    elModel.addEventListener('change', function () { selectModel(this.value.trim()); });
    elModel.addEventListener('input', function () { const v = this.value.trim(); if (state.brand && !state.evalMode && DATA.brands[state.brand].models[v]) selectModel(v); });

    function flash(btn, msg) { const orig = btn.innerHTML; return () => { btn.innerHTML = '<i class="bi bi-check2"></i> ' + msg; setTimeout(() => { btn.innerHTML = orig; }, 1600); }; }
    if (elCopy) elCopy.addEventListener('click', () => { const t = state.evalMode ? '' : plainQuote(); if (navigator.clipboard) navigator.clipboard.writeText(t).then(flash(elCopy, 'Copiat!')); else flash(elCopy, 'Copiat!')(); });
    if (elShare) elShare.addEventListener('click', () => {
        const url = location.origin + location.pathname + hashString();
        if (navigator.share) navigator.share({ title: 'Estimare repara\u021Bie OnixGSM', text: state.evalMode ? 'Estimare OnixGSM' : plainQuote(), url: url }).catch(() => {});
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(flash(elShare, 'Link copiat!'));
        else flash(elShare, 'Link copiat!')();
    });

    // ---- SHAREABLE QUOTE (URL hash) ----
    function hashString() { try { return '#cfg=' + encodeURIComponent(JSON.stringify({ b: state.brand, m: state.model, p: Object.keys(state.sel), x: state.express ? 1 : 0 })); } catch (e) { return ''; } }
    function syncHash() { if (!state.brand) return; try { history.replaceState(null, '', hashString()); } catch (e) {} }
    function restoreHash() {
        try {
            const m = location.hash.match(/^#cfg=(.+)$/); if (!m) return;
            const o = JSON.parse(decodeURIComponent(m[1]));
            if (!o.b) return;
            if (o.b.charAt(0) === '_') { selectEval(o.b.slice(1)); }
            else if (DATA.brands[o.b]) {
                selectBrand(o.b);
                if (o.m && DATA.brands[o.b].models[o.m]) {
                    elModel.value = o.m; selectModel(o.m);
                    (o.p || []).forEach(id => { const cb = elParts.querySelector('input[data-id="' + id + '"]'); if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change')); } });
                    if (o.x) { elExpress.checked = true; state.express = true; renderSummary(); }
                }
            } else return;
            syncHash();
            root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {}
    }
    restoreHash();
})();

// DEVICE FILTER
(function() {
    const btns = document.querySelectorAll('.filter-btn');
    if (!btns.length) return;
    const sections = document.querySelectorAll('.price-section');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const f = btn.dataset.filter;
            sections.forEach(s => {
                if (f === 'all' || s.dataset.category === f) {
                    s.style.display = '';
                    s.querySelectorAll('.reveal').forEach(r => r.classList.add('visible'));
                    s.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else { s.style.display = 'none'; }
            });
        });
    });
})();

// EXPANDABLE CARDS
document.querySelectorAll('.service-expand-btn').forEach(btn => {
    btn.addEventListener('click', function() { this.closest('.service-card').classList.toggle('expanded'); });
});

// DEVICE CLASS HOOKS — client-side, fără cookie/tracking; doar pentru adaptarea layout-ului.
// Pune pe <html>: is-ios/is-android, is-touch, is-phone/is-tablet/is-desktop (actualizat la resize/rotire).
(function () {
    var de = document.documentElement, ua = navigator.userAgent || '';
    var isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document); // iPad pe iPadOS se dă drept Mac
    if (isIOS) de.classList.add('is-ios');
    else if (/Android/i.test(ua)) de.classList.add('is-android');
    else de.classList.add('is-other-os');
    var coarse = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window);
    de.classList.add(coarse ? 'is-touch' : 'is-mouse');
    function formFactor() {
        var w = window.innerWidth || de.clientWidth || 1024;
        de.classList.remove('is-phone', 'is-tablet', 'is-desktop');
        de.classList.add(w < 768 ? 'is-phone' : (w < 992 ? 'is-tablet' : 'is-desktop'));
    }
    formFactor();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(formFactor, 150); }, { passive: true });
})();

// CONTACT FORM — trimitere AJAX (fără redirect off-site la JSON brut; degradă elegant până se pune cheia)
(function () {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var result = document.getElementById('contactFormResult');
    var btn = form.querySelector('button[type="submit"]');
    var FALLBACK = 'Nu am putut trimite mesajul acum. Scrie-ne pe <a href="https://wa.me/40750605905" class="clay-textlink">WhatsApp</a> sau sună la <a href="tel:0750605905" class="clay-textlink">0750 605 905</a>.';
    function show(msg, ok) {
        if (!result) return;
        result.hidden = false; result.innerHTML = msg;
        result.style.color = ok ? 'var(--clay-mint-2)' : '#c0271a';
    }
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (form.botcheck && form.botcheck.checked) return; // honeypot
        var orig = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Se trimite…'; }
        fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) })
            .then(function (r) { return r.json().catch(function () { return { success: false }; }); })
            .then(function (j) {
                if (j && j.success) { form.reset(); show('Mesaj trimis. Te contactăm cât mai repede. Mulțumim!', true); }
                else { show(FALLBACK, false); }
            })
            .catch(function () { show(FALLBACK, false); })
            .finally(function () { if (btn) { btn.disabled = false; btn.innerHTML = orig; } });
    });
})();
