/* ============================================================
   OnixGSM — SURSĂ UNICĂ DE PREȚURI (single source of truth)
   ------------------------------------------------------------
   Toate prețurile sunt RETAIL, în lei, TVA INCLUS (piesă + manoperă).
   Aceleași valori se folosesc în Configurator (js/main.js) ȘI în
   tabelele din service.html — NU duplica prețuri în alt fișier.

   ⚠️ NU pune aici prețuri de furnizor (_bmad-output/MASTER-*.md sunt
      COSTURI angro, nu retail — nu ajung niciodată la client).

   Convenții:
     - număr  = preț (lei)
     - null   = piesă neoferită pentru acel model (nu se afișează)
     - cap: {v: 549, full: true}  = carcasă completă (ramă+capac)
     - cap: 299                   = capac spate detașabil

   ACTUALIZARE: trimestrial. Ultima: 2026-05-30.
   ============================================================ */
(function () {
  'use strict';

  // Definițiile pieselor (etichetă pentru client, iconiță, timp estimativ)
  var partDefs = {
    dc:   { label: 'Display compatibil',  note: 'LCD/InCell. Funcțional, opțiunea accesibilă.', icon: 'bi-phone',         band: 'fast', group: 'display' },
    do:   { label: 'Display original',    note: 'OLED original / Soft OLED premium. Recomandat.', icon: 'bi-phone-fill',  band: 'fast', group: 'display' },
    bc:   { label: 'Baterie compatibilă', note: 'Aftermarket. Poate afișa „baterie necunoscută”.', icon: 'bi-battery-half', band: 'fast', group: 'battery' },
    bk:   { label: 'Baterie calibrabilă', note: 'Afișează „Sănătate 100%” în Settings.', icon: 'bi-battery-full', band: 'fast', group: 'battery' },
    bo:   { label: 'Baterie Original SP',  note: 'Piesă nouă Samsung (Service Pack).', icon: 'bi-battery-full', band: 'fast', group: 'battery' },
    port: { label: 'Port încărcare',       note: 'Mufa de încărcare / contact slab.', icon: 'bi-usb-c',  band: 'fast' },
    cam:  { label: 'Cameră',               note: 'Cameră principală / geam cameră.', icon: 'bi-camera', band: 'fast' },
    cap:  { label: 'Capac spate',          note: 'Sticlă spate / carcasă.', icon: 'bi-square', band: 'day' }
  };

  // Add-on-uri disponibile pentru orice telefon (preț „de la", flat)
  var addons = [
    { id: 'deox',  label: 'Deoxidare / daună lichid', note: 'A căzut în apă? Nu plătești dacă nu reușim.', icon: 'bi-droplet-half', price: 149, from: true, band: 'multiday' },
    { id: 'micro', label: 'Microsoldering placă',     note: 'Reparație la nivel de componentă. Preț final după diagnoză.', icon: 'bi-cpu', price: 299, from: true, band: 'multiday' },
    { id: 'soft',  label: 'Resoftare / transfer date', note: 'Resoftare, deblocare, transfer date.', icon: 'bi-arrow-repeat', price: 69, from: true, band: 'fast' }
  ];

  var iphone = {
    'iPhone X':          { dc:199, do:499, bc:199, bk:279, port:319, cam:249, cap:{v:549,full:true} },
    'iPhone XR':         { dc:199, do:449, bc:199, bk:279, port:219, cam:249, cap:null },
    'iPhone XS':         { dc:199, do:499, bc:199, bk:279, port:269, cam:249, cap:{v:549,full:true} },
    'iPhone XS Max':     { dc:249, do:549, bc:219, bk:299, port:269, cam:279, cap:{v:649,full:true} },
    'iPhone 11':         { dc:299, do:499, bc:219, bk:299, port:369, cam:279, cap:{v:549,full:true} },
    'iPhone 11 Pro':     { dc:399, do:649, bc:249, bk:329, port:369, cam:329, cap:{v:749,full:true} },
    'iPhone 11 Pro Max': { dc:429, do:699, bc:249, bk:329, port:369, cam:349, cap:{v:749,full:true} },
    'iPhone 12':         { dc:349, do:599, bc:249, bk:329, port:419, cam:329, cap:{v:849,full:true} },
    'iPhone 12 Pro':     { dc:399, do:699, bc:259, bk:349, port:419, cam:349, cap:{v:1049,full:true} },
    'iPhone 12 Pro Max': { dc:429, do:799, bc:269, bk:359, port:419, cam:399, cap:{v:1049,full:true} },
    'iPhone 13':         { dc:449, do:749, bc:269, bk:349, port:469, cam:449, cap:{v:1049,full:true} },
    'iPhone 13 Pro':     { dc:null, do:1149, bc:289, bk:369, port:469, cam:499, cap:{v:1249,full:true} },
    'iPhone 13 Pro Max': { dc:null, do:1249, bc:299, bk:379, port:469, cam:549, cap:{v:1249,full:true} },
    'iPhone 14':         { dc:469, do:949, bc:289, bk:369, port:519, cam:499, cap:249 },
    'iPhone 14 Plus':    { dc:499, do:1099, bc:299, bk:379, port:519, cam:529, cap:249 },
    'iPhone 14 Pro':     { dc:699, do:1449, bc:319, bk:399, port:519, cam:599, cap:{v:1049,full:true} },
    'iPhone 14 Pro Max': { dc:749, do:1699, bc:329, bk:419, port:519, cam:649, cap:{v:1249,full:true} },
    'iPhone 15':         { dc:599, do:1249, bc:299, bk:399, port:619, cam:549, cap:299 },
    'iPhone 15 Plus':    { dc:629, do:1349, bc:309, bk:399, port:619, cam:579, cap:299 },
    'iPhone 15 Pro':     { dc:649, do:1699, bc:329, bk:419, port:619, cam:549, cap:349 },
    'iPhone 15 Pro Max': { dc:699, do:1999, bc:339, bk:429, port:619, cam:699, cap:349 },
    'iPhone 16':         { dc:579, do:1449, bc:349, bk:449, port:819, cam:549, cap:299 },
    'iPhone 16 Plus':    { dc:629, do:1549, bc:359, bk:449, port:819, cam:579, cap:299 },
    'iPhone 16 Pro':     { dc:null, do:2249, bc:389, bk:469, port:819, cam:799, cap:349 },
    'iPhone 16 Pro Max': { dc:null, do:2399, bc:399, bk:479, port:819, cam:849, cap:349 },
    'iPhone 16e':        { dc:499, do:1199, bc:299, bk:369, port:619, cam:449, cap:249 },
    'iPhone 17':         { dc:899, do:2499, bc:419, bk:519, port:619, cam:899, cap:349 },
    'iPhone Air':        { dc:949, do:2499, bc:419, bk:519, port:1019, cam:649, cap:449 },
    'iPhone 17 Pro':     { dc:null, do:2599, bc:449, bk:549, port:919, cam:1099, cap:449 },
    'iPhone 17 Pro Max': { dc:null, do:2999, bc:449, bk:549, port:919, cam:1099, cap:449 }
  };

  var samsung = {
    'Galaxy S8 / S8+':       { dc:399, do:649, bc:149, bo:199, port:119, cam:119 },
    'Galaxy S9 / S9+':       { dc:429, do:699, bc:149, bo:219, port:159, cam:129 },
    'Galaxy S10 / S10+':     { dc:449, do:749, bc:149, bo:199, port:169, cam:139 },
    'Galaxy S10e':           { dc:399, do:649, bc:129, bo:179, port:159, cam:129 },
    'Galaxy S20':            { dc:549, do:849, bc:169, bo:219, port:179, cam:149 },
    'Galaxy S20 Ultra':      { dc:699, do:1099, bc:179, bo:229, port:199, cam:189 },
    'Galaxy S20 FE':         { dc:449, do:699, bc:169, bo:219, port:169, cam:149 },
    'Galaxy S21':            { dc:549, do:849, bc:169, bo:219, port:179, cam:149 },
    'Galaxy S21 Ultra':      { dc:749, do:1199, bc:179, bo:229, port:199, cam:189 },
    'Galaxy S22':            { dc:599, do:899, bc:179, bo:229, port:189, cam:159 },
    'Galaxy S22 Ultra':      { dc:849, do:1299, bc:189, bo:249, port:199, cam:189 },
    'Galaxy S23':            { dc:799, do:849, bc:199, bo:249, port:179, cam:169 },
    'Galaxy S23 Ultra':      { dc:999, do:1349, bc:199, bo:249, port:199, cam:189 },
    'Galaxy S24':            { dc:429, do:779, bc:199, bo:259, port:189, cam:189 },
    'Galaxy S24 Ultra':      { dc:999, do:1199, bc:199, bo:259, port:209, cam:189 },
    'Galaxy S25':            { dc:699, do:899, bc:219, bo:279, port:229, cam:199 },
    'Galaxy S25 Ultra':      { dc:899, do:1249, bc:239, bo:299, port:229, cam:189 },
    'Galaxy S26':            { dc:749, do:949, bc:259, bo:329, port:259, cam:219 },
    'Galaxy S26 Ultra':      { dc:1199, do:1699, bc:279, bo:359, port:259, cam:199 },
    'Galaxy A14 / A15':      { dc:219, do:349, bc:99, bo:149, port:109, cam:99 },
    'Galaxy A25 / A35':      { dc:299, do:399, bc:109, bo:159, port:119, cam:119 },
    'Galaxy A54 / A55 / A56':{ dc:419, do:549, bc:129, bo:179, port:149, cam:159 },
    'Galaxy Z Flip5 / 6':    { dc:null, do:1649, bc:null, bo:479, port:null, cam:null },
    'Galaxy Z Flip7':        { dc:null, do:1899, bc:null, bo:699, port:null, cam:null },
    'Galaxy Z Fold5 / 6':    { dc:null, do:2599, bc:null, bo:549, port:null, cam:null },
    'Galaxy Z Fold7':        { dc:null, do:3499, bc:null, bo:799, port:null, cam:null }
  };

  window.ONIX_PRICES = Object.freeze({
    meta: {
      currency: 'lei',
      tvaIncluded: true,
      updated: '2026-05-30',
      disclaimer: 'Prețuri orientative, TVA inclus. Confirmăm exact după diagnoză gratuită.',
      whatsapp: '40750605905'
    },
    partDefs: partDefs,
    addons: addons,
    // Benzi orientative „de la" pentru mărcile fără preț per-model (Xiaomi/Huawei/Honor/Motorola/Oppo/OnePlus/Google/realme/vivo/Nokia/Lenovo).
    // NU prețuri exacte — estimări de pornire pe gama telefonului, confirmate la diagnoza gratuită.
    androidBands: {
      entry:    { display: 199, baterie: 119, port: 129, cam: 149, cap: 199 },
      mid:      { display: 299, baterie: 149, port: 149, cam: 199, cap: 249 },
      flagship: { display: 499, baterie: 199, port: 199, cam: 299, cap: 349 }
    },
    brands: {
      iphone:  { label: 'iPhone',          icon: 'bi-apple', order: ['dc','do','bc','bk','port','cam','cap'], models: iphone },
      samsung: { label: 'Samsung Galaxy',  icon: 'bi-phone', order: ['dc','do','bc','bo','port','cam'],       models: samsung }
    }
  });
})();
