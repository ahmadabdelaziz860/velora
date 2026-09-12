/* =========================================================
   product.js — صفحة المنتج
   لا يعرف شيئًا عن بيانات المتجر إلا من خلال window.VELORA.api
   ========================================================= */
(() => {
'use strict';

/* ---------- الإقلاع بعد جاهزية الملف الرئيسي ---------- */
const boot = () => {
  const A = (window.VELORA || {}).api;
  if (!A) { console.error('[product] VELORA.api missing — check script order'); return; }
  const need = ['lang','L','money','byId','ALL','pic','toast','openSheet','addToCart','cardHTML'];
  const miss = need.filter(k => !A[k]);
  if (miss.length) console.warn('[product] api incomplete:', miss.join(', '));
  try { init(A); } catch (e) { console.error('[product] init failed', e); }
};
if ((window.VELORA || {}).api) boot();
else document.addEventListener('velora:ready', boot, { once: true });


function init(A) {
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------- الإعدادات: مصدر واحد، وأي قيمة من الملف الرئيسي لها الأولوية ---------- */
const CFG = Object.assign({
  HOME: 'index.html',
  SHOP: 'shop.html',
  BRAND: 'Velora',
  CUR: 'EGP',
  LOW_STOCK: 5,      // حد إظهار تنبيه قلة المخزون
  QTY_MAX: 9,        // أقصى كمية في الطلب الواحد
  DEMO_REVIEWS: true,// اجعلها false عند ربط تقييمات حقيقية
  REV_MAX: 20        // أقصى عدد تقييمات محفوظة لكل منتج
}, A.cfg || {});

/* ---------- عناصر الصفحة ---------- */
const el = {
  root:   $('#pdp'),
  crumbs: $('#pdpCrumbs'),
  stage:  $('#pdpStage'),
  thumbs: $('#pdpThumbs'),
  info:   $('#pdpInfo'),
  bar:    $('#pdpBar'),
  revTitle: $('#revTitle'), revSum: $('#revSum'),
  revList:  $('#revList'),  revForm: $('#revFormWrap'),
  relTitle: $('#relTitle'), relGrid: $('#relGrid'),
  sgTitle:  $('#sgTitle'),  sgBody:  $('#sgBody'),
  sizeSheet:$('#sizeSheet')
};
if (!el.root) return;

/* ---------- أدوات ---------- */
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g,
  c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const lang = () => (A.lang ? A.lang() : document.documentElement.lang) || 'en';
const money = n => (A.money ? A.money(n) : `${Number(n).toFixed(2)} ${CFG.CUR}`);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

/* ---------- النصوص ---------- */
const T = {
en:{home:'Home',shop:'Shop',color:'Color',size:'Size',guide:'Size guide',desc:'Description',
 reviews:'Reviews',addrev:'Add a review',your_rating:'Your rating',your_rev:'Your review',nm:'Name',em:'Email',
 submit:'Submit',related:'Related Products',need_size:'Please select a size first',need_color:'Please select a color first',
 need_rate:'Please choose a rating',need_txt:'Please write a short review',thanks:'Thanks! Your review is published.',
 based:'based on',rvs:'reviews',no_rev:'No reviews yet — be the first to write one.',left:'Only',left2:'left in stock',
 qty:'Quantity',add:'Add to cart',soldout:'Sold out',notfound:'Product not found.',back:'Back to shop',
 verified:'Verified purchase',sg_note:'All measurements in cm. Model wears size M.',sg_size:'Size',
 bust:'Bust',waist:'Waist',hips:'Hips',one_note:'One size fits most.',share:'Share',copied:'Link copied',
 share_fail:'Could not share the link',save_fail:'Storage is full — review not saved',
 f1:'Free shipping over 500 EGP',f2:'Easy 14-day returns',f3:'Secure payment',req:'Required fields are marked *'},
ar:{home:'الرئيسية',shop:'المتجر',color:'اللون',size:'المقاس',guide:'دليل المقاسات',desc:'الوصف',
 reviews:'التقييمات',addrev:'أضف تقييمك',your_rating:'تقييمك',your_rev:'رأيك',nm:'الاسم',em:'البريد الإلكتروني',
 submit:'إرسال',related:'منتجات مشابهة',need_size:'اختر المقاس أولًا',need_color:'اختر اللون أولًا',
 need_rate:'اختر عدد النجوم',need_txt:'اكتب رأيك في سطر على الأقل',thanks:'شكرًا! تم نشر تقييمك.',
 based:'من',rvs:'تقييم',no_rev:'لا توجد تقييمات بعد — كن أول من يكتب رأيه.',left:'باقي',left2:'قطعة فقط',
 qty:'الكمية',add:'أضف للسلة',soldout:'نفدت الكمية',notfound:'المنتج غير موجود.',back:'العودة للمتجر',
 verified:'شراء موثّق',sg_note:'كل المقاسات بالسنتيمتر. العارضة تلبس مقاس M.',sg_size:'المقاس',
 bust:'الصدر',waist:'الوسط',hips:'الأرداف',one_note:'مقاس واحد يناسب الجميع.',share:'مشاركة',copied:'تم نسخ الرابط',
 share_fail:'تعذّرت مشاركة الرابط',save_fail:'مساحة التخزين ممتلئة — لم يتم حفظ التقييم',
 f1:'شحن مجاني فوق ٥٠٠ جنيه',f2:'استرجاع سهل خلال ١٤ يوم',f3:'دفع آمن',req:'الحقول المطلوبة عليها علامة *'}};
const x = k => (T[lang()] && T[lang()][k]) || T.en[k] || k;

/* ---------- أسماء الألوان ---------- */
const CN = {'#C98A9A':{en:'Rose',ar:'وردي'},'#E8DCCF':{en:'Cream',ar:'كريمي'},'#4F6B4A':{en:'Olive',ar:'زيتوني'},
'#3E5A7A':{en:'Indigo',ar:'نيلي'},'#1A1816':{en:'Black',ar:'أسود'},'#B08D57':{en:'Camel',ar:'جملي'},
'#8B3A3A':{en:'Burgundy',ar:'نبيتي'},'#E2D6C9':{en:'Sand',ar:'رملي'},'#8A7F74':{en:'Taupe',ar:'بيج غامق'},
'#3E6B4F':{en:'Forest',ar:'أخضر غامق'},'#2F3A44':{en:'Charcoal',ar:'رصاصي'}};
const cname = h => { const c = CN[String(h).toUpperCase()]; return c ? (c[lang()] || c.en) : String(h); };

/* ---------- أيقونات ---------- */
const I = {
 star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1L12 2z"/></svg>',
 bag:'<svg viewBox="0 0 24 24" fill="none"><path d="M7.5 7.67v-.97c0-2.25 1.81-4.46 4.06-4.67 2.68-.26 4.94 1.85 4.94 4.48v1.38" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M9 22h6c4.02 0 4.74-1.61 4.95-3.57l.75-6C20.97 9.99 20.27 8 16 8H8c-4.27 0-4.97 1.99-4.7 4.43l.75 6C4.26 20.39 4.98 22 9 22z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
 heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.65c-.31 0-.61-.04-.86-.13C7.32 20.21 1.25 15.56 1.25 8.69 1.25 5.19 4.08 2.35 7.56 2.35c1.69 0 3.27.66 4.44 1.84 1.17-1.18 2.75-1.84 4.44-1.84 3.48 0 6.31 2.85 6.31 6.34 0 6.88-6.07 11.52-9.89 12.83-.25.09-.55.13-.86.13z"/></svg>',
 share:'<svg viewBox="0 0 24 24" fill="none"><path d="M15 8V5.5C15 4 16 3.5 17 4.3l5 4c.8.6.8 1.8 0 2.4l-5 4c-1 .8-2 .3-2-1.2V11c-6 0-8 3-7 8-3-4-2-11 7-11z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
 chk:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5l5 5L20 6.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
const starsHTML = (n, cls='') =>
  `<span class="stars ${cls}" role="img" aria-label="${Number(n).toFixed(1)} / 5">${
    [1,2,3,4,5].map(i => `<i class="${i <= Math.round(n) ? 'on' : ''}">${I.star}</i>`).join('')}</span>`;

/* ---------- المنتج ---------- */
const pid = new URLSearchParams(location.search).get('id');
const p = pid && A.byId ? A.byId(pid) : null;

if (!p) {
  document.title = `${x('notfound')} — ${CFG.BRAND}`;
  el.root.setAttribute('aria-busy', 'false');
  el.root.innerHTML =
    `<p class="empty">${x('notfound')}</p><a class="cta" href="${CFG.SHOP}">${x('back')}</a>`;
  if (el.bar) el.bar.hidden = true;
  return;
}

/* ---------- الصور: الصور الحقيقية فقط ---------- */
const gallery = (Array.isArray(p.img) ? p.img : [p.img]).filter(Boolean);
const stock = Number.isFinite(+p.stock) ? +p.stock : 0;
const soldout = stock <= 0;
const qtyMax = clamp(soldout ? 1 : stock, 1, CFG.QTY_MAX);

const only = a => Array.isArray(a) && a.length === 1;
const S = {
  img: 0,
  size:  only(p.sizes)  ? p.sizes[0]  : null,
  color: only(p.colors) ? p.colors[0] : null,
  qty: 1,
  rate: 0,
  draft: { t:'', n:'', e:'' },
  stats: { avg: +p.rating || 0, count: 0 }
};

const shotHTML = (imgId, w, ratio) => {
  const alt = esc(A.L(p.name));
  if (imgId && A.pic) return A.pic([imgId], A.L(p.name), w, ratio);
  if (A.PICSUM) return `<img src="${A.PICSUM(p.id, w, Math.round(w * ratio))}" alt="${alt}" loading="lazy" decoding="async">`;
  return `<div class="pdp__noimg" aria-hidden="true"></div>`;
};

/* ---------- التقييمات ---------- */
const RK = 'velora_reviews';
const readAll = () => { try { return JSON.parse(localStorage.getItem(RK) || '{}') || {}; } catch (e) { return {}; } };
const userRevs = () => (readAll()[p.id] || []).filter(r => r && +r.r > 0);

const NAMES = { en:['Nour A.','Hana M.','Sara K.','Mariam T.','Yara S.'],
                ar:['نور أ.','هنا م.','سارة ك.','مريم ط.','يارا س.'] };
const TXT = {
 en:['Fabric feels premium and the fit is true to size. Would buy again.',
     'Beautiful colour in person, even better than the photos. Very comfortable.',
     'Great quality for the price. Delivery took three days.',
     'Lovely piece, I sized up for a looser look and it worked perfectly.',
     'Soft material and neat stitching. Highly recommend.'],
 ar:['القماش خامته ممتازة والمقاس مطابق تمامًا. هشتري منه تاني.',
     'اللون على الطبيعة أحلى من الصور بكتير، ومريح جدًا في اللبس.',
     'جودة عالية بالنسبة للسعر، والتوصيل وصل في تلات أيام.',
     'قطعة جميلة، أخدت مقاس أكبر عشان يبقى واسع شوية وجه مظبوط.',
     'الخامة ناعمة والخيوط نظيفة. أنصح بيه بشدة.']};

/* بصمة ثابتة من رقم المنتج: النجوم والتواريخ لا تتغيّر بتغيّر اللغة */
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; } return h; };
const HSH = hash(String(p.id));
const midnight = () => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); };

