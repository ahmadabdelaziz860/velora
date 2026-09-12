/* ===== Velora — Shop page logic (shop.js) — requires velora.js first ===== */
(() => {
'use strict';

const A = window.VELORA && window.VELORA.api;
if (!A) { console.error('Velora: velora.js must load before shop.js'); return; }

/* ---------- helpers ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const clamp   = (v,a,b) => Math.min(b, Math.max(a, v));
const okColor = v => /^#[0-9A-Fa-f]{3,8}$/.test(String(v)) || /^[A-Za-z]{3,20}$/.test(String(v));
const num     = n => (typeof A.num === 'function' ? A.num(n) : String(n));
const money   = n => (typeof A.money === 'function' ? A.money(n) : String(n));

/* ---------- i18n ---------- */
const T = {
  en:{ shop:'Shop', filter:'Filter', sort:'Sort By', products:'Products', clear:'Clear all',
       category:'Category', size:'Size', color:'Color', price:'Price', show:'Show results',
       reset:'Reset', none:'No products match your filters.', newest:'Newest',
       low:'Price: low to high', high:'Price: high to low', rated:'Top rated',
       all:'All', new:'New In', sale:'Sale', only:'Show only', more:'Load more',
       doc:'Shop — Velora' },
  ar:{ shop:'المتجر', filter:'تصفية', sort:'ترتيب', products:'منتج', clear:'مسح الكل',
       category:'القسم', size:'المقاس', color:'اللون', price:'السعر', show:'اعرض النتائج',
       reset:'إعادة ضبط', none:'لا توجد منتجات مطابقة للتصفية.', newest:'الأحدث',
       low:'الأقل سعرًا', high:'الأعلى سعرًا', rated:'الأعلى تقييمًا',
       all:'الكل', new:'الجديد', sale:'التخفيضات', only:'عرض فقط', more:'عرض المزيد',
       doc:'المتجر — Velora' }
};
const lang = () => (typeof A.lang === 'function' ? A.lang() : 'en');
const st   = k => (T[lang()] || T.en)[k] || T.en[k] || k;

/* ---------- data ---------- */
const ALL  = Array.isArray(A.ALL)  ? A.ALL.filter(p => p && p.id != null) : [];
const CATS = Array.isArray(A.CATS) ? A.CATS.filter(c => c && c.k) : [];
const CATLIST = CATS.some(c => c.k === 'all')
  ? CATS
  : [{ k:'all', n:{ en:'All', ar:'الكل' } }, ...CATS];
const catName = c => { try { return String(A.L(c.n) ?? c.k); } catch { return String(c.k); } };

if (!ALL.length) console.warn('Velora: shop.js — قائمة المنتجات فاضية');

const SIZE_ORDER = ['XXS','XS','S','M','L','XL','XXL','2XL','3XL','4XL'];
const sizeRank = s => {
  const i = SIZE_ORDER.indexOf(String(s).toUpperCase());
  return i >= 0 ? i : 100 + (parseFloat(s) || 0);
};
const SIZES  = [...new Set(ALL.flatMap(p => p.sizes  || []))].sort((a,b)=>sizeRank(a)-sizeRank(b));
const COLORS = [...new Set(ALL.flatMap(p => p.colors || []))].filter(okColor);

const PRICES = ALL.map(p => +p.price).filter(Number.isFinite);
const PMIN = PRICES.length ? Math.floor(Math.min(...PRICES)/10)*10 : 0;
let   PMAX = PRICES.length ? Math.ceil (Math.max(...PRICES)/10)*10 : 0;
if (PMAX <= PMIN) PMAX = PMIN + 10;

/* ---------- sale / new ---------- */
const isSale = p => {
  if (typeof A.isSale === 'function') return !!A.isSale(p);
  if (Array.isArray(A.SALE) && A.SALE.some(s => (s && s.id ? s.id : s) === p.id)) return true;
  const old = p.old ?? p.oldPrice ?? p.was ?? p.compare ?? p.before;
  if (typeof old === 'number' && old > p.price) return true;
  return !!(p.off || p.sale || p.discount);
};
const NEWSET = (() => {
  const m = ALL.filter(p => p.new === true || p.isNew === true || p.tag === 'new');
  return new Set((m.length ? m : ALL.slice(-12)).map(p => p.id));
})();
const isNew = p => NEWSET.has(p.id);

/* ترتيب «الأحدث»: تاريخ المنتج إن وُجد، وإلا ترتيب الإضافة عكسيًا */
const IDX  = new Map(ALL.map((p,i) => [p.id, i]));
const dOf  = p => Date.parse(p.date || p.createdAt || p.added || '');
const HASD = ALL.some(p => Number.isFinite(dOf(p)));
const newKey = p => HASD ? (Number.isFinite(dOf(p)) ? dOf(p) : 0) : IDX.get(p.id);

/* ---------- state ---------- */
const SORTS = ['newest','low','high','rated'];
const PAGE  = 24;
const S = { cat:'all', flags:new Set(), sizes:new Set(), colors:new Set(),
            min:PMIN, max:PMAX, sort:'newest' };
let shown = PAGE, cache = null;

/* ---------- URL sync ---------- */
function readURL(){
  const q = new URLSearchParams(location.search);
  const cat = q.get('cat');
  S.cat = (cat && (cat === 'all' || CATS.some(c => c.k === cat))) ? cat : 'all';

  S.flags.clear();
  q.getAll('f').join(',').toLowerCase().split(',').map(x => x.trim())
   .forEach(f => { if (f === 'sale' || f === 'new') S.flags.add(f); });

  S.sizes.clear();
  q.getAll('size').join(',').split(',').map(x => x.trim()).filter(Boolean)
   .forEach(s => { if (SIZES.includes(s)) S.sizes.add(s); });

  S.colors.clear();
  q.getAll('color').join(',').split(',').map(x => x.trim()).filter(Boolean)
   .forEach(c => { if (COLORS.includes(c)) S.colors.add(c); });

  const mn = q.get('min'), mx = q.get('max');
  S.min = (mn !== null && Number.isFinite(+mn)) ? clamp(+mn, PMIN, PMAX) : PMIN;
  S.max = (mx !== null && Number.isFinite(+mx)) ? clamp(+mx, PMIN, PMAX) : PMAX;
  if (S.min > S.max) { const t = S.min; S.min = S.max; S.max = t; }

  const so = q.get('sort');
  S.sort = SORTS.includes(so) ? so : 'newest';
}
function writeURL(){
  const q = new URLSearchParams();
  if (S.cat !== 'all')  q.set('cat', S.cat);
  if (S.flags.size)     q.set('f', [...S.flags].join(','));
  if (S.sizes.size)     q.set('size', [...S.sizes].join(','));
  if (S.colors.size)    q.set('color', [...S.colors].join(','));
  if (S.min > PMIN)     q.set('min', S.min);
  if (S.max < PMAX)     q.set('max', S.max);
  if (S.sort !== 'newest') q.set('sort', S.sort);
  const s = q.toString();
  try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '')); } catch {}
}

