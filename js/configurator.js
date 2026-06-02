// === OnixGSM — Configurator interactiv de reparație (v3: categorii + branduri cu logo + grilă vizuală de modele) ===
// Prețuri reale: window.ONIX_PRICES (pricing.js). Modele: window.ONIX_MODELS (models.js).
// iPhone & Samsung au preț → estimare live. Restul → „Cere ofertă pe WhatsApp" (ZERO preț inventat).
// Foto per-model: assets/img/models/<slug>.jpg (owner le pune; până atunci placeholder premium).
(function () {
  'use strict';
  const root = document.getElementById('cfg');
  if (!root || !window.ONIX_PRICES) return;

  const DATA = window.ONIX_PRICES;
  const MODELS = window.ONIX_MODELS || {};
  const WA = DATA.meta.whatsapp;
  const GRID_CAP = 24; // câte modele arătăm cu poză (restul: căutare)

  const el = id => document.getElementById(id);
  const elTabs = el('cfgTabs'), elBrands = el('cfgBrands'), elModelStep = el('cfgModelStep'), elModel = el('cfgModel'),
    elModelList = el('cfgModelList'), elModelHint = el('cfgModelHint'), elModelGrid = el('cfgModelGrid'),
    elPartsStep = el('cfgPartsStep'), elParts = el('cfgParts'), elLines = el('cfgLines'),
    elExpressRow = el('cfgExpressRow'), elExpress = el('cfgExpress'), elTotalRow = el('cfgTotalRow'), elTotal = el('cfgTotal'),
    elDisclaimer = el('cfgDisclaimer'), elActions = el('cfgActions'), elWa = el('cfgWa'), elCopy = el('cfgCopy'), elShare = el('cfgShare'),
    elStepper = el('cfgStepper'), elDevice = el('cfgDevice'), elDeviceName = el('cfgDeviceName'), elDefectHint = el('cfgDefectHint'),
    elSheet = el('cfgSheet'), elSheetTotal = el('cfgSheetTotal'), elSheetWa = el('cfgSheetWa');

  const fmt = n => n.toLocaleString('ro-RO');
  const esc = s => (s + '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const slugify = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // Model photos that actually exist in assets/img/models/ (slug = slugify(name)).
  // Only these emit an <img>; the rest show the premium placeholder, no 404 request.
  // Regenerate after adding photos: ls assets/img/models/*.jpg | xargs -n1 basename | sed 's/.jpg$//'
  const MODEL_IMG = new Set(['iphone-11','iphone-11-pro','iphone-11-pro-max','iphone-12','iphone-12-mini','iphone-12-pro','iphone-12-pro-max','iphone-13','iphone-13-mini','iphone-13-pro','iphone-13-pro-max','iphone-14','iphone-14-plus','iphone-14-pro','iphone-14-pro-max','iphone-15','iphone-15-plus','iphone-15-pro','iphone-15-pro-max','iphone-16e','iphone-16','iphone-16-plus','iphone-16-pro','iphone-16-pro-max','iphone-17e','iphone-17','iphone-17-pro','iphone-17-pro-max','iphone-air','iphone-se-2020','iphone-se-2022','iphone-x','iphone-xr','iphone-xs','iphone-xs-max']);
  const shortModel = s => (s || '').replace(/^(iPhone|Galaxy|Redmi|POCO|Xiaomi|Honor|Huawei|Motorola|Moto|Oppo|OnePlus|realme|Realme|Vivo|Pixel|Google|Nokia|Lenovo)\s+/i, '').trim() || s;
  const waHref = text => 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
  const PHONE_SVG = '<svg class="cfg-model-ph" viewBox="0 0 40 56" aria-hidden="true"><rect x="6" y="2" width="28" height="52" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="7.5" r="1.4" fill="currentColor"/></svg>';

  const PRICED = { iphone: true, samsung: true };

  // ----- CATEGORII + BRANDURI -----
  const CATS = [
    { key: 'phone', label: 'Telefoane', icon: 'bi-phone', kind: 'phone', brands: [
      { key: 'iphone', label: 'iPhone', logo: 'apple' },
      { key: 'samsung', label: 'Samsung', logo: 'samsung' },
      { key: 'xiaomi', label: 'Xiaomi', logo: 'xiaomi', bucket: 'xiaomi', exclude: ['redmi', 'poco'] },
      { key: 'redmi', label: 'Redmi', logo: null, color: '#C2410C', bucket: 'xiaomi', include: ['redmi', 'poco'] },
      { key: 'honor', label: 'Honor', logo: 'honor', bucket: 'honor' },
      { key: 'oppo', label: 'Oppo', logo: 'oppo', bucket: 'oppo', exclude: ['realme'] },
      { key: 'huawei', label: 'Huawei', logo: 'huawei', bucket: 'huawei' },
      { key: 'motorola', label: 'Motorola', logo: 'motorola', bucket: 'motorola' },
      { key: 'oneplus', label: 'OnePlus', logo: 'oneplus', bucket: 'oneplus' },
      { key: 'realme', label: 'realme', logo: null, color: '#A16207', bucket: 'oppo', include: ['realme'] },
      { key: 'vivo', label: 'Vivo', logo: 'vivo' },
      { key: 'google', label: 'Google Pixel', logo: 'google', bucket: 'google' },
      { key: 'nokia', label: 'Nokia', logo: 'nokia', bucket: 'altele', include: ['nokia'] },
      { key: 'lenovo', label: 'Lenovo', logo: 'lenovo' },
    ] },
    { key: 'laptop', label: 'Laptopuri', icon: 'bi-laptop', kind: 'eval',
      evalMsg: b => 'Laptop ' + b + ': display, tastatură, baterie, balamale, curățare, placă de bază — preț după evaluare gratuită.',
      brands: [
        { key: 'apple', label: 'Apple', logo: 'apple' }, { key: 'lenovo', label: 'Lenovo', logo: 'lenovo' },
        { key: 'hp', label: 'HP', logo: 'hp' }, { key: 'dell', label: 'Dell', logo: 'dell' },
        { key: 'asus', label: 'Asus', logo: 'asus' }, { key: 'acer', label: 'Acer', logo: 'acer' },
        { key: 'msi', label: 'MSI', logo: 'msi' }, { key: 'samsung', label: 'Samsung', logo: 'samsung' },
        { key: 'microsoft', label: 'Microsoft', logo: 'microsoft' }, { key: 'huawei', label: 'Huawei', logo: 'huawei' },
        { key: 'lg', label: 'LG', logo: 'lg' }, { key: 'razer', label: 'Razer', logo: 'razer' },
      ] },
    { key: 'tablet', label: 'Tablete', icon: 'bi-tablet', kind: 'eval',
      evalMsg: b => 'Tabletă ' + b + ': display / touch, baterie, port încărcare, sticlă — preț după evaluare gratuită.',
      brands: [
        { key: 'apple', label: 'Apple iPad', logo: 'apple' }, { key: 'samsung', label: 'Galaxy Tab', logo: 'samsung' },
        { key: 'xiaomi', label: 'Xiaomi', logo: 'xiaomi' }, { key: 'lenovo', label: 'Lenovo', logo: 'lenovo' },
        { key: 'huawei', label: 'Huawei', logo: 'huawei' }, { key: 'honor', label: 'Honor', logo: 'honor' },
        { key: 'microsoft', label: 'Surface', logo: 'microsoft' }, { key: 'realme', label: 'realme', logo: null, color: '#A16207' },
        { key: 'nokia', label: 'Nokia', logo: 'nokia' }, { key: 'amazon', label: 'Amazon Fire', logo: 'amazon' },
      ] },
    { key: 'micro', label: 'Microsoldering', icon: 'bi-cpu', kind: 'micro',
      evalMsg: () => 'Microsoldering / placă de bază / recuperare date — reparație la nivel de componentă, sub microscop. Preț după evaluare. De la 299 lei.' },
  ];
  function findCat(k) { return CATS.find(c => c.key === k); }
  function findBrand(catKey, brandKey) { const c = findCat(catKey); return c && c.brands ? c.brands.find(b => b.key === brandKey) : null; }

  // piese generice (model fără preț listat)
  const ASK_PARTS = [
    { id: 'display', label: 'Display / ecran', note: 'Spart, dungi, nu afișează, touch.', icon: 'bi-phone', group: 'screen' },
    { id: 'baterie', label: 'Baterie', note: 'Se descarcă repede, se umflă.', icon: 'bi-battery-half', group: 'battery' },
    { id: 'port', label: 'Port încărcare', note: 'Nu mai încarcă / contact slab.', icon: 'bi-usb-c', group: 'port' },
    { id: 'cam', label: 'Cameră', note: 'Nu focalizează, geam spart.', icon: 'bi-camera', group: 'camera' },
    { id: 'cap', label: 'Capac / sticlă spate', note: 'Spart sau zgâriat.', icon: 'bi-square', group: 'body' },
  ];
  const DEFECTS = {
    ecran: { label: 'Ecran spart', group: 'screen' }, baterie: { label: 'Bateria nu ține', group: 'battery' },
    incarcare: { label: 'Nu mai încarcă', group: 'port' }, camera: { label: 'Problemă cameră', group: 'camera' },
    apa: { label: 'A căzut în apă', addon: 'deox' }, 'nu-porneste': { label: 'Nu pornește', addon: 'micro' },
    microsoldering: { label: 'Microsoldering', addon: 'micro' },
  };
  function partGroup(id) {
    if (id === 'dc' || id === 'do' || id === 'display') return 'screen';
    if (id === 'bc' || id === 'bk' || id === 'bo' || id === 'baterie') return 'battery';
    if (id === 'port') return 'port'; if (id === 'cam') return 'camera';
    if (id === 'cap' || id === 'deox') return 'body'; if (id === 'micro') return 'board';
    return null;
  }

  // index preț + alias range ("Galaxy S8 / S8+")
  const PRICED_NORM = { iphone: {}, samsung: {} }, RANGE_ALIAS = {};
  Object.keys(PRICED).forEach(bk => {
    Object.keys(DATA.brands[bk].models).forEach(key => {
      PRICED_NORM[bk][norm(key)] = key;
      if (key.indexOf('/') > -1) {
        const parts = key.split('/').map(s => s.trim());
        const first = parts[0], m = first.match(/^(.*?)([A-Za-z]*\d+\S*)$/), prefix = m ? m[1] : '';
        RANGE_ALIAS[norm(first)] = key;
        for (let i = 1; i < parts.length; i++) {
          const p = parts[i]; let full;
          if (/^[0-9]/.test(p)) { const stem = (m && m[2]) ? m[2].replace(/\d+\S*$/, '') : ''; full = (prefix + stem + p).trim(); }
          else full = (prefix + p).trim();
          RANGE_ALIAS[norm(full)] = key;
        }
      }
    });
  });
  function findPriced(bk, name) {
    if (!PRICED[bk]) return null;
    const models = DATA.brands[bk].models;
    if (models[name]) return name;
    const n = norm(name);
    if (PRICED_NORM[bk][n]) return PRICED_NORM[bk][n];
    if (RANGE_ALIAS[n] && models[RANGE_ALIAS[n]]) return RANGE_ALIAS[n];
    return null;
  }
  function getModels(brand) {
    if (brand.key === 'iphone') return MODELS.iphone || [];
    if (brand.key === 'samsung') return MODELS.samsung || [];
    if (!brand.bucket) return [];
    let list = (MODELS[brand.bucket] || []).slice();
    if (brand.include) list = list.filter(n => brand.include.some(k => norm(n).indexOf(k) >= 0));
    if (brand.exclude) list = list.filter(n => !brand.exclude.some(k => norm(n).indexOf(k) >= 0));
    return list;
  }

  const devRegions = {
    screen: root.querySelectorAll('.cfg-dev-screen'), battery: root.querySelectorAll('.cfg-dev-batt'),
    port: root.querySelectorAll('.cfg-dev-port'), camera: root.querySelectorAll('.cfg-dev-cam'),
    body: root.querySelectorAll('.cfg-dev-body'), board: root.querySelectorAll('.cfg-dev-chip'),
  };

  let state = { cat: null, brand: null, brandCfg: null, priced: false, model: null, priceKey: null, ask: false, sel: {}, express: false, evalMode: null };
  let pendingDefect = null, lastTotal = 0, rafId = null, curModelSet = null;

  // ----- TABS -----
  function renderTabs() {
    if (!elTabs) return;
    elTabs.innerHTML = '';
    CATS.forEach(c => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'cfg-tab'; b.dataset.cat = c.key; b.setAttribute('role', 'tab');
      b.innerHTML = '<i class="bi ' + c.icon + '"></i> ' + c.label;
      b.addEventListener('click', () => selectCategory(c.key));
      elTabs.appendChild(b);
    });
  }
  function setActiveTab(k) { Array.prototype.forEach.call(elTabs.children, c => { const on = c.dataset.cat === k; c.classList.toggle('is-active', on); c.setAttribute('aria-selected', on ? 'true' : 'false'); }); }

  // ----- BRAND BUTTONS (logo oficial pe cip alb / text + nume dedesubt) -----
  function brandBtn(brand, handler) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'cfg-brand-btn'; b.setAttribute('aria-pressed', 'false'); b.dataset.brand = brand.key;
    let tile;
    if (brand.logo) tile = '<span class="cfg-brand-tile"><img src="assets/img/brands/' + brand.logo + '.svg" alt="' + esc(brand.label) + '" loading="lazy"></span>';
    else tile = '<span class="cfg-brand-tile cfg-brand-tile--text" style="color:' + (brand.color || '#2B2A3A') + '">' + esc(brand.label) + '</span>';
    b.innerHTML = tile + '<span class="cfg-brand-name">' + esc(brand.label) + '</span>';
    b.addEventListener('click', handler);
    elBrands.appendChild(b);
  }
  function setActiveBrand(key) {
    Array.prototype.forEach.call(elBrands.children, c => { const on = c.dataset.brand === key; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }
  function setStep(n) {
    if (!elStepper) return;
    Array.prototype.forEach.call(elStepper.querySelectorAll('.cfg-stepper-item'), li => { const s = +li.dataset.step; li.classList.toggle('is-done', s < n); li.classList.toggle('is-active', s === n); });
  }
  function litRegion(name, on) { const ns = devRegions[name]; if (ns) ns.forEach(node => node.classList.toggle('lit', on)); }
  function updateDevice() {
    const groups = {};
    if (state.evalMode === 'micro') groups.board = true;
    Object.keys(state.sel).forEach(id => { const g = partGroup(id); if (g) groups[g] = true; });
    ['screen', 'battery', 'port', 'camera', 'body', 'board'].forEach(g => litRegion(g, !!groups[g]));
    if (elDeviceName) elDeviceName.textContent = state.model || (state.brandCfg ? state.brandCfg.label : '');
    if (elDevice) elDevice.classList.toggle('is-live', !!state.model || !!state.evalMode);
  }

  function selectCategory(catKey) {
    const cat = findCat(catKey); if (!cat) return;
    state = { cat: catKey, brand: null, brandCfg: null, priced: false, model: null, priceKey: null, ask: false, sel: {}, express: false, evalMode: null };
    setActiveTab(catKey);
    elBrands.innerHTML = '';
    if (cat.kind === 'micro') { selectMicro(cat); setStep(3); return; }
    cat.brands.forEach(br => brandBtn(br, () => { if (cat.kind === 'eval') selectEvalBrand(cat, br); else selectPhoneBrand(br); }));
    // reset dreapta + pași
    elModelStep.hidden = true; elPartsStep.hidden = true; if (elModelGrid) { elModelGrid.hidden = true; elModelGrid.innerHTML = ''; }
    setStep(1); resetRightIdle(); syncHash();
  }
  function resetRightIdle() {
    elLines.innerHTML = '<p class="text-muted small mb-0">' + (state.brand ? 'Alege modelul și piesele pentru o estimare instant.' : 'Alege marca și modelul pentru o estimare instant.') + '</p>';
    elExpressRow.hidden = true; elTotalRow.hidden = true; elDisclaimer.hidden = true; elActions.hidden = true;
    lastTotal = 0; setSheet(false); if (elDevice) elDevice.style.display = ''; updateDevice();
  }

  // ----- TELEFOANE -----
  function selectPhoneBrand(brand) {
    state = { cat: 'phone', brand: brand.key, brandCfg: brand, priced: !!PRICED[brand.key], model: null, priceKey: null, ask: false, sel: {}, express: false, evalMode: null };
    setActiveBrand(brand.key); if (elExpress) elExpress.checked = false;
    const list = getModels(brand);
    curModelSet = new Set(list);
    elModelList.innerHTML = list.map(m => '<option value="' + esc(m) + '">').join('');
    elModel.value = ''; elModel.placeholder = list.length ? ('Caută ' + brand.label + ' (ex: ' + (list[0] || '') + ')') : ('Scrie modelul de ' + brand.label);
    elModelStep.hidden = false; elPartsStep.hidden = true; elModelHint.hidden = true;
    if (elModelGrid) { if (list.length) { renderModelGrid(list); elModelGrid.hidden = false; } else { elModelGrid.hidden = true; elModelGrid.innerHTML = ''; } }
    lastTotal = 0; setStep(2); resetRightIdle(); syncHash();
    try { if (!list.length) elModel.focus(); } catch (e) {}
  }
  function androidTier(bk, model) {
    const n = (model || '').toLowerCase();
    if (/ultra|pro\+|pro plus|pro max|fold|flip|mate\s?\d|mate x|find x|find n|magic\s?v|magic\s?\d|razr|porsche|rs ultimate|pixel\s?\d+\s?pro/.test(n)) return 'flagship';
    if (/lite|\bse\b|\bgo\b|redmi\s?\d*a\b|redmi\s?a\d|poco\s?c|moto\s?e|moto\s?g\b|honor\s?x|nova\s?y|enjoy|\by\d{1,3}\b|smart|a0\d/.test(n)) return 'entry';
    return 'mid';
  }
  function bandFor(name) { const b = DATA.androidBands; return (b && state.cat === 'phone') ? b[androidTier(state.brand, name)] : null; }
  function cheapestFor(name) {
    if (state.cat !== 'phone' || !state.brand) return null;
    const key = findPriced(state.brand, name);
    if (key) {
      const m = DATA.brands[state.brand].models[key]; let min = Infinity;
      for (const k in m) { const r = m[k]; if (r == null) continue; const v = (typeof r === 'object') ? r.v : r; if (typeof v === 'number' && v < min) min = v; }
      return min === Infinity ? null : min;
    }
    const band = bandFor(name);
    if (band) { let min = Infinity; for (const k in band) if (band[k] < min) min = band[k]; return min; }
    return null;
  }
  function renderModelGrid(list) {
    if (!elModelGrid) return;
    elModelGrid.innerHTML = '';
    // priced-first: modelele cu preț apar primele (altfel grila Samsung începe cu un zid de „cere ofertă")
    const priced = [], rest = []; list.forEach(n => (findPriced(state.brand, n) ? priced : rest).push(n));
    const ordered = priced.concat(rest);
    ordered.slice(0, GRID_CAP).forEach(name => {
      const card = document.createElement('button');
      card.type = 'button'; card.className = 'cfg-model-card'; card.dataset.model = name;
      const cp = cheapestFor(name);
      const chip = cp ? '<span class="cfg-model-price">de la ' + fmt(cp) + ' lei</span>' : '<span class="cfg-model-price cfg-model-price--ask">ofertă</span>';
      const mslug = slugify(name);
      const mimg = MODEL_IMG.has(mslug) ? '<img src="assets/img/models/' + mslug + '.jpg" alt="' + esc(name) + '" loading="lazy" onerror="this.remove()">' : '';
      card.innerHTML = '<span class="cfg-model-img"><span class="cfg-model-label">' + esc(shortModel(name)) + '</span>' + mimg + '</span>' +
        '<span class="cfg-model-name">' + esc(name) + '</span>' + chip;
      card.addEventListener('click', () => {
        Array.prototype.forEach.call(elModelGrid.children, c => c.classList.toggle('is-active', c === card));
        elModel.value = name; selectModel(name);
        if (elPartsStep) { try { elPartsStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {} }
      });
      elModelGrid.appendChild(card);
    });
    if (list.length > GRID_CAP) {
      const more = document.createElement('div');
      more.className = 'cfg-model-more'; more.textContent = '+ ' + (list.length - GRID_CAP) + ' modele — caută mai sus';
      elModelGrid.appendChild(more);
    }
  }
  function selectModel(name) {
    if (state.cat !== 'phone' || !state.brand) return;
    name = (name || '').trim();
    if (!name) { elPartsStep.hidden = true; state.model = null; setStep(2); updateDevice(); renderSummary(); return; }
    if (name === state.model) return;
    state.model = name; state.sel = {};
    const key = findPriced(state.brand, name);
    state.priceKey = key; state.ask = !key; state.band = key ? null : bandFor(name); state.express = false; if (elExpress) elExpress.checked = false; elModelHint.hidden = true;
    renderParts(); elPartsStep.hidden = false; setStep(3); updateDevice(); renderSummary(); applyPendingDefect(); syncHash();
  }
  function partInfo(bk, model, key) {
    const def = DATA.partDefs[key], raw = DATA.brands[bk].models[model][key];
    if (raw === null || raw === undefined) return null;
    let price, label = def.label, full = false;
    if (typeof raw === 'object') { price = raw.v; full = !!raw.full; } else price = raw;
    if (key === 'cap' && full) label = 'Carcasă completă (ramă+capac)';
    return { id: key, label: label, note: def.note, icon: def.icon, price: price, from: false, group: partGroup(key) };
  }
  function renderParts() {
    elParts.innerHTML = '';
    if (state.ask) {
      const band = state.band;
      ASK_PARTS.forEach(p => elParts.appendChild(partCard({ id: p.id, label: p.label, note: p.note, icon: p.icon, price: band ? band[p.id] : null, from: !!band, group: p.group })));
      DATA.addons.forEach(a => elParts.appendChild(partCard({ id: a.id, label: a.label, note: a.note, icon: a.icon, price: band ? a.price : null, from: true, group: partGroup(a.id) })));
    } else {
      DATA.brands[state.brand].order.forEach(key => { const info = partInfo(state.brand, state.priceKey, key); if (info) elParts.appendChild(partCard(info)); });
      DATA.addons.forEach(a => elParts.appendChild(partCard({ id: a.id, label: a.label, note: a.note, icon: a.icon, price: a.price, from: true, group: partGroup(a.id) })));
    }
  }
  function partCard(info) {
    const id = 'p_' + info.id, wrap = document.createElement('label');
    wrap.className = 'cfg-part'; wrap.setAttribute('for', id);
    const priceHtml = (info.price === null || info.price === undefined)
      ? '<span class="cfg-part-price">ofertă</span>'
      : '<span class="cfg-part-price">' + (info.from ? 'de la ' : '') + fmt(info.price) + ' lei</span>';
    wrap.innerHTML = '<input type="checkbox" id="' + id + '" data-id="' + info.id + '" data-group="' + (info.group || '') + '">' +
      '<i class="bi ' + info.icon + ' cfg-part-icon"></i>' +
      '<span class="cfg-part-body"><span class="cfg-part-name">' + info.label + '</span>' +
      (info.note ? '<span class="cfg-part-note">' + info.note + '</span>' : '') + '</span>' + priceHtml;
    const cb = wrap.querySelector('input');
    if (state.sel[info.id]) { cb.checked = true; wrap.classList.add('is-selected'); }
    cb.addEventListener('change', () => {
      // alegere unică pe tier (display dc/do, baterie bc/bk/bo): bifarea uneia o debifează pe sora din grup
      if (cb.checked && (info.group === 'screen' || info.group === 'battery')) {
        elParts.querySelectorAll('input[data-group="' + info.group + '"]').forEach(other => {
          if (other !== cb && other.checked) {
            other.checked = false;
            const ow = other.closest('.cfg-part'); if (ow) ow.classList.remove('is-selected');
            const oid = other.getAttribute('data-id'); if (oid) delete state.sel[oid];
          }
        });
      }
      wrap.classList.toggle('is-selected', cb.checked);
      if (cb.checked) state.sel[info.id] = info; else delete state.sel[info.id];
      updateDevice(); renderSummary(); syncHash();
    });
    return wrap;
  }
  const selectedItems = () => Object.keys(state.sel).map(k => state.sel[k]);
  function computeTotal(items) { let t = 0; items.forEach(it => { if (it.price) t += it.price; }); if (state.express) t += 99; return t; }

  // ----- LAPTOP / TABLETĂ / MICROSOLDERING (evaluare) -----
  function selectEvalBrand(cat, brand) {
    state = { cat: cat.key, brand: brand.key, brandCfg: brand, priced: false, model: null, priceKey: null, ask: false, sel: {}, express: false, evalMode: cat.key };
    setActiveBrand(brand.key);
    elModelStep.hidden = true; elPartsStep.hidden = true; if (elModelGrid) { elModelGrid.hidden = true; elModelGrid.innerHTML = ''; }
    showEval(cat.evalMsg(brand.label), (cat.label + ' ' + brand.label));
    setStep(3); updateDevice(); syncHash();
  }
  function selectMicro(cat) {
    state = { cat: 'micro', brand: '_micro', brandCfg: { label: 'Microsoldering' }, priced: false, model: null, priceKey: null, ask: false, sel: {}, express: false, evalMode: 'micro' };
    elModelStep.hidden = true; elPartsStep.hidden = true; if (elModelGrid) { elModelGrid.hidden = true; elModelGrid.innerHTML = ''; }
    showEval(cat.evalMsg(''), 'Microsoldering');
    updateDevice(); syncHash();
  }
  function showEval(msg, subject) {
    if (elDevice) elDevice.style.display = 'none';
    elLines.innerHTML = '<p class="small mb-0">' + esc(msg) + '</p>';
    elExpressRow.hidden = true; elTotalRow.hidden = true;
    elDisclaimer.hidden = false; elDisclaimer.textContent = 'Diagnostic gratuit. Îți dăm prețul exact după ce ne uităm la dispozitiv.';
    elActions.hidden = false; elWa.innerHTML = '<i class="bi bi-whatsapp"></i> Cere ofertă pe WhatsApp';
    elWa.href = waHref('Bună ziua! Doresc o ofertă pentru: ' + subject + '. Detalii: ');
    setSheet(true, 'Cere ofertă', elWa.href);
  }

  // ----- SUMAR + COUNT-UP -----
  function setSheet(show, totalText, href) {
    if (!elSheet) return;
    if (show) { if (elSheetTotal && totalText != null) elSheetTotal.textContent = totalText; if (elSheetWa && href) elSheetWa.href = href; elSheet.classList.add('is-up'); document.body.classList.add('cfg-sheet-on'); elSheet.removeAttribute('aria-hidden'); try { elSheet.inert = false; } catch (e) {} }
    else { elSheet.classList.remove('is-up'); document.body.classList.remove('cfg-sheet-on'); elSheet.setAttribute('aria-hidden', 'true'); try { elSheet.inert = true; } catch (e) {} }
  }
  function animateTotal(to, prefix, suffix) {
    const from = lastTotal; lastTotal = to; if (!elTotal) return;
    const setBoth = txt => { elTotal.textContent = txt; if (elSheetTotal) elSheetTotal.textContent = txt; };
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (to === from || reduce || typeof performance === 'undefined') { setBoth(prefix + fmt(to) + suffix); return; }
    if (rafId) cancelAnimationFrame(rafId);
    elTotal.classList.remove('cfg-bump'); void elTotal.offsetWidth; elTotal.classList.add('cfg-bump');
    const dur = 480, t0 = performance.now();
    (function tick(now) { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); setBoth(prefix + fmt(Math.round(from + (to - from) * e)) + suffix); if (p < 1) rafId = requestAnimationFrame(tick); })(t0);
  }
  function renderSummary() {
    if (state.evalMode) return;
    const items = selectedItems(); updateDevice();
    if (!state.model || items.length === 0) {
      elLines.innerHTML = '<p class="text-muted small mb-0">' + (state.model ? 'Bifează cel puțin o reparație.' : 'Alege modelul și piesele pentru o estimare instant.') + '</p>';
      elExpressRow.hidden = !state.model || state.ask; elTotalRow.hidden = true; elDisclaimer.hidden = true; elActions.hidden = true; lastTotal = 0; setSheet(false); return;
    }
    if (state.ask) {
      if (state.band) {
        let total = 0; items.forEach(it => { if (it.price) total += it.price; });
        let html = '<div class="cfg-line cfg-line--head"><span>' + esc(state.model) + '</span><span class="cfg-part-price">orientativ</span></div>';
        items.forEach(it => { html += '<div class="cfg-line"><span>' + it.label + '</span><span>' + (it.price ? 'de la ' + fmt(it.price) + ' lei' : '') + '</span></div>'; });
        elLines.innerHTML = html; elExpressRow.hidden = true;
        animateTotal(total, 'de la ', ' lei');
        elTotalRow.hidden = false; elDisclaimer.hidden = false;
        elDisclaimer.textContent = 'Preț orientativ pe gama telefonului — confirmăm exact pe loc, la diagnoza gratuită.';
        elActions.hidden = false; elWa.innerHTML = '<i class="bi bi-whatsapp"></i> Confirmă prețul pe WhatsApp'; elWa.href = waHref(buildMessage(items, total, true)); setSheet(true, 'de la ' + fmt(total) + ' lei', elWa.href); return;
      }
      let html = '<div class="cfg-line cfg-line--head"><span>' + esc(state.model) + '</span><span class="cfg-part-price">cere ofertă</span></div>';
      items.forEach(it => { html += '<div class="cfg-line"><span>' + it.label + '</span><span></span></div>'; });
      elLines.innerHTML = html; elExpressRow.hidden = true; elTotalRow.hidden = true;
      elDisclaimer.hidden = false; elDisclaimer.textContent = 'Pentru acest model nu avem încă preț listat — îți dăm oferta pe loc, pe WhatsApp. Diagnostic gratuit.';
      elActions.hidden = false; elWa.innerHTML = '<i class="bi bi-whatsapp"></i> Cere ofertă pe WhatsApp'; elWa.href = waHref(buildAskMessage(items)); setSheet(true, 'Cere ofertă', elWa.href); return;
    }
    const approx = items.some(it => it.from);
    let html = '<div class="cfg-line cfg-line--head"><span>' + esc(state.model) + '</span></div>';
    items.forEach(it => { html += '<div class="cfg-line"><span>' + it.label + '</span><span>' + (it.from ? 'de la ' : '') + fmt(it.price) + ' lei</span></div>'; });
    if (state.express) html += '<div class="cfg-line"><span>Serviciu Express</span><span>+99 lei</span></div>';
    elLines.innerHTML = html; elExpressRow.hidden = false;
    const total = computeTotal(items), prefix = approx ? 'de la ' : '~', suffix = ' lei';
    animateTotal(total, prefix, suffix);
    elTotalRow.hidden = false; elDisclaimer.hidden = false; elDisclaimer.textContent = DATA.meta.disclaimer;
    elActions.hidden = false; elWa.innerHTML = '<i class="bi bi-whatsapp"></i> Trimite pe WhatsApp'; elWa.href = waHref(buildMessage(items, total, approx)); setSheet(true, prefix + fmt(total) + suffix, elWa.href);
  }
  function buildMessage(items, total, approx) {
    const L = ['Bună ziua! Doresc o estimare pentru reparație:', '', 'Dispozitiv: ' + state.model, '', 'Reparații selectate:'];
    items.forEach(it => L.push('- ' + it.label + ': ' + (it.from ? 'de la ' : '') + fmt(it.price) + ' lei'));
    if (state.express) L.push('- Serviciu Express: +99 lei');
    L.push('', 'Total estimativ: ' + (approx ? 'de la ' : '~') + fmt(total) + ' lei (TVA inclus)', 'Trimis din configuratorul onixgsm.ro');
    return L.join('\n');
  }
  function buildAskMessage(items) {
    const L = ['Bună ziua! Doresc o ofertă de preț pentru reparație:', '', 'Dispozitiv: ' + state.model, '', 'Ce aș vrea reparat:'];
    if (items.length) items.forEach(it => L.push('- ' + it.label)); else L.push('- (vă spun eu la fața locului)');
    L.push('', 'Vă rog un preț și o durată estimativă. (Trimis din configuratorul onixgsm.ro)');
    return L.join('\n');
  }
  function currentText() {
    if (state.evalMode) return '';
    const items = selectedItems();
    if (state.ask) return buildAskMessage(items);
    return buildMessage(items, computeTotal(items), items.some(x => x.from));
  }

  // ----- events -----
  if (elExpress) elExpress.addEventListener('change', () => { state.express = elExpress.checked; renderSummary(); syncHash(); });
  elModel.addEventListener('change', function () { selectModel(this.value); });
  elModel.addEventListener('input', function () { const v = this.value.trim(); if (v && state.cat === 'phone' && state.brand && (findPriced(state.brand, v) || (curModelSet && curModelSet.has(v)))) selectModel(v); });
  function flash(btn, msg) { const orig = btn.innerHTML; return () => { btn.innerHTML = '<i class="bi bi-check2"></i> ' + msg; setTimeout(() => { btn.innerHTML = orig; }, 1600); }; }
  if (elCopy) elCopy.addEventListener('click', () => { const t = currentText(); if (!t) return; if (navigator.clipboard) navigator.clipboard.writeText(t).then(flash(elCopy, 'Copiat!')).catch(() => flash(elCopy, 'Copiat!')()); else flash(elCopy, 'Copiat!')(); });
  if (elShare) elShare.addEventListener('click', () => { const url = location.origin + location.pathname + hashString(); if (navigator.share) navigator.share({ title: 'Estimare reparație OnixGSM', text: currentText(), url: url }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(url).then(flash(elShare, 'Link copiat!')); else flash(elShare, 'Link copiat!')(); });

  // ----- defect deep-link + hash -----
  function showDefectHint(label) { if (!elDefectHint) return; elDefectHint.innerHTML = '<i class="bi bi-wrench-adjustable"></i> Ai ales: <strong>' + esc(label) + '</strong>. Alege marca și modelul — reparația se bifează automat.'; elDefectHint.hidden = false; }
  function applyPendingDefect() {
    if (!pendingDefect || !DEFECTS[pendingDefect]) return;
    const d = DEFECTS[pendingDefect];
    const cb = d.addon ? elParts.querySelector('input[data-id="' + d.addon + '"]') : (d.group ? elParts.querySelector('input[data-group="' + d.group + '"]') : null);
    if (cb && !cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change')); }
    pendingDefect = null; if (elDefectHint) elDefectHint.hidden = true;
  }
  function hashString() { try { return '#cfg=' + encodeURIComponent(JSON.stringify({ c: state.cat, b: state.brand, m: state.model, p: Object.keys(state.sel), x: state.express ? 1 : 0 })); } catch (e) { return ''; } }
  var booted = false; // nu scrie hash-ul în URL în timpul init (altfel restore crede că e stare salvată și derulează pagina)
  function syncHash() { if (!booted || !state.cat) return; try { history.replaceState(null, '', location.pathname + location.search + hashString()); } catch (e) {} }
  function restore() {
    try { const d = new URLSearchParams(location.search).get('defect'); if (d && DEFECTS[d]) { pendingDefect = d; showDefectHint(DEFECTS[d].label); } } catch (e) {}
    // pre-selectare marcă: ?brand=iphone (din nav) sau data-default-brand pe #cfg (pagini dedicate) → deschide direct la model
    try {
      let hashBrand = null;
      try { const mm = location.hash.match(/#cfg=(.+)$/); if (mm) { const oo = JSON.parse(decodeURIComponent(mm[1])); hashBrand = oo && oo.b; } } catch (e2) {}
      if (!hashBrand) {
        const params = new URLSearchParams(location.search);
        const bp = params.get('brand') || root.getAttribute('data-default-brand');
        if (bp) { const br = findBrand('phone', bp); if (br) { selectCategory('phone'); selectPhoneBrand(br); var mp = params.get('model'); if (mp) { try { elModel.value = mp; selectModel(mp); } catch (e3) {} } return; } }
      }
    } catch (e) {}
    try {
      const m = location.hash.match(/#cfg=(.+)$/); if (!m) return;
      const o = JSON.parse(decodeURIComponent(m[1])); if (!o.c) return;
      selectCategory(o.c);
      const cat = findCat(o.c);
      if (cat && cat.kind === 'phone' && o.b) {
        const br = findBrand(o.c, o.b); if (!br) return;
        selectPhoneBrand(br);
        if (o.m) {
          elModel.value = o.m; selectModel(o.m);
          (o.p || []).forEach(id => { const cb = elParts.querySelector('input[data-id="' + id + '"]'); if (cb && !cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change')); } });
          if (o.x && elExpress) { elExpress.checked = true; state.express = true; renderSummary(); }
        }
      } else if (cat && cat.kind === 'eval' && o.b) { const br = findBrand(o.c, o.b); if (br) selectEvalBrand(cat, br); }
      // Restore the configurator STATE silently — never scroll the page on load.
      // (Intentional navigation to the configurator uses the #configurator href anchor.)
      syncHash();
    } catch (e) {}
  }

  // ----- auto-preselectare (client-side, fără cookie) -----
  function brandFromUA(ua) {
    if (/iPhone/i.test(ua)) return 'iphone'; if (/iPad/i.test(ua)) return null; if (!/Android/i.test(ua)) return null;
    if (/Pixel/i.test(ua)) return 'google'; if (/SM-|GT-|Samsung/i.test(ua)) return 'samsung'; if (/\bHonor\b/i.test(ua)) return 'honor';
    if (/HUAWEI|Huawei/i.test(ua)) return 'huawei'; if (/OnePlus/i.test(ua)) return 'oneplus'; if (/realme|RMX\d/i.test(ua)) return 'realme';
    if (/OPPO|CPH\d/i.test(ua)) return 'oppo'; if (/vivo/i.test(ua)) return 'vivo'; if (/Motorola|moto[ _g]/i.test(ua)) return 'motorola';
    if (/Redmi|POCO/i.test(ua)) return 'redmi'; if (/Xiaomi|MIX/i.test(ua)) return 'xiaomi'; if (/Nokia/i.test(ua)) return 'nokia'; if (/Lenovo/i.test(ua)) return 'lenovo';
    return null;
  }
  function brandFromModelCode(m) {
    m = (m || '').trim(); if (!m) return null;
    if (/^Pixel/i.test(m)) return 'google'; if (/^SM[-\s]|^GT-/i.test(m)) return 'samsung'; if (/^moto|^XT\d/i.test(m)) return 'motorola';
    if (/Redmi|POCO|^M2\d{3}|^2\d{5}/i.test(m)) return 'redmi'; if (/Xiaomi|^Mi\b/i.test(m)) return 'xiaomi';
    if (/realme|^RMX/i.test(m)) return 'realme'; if (/^CPH|^OPPO|^PG[A-Z]|^PH[A-Z]/i.test(m)) return 'oppo';
    if (/OnePlus|^NE2|^LE2|^IN2|^KB2|^GM1|^BE2|^DN2/i.test(m)) return 'oneplus'; if (/^V2\d{3}|vivo/i.test(m)) return 'vivo';
    if (/HUAWEI|^ANE|^VOG|^ELS|^LIO|^NOH|^JAD|^MGA|^TAS/i.test(m)) return 'huawei'; if (/Honor|^LLD|^YAL|^FRD|^BMH/i.test(m)) return 'honor';
    if (/Lenovo/i.test(m)) return 'lenovo';
    return null;
  }
  function autoPreselect() {
    if (state.brand) return;
    const ua = navigator.userAgent || '';
    const tryKey = bk => { const br = findBrand('phone', bk); if (br) { selectPhoneBrand(br); return true; } return false; };
    const b = brandFromUA(ua); if (b && tryKey(b)) return;
    if (/Android/i.test(ua) && navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
      navigator.userAgentData.getHighEntropyValues(['model']).then(d => { if (state.brand) return; const bk = brandFromModelCode(d && d.model); if (bk) tryKey(bk); }).catch(() => {});
    }
  }

  // ----- „atinge defectul" pe telefon (scurtătură vizuală; lista de checkbox rămâne controlul accesibil) -----
  function tapRegion(group) {
    if (!elParts || !elPartsStep || elPartsStep.hidden) return; // doar când sunt piese afișate
    const cb = elParts.querySelector('input[data-group="' + group + '"]');
    if (!cb) return;
    cb.click(); // reutilizează handlerul existent (single-choice + total + device)
    const wrap = cb.closest('.cfg-part'); if (wrap) { try { wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {} }
  }
  function setupDeviceTap() {
    Object.keys(devRegions).forEach(group => {
      devRegions[group].forEach(node => {
        node.classList.add('cfg-dev-hit');
        node.addEventListener('click', () => tapRegion(group));
      });
    });
  }

  // ----- init -----
  renderTabs();
  setupDeviceTap();
  selectCategory('phone'); // categorie implicită
  restore();
  autoPreselect();
  booted = true; // de-acum interacțiunile utilizatorului pot scrie starea în hash (pt. share)
})();