const demoRevs = (() => {
  if (!CFG.DEMO_REVIEWS) return [];
  const n = 2 + (HSH % 3);
  const base = midnight();
  return Array.from({ length: n }, (_, i) => ({
    demo: true,
    k: (HSH + i * 7) % 5,
    r: 3 + ((HSH >> (i + 1)) % 3),
    d: base - (7 + ((HSH >> (i + 2)) % 60) + i * 11) * 864e5,
    v: true
  }));
})();

const allRevs = () => [...userRevs().slice().reverse(), ...demoRevs].sort((a, b) => b.d - a.d);
const fdate = ms => { try {
  return new Date(ms).toLocaleDateString(lang() === 'ar' ? 'ar-EG' : 'en-GB',
    { day:'numeric', month:'short', year:'numeric' });
} catch (e) { return ''; } };

const revName = r => r.demo ? ((NAMES[lang()] || NAMES.en)[r.k] || '') : (r.n || '');
const revText = r => r.demo ? ((TXT[lang()] || TXT.en)[r.k] || '') : (r.t || '');

function computeStats() {
  const list = allRevs();
  const avg = list.length ? list.reduce((a, r) => a + (+r.r || 0), 0) / list.length : (+p.rating || 0);
  return { avg, count: list.length, list };
}

/* ---------- الميتا وبيانات محركات البحث ---------- */
function upsert(sel, make, set) {
  let n = document.head.querySelector(sel);
  if (!n) { n = make(); document.head.appendChild(n); }
  set(n); return n;
}
function setMeta() {
  const name = A.L(p.name), desc = String(A.L(p.desc) || '').replace(/\s+/g, ' ').trim();
  document.title = `${name} — ${CFG.BRAND}`;
  upsert('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name:'description' }),
    n => n.setAttribute('content', desc.slice(0, 155)));
  const url = location.origin + location.pathname + '?id=' + encodeURIComponent(p.id);
  upsert('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel:'canonical' }),
    n => n.setAttribute('href', url));
  [['og:title', name], ['og:description', desc.slice(0, 155)], ['og:url', url]].forEach(([k, v]) =>
    upsert(`meta[property="${k}"]`, () => { const m = document.createElement('meta'); m.setAttribute('property', k); return m; },
      n => n.setAttribute('content', v)));

  upsert('script#pdpLd', () => Object.assign(document.createElement('script'), { type:'application/ld+json', id:'pdpLd' }),
    n => n.textContent = JSON.stringify({
      '@context':'https://schema.org', '@type':'Product',
      name, description: desc, sku: p.id,
      offers: { '@type':'Offer', price: p.price, priceCurrency: CFG.CUR, url,
        availability: soldout ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' },
      aggregateRating: S.stats.count
        ? { '@type':'AggregateRating', ratingValue:+S.stats.avg.toFixed(1), reviewCount:S.stats.count }
        : undefined
    }));
}

/* ---------- الرسم ---------- */
function paintAll() {
  S.stats = computeStats();
  setMeta(); paintCrumbs(); paintGallery(); paintInfo(); paintBar();
  paintReviews(); paintRelated(); paintSizeGuide();
  el.root.setAttribute('aria-busy', 'false');
}

function paintCrumbs() {
  if (!el.crumbs) return;
  el.crumbs.innerHTML =
    `<a href="${CFG.HOME}">${x('home')}</a><i aria-hidden="true">/</i>` +
    `<a href="${CFG.SHOP}">${x('shop')}</a><i aria-hidden="true">/</i>` +
    `<span aria-current="page">${esc(A.L(p.name))}</span>`;
}

function paintGallery() {
  if (el.stage) el.stage.innerHTML = shotHTML(gallery[S.img], 1000, 1.25);
  if (!el.thumbs) return;
  if (gallery.length < 2) { el.thumbs.hidden = true; el.thumbs.innerHTML = ''; return; }
  el.thumbs.hidden = false;
  el.thumbs.innerHTML = gallery.map((g, i) =>
    `<button class="pdp__thumb" type="button" data-th="${i}" aria-pressed="${i === S.img}">${shotHTML(g, 240, 1)}</button>`).join('');
}

function paintInfo() {
  if (!el.info) return;
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  const wished = (A.wish || []).includes(p.id);
  const hasColors = Array.isArray(p.colors) && p.colors.length;
  const hasSizes  = Array.isArray(p.sizes)  && p.sizes.length;

  el.info.innerHTML = `
  <div class="pdp__top">
    <div>
      <h1 class="pdp__ttl">${esc(A.L(p.name))}</h1>
      <div class="pdp__meta">
        ${starsHTML(S.stats.avg)}<span>${S.stats.avg.toFixed(1)}</span>
        ${S.stats.count ? `<span aria-hidden="true">·</span><span>${S.stats.count} ${x('rvs')}</span>` : ''}
        ${soldout ? `<span aria-hidden="true">·</span><span class="pdp__out">${x('soldout')}</span>`
          : (stock <= CFG.LOW_STOCK ? `<span aria-hidden="true">·</span><span class="pdp__low">${x('left')} ${stock} ${x('left2')}</span>` : '')}
      </div>
    </div>
    <div class="pdp__acts">
      <button class="pdp__act ${wished ? 'on' : ''}" type="button" id="pdpWish" data-wish="${esc(p.id)}"
              aria-pressed="${wished}" aria-label="Wishlist">${I.heart}</button>
      <button class="pdp__act" type="button" id="pdpShare" aria-label="${x('share')}">${I.share}</button>
    </div>
  </div>

  <div class="pdp__pr">
    <b>${money(p.price)}</b>${p.old ? `<s>${money(p.old)}</s>` : ''}${off ? `<span class="off">-${off}%</span>` : ''}
  </div>

  ${hasColors ? `
  <div class="lbl-row"><p class="lbl" id="lblColor">${x('color')}</p></div>
  <div class="sws" id="pdpColors" role="group" aria-labelledby="lblColor">${p.colors.map(c =>
    `<button class="sw" type="button" data-color="${esc(c)}" style="background:${esc(c)}"
             aria-pressed="${c === S.color}" aria-label="${esc(cname(c))}"></button>`).join('')}</div>
  <p class="sw-name" id="swName">${S.color ? esc(cname(S.color)) : '—'}</p>` : ''}

  ${hasSizes ? `
  <div class="lbl-row">
    <p class="lbl" id="lblSize">${x('size')}</p>
    <button class="sg-link" type="button" id="pdpSG">${x('guide')}</button>
  </div>
  <div class="sizes" id="pdpSizes" role="group" aria-labelledby="lblSize">${p.sizes.map(s =>
    `<button class="size" type="button" data-size="${esc(s)}" aria-pressed="${s === S.size}">${esc(s)}</button>`).join('')}</div>` : ''}

  <div class="pdp__desc">
    <h2 class="pdp__h3">${x('desc')}</h2>
    <p>${esc(A.L(p.desc)).replace(/\n+/g, '<br>')}</p>
    <div class="pdp__list">
      <div>${I.chk}<span>${x('f1')}</span></div>
      <div>${I.chk}<span>${x('f2')}</span></div>
      <div>${I.chk}<span>${x('f3')}</span></div>
    </div>
  </div>`;
}

function paintBar() {
  if (!el.bar) return;
  el.bar.innerHTML = `
  <div class="pdp-bar__in wrap">
    <button class="pdp-bar__bag" type="button" id="pdpBag" aria-label="${x('add')}">${I.bag}</button>
    <div class="qty" role="group" aria-label="${x('qty')}">
      <button type="button" data-q="-1" aria-label="-" ${S.qty <= 1 ? 'disabled' : ''}>−</button>
      <span id="qtyNow" aria-live="polite">${S.qty}</span>
      <button type="button" data-q="1" aria-label="+" ${S.qty >= qtyMax ? 'disabled' : ''}>+</button>
    </div>
    <button class="btn-primary" type="button" id="pdpAdd" ${soldout ? 'disabled' : ''}>
      ${I.bag}<span id="addTxt">${soldout ? x('soldout') : `${x('add')} · ${money(p.price * S.qty)}`}</span>
    </button>
  </div>`;
  requestAnimationFrame(() => el.bar.classList.add('on'));
}

function paintReviews() {
  if (!el.revList) return;
  snapDraft();
  const { list, avg, count } = S.stats;

  if (el.revTitle) el.revTitle.textContent = x('reviews');
  if (el.revSum) el.revSum.innerHTML =
    `<b>${avg.toFixed(1)}</b><div>${starsHTML(avg, 'lg')}<span>${x('based')} ${count} ${x('rvs')}</span></div>`;

  el.revList.innerHTML = list.length ? list.map(r => {
    const nm = revName(r);
    return `
    <article class="rev">
      <div class="rev__av" aria-hidden="true">${esc(nm.trim().charAt(0) || '?')}</div>
      <div class="rev__main">
        <div class="rev__hd">
          <span class="rev__nm">${esc(nm)}</span>${starsHTML(r.r)}
          <span class="rev__dt">${fdate(r.d)}</span>
          ${r.v ? `<span class="rev__vf">${x('verified')}</span>` : ''}
        </div>
        <p class="rev__tx">${esc(revText(r)).replace(/\n+/g, '<br>')}</p>
      </div>
    </article>`; }).join('') : `<p class="empty">${x('no_rev')}</p>`;

  if (!el.revForm) return;
  el.revForm.innerHTML = `
  <form class="rev-form" id="revForm" novalidate>
    <h3 class="pdp__h3">${x('addrev')}</h3>
    <p class="note">${x('req')}</p>
    <div class="fld">
      <label id="rateLbl">${x('your_rating')} *</label>
      <div class="rate-pick" id="ratePick" role="group" aria-labelledby="rateLbl">${[1,2,3,4,5].map(i =>
        `<button type="button" data-r="${i}" class="${i <= S.rate ? 'on' : ''}" aria-label="${i}">${I.star}</button>`).join('')}</div>
    </div>
    <div class="fld"><label for="rvTx">${x('your_rev')} *</label><textarea id="rvTx" maxlength="800"></textarea></div>
    <div class="rev-two">
      <div class="fld"><label for="rvNm">${x('nm')} *</label><input id="rvNm" type="text" maxlength="40" autocomplete="name"></div>
      <div class="fld"><label for="rvEm">${x('em')} *</label><input id="rvEm" type="email" maxlength="80" autocomplete="email"></div>
    </div>
    <button class="btn-primary" type="submit"><span>${x('submit')}</span></button>
  </form>`;
  restoreDraft();
}

function paintRelated() {
  if (!el.relGrid || !A.ALL || !A.cardHTML) return;
  if (el.relTitle) el.relTitle.textContent = x('related');
  const same = A.ALL.filter(o => o.cat === p.cat && o.id !== p.id);
  const rest = A.ALL.filter(o => o.cat !== p.cat && o.id !== p.id);
  el.relGrid.innerHTML = [...same, ...rest].slice(0, 4).map(A.cardHTML).join('');
}

function paintSizeGuide() {
  if (!el.sgBody) return;
  if (el.sgTitle) el.sgTitle.textContent = x('guide');
  // جدول المقاسات قابل للتخصيص لكل منتج عبر p.measure
  const M = p.measure || { XS:[82,64,90], S:[86,68,94], M:[90,72,98], L:[96,78,104], XL:[102,84,110], XXL:[108,90,116] };
  const rows = (p.sizes || []).filter(s => M[s]);
  el.sgBody.innerHTML = rows.length ? `
    <table class="sg-tbl">
      <thead><tr><th>${x('sg_size')}</th><th>${x('bust')}</th><th>${x('waist')}</th><th>${x('hips')}</th></tr></thead>
      <tbody>${rows.map(s =>
        `<tr><td>${esc(s)}</td><td>${M[s][0]}</td><td>${M[s][1]}</td><td>${M[s][2]}</td></tr>`).join('')}</tbody>
    </table>
    <p class="sg-note">${x('sg_note')}</p>` : `<p class="sg-note">${x('one_note')}</p>`;
}

/* ---------- تحديثات جزئية بدل إعادة بناء الصفحة ---------- */
function selectColor(v) {
  S.color = v;

  $$('[data-color]', el.info).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.color === v)));
  const n = $('#swName', el.info); if (n) n.textContent = cname(v);
}
function selectSize(v) {
  S.size = v;

  $$('[data-size]', el.info).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.size === v)));
}
function selectImg(i) {
  S.img = i;
  if (el.stage) el.stage.innerHTML = shotHTML(gallery[S.img], 1000, 1.25);

  $$('[data-th]', el.thumbs).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.th === S.img)));
}
function setQty(d) {
  S.qty = clamp(S.qty + d, 1, qtyMax);
  const n = $('#qtyNow', el.bar); if (n) n.textContent = S.qty;
  const t = $('#addTxt', el.bar); if (t && !soldout) t.textContent = `${x('add')} · ${money(p.price * S.qty)}`;
  const minus = $('[data-q="-1"]', el.bar), plus = $('[data-q="1"]', el.bar);
  if (minus) minus.disabled = S.qty <= 1;
  if (plus)  plus.disabled  = S.qty >= qtyMax;
}
function syncWish() {
  const b = $('#pdpWish', el.info); if (!b) return;
  const on = (A.wish || []).includes(p.id);
  b.classList.toggle('on', on);
  b.setAttribute('aria-pressed', String(on));
}
const flash = sel => { const n = $(sel, el.info); if (!n) return;
  n.classList.add('need'); setTimeout(() => n.classList.remove('need'), 450); };

