/* ============================================================
   VELORA — core script (loaded first on every page)
   ============================================================ */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g,
  c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

/* ---------- Config: single source of truth ---------- */
const CFG = {
  HOME:'velora.html',            /* اسم الصفحة الرئيسية — المكان الوحيد */
  SHOP:'shop.html',
  CHECKOUT:'checkout.html',
  PRODUCT:'product.html',
  ACCOUNT:'account.html',    /* بدّلها لـ account.html بعد إنشائها */
  WISHLIST:'shop.html?f=wish',
  TRACK:'account.html',
RETURNS:'returns.html',
  WA:'201000000000',             /* رقم الواتساب — مرة واحدة */
  FREE_SHIP:500,
  QTY_MAX:9
};
const ROUTE = {
  home:CFG.HOME, shop:CFG.SHOP, account:CFG.ACCOUNT,
  wishlist:CFG.WISHLIST, track:CFG.TRACK, checkout:CFG.CHECKOUT,
  returns:CFG.RETURNS
};
const PAGE = (location.pathname.split('/').pop() || CFG.HOME).toLowerCase();
const HOME_ALIAS = /^(index|home|velova|velora)\.html/i;

const V = window.VELORA = window.VELORA || {};
const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));

/* ---------- Storage (never throws) ---------- */
const LS = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
  raw(k, d){ try{ const v = localStorage.getItem(k); return v == null ? d : v; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); return true; }catch(e){ return false; } }
};

/* ---------- Images ---------- */
const U = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const PICSUM = (seed, w, h) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

