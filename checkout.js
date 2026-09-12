(() => {
'use strict';

/* ======= إعدادات سريعة ======= */
const PAYS      = ['card','wal','cod'];  /* خلّيها ['cod'] لو مفيش دفع أونلاين */
const EMAIL_REQ = true;                  /* false يخلي الإيميل اختياري */
const CODFEE    = 15;
const FK        = 'velora_checkout';
const OK        = 'velora_orders';
const KEEP      = 30;

const $    = (s, r = document) => r.querySelector(s);
const byId = (id) => document.getElementById(id);

/* ======= استنى الواجهة الأساسية ======= */
(function boot(n){
  const A = (window.VELORA || {}).api;
  if(A && A.cart && A.money) return init(A);
  if(n === 0) document.addEventListener('velora:ready', () => boot(1), { once:true });
  if(n > 120){
    const m = byId('coMain');
    if(m) m.innerHTML = '<p class="empty" style="padding:40px 0">'
      + 'حصلت مشكلة في تحميل الصفحة — حدّث الصفحة.</p>';
    return console.error('[checkout] VELORA.api not ready');
  }
  setTimeout(() => boot((n || 0) + 1), 60);
})(0);

function init(A){
const st   = () => A.lang();
const esc  = A.esc || (v => String(v == null ? '' : v)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));
const CFG  = A.cfg || {};
const HOME = CFG.HOME || 'velora.html';
const SHOP = CFG.SHOP || 'shop.html';
const FREE = Number.isFinite(+CFG.FREE_SHIP) ? +CFG.FREE_SHIP : 500;

document.body.classList.add('is-co');

const T = {
en:{ttl:'Check out',s1:'Bag',s2:'Information',s3:'Payment',
 c_h:'Contact Information',c_p:"We'll use this to contact you about your order.",
 nm:'Full Name',ph:'Phone Number',em:'Email',
 a_h:'Shipping Address',a_p:'Please enter the address where you want your order delivered.',
 gov:'Choose your governorate',area:'Area',street:'Street',bld:'Building',apt:'Apartment (optional)',
 notes:'Order notes (optional)',fee:'Delivery fees',free:'Free delivery on this order',free_t:'Free',
 p_h:'Payment method',p_p:"Choose how you'd like to pay",
 card:'Credit / Debit Card',card_s:'Visa, Mastercard, Meeza',
 wal:'Mobile Wallet',wal_s:'Vodafone Cash, InstaPay',
 cod:'Cash on delivery',cod_s:'Pay when you receive',
 cnum:'Card number',cexp:'MM / YY',ccvv:'CVV',wnum:'Wallet number',
 demo:'Demo store — no real payment is taken.',
 sum:'Order summary',sub:'Subtotal',ship:'Delivery',cod_f:'Cash on delivery fee',
 tot:'Total',pick:'Select governorate',pay:'Pay',place:'Place order',size:'Size',
 empty:'Your bag is empty',empty_s:'Add something you love, then come back here.',go:'Go to shop',
 e_nm:'Please enter your full name',e_ph:'Enter a valid phone number (11 digits)',
 e_em:'Enter a valid email address',e_gov:'Please choose a governorate',
 e_ad:'Please complete the address fields',
 e_card:'Enter a valid 16-digit card number',e_exp:'Enter a valid expiry (MM/YY)',
 e_cvv:'Enter the 3-digit CVV',e_wal:'Enter a valid wallet number',
 ok_h:'Thank you for your order!',ok_p:'We received your order and will contact you shortly to confirm delivery.',
 ok_no:'Order number',ok_pay:'Payment',ok_to:'Delivering to',ok_eta:'Estimated delivery',
 days:'2 – 4 days',back_home:'Back to home',keep:'Continue shopping'},
ar:{ttl:'إتمام الشراء',s1:'السلة',s2:'البيانات',s3:'الدفع',
 c_h:'بيانات التواصل',c_p:'هنستخدمها للتواصل معاك بخصوص طلبك.',
 nm:'الاسم بالكامل',ph:'رقم الموبايل',em:'البريد الإلكتروني',
 a_h:'عنوان الشحن',a_p:'اكتب العنوان اللي تحب يوصلك عليه الطلب.',
 gov:'اختر المحافظة',area:'المنطقة',street:'الشارع',bld:'رقم العمارة',apt:'الشقة (اختياري)',
 notes:'ملاحظات على الطلب (اختياري)',fee:'مصاريف الشحن',free:'الشحن مجاني على الطلب ده',free_t:'مجاني',
 p_h:'طريقة الدفع',p_p:'اختار طريقة الدفع المناسبة لك',
 card:'بطاقة ائتمان / خصم',card_s:'ڤيزا، ماستركارد، ميزة',
 wal:'محفظة إلكترونية',wal_s:'ڤودافون كاش، إنستاباي',
 cod:'الدفع عند الاستلام',cod_s:'ادفع لما توصلك',
 cnum:'رقم البطاقة',cexp:'شهر / سنة',ccvv:'الرقم السري',wnum:'رقم المحفظة',
 demo:'متجر تجريبي — مش بيتم أي دفع حقيقي.',
 sum:'ملخص الطلب',sub:'المجموع',ship:'الشحن',cod_f:'رسوم الدفع عند الاستلام',
 tot:'الإجمالي',pick:'اختر المحافظة',pay:'ادفع',place:'تأكيد الطلب',size:'المقاس',
 empty:'سلتك فارغة',empty_s:'ضيف حاجة تحبها وبعدين ارجع هنا.',go:'روح للمتجر',
 e_nm:'اكتب اسمك بالكامل',e_ph:'اكتب رقم موبايل صحيح (١١ رقم)',
 e_em:'اكتب بريد إلكتروني صحيح',e_gov:'اختر المحافظة',e_ad:'كمّل بيانات العنوان',
 e_card:'اكتب رقم بطاقة صحيح (١٦ رقم)',e_exp:'اكتب تاريخ انتهاء صحيح: شهر/سنة',
 e_cvv:'اكتب الرقم السري (٣ أرقام)',e_wal:'اكتب رقم محفظة صحيح',
 ok_h:'شكرًا على طلبك!',ok_p:'استلمنا طلبك وهنتواصل معاك قريب لتأكيد التوصيل.',
 ok_no:'رقم الطلب',ok_pay:'الدفع',ok_to:'التوصيل إلى',ok_eta:'موعد التوصيل المتوقع',
 days:'٢ – ٤ أيام',back_home:'العودة للرئيسية',keep:'أكمل التسوق'}};
const x = (k) => (T[st()] && T[st()][k]) || T.en[k] || k;

const GOV=[
 {k:'cai',n:{en:'Cairo',ar:'القاهرة'},f:40},{k:'giz',n:{en:'Giza',ar:'الجيزة'},f:40},
 {k:'qlb',n:{en:'Qalyubia',ar:'القليوبية'},f:50},{k:'alx',n:{en:'Alexandria',ar:'الإسكندرية'},f:55},
 {k:'dkh',n:{en:'Dakahlia',ar:'الدقهلية'},f:60},{k:'shr',n:{en:'Sharqia',ar:'الشرقية'},f:60},
 {k:'grb',n:{en:'Gharbia',ar:'الغربية'},f:60},{k:'mnf',n:{en:'Monufia',ar:'المنوفية'},f:60},
 {k:'kfs',n:{en:'Kafr El Sheikh',ar:'كفر الشيخ'},f:65},{k:'bhr',n:{en:'Beheira',ar:'البحيرة'},f:65},
 {k:'dmt',n:{en:'Damietta',ar:'دمياط'},f:65},{k:'prt',n:{en:'Port Said',ar:'بورسعيد'},f:70},
 {k:'ism',n:{en:'Ismailia',ar:'الإسماعيلية'},f:70},{k:'sez',n:{en:'Suez',ar:'السويس'},f:70},
 {k:'fym',n:{en:'Faiyum',ar:'الفيوم'},f:70},{k:'bni',n:{en:'Beni Suef',ar:'بني سويف'},f:70},
 {k:'mny',n:{en:'Minya',ar:'المنيا'},f:75},{k:'asy',n:{en:'Asyut',ar:'أسيوط'},f:75},
 {k:'sog',n:{en:'Sohag',ar:'سوهاج'},f:80},{k:'qna',n:{en:'Qena',ar:'قنا'},f:80},
 {k:'lxr',n:{en:'Luxor',ar:'الأقصر'},f:85},{k:'asw',n:{en:'Aswan',ar:'أسوان'},f:90},
 {k:'rds',n:{en:'Red Sea',ar:'البحر الأحمر'},f:95},{k:'mtr',n:{en:'Matrouh',ar:'مطروح'},f:95},
 {k:'nsi',n:{en:'North Sinai',ar:'شمال سيناء'},f:95},{k:'ssi',n:{en:'South Sinai',ar:'جنوب سيناء'},f:95},
 {k:'nvl',n:{en:'New Valley',ar:'الوادي الجديد'},f:95}];

/* ======= الحالة ======= */
const BLANK = {nm:'',ph:'',em:'',gov:'',area:'',street:'',bld:'',apt:'',notes:'',
               pay:'cod',cnum:'',cexp:'',ccvv:'',wnum:''};
/* بيانات البطاقة والمحفظة مش بتتخزن على الجهاز */
const SAFE = ['nm','ph','em','gov','area','street','bld','apt','notes','pay'];
const has  = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
const F    = Object.assign({}, BLANK);

(function restore(){
  let raw = {};
  try{ raw = JSON.parse(localStorage.getItem(FK) || '{}') || {}; }catch(e){}
  SAFE.forEach(k => { if(typeof raw[k] === 'string') F[k] = raw[k]; });
  if(PAYS.indexOf(F.pay) < 0) F.pay = PAYS[PAYS.length - 1];
  if(F.gov && !GOV.some(g => g.k === F.gov)) F.gov = '';
})();

let saveT = 0;
const saveF = () => {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    const o = {}; SAFE.forEach(k => o[k] = F[k]);
    try{ localStorage.setItem(FK, JSON.stringify(o)); }catch(e){}
  }, 250);
};