/* ---------- مسودة نموذج التقييم ---------- */
function snapDraft() {
  const t = $('#rvTx'), n = $('#rvNm'), e = $('#rvEm');
  if (t || n || e) S.draft = { t: t ? t.value : '', n: n ? n.value : '', e: e ? e.value : '' };
}
function restoreDraft() {
  const t = $('#rvTx'), n = $('#rvNm'), e = $('#rvEm');
  if (t) t.value = S.draft.t; if (n) n.value = S.draft.n; if (e) e.value = S.draft.e;
}

/* ---------- المشاركة ---------- */
async function share() {
  const url = location.href;
  try {
    if (navigator.share) { await navigator.share({ title: A.L(p.name), url }); return; }
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url); A.toast(x('copied')); return;
    }
    throw new Error('unsupported');
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    A.toast(x('share_fail'));
  }
}

/* ---------- الأحداث ---------- */
el.root.addEventListener('click', e => {
  const th = e.target.closest('[data-th]');       if (th) return selectImg(+th.dataset.th);
  const c  = e.target.closest('[data-color]');    if (c)  return selectColor(c.dataset.color);
  const s  = e.target.closest('[data-size]');     if (s)  return selectSize(s.dataset.size);
  if (e.target.closest('#pdpSG')) { A.openSheet && A.openSheet(el.sizeSheet); return; }
  if (e.target.closest('#pdpShare')) { share(); return; }
  const r = e.target.closest('[data-r]');
  if (r) { S.rate = +r.dataset.r;

    $$('[data-r]', el.revForm).forEach(b => b.classList.toggle('on', +b.dataset.r <= S.rate)); }
});