function pic(ids, alt, w = 800, ratio = 1.25, cls = '', eager = false){
  const list = (Array.isArray(ids) ? ids : [ids]).filter(Boolean).map(id => U(id, w));
  list.push(PICSUM(alt || 'velora', w, Math.round(w * ratio)));
  return `<img class="${esc(cls)}" src="${list[0]}" data-srcs="${esc(list.slice(1).join('|'))}"
    alt="${esc(alt)}" width="${w}" height="${Math.round(w * ratio)}"
    ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

/* معالجة موحّدة للصور — لا حاجة لخصائص مضمّنة في كل وسم */
function nextSrc(el){
  const q = (el.dataset.srcs || '').split('|').filter(Boolean);
  if(q.length){ el.dataset.srcs = q.slice(1).join('|'); el.src = q[0]; }
  else { el.style.display = 'none'; el.parentElement && el.parentElement.classList.add('skel'); }
}
V.imgErr = nextSrc;   /* توافق مع الصفحات القديمة */
document.addEventListener('error', e => {
  if(e.target instanceof HTMLImageElement) nextSrc(e.target);
}, true);
document.addEventListener('load', e => {
  if(e.target instanceof HTMLImageElement) e.target.classList.add('loaded');
}, true);

/* ---------- i18n ---------- */
const I18N = {
  en:{
    ann1:"Free shipping on orders over {v}", ann2:"New arrivals every week", ann3:"Easy 14-day returns",
    nav_shop:"Shop", nav_new:"New In", nav_sale:"Sale", nav_about:"About",
    best_seller:"Best Seller", new_arrivals:"New", on_sale:"On Sale", see_more:"See More",
    shop_now:"Shop Now", add_to_cart:"Add to Cart",
    promo_title:"The best of Summer 2025", promo_sub:"Limited Edition",
    only:"Only", pieces:"left", ends_in:"Ends in",
    t1:"Free Shipping", t1s:"Over {v}", t2:"Easy Returns", t2s:"Within 14 days", t3:"Secure Payment", t3s:"100% protected",
    f_home:"Home", f_about:"About Us", f_contact:"Contact Us", f_shop:"Shop", f_blog:"Blog", f_help:"Help",
    f_privacy:"Privacy Policy", f_return:"Return and Exchange Policy", f_ship:"Shipping Policy", rights:"All rights reserved.",
    menu:"Menu", search:"Search", search_ph:"Search for dresses, denim…", popular:"Popular searches",
    details:"Product Details", your_bag:"Your Bag", subtotal:"Subtotal", shipping:"Shipping",
    calc_checkout:"Calculated at checkout", total:"Total", checkout:"Checkout",
    empty_cart:"Your bag is empty", empty_cart_sub:"Add something beautiful to get started.",
    no_results:"No products matched your search.", size:"Select size", color:"Select colour", qty:"Quantity",
    added:"added to your bag", removed:"Removed from bag", wish_add:"Saved to wishlist", wish_rm:"Removed from wishlist",
    need_help:"Need help?", whatsapp_us:"WhatsApp us", free_left:"away from free shipping",
    free_done:"You unlocked free shipping!", remove:"Remove", size_l:"Size", colour_l:"Colour",
    max_qty:"Maximum available quantity reached", save_fail:"Storage is full — changes were not saved",
    soldout:"Sold out", account:"Account", wishlist:"Wishlist",
    u_svc:"Support 10AM - 8PM", u_msg:"Free shipping on orders over {v}", u_trk:"Track order", u_cur:"Currency",
    to_ar:"Switch to Arabic", to_en:"Switch to English"
  },
  ar:{
    ann1:"شحن مجاني للطلبات أكثر من {v}", ann2:"وصل حديثًا كل أسبوع", ann3:"استرجاع سهل خلال ١٤ يوم",
    nav_shop:"تسوّق الآن", nav_new:"وصل حديثًا", nav_sale:"التخفيضات", nav_about:"من نحن",
    best_seller:"الأكثر مبيعًا", new_arrivals:"جديدنا", on_sale:"عروض", see_more:"مشاهدة الكل",
    shop_now:"اشتري الآن", add_to_cart:"أضف للسلة",
    promo_title:"أفضل إطلالات صيف ٢٠٢٥", promo_sub:"إصدار محدود",
    only:"باقي", pieces:"قطع", ends_in:"ينتهي بعد",
    t1:"شحن مجاني", t1s:"فوق {v}", t2:"استرجاع سهل", t2s:"خلال ١٤ يوم", t3:"دفع آمن", t3s:"محمي ١٠٠٪",
    f_home:"الرئيسية", f_about:"من نحن", f_contact:"اتصل بنا", f_shop:"المتجر", f_blog:"المدونة", f_help:"المساعدة",
    f_privacy:"سياسة الخصوصية", f_return:"سياسة الاستبدال والاسترجاع", f_ship:"سياسة الشحن", rights:"جميع الحقوق محفوظة.",
    menu:"القائمة", search:"بحث", search_ph:"ابحث عن فستان، جينز…", popular:"الأكثر بحثًا",
    details:"تفاصيل المنتج", your_bag:"سلة الشراء", subtotal:"المجموع", shipping:"الشحن",
    calc_checkout:"يُحسب عند الدفع", total:"الإجمالي", checkout:"إتمام الشراء",
    empty_cart:"سلتك فارغة", empty_cart_sub:"أضف قطعة تحبها وابدأ التسوق.",
    no_results:"لا توجد نتائج مطابقة.", size:"اختر المقاس", color:"اختر اللون", qty:"الكمية",
    added:"أُضيف للسلة", removed:"تم الحذف من السلة", wish_add:"أُضيف للمفضلة", wish_rm:"أُزيل من المفضلة",
    need_help:"محتاج مساعدة؟", whatsapp_us:"تواصل واتساب", free_left:"للحصول على شحن مجاني",
    free_done:"مبروك! حصلت على شحن مجاني", remove:"حذف", size_l:"المقاس", colour_l:"اللون",
    max_qty:"وصلت لأقصى كمية متاحة", save_fail:"مساحة التخزين ممتلئة — لم يتم الحفظ",
    soldout:"نفدت الكمية", account:"الحساب", wishlist:"المفضلة",
    u_svc:"خدمة العملاء ١٠ص - ٨م", u_msg:"شحن مجاني للطلبات أكتر من {v}", u_trk:"تتبّع طلبك", u_cur:"العملة",
    to_ar:"التبديل للعربية", to_en:"التبديل للإنجليزية"
  }
};
let lang = LS.raw('velora_lang', 'en');
if(!I18N[lang]) lang = 'en';
const t = (k, vars) => {
  let s = (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k;
  if(vars) Object.keys(vars).forEach(v => { s = s.split('{' + v + '}').join(vars[v]); });
  return s;
};
const L = o => (o && (o[lang] || o.en)) || '';

/* ---------- Data ---------- */
const SLIDES = [
  {img:['1483985988355-763728e1935b','1445205170230-053b83016050'], kicker:{en:'New Collection',ar:'تشكيلة جديدة'}, title:{en:'Denim, redefined',ar:'الدنيم بشكل جديد'}},
  {img:['1490481651871-ab68de25d43d','1487222477894-8943e31ef7b2'], kicker:{en:'Autumn Edit',ar:'إصدار الخريف'}, title:{en:'Soft layers season',ar:'موسم الطبقات الناعمة'}},
  {img:['1479064555552-3ef4979f8908','1441984904996-e0b6ba687e04'], kicker:{en:'Up to 50% off',ar:'خصم يصل ٥٠٪'}, title:{en:'The Sale is on',ar:'التخفيضات بدأت'}}
];
const CATS = [
  {k:'all',   n:{en:'All',ar:'الكل'}},
  {k:'dress', n:{en:'Dresses',ar:'فساتين'}},
  {k:'tops',  n:{en:'Tops',ar:'بلوزات'}},
  {k:'denim', n:{en:'Denim',ar:'جينز'}},
  {k:'knit',  n:{en:'Knitwear',ar:'تريكو'}},
  {k:'bags',  n:{en:'Bags',ar:'شنط'}},
  {k:'shoes', n:{en:'Shoes',ar:'أحذية'}}
];
const P = (id,en,ar,den,dar,price,old,img,cat,tag,rating,colors,sizes,stock) =>
  ({id,name:{en,ar},desc:{en:den,ar:dar},price,old,img,cat,tag,rating,colors,sizes,stock});

const PRODUCTS = [
  P('p1','Rosa Textured Blouse','بلوزة روزا المنقوشة','Relaxed fit • soft cotton blend','قَصّة واسعة • قطن ناعم',530,690,['1554568218-0f1715e72254','1485462537746-965f33f7f6a7'],'tops','best',4.8,['#C98A9A','#E8DCCF'],['XS','S','M','L'],7),
  P('p2','Olive Linen Shirt','قميص أوليڤ الكتان','Breathable linen • button front','كتان مريح • أزرار أمامية',610,760,['1591047139829-d91aecb6caea','1529139574466-a303027c1d8b'],'tops','best',4.7,['#4F6B4A','#E8DCCF'],['S','M','L','XL'],5),
  P('p3','Nora Denim Jacket','جاكيت نورا دنيم','Oversized • washed indigo','واسع • دنيم مغسول',1290,1590,['1541099649105-f69ad21f3246','1503342217505-b0a15ec3261c'],'denim','best',4.9,['#3E5A7A','#1A1816'],['S','M','L'],9),
  P('p4','Amber Midi Dress','فستان أمبر ميدي','Flowy midi • wrap waist','قَصّة منسدلة • وسط ملفوف',980,1250,['1595777457583-95e059d581b8','1515886657613-9f3515b0c78f'],'dress','best',4.6,['#B08D57','#8B3A3A'],['XS','S','M'],4),
  P('p5','Sand Knit Cardigan','كارديجان ساند تريكو','Chunky knit • drop shoulder','تريكو سميك • كتف ساقط',870,null,['1576566588028-4147f3842f27','1434389677669-e08b4cac3105'],'knit','new',4.5,['#E2D6C9','#8A7F74'],['S','M','L'],12),
  P('p6','Ivy Pleated Skirt','جيبة آيڤي بليسيه','Fine pleats • midi length','بليسيه ناعم • طول ميدي',720,null,['1583496661160-fb5886a13d77','1490481651871-ab68de25d43d'],'dress','new',4.4,['#3E6B4F','#E8DCCF'],['XS','S','M','L'],10),
  P('p7','Luna Structured Bag','شنطة لونا','Vegan leather • gold hardware','جلد نباتي • تفاصيل ذهبية',940,null,['1548036328-c9fa89d128fa','1591561954557-26941169b49e'],'bags','new',4.9,['#B08D57','#1A1816'],['One'],6),
  P('p8','Mira Slim Trousers','بنطلون ميرا سليم','High waist • tailored','خصر عالي • قَصّة مضبوطة',760,null,['1594633312681-425c7b97ccd1','1552374196-c4e7ffc6e126'],'denim','new',4.3,['#2F3A44','#8A7F74'],['S','M','L'],8)
];
const SALE = [
  P('s1','Velvet Wrap Blouse','بلوزة ڤيلڤيت','Silky touch • adjustable tie','ملمس حريري • ربطة قابلة للتعديل',530,690,['1485462537746-965f33f7f6a7'],'tops',null,4.6,['#8B3A3A','#1A1816'],['XS','S','M','L'],5),
  P('s2','Classic Denim Shirt','قميص دنيم كلاسيك','Timeless cut • soft wash','قَصّة كلاسيكية • غسيل ناعم',530,690,['1503342217505-b0a15ec3261c'],'denim',null,4.8,['#3E5A7A','#E8DCCF'],['S','M','L'],5),
  P('s3','Terra Ribbed Top','توب تيرا مضلع','Stretch rib • fitted','قماش مضلع مرن • ضيق',480,640,['1529139574466-a303027c1d8b'],'tops',null,4.5,['#B08D57','#1A1816'],['XS','S','M'],5),
  P('s4','Sahar Maxi Dress','فستان سحر ماكسي','Floaty maxi • side slit','ماكسي منسدل • شق جانبي',530,690,['1515886657613-9f3515b0c78f'],'dress',null,4.7,['#E8DCCF','#8B3A3A'],['S','M','L'],5),
  P('s5','Nova Cropped Jacket','جاكيت نوڤا كروب','Cropped fit • lined','قَصّة كروب • مبطن',530,690,['1539109136881-3be0616acf4b'],'denim',null,4.4,['#2F3A44','#1A1816'],['S','M','L','XL'],5)
];
const ALL = [...PRODUCTS, ...SALE];
const byId = id => ALL.find(p => p.id === id);
const sizesOf  = p => Array.isArray(p.sizes)  ? p.sizes  : [];
const colorsOf = p => Array.isArray(p.colors) ? p.colors : [];
const stockOf  = p => Number.isFinite(+(p && p.stock)) ? +p.stock : 0;

/* ---------- Currency ---------- */
const CUR = {
  EGP:{r:1,     s:{en:'EGP',ar:'ج.م'}, n:{en:'Egyptian Pound',ar:'جنيه مصري'}},
  USD:{r:0.021, s:{en:'$',  ar:'$'},   n:{en:'US Dollar',ar:'دولار أمريكي'}},
  SAR:{r:0.079, s:{en:'SAR',ar:'ر.س'}, n:{en:'Saudi Riyal',ar:'ريال سعودي'}},
  AED:{r:0.077, s:{en:'AED',ar:'د.إ'}, n:{en:'UAE Dirham',ar:'درهم إماراتي'}},
  EUR:{r:0.019, s:{en:'€',  ar:'€'},   n:{en:'Euro',ar:'يورو'}}
};
let curr = LS.raw('velora_cur', 'EGP');
if(!CUR[curr]) curr = 'EGP';
const money = v => {
  const c = CUR[curr];
  const n = (Number(v) || 0) * c.r;
  const f = n.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
  const s = c.s[lang] || c.s.en;
  return (curr === 'USD' || curr === 'EUR') ? s + f : f + ' ' + s;
};
const i18nVars = () => ({ v: money(CFG.FREE_SHIP) });

function setCur(k){
  curOpen(false);
  if(!CUR[k] || k === curr) return;
  curr = k; LS.set('velora_cur', k);
  /* الأسعار فقط — بدون إعادة بناء البانر */
  buildUbar(); renderTexts(); renderRails(); paintCart(); doSearch();
  emit('velora:cur', { cur:curr });
  emit('velora:lang', { lang, cur:curr });
  if(typeof V.onLang === 'function') V.onLang();
}

/* ---------- State ---------- */
let cart = (LS.get('velora_cart', []) || [])
  .filter(c => c && byId(c.id) && +c.qty > 0)
  .map(c => ({ id:c.id, size:c.size || null, color:c.color || null, qty:clamp(+c.qty || 1, 1, CFG.QTY_MAX) }));
let wish = (LS.get('velora_wish', []) || []).filter(id => !!byId(id));

function save(){
  const ok = LS.set('velora_cart', cart) && LS.set('velora_wish', wish);
  if(!ok) toast(t('save_fail'), '');
  return ok;
}
const lineMax = id => clamp(Math.min(stockOf(byId(id)) || CFG.QTY_MAX, CFG.QTY_MAX), 1, CFG.QTY_MAX);

/* ---------- Icons ---------- */
const ICON_OK = `<svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5l5 5L20 6.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const starSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1L12 2z"/></svg>`;
const bagSvg  = `<svg viewBox="0 0 24 24" fill="none"><path d="M7.5 7.67v-.97c0-2.25 1.81-4.46 4.06-4.67 2.68-.26 4.94 1.85 4.94 4.48v1.38" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M9 22h6c4.02 0 4.74-1.61 4.95-3.57l.75-6C20.97 9.99 20.27 8 16 8H8c-4.27 0-4.97 1.99-4.7 4.43l.75 6C4.26 20.39 4.98 22 9 22z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;
const heartSvg= `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.65c-.31 0-.61-.04-.86-.13C7.32 20.21 1.25 15.56 1.25 8.69 1.25 5.19 4.08 2.35 7.56 2.35c1.69 0 3.27.66 4.44 1.84 1.17-1.18 2.75-1.84 4.44-1.84 3.48 0 6.31 2.85 6.31 6.34 0 6.88-6.07 11.52-9.89 12.83-.25.09-.55.13-.86.13zM7.56 3.85c-2.65 0-4.81 2.17-4.81 4.84 0 6.83 6.57 10.63 8.88 11.42.18.06.57.06.75 0 2.3-.79 8.88-4.58 8.88-11.42 0-2.67-2.16-4.84-4.81-4.84-1.52 0-2.93.71-3.84 1.94-.28.38-.92.38-1.2 0-.93-1.24-2.33-1.94-3.85-1.94z"/></svg>`;
const arrowSvg= `<svg viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const waSvg   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15.5v3a2 2 0 0 1-2.2 2 19 19 0 0 1-8.3-3 18.6 18.6 0 0 1-5.7-5.7 19 19 0 0 1-3-8.4A2 2 0 0 1 3.8 1h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 8.7a15 15 0 0 0 5.7 5.7l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>`;
const chevSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 9 6 6 6-6"/></svg>`;

/* ---------- Toast ---------- */
function toast(msg, icon = ICON_OK){
  let box = $('#toasts');
  if(!box){
    box = document.createElement('div');
    box.id = 'toasts'; box.className = 'toasts'; box.setAttribute('aria-live','polite');
    document.body.appendChild(box);
  }
  const el = document.createElement('div');
  el.className = 'toast'; el.innerHTML = (icon || '') + `<span>${esc(msg)}</span>`;
  box.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2100);
}