let done = null, errs = {}, busy = false;

/* ======= أدوات ======= */
const AR = '٠١٢٣٤٥٦٧٨٩', FA = '۰۱۲۳۴۵۶۷۸۹';
const dg = (v) => String(v == null ? '' : v)
  .replace(/[٠-٩]/g, d => AR.indexOf(d))
  .replace(/[۰-۹]/g, d => FA.indexOf(d))
  .replace(/\D/g, '');
const safeColor = (v) => {
  const s = String(v == null ? '' : v).trim();
  return (/^#[0-9a-fA-F]{3,8}$/.test(s) || /^[a-zA-Z]{3,20}$/.test(s)) ? s : '';
};

const CARD='<svg viewBox="0 0 24 24" fill="none"><rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M2.5 9.5h19" stroke="currentColor" stroke-width="1.6"/><path d="M6 15h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const WAL='<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="2.5" width="12" height="19" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M10.5 18.5h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M9.5 8.5h5M9.5 12h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
const COD='<svg viewBox="0 0 24 24" fill="none"><rect x="2.5" y="6" width="19" height="12" rx="2.5" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.6"/></svg>';
const LOCK='<svg viewBox="0 0 24 24" fill="none"><rect x="4.5" y="10" width="15" height="11" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M8 10V7.5a4 4 0 018 0V10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
const CHEV='<svg viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const TICK='<svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5l5 5L20 6.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PIC = {card:CARD, wal:WAL, cod:COD};

const lines = () => A.cart.map(c => ({c, p:A.byId(c.id)})).filter(o => o.p);

function sums(){
  const sub  = lines().reduce((a,o) => a + o.p.price * o.c.qty, 0);
  const g    = GOV.find(v => v.k === F.gov) || null;
  const free = sub >= FREE;
  const ship = free ? 0 : (g ? g.f : null);
  const cod  = F.pay === 'cod' ? CODFEE : 0;
  return {sub, g, free, ship, cod, total: sub + (ship || 0) + cod};
}
const govName = (g) => g ? (g.n[st()] || g.n.en) : '';
const payName = (k) => k === 'card' ? x('card') : k === 'wal' ? x('wal') : x('cod');

const AC = {nm:'name',ph:'tel',em:'email',area:'address-level2',street:'address-line1',
            bld:'address-line2',apt:'address-line3',cnum:'cc-number',cexp:'cc-exp',
            ccvv:'cc-csc',wnum:'tel'};
const IM = {ph:'tel',wnum:'tel',cnum:'numeric',cexp:'numeric',ccvv:'numeric'};
const MX = {cnum:'19',cexp:'7',ccvv:'4',ph:'16',wnum:'16'};
const NONAME = {cnum:1,cexp:1,ccvv:1,wnum:1};   /* يستحيل تظهر في الرابط */

function fld(id, lab, req = true, type = 'text'){
  return '<div class="fld" data-f="' + id + '">'
    + '<input id="' + id + '"' + (NONAME[id] ? '' : ' name="' + id + '"')
    + ' type="' + type + '" value="' + esc(F[id]) + '"'
    + ' placeholder="' + esc(lab) + (req ? ' *' : '') + '"'
    + ' aria-label="' + esc(lab) + '"'
    + ' autocomplete="' + (AC[id] || 'off') + '"'
    + (IM[id] ? ' inputmode="' + IM[id] + '"' : '')
    + (MX[id] ? ' maxlength="' + MX[id] + '"' : '') + '></div>';
}
function setErr(id, msg){
  const w = $('.fld[data-f="' + id + '"]'); if(!w) return;
  const el = byId(id);
  if(el){ el.classList.add('err'); el.setAttribute('aria-invalid','true'); }
  let m = w.querySelector('.co-err');
  if(!m){ m = document.createElement('p'); m.className = 'co-err';
          m.setAttribute('role','alert'); w.appendChild(m); }
  m.textContent = msg;
}
function clearErr(id){
  const w = $('.fld[data-f="' + id + '"]'); if(!w) return;
  const el = byId(id);
  if(el){ el.classList.remove('err'); el.removeAttribute('aria-invalid'); }
  const m = w.querySelector('.co-err'); if(m) m.remove();
}

/* ======= الرسم ======= */
function paint(){
  document.title = 'Velora — ' + x('ttl');
  const ttl = byId('coTtl'); if(ttl) ttl.textContent = done ? x('ok_h') : x('ttl');
  const steps = byId('coSteps');
  if(steps) steps.innerHTML =
      '<b class="ok" id="stBag">' + x('s1') + '</b><i>' + CHEV + '</i>'
    + '<b class="' + (done ? 'ok' : 'on') + '">' + x('s2') + '</b><i>' + CHEV + '</i>'
    + '<b class="' + (done ? 'on' : '') + '">' + x('s3') + '</b>';

  if(done) return paintDone();
  const old = byId('coOk'); if(old) old.remove();
  const grid = byId('coGrid'); if(grid) grid.style.display = '';
  if(!lines().length) return paintEmpty();

  paintMain(); syncFee(); syncPay(); paintSide(); paintBar();
}

function paintEmpty(){
  const side = byId('coSide'); if(side) side.innerHTML = '';
  const main = byId('coMain');
  if(main) main.innerHTML = '<div class="empty" style="padding:36px 0">'
    + '<b style="display:block;color:var(--ink);font-weight:400;margin-bottom:5px">' + x('empty') + '</b>'
    + '<span>' + x('empty_s') + '</span><br>'
    + '<a class="cta" href="' + SHOP + '" style="margin-top:14px">' + x('go') + '</a></div>';
  const bar = byId('coBar'); if(bar){ bar.classList.remove('on'); bar.innerHTML = ''; }
}

function paintMain(){
  const main = byId('coMain'); if(!main) return;
  main.innerHTML =
    '<section class="co-sec"><h2 class="co-h">' + x('c_h') + '</h2>'
  + '<p class="co-p">' + x('c_p') + '</p>'
  + fld('nm', x('nm')) + fld('ph', x('ph'), true, 'tel')
  + fld('em', x('em'), EMAIL_REQ, 'email')
  + '</section>'
  + '<section class="co-sec"><h2 class="co-h">' + x('a_h') + '</h2>'
  + '<p class="co-p">' + x('a_p') + '</p>'
  + '<div class="fld" data-f="gov"><select class="co-sel" id="gov" name="gov" aria-label="'
  + esc(x('gov')) + '"><option value="">' + x('pick') + '</option>'
  + GOV.map(g => '<option value="' + g.k + '"' + (g.k === F.gov ? ' selected' : '') + '>'
      + esc(govName(g)) + '</option>').join('')
  + '</select></div><p class="co-fee" id="coFee"></p>'
  + '<div class="co-two">' + fld('area', x('area')) + fld('bld', x('bld')) + '</div>'
  + '<div class="co-two">' + fld('street', x('street')) + fld('apt', x('apt'), false) + '</div>'
  + fld('notes', x('notes'), false)
  + '</section>'
  + '<section class="co-sec"><h2 class="co-h">' + x('p_h') + '</h2>'
  + '<p class="co-p">' + x('p_p') + '</p><div class="pays">'
  + PAYS.map(k => '<button type="button" class="pay" data-pay="' + k + '" aria-pressed="'
      + (F.pay === k) + '"><span class="pay__ic">' + PIC[k] + '</span>'
      + '<span class="pay__t">' + payName(k) + '<small>'
      + (k === 'card' ? x('card_s') : k === 'wal' ? x('wal_s') : x('cod_s'))
      + '</small></span><span class="pay__r"></span></button>').join('')
  + '</div><div id="payBox"></div></section>';
  Object.keys(errs).forEach(k => setErr(k, errs[k]));
}

function syncFee(){
  const el = byId('coFee'); if(!el) return;
  const s = sums();
  el.innerHTML = s.free
    ? '<b style="color:var(--green,#4F6B4A)">' + x('free') + '</b>'
    : (s.g ? x('fee') + ': <b>' + A.money(s.g.f) + '</b>' : x('fee') + ': <b>—</b>');
}

function syncPay(){
  document.querySelectorAll('.pay[data-pay]').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.pay === F.pay));
  });
  const box = byId('payBox'); if(!box) return;
  box.innerHTML = F.pay === 'card'
    ? '<div class="pay-x">' + fld('cnum', x('cnum'))
      + '<div class="co-two">' + fld('cexp', x('cexp')) + fld('ccvv', x('ccvv')) + '</div>'
      + '<p class="note">' + x('demo') + '</p></div>'
    : F.pay === 'wal'
    ? '<div class="pay-x">' + fld('wnum', x('wnum'), true, 'tel')
      + '<p class="note">' + x('demo') + '</p></div>'
    : '<div class="pay-x"><p class="note">' + x('demo') + '</p></div>';
  ['cnum','cexp','ccvv','wnum'].forEach(k => { if(errs[k]) setErr(k, errs[k]); });
}