/* ---------- filtering ---------- */
function compute(){
  const a = ALL.filter(p => {
    if (S.cat !== 'all' && p.cat !== S.cat) return false;
    if (S.flags.has('sale') && !isSale(p)) return false;
    if (S.flags.has('new')  && !isNew(p))  return false;
    const pr = +p.price;
    if (!Number.isFinite(pr) || pr < S.min || pr > S.max) return false;
    if (S.sizes.size  && !(p.sizes  || []).some(x => S.sizes.has(x)))  return false;
    if (S.colors.size && !(p.colors || []).some(x => S.colors.has(x))) return false;
    return true;
  });
  if (S.sort === 'low')    a.sort((x,y) => x.price - y.price);
  if (S.sort === 'high')   a.sort((x,y) => y.price - x.price);
  if (S.sort === 'rated')  a.sort((x,y) => (y.rating || 0) - (x.rating || 0));
  if (S.sort === 'newest') a.sort((x,y) => newKey(y) - newKey(x));
  return a;
}
const results   = () => (cache || (cache = compute()));
const invalidate= () => { cache = null; };
const activeCount = () => (S.cat !== 'all' ? 1 : 0) + S.flags.size + S.sizes.size +
                          S.colors.size + ((S.min > PMIN || S.max < PMAX) ? 1 : 0);

/* ---------- nodes ---------- */
const N = {
  catsRail : $('#shopCats'),
  fCats    : $('#fCats'),
  fFlags   : $('#fFlags'),
  fSizes   : $('#fSizes'),
  fColors  : $('#fColors'),
  fMin     : $('#fMin'),
  fMax     : $('#fMax'),
  pvMin    : $('#pvMin'),
  pvMax    : $('#pvMax'),
  sortList : $('#sortList'),
  tokens   : $('#shopTokens'),
  grid     : $('#shopGrid'),
  count    : $('#shopCount'),
  more     : $('#shopMore'),
  openF    : $('#openFilter'),
  openS    : $('#openSort'),
  filterSh : $('#filterSheet'),
  sortSh   : $('#sortSheet')
};