/* ---------- Utility bar (owned by this file only) ---------- */
function curOpen(v){
  const pop = $('#curPop'), btn = $('#curBtn');
  if(pop) pop.hidden = !v;
  if(btn) btn.setAttribute('aria-expanded', String(!!v));
}
function buildUbar(){
  const found = $$('.ubar');
  found.slice(1).forEach(n => n.remove());       /* يمنع تكرار الشريط */
  let bar = found[0];
  if(!bar){
    bar = document.createElement('div');
    bar.className = 'ubar';
    const anchor = $('.announce') || $('.header');
    if(anchor) anchor.parentNode.insertBefore(bar, anchor); else document.body.prepend(bar);
  }
  bar.id = 'ubar';
  bar.innerHTML = `
  <div class="ubar__in wrap">
    <a class="ubar__svc" data-wa href="#" target="_blank" rel="noopener">
      ${waSvg}<span>${esc(t('u_svc'))}</span>
    </a>
    <p class="ubar__msg">${esc(t('u_msg', i18nVars()))}</p>
    <div class="ubar__tools">
      <a class="ubar__b" data-route="track" href="${esc(CFG.TRACK)}">${esc(t('u_trk'))}</a>
      <button class="ubar__b" id="curBtn" type="button" aria-label="${esc(t('u_cur'))}" aria-expanded="false">
        <span>${esc(curr)}</span>${chevSvg}
      </button>
      <div class="ubar__pop" id="curPop" hidden>
        ${Object.keys(CUR).map(k => `<button type="button" data-c="${k}" class="${k === curr ? 'on' : ''}">
          <span>${k}</span><small>${esc(CUR[k].n[lang] || CUR[k].n.en)}</small></button>`).join('')}
      </div>
    </div>
  </div>`;
  paintWA(); paintRoutes();
}
document.addEventListener('click', e => {
  if(e.target.closest('#curBtn')){ curOpen($('#curPop') ? $('#curPop').hidden : false); return; }
  const pick = e.target.closest('#curPop [data-c]');
  if(pick){ setCur(pick.dataset.c); return; }
  if(!e.target.closest('#curPop')) curOpen(false);
});