function paintSide(){
  const side = byId('coSide'); if(!side) return;
  const s = sums();
  side.innerHTML = '<h3>' + x('sum') + '</h3>'
  + lines().map(({c,p}) => {
      const col = safeColor(c.color);
      return '<div class="co-line"><img src="'
      + esc(A.U(Array.isArray(p.img) ? p.img[0] : p.img, 180)) + '" alt="'
      + esc(A.L(p.name)) + '"><div style="min-width:0">'
      + '<div class="co-line__n">' + esc(A.L(p.name)) + '</div>'
      + '<div class="co-line__m">' + x('size') + ': ' + esc(c.size || '—') + ' × ' + esc(c.qty)
      + (col ? ' · <i class="csw" style="background:' + col + '"></i>' : '') + '</div>'
      + '<div class="co-line__p">' + A.money(p.price * c.qty) + '</div></div></div>';
    }).join('')
  + '<div class="co-tot">'
  + '<div><span>' + x('sub') + '</span><span>' + A.money(s.sub) + '</span></div>'
  + '<div class="' + (s.free ? 'free' : '') + '"><span>' + x('ship') + '</span><span>'
  + (s.free ? '✓ ' + x('free_t') : (s.ship === null ? '—' : A.money(s.ship))) + '</span></div>'
  + (s.cod ? '<div><span>' + x('cod_f') + '</span><span>' + A.money(s.cod) + '</span></div>' : '')
  + '<div class="big"><span>' + x('tot') + '</span><b>'
  + (s.ship === null ? A.money(s.sub + s.cod) + ' +' : A.money(s.total)) + '</b></div>'
  + (s.ship === null ? '<p class="co-hint">' + x('pick') + '</p>' : '')
  + '</div>';
}