/* ---------- render ---------- */
function texts(){

  $$('[data-i18n-shop]').forEach(el => { el.textContent = st(el.dataset.i18nShop); });
  document.title = st('doc');
}
function cats(){
  const html = CATLIST.map(c =>
    `<button type="button" class="chip" data-scat="${esc(c.k)}" aria-pressed="${c.k === S.cat}">${esc(catName(c))}</button>`
  ).join('');
  if (N.catsRail) N.catsRail.innerHTML = html;
  if (N.fCats)    N.fCats.innerHTML    = html.replace(/class="chip"/g, 'class="fchip"');
}
function flags(){
  if (!N.fFlags) return;
  N.fFlags.innerHTML = ['sale','new'].map(k => {
    const on = S.flags.has(k);
    return `<button type="button" class="fchip fflag" data-sflag="${k}" aria-pressed="${on}">
      <span class="tick" aria-hidden="true">${on ? '✓' : ''}</span>${esc(st(k))}</button>`;
  }).join('');
}
function sizes(){
  if (!N.fSizes) return;
  N.fSizes.innerHTML = SIZES.map(s =>
    `<button type="button" class="fchip" data-size="${esc(s)}" aria-pressed="${S.sizes.has(s)}">${esc(s)}</button>`
  ).join('');
}
function colors(){
  if (!N.fColors) return;
  N.fColors.innerHTML = COLORS.map(c =>
    `<button type="button" class="swatch" data-color="${esc(c)}" style="background:${c}"
      aria-pressed="${S.colors.has(c)}" aria-label="${esc(c)}"></button>`
  ).join('');
}
function price(){
  if (!N.fMin || !N.fMax) return;
  [N.fMin, N.fMax].forEach(el => { el.min = PMIN; el.max = PMAX; el.step = 10; });
  N.fMin.value = S.min; N.fMax.value = S.max;
  if (N.pvMin) N.pvMin.textContent = money(S.min);
  if (N.pvMax) N.pvMax.textContent = money(S.max);
}
function sorts(){
  if (!N.sortList) return;
  N.sortList.innerHTML = SORTS.map(k =>
    `<button type="button" data-sort="${k}" aria-pressed="${k === S.sort}">
       <span>${esc(st(k))}</span>
       <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
     </button>`).join('');
}
function tokens(){
  if (!N.tokens) return;
  const out = [];
  S.flags.forEach(k => out.push(
    `<span class="token">${esc(st(k))}<button type="button" data-rm="flag" data-v="${k}" aria-label="remove">×</button></span>`));
  if (S.cat !== 'all'){
    const c = CATLIST.find(x => x.k === S.cat);
    out.push(`<span class="token">${esc(st('category'))}: ${esc(c ? catName(c) : S.cat)}<button type="button" data-rm="cat" aria-label="remove">×</button></span>`);
  }
  S.sizes.forEach(s => out.push(
    `<span class="token">${esc(st('size'))}: ${esc(s)}<button type="button" data-rm="size" data-v="${esc(s)}" aria-label="remove">×</button></span>`));
  S.colors.forEach(c => out.push(
    `<span class="token"><i style="background:${okColor(c) ? c : 'transparent'}"></i><button type="button" data-rm="color" data-v="${esc(c)}" aria-label="remove">×</button></span>`));
  if (S.min > PMIN || S.max < PMAX) out.push(
    `<span class="token">${esc(st('price'))}: ${esc(money(S.min))} — ${esc(money(S.max))}<button type="button" data-rm="price" aria-label="remove">×</button></span>`);
  if (out.length) out.push(`<button type="button" class="clear-all" data-rm="all">${esc(st('clear'))}</button>`);
  N.tokens.innerHTML = out.join('');
}
function syncWish(){
  if (typeof A.isWished !== 'function' || !N.grid) return;

  $$('[data-wish]', N.grid).forEach(b => {
    const on = !!A.isWished(b.dataset.wish);
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on);
  });
}
function grid(){
  if (!N.grid) return;
  const a = results(), total = a.length;
  if (N.count) N.count.textContent = num(total);
  N.grid.innerHTML = total
    ? a.slice(0, shown).map(p => (typeof A.cardHTML === 'function' ? A.cardHTML(p) : '')).join('')
    : `<div class="shop-empty"><p>${esc(st('none'))}</p>
         <button type="button" class="btn-ghost" data-rm="all">${esc(st('clear'))}</button></div>`;
  if (N.more) N.more.hidden = total <= shown;
  if (N.openF) N.openF.classList.toggle('has', activeCount() > 0);
  syncWish();
}
function paint(){
  texts(); cats(); flags(); sizes(); colors(); price(); sorts(); tokens(); grid(); writeURL();
}