/* ---------- Links: WhatsApp + routes + old home names ---------- */
function paintWA(){

  $$('[data-wa]').forEach(a => {
    a.setAttribute('href', 'https://wa.me/' + CFG.WA);
    a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener');
  });
}
function paintRoutes(){

  $$('[data-route]').forEach(el => {
    const to = ROUTE[el.dataset.route]; if(!to) return;
    if(el.tagName === 'A') el.setAttribute('href', to);
  });
  /* يصلّح أي رابط قديم يشير لاسم رئيسية مختلف */

  $$('a[href]').forEach(a => {
    const h = a.getAttribute('href') || '';
    if(!HOME_ALIAS.test(h)) return;
    const [file, qs = ''] = h.split(/(?=\?)/);
    if(file.toLowerCase() !== CFG.HOME) a.setAttribute('href', CFG.HOME + qs);
  });
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-route]');
  if(!b || b.tagName === 'A' || b.dataset.sheet) return;
  const to = ROUTE[b.dataset.route]; if(!to) return;
  e.preventDefault();
  if(b.dataset.route === 'shop' && PAGE === CFG.SHOP){
    ($('.shop-grid') || $('#best'))?.scrollIntoView({ behavior:'smooth' }); return;
  }
  location.href = to;
});

/* ---------- Marquee ---------- */
function renderMarquee(){
  const el = $('#marquee'); if(!el) return;
  const items = [t('ann1', i18nVars()), t('ann2'), t('ann3')];
  el.innerHTML = [...items, ...items].map(x => `<span>${esc(x)}</span>`).join('');
}

/* ---------- Hero ---------- */
let hi = 0, heroTimer = null;
function heroPlay(){
  clearInterval(heroTimer);
  if(!$('#heroTrack') || document.hidden) return;
  heroTimer = setInterval(() => setSlide(hi + 1), 5400);
}
function renderHero(){
  const track = $('#heroTrack'); if(!track) return;
  track.innerHTML = SLIDES.map((s, i) => `
    <div class="slide ${i === 0 ? 'active' : ''}" role="group" aria-label="${i + 1} / ${SLIDES.length}">
      <div class="ph">${pic(s.img, L(s.title), 1400, .62, '', i === 0)}</div>
      <div class="slide__body">
        <p class="slide__kicker">${esc(L(s.kicker))}</p>
        <h1 class="slide__title">${esc(L(s.title))}</h1>
        <button class="cta" type="button" data-goto="#best">${esc(t('shop_now'))} ${arrowSvg}</button>
      </div>
    </div>`).join('');
  const dots = $('#heroDots');
  if(dots) dots.innerHTML = SLIDES.map((_, i) =>
    `<button type="button" class="${i === 0 ? 'on' : ''}" role="tab" aria-label="Slide ${i + 1}" data-i="${i}"></button>`).join('');
  setSlide(hi, true);
}
function setSlide(n, instant = false){
  const track = $('#heroTrack'); if(!track) return;
  hi = (n + SLIDES.length) % SLIDES.length;
  const rtl = document.documentElement.dir === 'rtl';
  if(instant) track.classList.add('nofx');
  track.style.transform = `translateX(${(rtl ? 1 : -1) * hi * 100}%)`;
  if(instant) requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove('nofx')));

  $$('#heroTrack .slide').forEach((s, i) => s.classList.toggle('active', i === hi));

  $$('#heroDots button').forEach((d, i) => d.classList.toggle('on', i === hi));
  heroPlay();
}
document.addEventListener('visibilitychange', () => { document.hidden ? clearInterval(heroTimer) : heroPlay(); });
(function heroSwipe(){
  const box = $('#hero'); if(!box) return;
  let x0 = null, dx = 0;
  box.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; $('#heroTrack')?.classList.add('nofx'); clearInterval(heroTimer); }, { passive:true });
  box.addEventListener('touchmove', e => {
    const track = $('#heroTrack'); if(x0 === null || !track) return;
    dx = e.touches[0].clientX - x0;
    const rtl = document.documentElement.dir === 'rtl';
    track.style.transform = `translateX(calc(${(rtl ? 1 : -1) * hi * 100}% + ${dx}px))`;
  }, { passive:true });
  box.addEventListener('touchend', () => {
    $('#heroTrack')?.classList.remove('nofx');
    const rtl = document.documentElement.dir === 'rtl';
    if(Math.abs(dx) > 45) setSlide(hi + (dx < 0 ? (rtl ? -1 : 1) : (rtl ? 1 : -1))); else setSlide(hi);
    x0 = null; dx = 0;
  });
})();
$('#heroPrev')?.addEventListener('click', () => setSlide(hi - 1));
$('#heroNext')?.addEventListener('click', () => setSlide(hi + 1));
$('#heroDots')?.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if(b) setSlide(+b.dataset.i); });

/* ---------- Categories ---------- */
let activeCat = 'all';
function renderCats(){
  const el = $('#catRail'); if(!el) return;
  el.innerHTML = CATS.map(c =>
    `<button class="chip" type="button" data-cat="${c.k}" aria-pressed="${c.k === activeCat}">${esc(L(c.n))}</button>`).join('');
}
$('#catRail')?.addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if(!b) return;
  activeCat = b.dataset.cat;

  $$('#catRail .chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.cat === activeCat)));
  renderRails();
  $('#best')?.scrollIntoView({ behavior:'smooth', block:'start' });
});