function paintBar(){
  const b = byId('coBar'); if(!b) return;
  const s = sums(), unknown = (s.ship === null);
  b.innerHTML = '<div class="co-bar__in wrap"><div class="co-bar__t"><small>'
    + x('tot') + '</small><b>'
    + (unknown ? A.money(s.sub + s.cod) + ' +' : A.money(s.total)) + '</b>'
    + (unknown ? '<i class="co-bar__hint">' + x('pick') + '</i>' : '') + '</div>'
    + '<button class="btn-primary" type="button" id="coPay">' + LOCK + '<span>'
    + ((F.pay === 'cod' || unknown) ? x('place') : x('pay') + ' ' + A.money(s.total))
    + '</span></button></div>';
  requestAnimationFrame(() => b.classList.add('on'));
}

function paintDone(){
  const o = done;
  const bar = byId('coBar'); if(bar) bar.classList.remove('on');
  const grid = byId('coGrid'); if(grid) grid.style.display = 'none';
  const side = byId('coSide'); if(side) side.innerHTML = '';
  const old = byId('coOk'); if(old) old.remove();

  const el = document.createElement('div');
  el.className = 'co-ok'; el.id = 'coOk';
  el.innerHTML = '<div class="co-ok__ic">' + TICK + '</div>'
    + '<h2>' + x('ok_h') + '</h2><p>' + x('ok_p') + '</p>'
    + '<span class="co-ok__no">' + x('ok_no') + ': ' + esc(o.no) + '</span>'
    + '<div class="co-ok__box">'
    + '<div class="co-ok__row"><span>' + x('ok_pay') + '</span><b>' + payName(o.pay) + '</b></div>'
    + '<div class="co-ok__row"><span>' + x('ok_to') + '</span><b>' + esc(o.gov) + '</b></div>'
    + '<div class="co-ok__row"><span>' + x('ok_eta') + '</span><b>' + x('days') + '</b></div>'
    + '<div class="co-ok__row"><span>' + x('tot') + '</span><b>' + A.money(o.total) + '</b></div>'
    + '</div>'
    + '<a class="cta" href="' + HOME + '">' + x('back_home') + '</a>'
    + '<a class="cta" href="' + SHOP + '">' + x('keep') + '</a>';
  (byId('co') || document.body).appendChild(el);
}