if (el.bar) el.bar.addEventListener('click', e => {
  const q = e.target.closest('[data-q]'); if (q) return setQty(+q.dataset.q);
  if (e.target.closest('#pdpBag')) { A.openSheet && A.openSheet(document.getElementById('cartSheet')); return; }
  if (!e.target.closest('#pdpAdd')) return;
  if (soldout) return;
  if (Array.isArray(p.sizes) && p.sizes.length && !S.size) { A.toast(x('need_size')); flash('#pdpSizes'); return; }
  if (Array.isArray(p.colors) && p.colors.length > 1 && !S.color) { A.toast(x('need_color')); flash('#pdpColors'); return; }
  A.addToCart(p.id, S.size, S.qty, el.stage, S.color);
});

el.root.addEventListener('submit', e => {
  if (!e.target || e.target.id !== 'revForm') return;
  e.preventDefault();
  const tx = $('#rvTx').value.trim(), nm = $('#rvNm').value.trim(), em = $('#rvEm').value.trim();
  if (!S.rate)        return A.toast(x('need_rate'));
  if (tx.length < 3)  return A.toast(x('need_txt'));
  if (!nm || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return A.toast(x('req'));

  const db = readAll();
  const list = Array.isArray(db[p.id]) ? db[p.id] : [];
  list.push({ r: S.rate, t: tx.slice(0, 800), n: nm.slice(0, 40), d: Date.now(), v: false });
  db[p.id] = list.slice(-CFG.REV_MAX);
  try { localStorage.setItem(RK, JSON.stringify(db)); }
  catch (err) { A.toast(x('save_fail')); return; }

  S.rate = 0; S.draft = { t:'', n:'', e:'' };
  S.stats = computeStats();
  paintReviews(); paintInfo(); A.toast(x('thanks'));
});

/* ---------- إعادة الرسم عند تغيّر اللغة أو المفضلة ---------- */
let queued = false;
const requestPaint = () => { if (queued) return; queued = true;
  requestAnimationFrame(() => { queued = false; snapDraft(); paintAll(); }); };

document.addEventListener('velora:lang', requestPaint);
document.addEventListener('velora:wish', syncWish);

/* توافق مع الملف الرئيسي القديم دون مسح أي مستمع سابق */
const prevOnLang = typeof window.VELORA.onLang === 'function' ? window.VELORA.onLang : null;
window.VELORA.onLang = function () {
  if (prevOnLang) { try { prevOnLang.apply(this, arguments); } catch (e) {} }
  requestPaint();
};

paintAll();
}
})();