/* ---------- Cards ---------- */
function cardHTML(p){
  const on = wish.includes(p.id);
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  const out = stockOf(p) <= 0;
  const tagTxt = p.tag === 'best' ? t('best_seller') : p.tag === 'new' ? t('new_arrivals') : '';
  const href = `${CFG.PRODUCT}?id=${encodeURIComponent(p.id)}`;
  return `
  <article class="pcard" data-id="${esc(p.id)}">
    <div class="pcard__media">
      ${off ? `<span class="tag">-${off}%</span>` : tagTxt ? `<span class="tag dark">${esc(tagTxt)}</span>` : ''}
      <button class="wish ${on ? 'on' : ''}" type="button" data-wish="${esc(p.id)}" aria-pressed="${on}" aria-label="${esc(t('wishlist'))}">${heartSvg}</button>
      <a href="${href}" data-open="${esc(p.id)}" aria-label="${esc(L(p.name))}">${pic(p.img, L(p.name), 700, 1.33)}</a>
      <span class="rate">${starSvg}${(+p.rating || 0).toFixed(1)}</span>
      <button class="qadd" type="button" data-quick="${esc(p.id)}" ${out ? 'disabled' : ''}
              aria-label="${esc(out ? t('soldout') : t('add_to_cart'))}">${bagSvg}</button>
    </div>
    <div class="pcard__info">
      <h3 class="pcard__name"><a href="${href}" data-open="${esc(p.id)}">${esc(L(p.name))}</a></h3>
      <div class="price"><b>${money(p.price)}</b>${p.old ? `<s>${money(p.old)}</s>` : ''}</div>
    </div>
  </article>`;
}
function saleHTML(p){
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  const href = `${CFG.PRODUCT}?id=${encodeURIComponent(p.id)}`;
  return `
  <article class="scard" data-id="${esc(p.id)}">
    <div class="scard__media">
      ${off ? `<span class="off">${off}% ${esc(lang === 'ar' ? 'خصم' : 'OFF')}</span>` : ''}
      <a href="${href}" data-open="${esc(p.id)}" aria-label="${esc(L(p.name))}">${pic(p.img, L(p.name), 400, 1.33)}</a>
    </div>
    <div class="scard__body">
      <h3 class="scard__name"><a href="${href}" data-open="${esc(p.id)}">${esc(L(p.name))}</a></h3>
      <div class="price" style="margin-top:4px"><b>${money(p.price)}</b>${p.old ? `<s>${money(p.old)}</s>` : ''}</div>
      <div class="scard__row">
        <button class="atc" type="button" data-quick="${esc(p.id)}">${bagSvg}<span>${esc(t('add_to_cart'))}</span></button>
        <div class="stock">
          <div class="stock__txt">${esc(t('only'))} ${stockOf(p)} ${esc(t('pieces'))}</div>
          <div class="stock__bar"><i style="width:${Math.min(100, stockOf(p) * 12)}%"></i></div>
          <div class="timer" data-timer="${esc(p.id)}">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
            <span>--:--:--</span>
          </div>
        </div>
      </div>
    </div>
  </article>`;
}
const skeletons = n => Array.from({ length:n }, () =>
  `<div class="sk-card"><div class="a skel"></div><div class="b skel"></div><div class="c skel"></div></div>`).join('');
const filt = list => activeCat === 'all' ? list : list.filter(p => p.cat === activeCat);

function renderRails(){
  const best = filt(PRODUCTS.filter(p => p.tag === 'best'));
  const nw   = filt(PRODUCTS.filter(p => p.tag === 'new'));
  const sale = filt(SALE);
  const fill = (sel, arr) => {
    const el = $(sel); if(!el) return;
    el.innerHTML = arr.length ? arr.map(cardHTML).join('') : `<p class="empty" style="width:100%">${esc(t('no_results'))}</p>`;
  };
  fill('#railBest', best.length ? best : filt(PRODUCTS));
  fill('#railNew',  nw.length ? nw : filt(PRODUCTS).slice().reverse());
  const sl = $('#saleList');
  if(sl) sl.innerHTML = sale.length ? sale.map(saleHTML).join('') : `<p class="empty">${esc(t('no_results'))}</p>`;
  startTimers(); syncRailNav(); observeReveals();
}

/* ---------- Rails navigation ---------- */
function syncRailNav(){

  $$('[data-scroll]').forEach(btn => {
    const rail = document.getElementById(btn.dataset.scroll); if(!rail) return;
    const max = rail.scrollWidth - rail.clientWidth - 2;
    const x = Math.abs(rail.scrollLeft);
    const isPrev = +btn.dataset.dir === -1;
    const rtl = document.documentElement.dir === 'rtl';
    const atStart = x <= 2, atEnd = x >= max;
    btn.disabled = max <= 0 ? true : (rtl ? (isPrev ? atEnd : atStart) : (isPrev ? atStart : atEnd));
  });
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-scroll]'); if(!b) return;
  const rail = document.getElementById(b.dataset.scroll); if(!rail) return;
  const rtl = document.documentElement.dir === 'rtl';
  const step = ((rail.querySelector('.pcard, .scard')?.offsetWidth) || 220) + 12;
  rail.scrollBy({ left:(rtl ? -1 : 1) * (+b.dataset.dir) * step * 2, behavior:'smooth' });
});