/* ======= التفاعل ======= */
const main = byId('coMain');
if(main){
  main.addEventListener('input', (e) => {
    const el = e.target;
    if(!el.id || !has(BLANK, el.id)) return;
    if(el.id === 'cnum') el.value = dg(el.value).slice(0,16).replace(/(.{4})(?=.)/g, '$1 ');
    if(el.id === 'cexp'){
      const d = dg(el.value).slice(0,4);
      el.value = d.length > 2 ? d.slice(0,2) + '/' + d.slice(2) : d;
    }
    if(el.id === 'ccvv') el.value = dg(el.value).slice(0,4);
    F[el.id] = el.value;
    saveF();
    if(errs[el.id]){ delete errs[el.id]; clearErr(el.id); }
  });

  main.addEventListener('change', (e) => {
    if(e.target.id !== 'gov') return;
    F.gov = e.target.value;
    if(errs.gov){ delete errs.gov; clearErr('gov'); }
    saveF(); syncFee(); paintSide(); paintBar();
  });

  main.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pay]');
    if(!b || b.dataset.pay === F.pay) return;
    F.pay = b.dataset.pay;
    ['cnum','cexp','ccvv','wnum'].forEach(k => delete errs[k]);
    saveF(); syncPay(); paintSide(); paintBar();
  });

  main.addEventListener('submit', (e) => { e.preventDefault(); placeOrder(); });
  main.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && e.target.tagName === 'INPUT'){ e.preventDefault(); placeOrder(); }
  });
}