/* رسم مُجمَّع لتفادي إعادة الرسم مع كل حركة */
let raf = 0;
function repaint(full){
  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    raf = 0;
    invalidate(); shown = PAGE;
    if (full) paint(); else { tokens(); grid(); writeURL(); }
  });
}

/* ---------- events ---------- */
function onClick(e){
  const fl = e.target.closest('[data-sflag]');
  if (fl){ const k = fl.dataset.sflag; S.flags.has(k) ? S.flags.delete(k) : S.flags.add(k); return repaint(true); }

  const c = e.target.closest('[data-scat]');
  if (c){ S.cat = c.dataset.scat; return repaint(true); }

  const s = e.target.closest('[data-size]');
  if (s){ const v = s.dataset.size; S.sizes.has(v) ? S.sizes.delete(v) : S.sizes.add(v); return repaint(true); }

  const k = e.target.closest('[data-color]');
  if (k){ const v = k.dataset.color; S.colors.has(v) ? S.colors.delete(v) : S.colors.add(v); return repaint(true); }

  const so = e.target.closest('[data-sort]');
  if (so){ S.sort = so.dataset.sort; repaint(true); if (typeof A.closeSheet === 'function') A.closeSheet(); return; }

  const rs = e.target.closest('#fReset');
  const rm = e.target.closest('[data-rm]');
  if (rs || (rm && rm.dataset.rm === 'all')){
    S.cat = 'all'; S.flags.clear(); S.sizes.clear(); S.colors.clear();
    S.min = PMIN; S.max = PMAX;
    return repaint(true);
  }
  if (rm){
    const kind = rm.dataset.rm, v = rm.dataset.v;
    if (kind === 'cat')   S.cat = 'all';
    if (kind === 'flag')  S.flags.delete(v);
    if (kind === 'size')  S.sizes.delete(v);
    if (kind === 'color') S.colors.delete(v);
    if (kind === 'price'){ S.min = PMIN; S.max = PMAX; }
    return repaint(true);
  }
}
[N.catsRail, N.filterSh, N.sortSh, N.tokens, N.grid]
  .forEach(root => root && root.addEventListener('click', onClick));

if (N.openF) N.openF.addEventListener('click', () => A.openSheet && A.openSheet(N.filterSh));
if (N.openS) N.openS.addEventListener('click', () => A.openSheet && A.openSheet(N.sortSh));

if (N.more) N.more.addEventListener('click', () => {
  shown += PAGE;
  const a = results();
  const extra = a.slice(shown - PAGE, shown)
    .map(p => (typeof A.cardHTML === 'function' ? A.cardHTML(p) : '')).join('');
  N.grid.insertAdjacentHTML('beforeend', extra);
  N.more.hidden = a.length <= shown;
  syncWish();
});

if (N.fMin) N.fMin.addEventListener('input', e => {
  S.min = clamp(Math.min(+e.target.value, S.max), PMIN, PMAX);
  e.target.value = S.min;
  if (N.pvMin) N.pvMin.textContent = money(S.min);
  repaint(false);
});
if (N.fMax) N.fMax.addEventListener('input', e => {
  S.max = clamp(Math.max(+e.target.value, S.min), PMIN, PMAX);
  e.target.value = S.max;
  if (N.pvMax) N.pvMax.textContent = money(S.max);
  repaint(false);
});

/* لغة / عملة / مفضلة / رجوع */
document.addEventListener('velora:lang', () => repaint(true));
document.addEventListener('velora:cur',  () => { price(); tokens(); grid(); });
document.addEventListener('velora:wish', syncWish);
window.addEventListener('popstate', () => { readURL(); invalidate(); shown = PAGE; paint(); });
/* توافق مع النداء القديم لو velora.js بيستخدمه */
if (typeof window.VELORA.onLang !== 'function') window.VELORA.onLang = () => repaint(true);

/* ---------- start ---------- */
readURL();
paint();
})();