$$('[data-rail], #catRail').forEach(rail => {
  rail.addEventListener('scroll', () => requestAnimationFrame(syncRailNav), { passive:true });
  /* تمرير أفقي فقط عند وجود نية أفقية — لا نسرق تمرير الصفحة */
  rail.addEventListener('wheel', e => {
    if(Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    if(rail.scrollWidth <= rail.clientWidth) return;
    e.preventDefault(); rail.scrollLeft += e.deltaX;
  }, { passive:false });
  let down = false, moved = false, sx = 0, sl = 0;
  rail.addEventListener('mousedown', e => { if(e.button) return; down = true; moved = false; sx = e.pageX; sl = rail.scrollLeft; });
  rail.addEventListener('mousemove', e => {
    if(!down) return;
    if(Math.abs(e.pageX - sx) > 6){ moved = true; rail.style.cursor = 'grabbing'; }
    if(moved){ e.preventDefault(); rail.scrollLeft = sl - (e.pageX - sx); }
  });
  window.addEventListener('mouseup', () => { down = false; rail.style.cursor = ''; setTimeout(() => { moved = false; }, 0); });
  rail.addEventListener('click', e => { if(moved){ e.preventDefault(); e.stopPropagation(); } }, true);
});
window.addEventListener('resize', () => { syncRailNav(); docH = 0; });

/* ---------- Countdown (stable end times) ---------- */
const SALE_END = (() => {
  const d = new Date(); d.setHours(23, 59, 59, 0);
  const map = {}; SALE.forEach((p, i) => { map[p.id] = d.getTime() + i * 36e5; });
  return map;
})();
let tick = null;
function startTimers(){
  clearInterval(tick);
  if(!$('[data-timer]')) return;
  const paint = () => {

    $$('[data-timer]').forEach(el => {
      const end = SALE_END[el.dataset.timer]; if(!end) return;
      const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const h = String(Math.floor(s / 3600)).padStart(2, '0');
      const m = String(Math.floor(s % 3600 / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      const span = el.querySelector('span');
      if(span) span.textContent = `${t('ends_in')} ${h}:${m}:${ss}`;
    });
  };
  paint(); tick = setInterval(paint, 1000);
}

/* ---------- Cart ---------- */
function addToCart(id, size, qty = 1, fromEl = null, color = null){
  const p = byId(id); if(!p) return false;
  if(stockOf(p) <= 0){ toast(t('soldout'), ''); return false; }
  const sz = size || sizesOf(p)[0] || null;
  const cl = color || colorsOf(p)[0] || null;
  const max = lineMax(id);
  const line = cart.find(c => c.id === id && c.size === sz && (c.color || null) === cl);
  const have = line ? line.qty : 0;
  if(have >= max){ toast(t('max_qty'), ''); return false; }
  const add = Math.min(qty, max - have);
  if(line) line.qty += add; else cart.push({ id, size:sz, color:cl, qty:add });
  save(); paintCart(); emit('velora:cart', { cart });
  if(fromEl) fly(fromEl);
  toast(`${L(p.name)} — ${t('added')}`);
  if(add < qty) toast(t('max_qty'), '');
  return true;
}
function paintCart(){
  const count = cart.reduce((a, c) => a + c.qty, 0);
  const sub = cart.reduce((a, c) => { const p = byId(c.id); return a + (p ? p.price * c.qty : 0); }, 0);

  const setBadge = (sel, v) => $$(sel).forEach(el => { el.textContent = v; el.classList.toggle('on', v > 0); });
  setBadge('[data-badge="cart"], #cartBadge, #cartBadge2', count);
  setBadge('[data-badge="wish"], #wishBadge', wish.length);

  const cnt = $('#cartCountTxt'); if(cnt) cnt.textContent = count ? `(${count})` : '';

  const body = $('#cartBody');
  if(body){
    body.innerHTML = cart.length ? cart.map((c, i) => {
      const p = byId(c.id); if(!p) return '';
      const first = Array.isArray(p.img) ? p.img[0] : p.img;
      return `<div class="citem">
        <img class="citem__img" src="${U(first, 240)}" data-srcs="${PICSUM(L(p.name), 240, 300)}" alt="${esc(L(p.name))}" width="80" height="100" loading="lazy" decoding="async">
        <div>
          <div class="citem__n">${esc(L(p.name))}</div>
          <div class="citem__sz">${esc(t('size_l'))}: ${esc(c.size || '—')}${c.color ? ` · <i class="csw" style="background:${esc(c.color)}"></i>` : ''}</div>
          <div class="citem__p">${money(p.price)}</div>
          <div class="qty">
            <button type="button" data-dec="${i}" aria-label="-">−</button><span>${c.qty}</span>
            <button type="button" data-inc="${i}" aria-label="+" ${c.qty >= lineMax(c.id) ? 'disabled' : ''}>+</button>
          </div>
        </div>
        <button class="rm" type="button" data-rm="${i}">${esc(t('remove'))}</button>
      </div>`;
    }).join('') : `<div class="empty"><b style="display:block;color:var(--ink);font-weight:400;margin-bottom:4px">${esc(t('empty_cart'))}</b><span>${esc(t('empty_cart_sub'))}</span></div>`;
  }
  const s1 = $('#sub'), s2 = $('#tot');
  if(s1) s1.textContent = money(sub);
  if(s2) s2.textContent = money(sub);
  const co = $('#checkout'); if(co) co.disabled = count === 0;

  const fs = $('#freeShip');
  if(fs){
    const target = CFG.FREE_SHIP, left = Math.max(0, target - sub);
    fs.innerHTML = left > 0
      ? `<span>${money(left)} ${esc(t('free_left'))}</span><div class="bar"><i style="width:${Math.min(100, sub / target * 100)}%"></i></div>`
      : `<span style="color:var(--green)">✓ ${esc(t('free_done'))}</span><div class="bar"><i style="width:100%"></i></div>`;
  }
}
$('#cartBody')?.addEventListener('click', e => {
  const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), rm = e.target.closest('[data-rm]');
  if(inc){
    const i = +inc.dataset.inc, line = cart[i]; if(!line) return;
    if(line.qty >= lineMax(line.id)) return toast(t('max_qty'), '');
    line.qty++;
  }
  else if(dec){ const i = +dec.dataset.dec; if(!cart[i]) return; cart[i].qty--; if(cart[i].qty < 1) cart.splice(i, 1); }
  else if(rm){ cart.splice(+rm.dataset.rm, 1); toast(t('removed'), ''); }
  else return;
  save(); paintCart(); emit('velora:cart', { cart });
});
$('#checkout')?.addEventListener('click', () => { if(cart.length) location.href = CFG.CHECKOUT; });

function fly(fromEl){
  const media = fromEl.closest('.pcard, .scard, #pvSheet, .pdp')?.querySelector('img');
  const anchor = (window.innerWidth >= 900 ? $('#cartBtnTop') : $('#navCart')) || $('#cartBtnTop') || $('#navCart');
  if(!media || !anchor) return;
  const a = media.getBoundingClientRect(), b = anchor.getBoundingClientRect();
  const g = media.cloneNode();
  g.className = 'fly'; g.removeAttribute('data-srcs'); g.removeAttribute('loading');
  g.style.left = a.left + 'px'; g.style.top = a.top + 'px';
  g.style.width = Math.min(58, a.width) + 'px'; g.style.height = Math.min(72, a.height) + 'px';
  document.body.appendChild(g);
  requestAnimationFrame(() => {
    g.style.left = (b.left + b.width / 2 - 13) + 'px';
    g.style.top  = (b.top + b.height / 2 - 13) + 'px';
    g.style.width = '26px'; g.style.height = '26px'; g.style.opacity = '.25'; g.style.borderRadius = '50%';
  });
  setTimeout(() => {
    g.remove();
    anchor.animate?.([{ transform:'scale(1)' }, { transform:'scale(1.22)' }, { transform:'scale(1)' }],
      { duration:400, easing:'cubic-bezier(.34,1.4,.64,1)' });
  }, 780);
}

/* ---------- Wishlist ---------- */
document.addEventListener('click', e => {
  const w = e.target.closest('[data-wish]'); if(!w) return;
  e.preventDefault(); e.stopPropagation();
  const id = w.dataset.wish, i = wish.indexOf(id);
  if(i > -1){ wish.splice(i, 1); toast(t('wish_rm'), ''); } else { wish.push(id); toast(t('wish_add'), ''); }
  const on = wish.includes(id);

  $$(`[data-wish="${id}"]`).forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  save(); paintCart(); emit('velora:wish', { wish });
});

/* ---------- Card → product page / quick view ---------- */
const goProduct = id => { location.href = `${CFG.PRODUCT}?id=${encodeURIComponent(id)}`; };
document.addEventListener('click', e => {
  const q = e.target.closest('[data-quick]');
  if(q){ e.preventDefault(); e.stopPropagation(); openProduct(q.dataset.quick); return; }
  const o = e.target.closest('[data-open]');
  if(o){ if(o.tagName !== 'A'){ e.preventDefault(); goProduct(o.dataset.open); } return; }
  const g = e.target.closest('[data-goto]');
  if(g){ e.preventDefault(); $(g.dataset.goto)?.scrollIntoView({ behavior:'smooth' }); return; }
  const card = e.target.closest('.pcard, .scard');
  if(card){
    if(e.target.closest('.wish, .qadd, .atc, .qty, input, select, textarea, a[href]')) return;
    const id = card.dataset.id; if(!id) return;
    e.preventDefault(); goProduct(id);
  }
});

/* ---------- Quick view sheet ---------- */
let pvSize = null, pvColor = null, pvQty = 1, pvId = null;
const cnameOf = h => String(h);
function openProduct(id){
  const p = byId(id), sheet = $('#pvSheet'), body = $('#pvBody'), foot = $('#pvFoot');
  if(!p || !sheet || !body || !foot) return goProduct(id);
  const sz = sizesOf(p), cl = colorsOf(p);
  pvId = id; pvSize = sz[0] || null; pvColor = cl[0] || null; pvQty = 1;
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  const max = lineMax(id);

  body.innerHTML = `
    <div class="pv">
      <div class="pv__media">${pic(p.img, L(p.name), 900, 1.25)}</div>
      <div>
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
          <div>
            <h4 class="pv__name">${esc(L(p.name))}</h4>
            <p class="pv__desc">${esc(L(p.desc))}</p>
          </div>
          <button class="wish ${wish.includes(p.id) ? 'on' : ''}" type="button" data-wish="${esc(p.id)}"
                  style="position:static;flex:none" aria-pressed="${wish.includes(p.id)}" aria-label="${esc(t('wishlist'))}">${heartSvg}</button>
        </div>
        <div class="price" style="font-size:17px;margin-top:12px">
          <b>${money(p.price)}</b>${p.old ? `<s>${money(p.old)}</s>` : ''}${off ? `<span class="tag" style="position:static">-${off}%</span>` : ''}
        </div>
        ${cl.length ? `<p class="lbl" id="pvColorLbl">${esc(t('color'))}</p>
        <div class="sws" id="pvColors" role="group" aria-labelledby="pvColorLbl">${cl.map(c =>
          `<button class="sw" type="button" data-color="${esc(c)}" style="background:${esc(c)}"
                   aria-pressed="${c === pvColor}" aria-label="${esc(cnameOf(c))}"></button>`).join('')}</div>` : ''}
        ${sz.length ? `<p class="lbl" id="pvSizeLbl">${esc(t('size'))}</p>
        <div class="sizes" id="pvSizes" role="group" aria-labelledby="pvSizeLbl">${sz.map(s =>
          `<button class="size" type="button" data-size="${esc(s)}" aria-pressed="${s === pvSize}">${esc(s)}</button>`).join('')}</div>` : ''}
        <p class="lbl">${esc(t('qty'))}</p>
        <div class="qty" style="margin-top:0">
          <button type="button" id="pvDec" aria-label="-">−</button><span id="pvQty">1</span>
          <button type="button" id="pvInc" aria-label="+" ${max <= 1 ? 'disabled' : ''}>+</button>
        </div>
      </div>
    </div>`;

  foot.innerHTML = `<button class="btn-primary" type="button" id="pvAdd" style="margin-top:0" ${stockOf(p) <= 0 ? 'disabled' : ''}>
    ${bagSvg}<span id="pvAddTxt">${esc(stockOf(p) <= 0 ? t('soldout') : t('add_to_cart'))} · ${money(p.price)}</span></button>`;

  body.addEventListener('click', ev => {
    const s = ev.target.closest('[data-size]');
    if(s){ pvSize = s.dataset.size; $$('#pvSizes .size', body).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.size === pvSize))); return; }
    const c = ev.target.closest('[data-color]');
    if(c){ pvColor = c.dataset.color; $$('#pvColors .sw', body).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.color === pvColor))); }
  });
  const setQ = d => {
    pvQty = clamp(pvQty + d, 1, max);
    $('#pvQty', body).textContent = pvQty;
    $('#pvDec', body).disabled = pvQty <= 1;
    $('#pvInc', body).disabled = pvQty >= max;
    const txt = $('#pvAddTxt', foot);
    if(txt) txt.textContent = `${t('add_to_cart')} · ${money(p.price * pvQty)}`;
  };
  $('#pvInc', body)?.addEventListener('click', () => setQ(1));
  $('#pvDec', body)?.addEventListener('click', () => setQ(-1));
  $('#pvAdd', foot)?.addEventListener('click', ev => {
    if(addToCart(pvId, pvSize, pvQty, ev.currentTarget, pvColor)) closeSheet();
  });
  setQ(0);
  openSheet(sheet);
}