const back = byId('coBack');
if(back) back.addEventListener('click', () => {
  if(history.length > 1) history.back(); else location.href = SHOP;
});

const steps = byId('coSteps');
if(steps) steps.addEventListener('click', (e) => {
  if(e.target.id !== 'stBag') return;
  const sheet = byId('cartSheet');
  if(sheet && typeof A.openSheet === 'function') return A.openSheet(sheet);
  const btn = byId('cartBtnTop') || byId('navCart');
  if(btn) return btn.click();
  location.href = SHOP;
});

/* ======= التحقق والتأكيد ======= */
function check(){
  errs = {};
  if(String(F.nm).trim().length < 3) errs.nm = x('e_nm');
  if(!/^01\d{9}$/.test(dg(F.ph))) errs.ph = x('e_ph');
  const em = String(F.em).trim();
  if((EMAIL_REQ || em) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) errs.em = x('e_em');
  if(!F.gov) errs.gov = x('e_gov');
  ['area','street','bld'].forEach(k => { if(!String(F[k]).trim()) errs[k] = x('e_ad'); });

  if(F.pay === 'card'){
    if(dg(F.cnum).length !== 16) errs.cnum = x('e_card');
    const d = dg(F.cexp);
    let good = d.length === 4;
    if(good){
      const mm = +d.slice(0,2), yy = +d.slice(2);
      const now = new Date(), cy = now.getFullYear() % 100, cm = now.getMonth() + 1;
      good = mm >= 1 && mm <= 12 && (yy > cy || (yy === cy && mm >= cm));
    }
    if(!good) errs.cexp = x('e_exp');
    if(dg(F.ccvv).length !== 3) errs.ccvv = x('e_cvv');
  }
  if(F.pay === 'wal' && !/^01\d{9}$/.test(dg(F.wnum))) errs.wnum = x('e_wal');
  return Object.keys(errs);
}