/* ---------- Search ---------- */
function renderSugg(){
  const el = $('#sugg'); if(!el) return;
  const s = lang === 'ar' ? ['فستان','جينز','بلوزة','تريكو','شنطة'] : ['Dress','Denim','Blouse','Knit','Bag'];
  el.innerHTML = s.map(x => `<button class="pill" type="button" data-s="${esc(x)}">${esc(x)}</button>`).join('');
}
$('#sugg')?.addEventListener('click', e => {
  const b = e.target.closest('[data-s]'); if(!b) return;
  const input = $('#searchInput'); if(!input) return;
  input.value = b.dataset.s; doSearch();
});
function doSearch(){
  const input = $('#searchInput'), out = $('#sres');
  if(!input || !out) return;
  const q = input.value.trim().toLowerCase();
  if(!q){ out.innerHTML = ''; return; }
  const res = ALL.filter(p => (p.name.en + p.name.ar + p.desc.en + p.desc.ar + p.cat).toLowerCase().includes(q));
  out.innerHTML = res.length ? res.map(p => `
    <button class="sres__item" type="button" data-open="${esc(p.id)}">
      <img src="${U(Array.isArray(p.img) ? p.img[0] : p.img, 200)}" data-srcs="${PICSUM(L(p.name), 200, 250)}"
           alt="${esc(L(p.name))}" width="48" height="60" loading="lazy" decoding="async">
      <span>
        <span style="display:block;font-size:13px">${esc(L(p.name))}</span>
        <span style="display:block;font-size:11px;color:var(--muted)">${esc(L(p.desc))}</span>
      </span>
      <b style="font-size:12.5px;font-weight:500">${money(p.price)}</b>
    </button>`).join('') : `<p class="empty">${esc(t('no_results'))}</p>`;
}
$('#searchInput')?.addEventListener('input', doSearch);

/* ---------- Sheets ---------- */
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
let openEl = null, lastFocus = null;
function openSheet(el){
  if(!el) return;
  lastFocus = document.activeElement;
  if(openEl && openEl !== el){ openEl.classList.remove('on'); openEl.setAttribute('aria-hidden','true'); }
  openEl = el; el.style.transform = ''; el.classList.add('on'); el.removeAttribute('aria-hidden');
  $('#ov')?.classList.add('on'); document.body.classList.add('no-scroll');
  setTimeout(() => { ($(FOCUSABLE, el) || el).focus?.(); }, 60);
}
function closeSheet(){
  if(openEl){ openEl.classList.remove('on'); openEl.style.transform = ''; openEl.setAttribute('aria-hidden','true'); }
  $('#ov')?.classList.remove('on'); document.body.classList.remove('no-scroll');
  openEl = null; lastFocus?.focus?.();
}
/* فتح موحّد — وتحويل الأزرار القديمة تلقائيًا */
[['#navMenu','menuSheet'],['#navSearch','searchSheet'],['#navCart','cartSheet'],
 ['#cartBtnTop','cartSheet'],['#searchBtnTop','searchSheet']].forEach(([sel, id]) => {
  const el = $(sel);
  if(el && !el.dataset.sheet && document.getElementById(id)){ el.dataset.sheet = id; el.removeAttribute('onclick'); }
});
document.addEventListener('click', e => {
  const trg = e.target.closest('[data-sheet]'); if(!trg) return;
  e.preventDefault();
  const sheet = document.getElementById(trg.dataset.sheet);
  if(!sheet) return;
  openSheet(sheet);
  if(trg.dataset.sheet === 'searchSheet') setTimeout(() => $('#searchInput')?.focus(), 380);
});
$('#ov')?.addEventListener('click', closeSheet);
document.addEventListener('click', e => { if(e.target.closest('[data-close]')) closeSheet(); });
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){ if(openEl) closeSheet(); curOpen(false); return; }
  if(openEl && e.key === 'Tab'){
    const f = $$(FOCUSABLE, openEl).filter(n => n.offsetParent !== null);
    if(!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    return;
  }
  if(openEl || !$('#heroTrack')) return;
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) return;
  if(e.key === 'ArrowRight') setSlide(hi + 1);
  if(e.key === 'ArrowLeft')  setSlide(hi - 1);
});

$$('.sheet').forEach(s => {
  s.setAttribute('aria-hidden','true');
  const zone = s.querySelector('.sheet__top'); if(!zone) return;
  let y0 = null, dy = 0;
  zone.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; dy = 0; s.style.transition = 'none'; }, { passive:true });
  zone.addEventListener('touchmove', e => { if(y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); s.style.transform = `translateY(${dy}px)`; }, { passive:true });
  zone.addEventListener('touchend', () => { s.style.transition = ''; s.style.transform = ''; if(dy > 90) closeSheet(); y0 = null; dy = 0; });
});

$$('#menuSheet .mlinks a').forEach(a => a.addEventListener('click', closeSheet));

/* ---------- Bottom nav state ---------- */
function markNav(){

  $$('.bnav .on').forEach(n => { n.classList.remove('on'); n.removeAttribute('aria-current'); });
  const on = id => { const n = $('#' + id); if(n){ n.classList.add('on'); n.setAttribute('aria-current','page'); } };
  const accPages = ['account.html','loyalty.html','returns.html'];
  if(PAGE === CFG.SHOP || PAGE === CFG.PRODUCT) on('navShop');
  else if(accPages.includes(PAGE)) on('navUser');
  else if(PAGE === CFG.CHECKOUT) on('navCart');
  const acc = $('#accBtnTop');
  if(acc) acc.classList.toggle('is-here', accPages.includes(PAGE));
}

/* ---------- Scroll effects ---------- */
let docH = 0;
function onScroll(){
  const y = window.scrollY;
  $('#header')?.classList.toggle('is-stuck', y > 8);
  $('#toTop')?.classList.toggle('on', y > 700);
  const prog = $('#prog');
  if(prog){
    if(!docH) docH = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
  }
}
window.addEventListener('scroll', onScroll, { passive:true });
$('#toTop')?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

const io = 'IntersectionObserver' in window
  ? new IntersectionObserver(es => es.forEach(en => {
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin:'-30px 0px -6% 0px' })
  : null;
const observeReveals = () => { if(io) $$('.reveal:not(.in)').forEach(el => io.observe(el)); else $$('.reveal').forEach(el => el.classList.add('in')); };

/* ---------- Language ---------- */
function renderTexts(){
  const vars = i18nVars();

  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n, vars); });

  $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh, vars); });
}
function renderAll(){
  renderTexts();
  buildUbar(); renderMarquee(); renderHero(); renderCats(); renderRails();
  renderSugg(); paintCart(); doSearch(); markNav(); paintWA(); paintRoutes();
  emit('velora:lang', { lang, cur:curr });
  if(typeof V.onLang === 'function') V.onLang();
}
function applyLang(animated){
  const commit = () => {
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    const lb = $('#langLabel'); if(lb) lb.textContent = lang === 'ar' ? 'EN' : 'AR';
    const btn = $('#langBtn'); if(btn) btn.setAttribute('aria-label', lang === 'ar' ? t('to_en') : t('to_ar'));
    renderAll();
    LS.set('velora_lang', lang);
    requestAnimationFrame(() => { document.body.classList.remove('lang-swap'); docH = 0; onScroll(); syncRailNav(); });
  };
  if(!animated) return commit();
  document.body.classList.add('lang-swap');
  setTimeout(commit, 260);
}
$('#langBtn')?.addEventListener('click', () => {
  lang = lang === 'en' ? 'ar' : 'en';
  applyLang(true);
  setTimeout(() => toast(lang === 'ar' ? 'تم التبديل للعربية' : 'Switched to English', ''), 340);
});

/* ---------- Boot ---------- */
const yr = $('#yr'); if(yr) yr.textContent = new Date().getFullYear();

const promo = $('#promoImg');
if(promo){
  promo.dataset.srcs = [U('1490481651871-ab68de25d43d', 1600), U('1441984904996-e0b6ba687e04', 1600), PICSUM('velora-summer', 1600, 900)].join('|');
  promo.src = U('1483985988355-763728e1935b', 1600);
}
const rb = $('#railBest'), rn = $('#railNew');
if(rb) rb.innerHTML = skeletons(4);
if(rn) rn.innerHTML = skeletons(4);

applyLang(false);
observeReveals();
onScroll();

/* ---------- Public API ---------- */
V.api = {
  cfg:CFG, ALL, CATS, PRODUCTS, SALE, CUR,
  cardHTML, saleHTML, money, setCur, cur:() => curr,
  L, t, esc, byId, addToCart, openProduct, openSheet, closeSheet,
  pic, U, PICSUM, wish, cart, save, paintCart, toast, lang:() => lang, emit
};
emit('velora:ready', { lang, cur:curr });
})();