function placeOrder(){
  if(done || busy) return;
  if(!lines().length) return paint();

  const bad = check();
  Object.keys(BLANK).forEach(k => { if(!errs[k]) clearErr(k); });
  if(bad.length){
    bad.forEach(k => setErr(k, errs[k]));
    const el = byId(bad[0]);
    if(el){
      el.scrollIntoView({behavior:'smooth', block:'center'});
      setTimeout(() => { try{ el.focus({preventScroll:true}); }catch(e){ el.focus(); } }, 380);
    }
    try{ A.toast(errs[bad[0]], ''); }catch(e){}
    return;
  }

  busy = true;
  const s = sums();
  const o = {
    no:'VLR-' + Date.now().toString(36).toUpperCase().slice(-6),
    d:Date.now(), pay:F.pay, gov:govName(s.g),
    sub:s.sub, ship:s.ship || 0, cod:s.cod, total:s.total,
    nm:String(F.nm).trim(), ph:dg(F.ph), em:String(F.em).trim(),
    addr:[F.area, F.street, F.bld, F.apt].map(v => String(v).trim()).filter(Boolean).join(' · '),
    notes:String(F.notes).trim(), status:'new',
    items:lines().map(({c,p}) => ({id:p.id, n:A.L(p.name), size:c.size,
      color:safeColor(c.color) || null, qty:c.qty, price:p.price}))
  };

  let db = [];
  try{ db = JSON.parse(localStorage.getItem(OK) || '[]') || []; }catch(e){}
  if(!Array.isArray(db)) db = [];
  db.push(o);
  if(db.length > KEEP) db = db.slice(-KEEP);
  try{ localStorage.setItem(OK, JSON.stringify(db)); }catch(e){}

  done = o;
  F.cnum = F.cexp = F.ccvv = F.wnum = '';
  errs = {};
  try{ localStorage.removeItem(FK); }catch(e){}

  A.cart.length = 0;
  A.save();
  A.paintCart();

  busy = false;
  paint();
  window.scrollTo({top:0, behavior:'smooth'});
}

const barEl = byId('coBar');
if(barEl) barEl.addEventListener('click', (e) => {
  if(e.target.closest('#coPay')) placeOrder();
});

/* ======= اللغة والعملة والسلة ======= */
function onMoney(){
  if(done) return paintDone();
  if(!lines().length) return paint();
  syncFee(); paintSide(); paintBar();
}
document.addEventListener('velora:lang', () => { try{ paint(); }catch(e){} });
document.addEventListener('velora:cur',  () => { try{ onMoney(); }catch(e){} });
document.addEventListener('velora:cart', () => { try{ onMoney(); }catch(e){} });

paint();
}
})();
