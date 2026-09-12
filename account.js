/* ===== Velora — Account (بروفايل محلي، بدون تسجيل دخول) ===== */
(() => {
'use strict';

const A   = (window.VELORA || {}).api;
const box = document.getElementById('acc');
if(!A){ console.warn('Velora: velora.js must load before account.js'); return; }
if(!box) return;
document.body.classList.add('is-acc');

/* ---------- أدوات ---------- */
const esc = s => String(s == null ? '' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const okColor = v => /^#[0-9A-Fa-f]{3,8}$/.test(String(v)) || /^[A-Za-z]{3,20}$/.test(String(v));
const st    = () => (typeof A.lang === 'function' ? A.lang() : 'en');
const money = n => (typeof A.money === 'function' ? A.money(n) : String(n));
const toast = (m,t) => { if(typeof A.toast === 'function') A.toast(m, t === undefined ? '' : t); };
const wishArr = () => (Array.isArray(A.wish) ? A.wish : []);
const catalog = () => (Array.isArray(A.ALL) ? A.ALL : []);
const val  = id => { const el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; };
const digits = v => String(v || '').replace(/\D/g,'');

/* ---------- نصوص ---------- */
const T = {
en:{ttl:'My Profile',wel:'Welcome to Velora',
 wel_p:'Save your details once on this device to speed up checkout, keep your addresses and follow your orders.<br>No sign-in, no password — everything stays on your device.',
 start:'Set up my profile',still:'You can also:',track:'Track your order',
 orders:'My Orders',addrs:'My Addresses',info:'My Details',wish:'Wishlist',
 loyalty:'Loyalty',pts:'points',edit:'Edit',cancel:'Cancel',save:'Save changes',
 l_ship:'Shipping',l_ret:'Returns',l_help:'Help',l_priv:'Privacy',
 nm:'Full name',ph:'Phone number',em:'Email',opt:'optional',
 demo:'Saved on this device only. Clearing your browser data removes it.',
 e_nm:'Please enter your full name',e_ph:'Enter a valid phone number (11 digits)',
 e_em:'Enter a valid email address',
 made:'Profile saved',saved:'Saved',
 clear:'Clear my data from this device',
 clear_q:'This removes your details, addresses and saved orders from this device. Continue?',
 cleared:'Data cleared',
 no_ord:'No orders yet',no_ord_s:'Your orders will show up here after your first purchase.',
 go:'Go to shop',items:'items',order:'Order',
 s_new:'Processing',s_ship:'Shipped',s_done:'Delivered',
 t_new:'Order placed',t_cnf:'Confirmed',t_ship:'Out for delivery',t_done:'Delivered',
 sum:'Order summary',sub:'Subtotal',ship:'Delivery',codf:'Cash on delivery fee',tot:'Total',
 dt:'Delivery details',pay:'Payment',addr:'Address',gov:'Governorate',notes:'Notes',size:'Size',
 add_a:'Add new address',ed_a:'Edit address',lab:'Label (Home, Work…)',area:'Area',
 street:'Street',bld:'Building',apt:'Apartment',pick:'Select governorate',
 def:'Default',set_def:'Set as default',del:'Delete',del_q:'Delete this address?',
 e_gov:'Please choose a governorate',e_ad:'Please complete the address fields',
 no_adr:'No saved addresses yet',
 no_w:'Your wishlist is empty',no_w_s:'Tap the heart on any product to save it here.',
 tr_h:'Track your order',tr_p:'Enter your order number to see its status.',
 tr_no:'Order number',find:'Track',tr_x:'We couldn’t find that order number.',
 member:'Saved since',ci:'Contact details',ci_p:'Used to fill your delivery info faster.',
 dob:'Date of birth',gender:'Gender',male:'Male',female:'Female',
 tier:'Tier',next_t:'to the next tier',lang:'Language',
 loy_h:'How points work',loy_1:'Every completed order earns points.',
 loy_2:'Points turn into discounts on your next order.',
 loy_3:'Higher tiers unlock earlier access to sales.',
 act:'Activity',no_act:'No activity yet',earned:'Points earned'},
ar:{ttl:'حسابي',wel:'أهلًا بك في ڤيلورا',
 wel_p:'احفظ بياناتك مرة واحدة على الجهاز ده عشان تخلّص الشراء بسرعة، وتحفظ عناوينك، وتتابع طلباتك.<br>مفيش تسجيل دخول ولا كلمة سر — كل حاجة محفوظة على جهازك.',
 start:'ابدأ واحفظ بياناتي',still:'وبرضه تقدر:',track:'تتبع طلبك',
 orders:'طلباتي',addrs:'عناويني',info:'بياناتي',wish:'المفضلة',
 loyalty:'نقاط الولاء',pts:'نقطة',edit:'تعديل',cancel:'إلغاء',save:'حفظ التعديلات',
 l_ship:'الشحن',l_ret:'الاسترجاع',l_help:'المساعدة',l_priv:'الخصوصية',
 nm:'الاسم بالكامل',ph:'رقم الموبايل',em:'البريد الإلكتروني',opt:'اختياري',
 demo:'محفوظة على الجهاز ده بس. لو مسحت بيانات المتصفح هتروح.',
 e_nm:'اكتب اسمك بالكامل',e_ph:'اكتب رقم موبايل صحيح (١١ رقم)',
 e_em:'اكتب بريد إلكتروني صحيح',
 made:'تم حفظ بياناتك',saved:'تم الحفظ',
 clear:'مسح بياناتي من الجهاز',
 clear_q:'ده هيمسح بياناتك وعناوينك وطلباتك المحفوظة من الجهاز ده. تكمّل؟',
 cleared:'تم مسح البيانات',
 no_ord:'مفيش طلبات لسه',no_ord_s:'طلباتك هتظهر هنا بعد أول عملية شراء.',
 go:'روح للمتجر',items:'قطعة',order:'طلب',
 s_new:'جاري التجهيز',s_ship:'في الطريق',s_done:'تم التوصيل',
 t_new:'تم استلام الطلب',t_cnf:'تم التأكيد',t_ship:'خرج للتوصيل',t_done:'تم التوصيل',
 sum:'ملخص الطلب',sub:'المجموع',ship:'الشحن',codf:'رسوم الدفع عند الاستلام',tot:'الإجمالي',
 dt:'بيانات التوصيل',pay:'الدفع',addr:'العنوان',gov:'المحافظة',notes:'ملاحظات',size:'المقاس',
 add_a:'إضافة عنوان جديد',ed_a:'تعديل العنوان',lab:'الاسم (البيت، الشغل…)',area:'المنطقة',
 street:'الشارع',bld:'رقم العمارة',apt:'الشقة',pick:'اختر المحافظة',
 def:'الافتراضي',set_def:'اجعله الافتراضي',del:'حذف',del_q:'تحذف العنوان ده؟',
 e_gov:'اختر المحافظة',e_ad:'كمّل بيانات العنوان',
 no_adr:'مفيش عناوين محفوظة لسه',
 no_w:'مفضلتك فاضية',no_w_s:'دوس على القلب في أي منتج وهتلاقيه هنا.',
 tr_h:'تتبع طلبك',tr_p:'اكتب رقم الطلب لتشوف حالته.',
 tr_no:'رقم الطلب',find:'تتبع',tr_x:'مش لاقيين رقم الطلب ده.',
 member:'محفوظ من',ci:'بيانات التواصل',ci_p:'بنستخدمها لملء بيانات التوصيل بسرعة.',
 dob:'تاريخ الميلاد',gender:'النوع',male:'ذكر',female:'أنثى',
 tier:'الدرجة',next_t:'للدرجة اللي بعدها',lang:'اللغة',
 loy_h:'النقاط بتشتغل إزاي',loy_1:'كل طلب مكتمل بيضيف لك نقاط.',
 loy_2:'النقاط بتتحوّل لخصم على طلبك اللي بعده.',
 loy_3:'الدرجات الأعلى بتدخل التخفيضات قبل الناس.',
 act:'سجل النقاط',no_act:'مفيش حركات لسه',earned:'نقاط مكتسبة'}};
const x = k => (T[st()] && T[st()][k]) || T.en[k] || k;

/* ---------- المحافظات ---------- */
const GOV=[['cai','Cairo','القاهرة'],['giz','Giza','الجيزة'],['qlb','Qalyubia','القليوبية'],
['alx','Alexandria','الإسكندرية'],['dkh','Dakahlia','الدقهلية'],['shr','Sharqia','الشرقية'],
['grb','Gharbia','الغربية'],['mnf','Monufia','المنوفية'],['kfs','Kafr El Sheikh','كفر الشيخ'],
['bhr','Beheira','البحيرة'],['dmt','Damietta','دمياط'],['prt','Port Said','بورسعيد'],
['ism','Ismailia','الإسماعيلية'],['sez','Suez','السويس'],['fym','Faiyum','الفيوم'],
['bni','Beni Suef','بني سويف'],['mny','Minya','المنيا'],['asy','Asyut','أسيوط'],
['sog','Sohag','سوهاج'],['qna','Qena','قنا'],['lxr','Luxor','الأقصر'],['asw','Aswan','أسوان'],
['rds','Red Sea','البحر الأحمر'],['mtr','Matrouh','مطروح'],['nsi','North Sinai','شمال سيناء'],
['ssi','South Sinai','جنوب سيناء'],['nvl','New Valley','الوادي الجديد']];
const gname = k => { const g = GOV.find(v => v[0] === k); return g ? (st() === 'ar' ? g[2] : g[1]) : ''; };

/* ---------- التخزين ---------- */
const UK='velora_user', ADK='velora_addresses', OK='velora_orders', FK='velora_checkout';
const rd = (k,d) => { try{ const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; }catch(e){ return d; } };
const wr = (k,v) => { try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } };

let U  = rd(UK, null);
if(U && typeof U === 'object'){ delete U.p; }              /* تنظيف أي كلمة سر قديمة */
let AD = rd(ADK, []); if(!Array.isArray(AD)) AD = [];
let ORD = rd(OK, []); if(!Array.isArray(ORD)) ORD = [];
const mirror = o => { const f = rd(FK, {}) || {}; wr(FK, Object.assign(f, o)); };

/* ---------- أيقونات ---------- */
const IC={
bag:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.5 7.7v-1c0-2.2 1.8-4.4 4.1-4.6 2.7-.3 4.9 1.8 4.9 4.5v1.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M9 22h6c4 0 4.7-1.6 4.9-3.6l.8-6C21 10 20.3 8 16 8H8c-4.3 0-5 2-4.7 4.4l.7 6C4.3 20.4 5 22 9 22z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
pin:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="1.7"/></svg>',
usr:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="7.5" r="4.2" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 20.5c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
hrt:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20.7C9 19.6 3.2 15.6 3.2 9.6a4.9 4.9 0 019-2.7 4.9 4.9 0 019 2.7c0 6-5.8 10-8.8 11.1z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
gift:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="8.5" width="17" height="12" rx="2.4" stroke="currentColor" stroke-width="1.6"/><path d="M12 8.5v12M3.5 13.5h17" stroke="currentColor" stroke-width="1.6"/><path d="M12 8.5S10.8 4 8.6 4a2.3 2.3 0 000 4.5M12 8.5S13.2 4 15.4 4a2.3 2.3 0 010 4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
box:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.5 8.5v7c0 1-.5 1.8-1.4 2.3l-6 3.4c-.7.4-1.5.4-2.2 0l-6-3.4A2.6 2.6 0 013.5 15.5v-7c0-1 .5-1.8 1.4-2.3l6-3.4c.7-.4 1.5-.4 2.2 0l6 3.4c.9.5 1.4 1.3 1.4 2.3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3.8 7.2L12 12l8.2-4.8M12 12v9.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
chev:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
back:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
tick:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'};

/* ---------- الحالة ---------- */
const VIEWS = ['home','welcome','info','orders','order','addr','addrform','wish','track','loyalty'];
let V = 'home', cur = null, edit = null, errs = {}, trk = null, gsel = null, draft = {};

const TIER = [[0,'Bronze','برونزي'],[500,'Silver','فضي'],[1500,'Gold','ذهبي'],[3000,'Platinum','بلاتيني']];
const fdate = ms => { const d = new Date(ms); return isNaN(d) ? '' :
  d.toLocaleDateString(st() === 'ar' ? 'ar-EG' : 'en-GB',{day:'numeric',month:'short',year:'numeric'}); };
const initials = n => String(n || '?').trim().split(/\s+/).slice(0,2).map(w => w[0] || '').join('').toUpperCase() || '?';
const days = ms => (Date.now() - Number(ms || 0)) / 864e5;
const stat = o => {
  const s = String(o && o.status || '').toLowerCase();
  if(s === 'done' || s === 'delivered') return 2;
  if(s === 'shipped') return 1;
  if(s === 'new' || s === 'processing') return 0;
  return days(o.d) < 1 ? 0 : days(o.d) < 3 ? 1 : 2;
};
const ptsOf = o => Math.floor(Number(o && o.total || 0) / 10);
const points = () => ORD.reduce((a,o) => a + ptsOf(o), 0);
const tierNow = () => { const p = points(); let t = TIER[0]; TIER.forEach(v => { if(p >= v[0]) t = v; }); return t; };
const tierNext = () => { const p = points(); return TIER.find(v => v[0] > p) || null; };
const tName = t => (st() === 'ar' ? t[2] : t[1]);

const prod = i => (typeof A.byId === 'function' ? A.byId(i.id) : null);
const imgOf = i => {
  const p = prod(i);
  let src = (p && p.img) ? (Array.isArray(p.img) ? p.img[0] : p.img) : (i.img || '');
  return (src && typeof A.U === 'function') ? A.U(src,160) : src;
};

/* ---------- الرابط ---------- */
function readURL(){
  let q; try{ q = new URLSearchParams(location.search); }catch(e){ q = new URLSearchParams(); }
  const v = q.get('v') || 'home';
  V = VIEWS.includes(v) ? v : 'home';
  const no = q.get('o');
  if(no){ cur = ORD.find(o => String(o.no) === no) || null; if(!cur && V === 'order') V = 'orders'; }
}
function writeURL(){
  const q = new URLSearchParams();
  if(V !== 'home') q.set('v', V);
  if(V === 'order' && cur) q.set('o', cur.no);
  const s = q.toString();
  try{ history.replaceState(null,'', location.pathname + (s ? '?' + s : '')); }catch(e){}
}
function go(v){
  V = VIEWS.includes(v) ? v : 'home';
  errs = {}; gsel = null; draft = {};
  try{ history.pushState(null,'', location.pathname + (V === 'home' ? '' : '?v=' + V)); }catch(e){}
  paint();
  window.scrollTo({ top:0 });
}

/* ---------- عناصر مشتركة ---------- */
const fld = (id,lab,v,req,ty) => `<div class="fld">
  <input id="${id}" type="${ty || 'text'}" value="${esc(v)}"
    placeholder="${esc(lab)}${req === false ? ' (' + esc(x('opt')) + ')' : ' *'}"
    aria-label="${esc(lab)}" class="${errs[id] ? 'err' : ''}" autocomplete="off">
  ${errs[id] ? `<p class="co-err">${esc(errs[id])}</p>` : ''}</div>`;

const head = (ttl,sub,back) => `<div class="acc-head">
  ${back ? `<button class="acc-back" type="button" data-go="${back}" aria-label="Back">${IC.back}</button>` : ''}
  <h1 class="acc-h1" tabindex="-1">${esc(ttl)}${sub ? `<small>${esc(sub)}</small>` : ''}</h1></div>`;

const empty = (t1,t2) => `<div class="empty" style="padding:34px 0">
  <b style="display:block;color:var(--ink);font-weight:400;margin-bottom:5px">${esc(t1)}</b>
  <span>${esc(t2)}</span><br><a class="cta" href="shop.html" style="margin-top:14px">${esc(x('go'))}</a></div>`;

/* ---------- الشريط الجانبي ---------- */
function sideHTML(){
  if(!U || V === 'welcome') return '';
  const items = [
    ['home',    x('ttl'),     IC.usr,  ''],
    ['orders',  x('orders'),  IC.bag,  ORD.length],
    ['addr',    x('addrs'),   IC.pin,  AD.length],
    ['info',    x('info'),    IC.usr,  ''],
    ['wish',    x('wish'),    IC.hrt,  wishArr().length],
    ['loyalty', x('loyalty'), IC.gift, points()],
    ['track',   x('track'),   IC.box,  '']
  ];
  const map = { order:'orders', addrform:'addr' }, act = map[V] || V;
  return `<aside class="acc-side" aria-label="${esc(x('ttl'))}">
    <div class="acc-side__u">
      <span class="acc-side__av">${esc(initials(U.nm))}</span>
      <span class="acc-side__who"><b>${esc(U.nm)}</b><small>${esc(U.em || U.ph)}</small></span>
    </div>
    <nav class="acc-side__nav">
      ${items.map(([v,lb,ic,n]) => `<button class="acc-side__i${act === v ? ' on' : ''}" type="button" data-go="${v}">
        <span class="acc-side__ic">${ic}</span><span class="acc-side__t">${esc(lb)}</span>${n ? `<em>${esc(n)}</em>` : ''}
      </button>`).join('')}
    </nav>
  </aside>`;
}

/* ---------- الشاشات ---------- */
function vWelcome(){
  const hero = (typeof A.pic === 'function')
    ? A.pic(['1483985988355-763728e1935b','1445205170230-053b83016050'],'Velora',1200,.56) : '';
  return `${head(x('ttl'))}<div class="acc-wrap">
  ${hero ? `<div class="acc-hero">${hero}</div>` : ''}
  <div class="acc-wel"><h2>${esc(x('wel'))}</h2><p>${x('wel_p')}</p></div>
  <div class="acc-btns">
    <button class="btn-primary" type="button" data-go="info" style="margin-top:0"><span>${esc(x('start'))}</span></button>
  </div>
  <p class="acc-still">${esc(x('still'))}</p>
  <button class="acc-row" type="button" data-go="track"><span class="acc-row__ic">${IC.box}</span>
    <span class="acc-row__t">${esc(x('track'))}</span><span class="acc-row__c">${IC.chev}</span></button>
  <button class="acc-row" type="button" data-go="wish"><span class="acc-row__ic">${IC.hrt}</span>
    <span class="acc-row__t">${esc(x('wish'))}</span>
    <span class="acc-row__v">${esc(wishArr().length)}</span><span class="acc-row__c">${IC.chev}</span></button>
  <p class="note">${esc(x('demo'))}</p></div>`;
}

function vHome(){
  return `${head(x('ttl'), U.nm)}<div class="acc-wrap">
  <div class="acc-card">
    <div class="acc-av">${esc(initials(U.nm))}</div>
    <div class="acc-who"><b>${esc(U.nm)}</b><span style="direction:ltr">${esc(U.ph)}</span></div>
    <button class="acc-edit" type="button" data-go="info">${esc(x('edit'))}</button>
  </div>
  <div class="acc-tiles">
    <button class="tile" type="button" data-go="orders">${IC.bag}<b>${esc(x('orders'))}</b><span>${ORD.length}</span></button>
    <button class="tile" type="button" data-go="addr">${IC.pin}<b>${esc(x('addrs'))}</b><span>${AD.length}</span></button>
    <button class="tile" type="button" data-go="info">${IC.usr}<b>${esc(x('info'))}</b><span>&nbsp;</span></button>
    <button class="tile" type="button" data-go="wish">${IC.hrt}<b>${esc(x('wish'))}</b><span>${wishArr().length}</span></button>
  </div>
  <button class="acc-row" type="button" data-go="loyalty"><span class="acc-row__ic">${IC.gift}</span>
    <span class="acc-row__t">${esc(x('loyalty'))}</span>
    <span class="acc-row__v">${points()} ${esc(x('pts'))}</span><span class="acc-row__c">${IC.chev}</span></button>
  <button class="acc-row" type="button" data-go="track"><span class="acc-row__ic">${IC.box}</span>
    <span class="acc-row__t">${esc(x('track'))}</span><span class="acc-row__c">${IC.chev}</span></button>
  <div class="acc-links">
    <a href="page.html?p=shipping">${esc(x('l_ship'))}</a>
    <a href="page.html?p=returns">${esc(x('l_ret'))}</a>
    <a href="page.html?p=help">${esc(x('l_help'))}</a>
    <a href="page.html?p=privacy">${esc(x('l_priv'))}</a>
  </div>
  <button class="acc-out acc-danger" type="button" id="accClear">${esc(x('clear'))}</button>
  <p class="note">${esc(x('member'))} ${esc(fdate(U.d))} · ${esc(x('demo'))}</p></div>`;
}

function vInfo(){
  const isNew = !U, u = U || {};
  const g = gsel !== null ? gsel : (u.gen || '');
  return `${head(isNew ? x('start') : x('info'), '', isNew ? 'welcome' : 'home')}<div class="acc-wrap">
  <form class="acc-form" id="infoForm" novalidate>
    <h3 class="acc-sec">${esc(x('ci'))}</h3>
    <p class="acc-sec__p">${esc(x('ci_p'))}</p>
    ${fld('nm', x('nm'), u.nm, true)}
    ${fld('ph', x('ph'), u.ph, true, 'tel')}
    ${fld('em', x('em'), u.em, false, 'email')}
    <p class="lbl-s">${esc(x('dob'))}</p>
    ${fld('dob', x('dob'), u.dob, false, 'date')}
    <p class="lbl-s">${esc(x('gender'))}</p>
    <div class="gen">
      <button type="button" class="gen__b${g === 'm' ? ' on' : ''}" data-gen="m">${esc(x('male'))}</button>
      <button type="button" class="gen__b${g === 'f' ? ' on' : ''}" data-gen="f">${esc(x('female'))}</button>
    </div>
    ${isNew ? '' : `<p class="lbl-s">${esc(x('tier'))}</p>
    <button class="acc-row tier" type="button" data-go="loyalty">
      <span class="acc-row__ic">${IC.gift}</span>
      <span class="acc-row__t"><b>${esc(tName(tierNow()))}</b><small>${points()} ${esc(x('pts'))}</small></span>
      <span class="acc-row__c">${IC.chev}</span></button>`}
    <button type="button" class="acc-row" id="langRow">
      <span class="acc-row__t">${esc(x('lang'))}</span>
      <span class="acc-row__v">${st() === 'ar' ? 'العربية' : 'English'}</span>
      <span class="acc-row__c">${IC.chev}</span>
    </button>
    <div class="acc-two">
      <button class="btn-ghost" type="button" data-go="${isNew ? 'welcome' : 'home'}">${esc(x('cancel'))}</button>
      <button class="btn-primary" type="submit" style="margin-top:0"><span>${esc(isNew ? x('start') : x('save'))}</span></button>
    </div>
    <p class="note">${esc(x('demo'))}</p>
  </form></div>`;
}

function vOrders(){
  if(!ORD.length) return `${head(x('orders'),'','home')}<div class="acc-wrap">${empty(x('no_ord'), x('no_ord_s'))}</div>`;
  const cls = ['','w','g'], key = ['s_new','s_ship','s_done'];
  return `${head(x('orders'),'','home')}<div class="acc-wrap">${ORD.slice().reverse().map(o => {
    const s = stat(o);
    const n = (Array.isArray(o.items) ? o.items : []).reduce((a,i) => a + Number(i.qty || 0), 0);
    return `<button class="ord" type="button" data-ord="${esc(o.no)}"><span class="ord__b">
      <span class="ord__no">${esc(o.no)}</span>
      <span class="ord__m">${esc(fdate(o.d))} · ${n} ${esc(x('items'))}</span></span>
      <span class="ord__p"><b>${esc(money(o.total))}</b>
      <span class="badge ${cls[s]}">${esc(x(key[s]))}</span></span></button>`; }).join('')}</div>`;
}

function vOrder(){
  const o = cur;
  if(!o) return vOrders();
  const s = stat(o), steps = ['t_new','t_cnf','t_ship','t_done'];
  const items = Array.isArray(o.items) ? o.items : [];
  const payTxt = o.pay === 'card' ? 'Card' : o.pay === 'wal' ? 'Wallet'
    : (st() === 'ar' ? 'عند الاستلام' : 'Cash on delivery');
  return `${head(x('order') + ' ' + o.no, fdate(o.d), 'orders')}<div class="acc-wrap">
  <div class="tl">${steps.map((k,i) => `<div class="tl__s ${i <= s + 1 ? 'on' : ''}">
    <span class="tl__d">${IC.tick}</span><span class="tl__t">${esc(x(k))}</span></div>`).join('')}</div>
  <div class="box"><h3>${esc(x('sum'))}</h3>
    ${items.map(i => `<div class="oi">
      <img src="${esc(imgOf(i))}" alt="${esc(i.n)}" loading="lazy">
      <div style="min-width:0"><div class="oi__n">${esc(i.n)}</div>
      <div class="oi__m">${esc(x('size'))}: ${esc(i.size)} × ${esc(i.qty)}${
        okColor(i.color) ? ` · <i class="csw" style="background:${i.color}"></i>` : ''}</div>
      <div class="oi__m">${esc(money(Number(i.price || 0) * Number(i.qty || 0)))}</div></div></div>`).join('')}
    <div class="kv"><span>${esc(x('sub'))}</span><span>${esc(money(o.sub))}</span></div>
    <div class="kv"><span>${esc(x('ship'))}</span><span>${o.ship ? esc(money(o.ship)) : '✓'}</span></div>
    ${o.cod ? `<div class="kv"><span>${esc(x('codf'))}</span><span>${esc(money(o.cod))}</span></div>` : ''}
    <div class="kv big"><span>${esc(x('tot'))}</span><b>${esc(money(o.total))}</b></div></div>
  <div class="box"><h3>${esc(x('dt'))}</h3>
    <div class="kv"><span>${esc(x('nm'))}</span><b>${esc(o.nm)}</b></div>
    <div class="kv"><span>${esc(x('ph'))}</span><b style="direction:ltr">${esc(o.ph)}</b></div>
    <div class="kv"><span>${esc(x('gov'))}</span><b>${esc(o.gov)}</b></div>
    <div class="kv"><span>${esc(x('addr'))}</span><b style="text-align:end">${esc(o.addr)}</b></div>
    <div class="kv"><span>${esc(x('pay'))}</span><b>${esc(payTxt)}</b></div>
    ${o.notes ? `<div class="kv"><span>${esc(x('notes'))}</span><b style="text-align:end">${esc(o.notes)}</b></div>` : ''}
  </div></div>`;
}

function vAddr(){
  return `${head(x('addrs'),'','home')}<div class="acc-wrap">
  ${AD.length ? AD.map((a,i) => `<div class="adr ${a.def ? 'def' : ''}">
    ${a.def ? `<span class="adr__tag">${esc(x('def'))}</span>` : ''}
    <div class="adr__l">${esc(a.lab || x('addr'))}</div>
    <div class="adr__x">${esc(gname(a.gov))} · ${esc([a.area,a.street,a.bld,a.apt].filter(Boolean).join(' · '))}</div>
    <div class="adr__a"><button type="button" data-ae="${i}">${esc(x('edit'))}</button>
      ${a.def ? '' : `<button type="button" data-ad="${i}">${esc(x('set_def'))}</button>`}
      <button type="button" data-ax="${i}">${esc(x('del'))}</button></div></div>`).join('')
   : `<p class="empty" style="padding:26px 0">${esc(x('no_adr'))}</p>`}
  <button class="btn-ghost" type="button" data-anew style="margin-top:12px">+ ${esc(x('add_a'))}</button></div>`;
}

function vAddrForm(){
  const a = edit || {};
  return `${head(edit && edit.i > -1 ? x('ed_a') : x('add_a'), '', 'addr')}<div class="acc-wrap">
  <form class="acc-form" id="adrForm" novalidate>
    ${fld('lab', x('lab'), a.lab, false)}
    <div class="fld"><select class="co-sel ${errs.gov ? 'err' : ''}" id="gov" aria-label="${esc(x('gov'))}">
      <option value="">${esc(x('pick'))}</option>
      ${GOV.map(g => `<option value="${g[0]}" ${g[0] === a.gov ? 'selected' : ''}>${esc(st() === 'ar' ? g[2] : g[1])}</option>`).join('')}
    </select>${errs.gov ? `<p class="co-err">${esc(errs.gov)}</p>` : ''}</div>
    <div class="co-two">${fld('area', x('area'), a.area, true)}${fld('bld', x('bld'), a.bld, true)}</div>
    <div class="co-two">${fld('street', x('street'), a.street, true)}${fld('apt', x('apt'), a.apt, false)}</div>
    <button class="btn-primary" type="submit"><span>${esc(x('save'))}</span></button>
  </form></div>`;
}

function vLoyalty(){
  const p = points(), t = tierNow(), n = tierNext();
  const pct = n ? Math.min(100, Math.round(((p - t[0]) / (n[0] - t[0])) * 100)) : 100;
  const log = ORD.slice().reverse().filter(o => ptsOf(o) > 0);
  return `${head(x('loyalty'),'', U ? 'home' : 'welcome')}<div class="acc-wrap">
  <div class="loy-card">
    <span>${esc(x('tier'))}: <b>${esc(tName(t))}</b></span>
    <b class="loy-pts">${p} <small>${esc(x('pts'))}</small></b>
    ${n ? `<div class="loy-bar"><i style="width:${pct}%"></i></div>
      <small>${n[0] - p} ${esc(x('pts'))} ${esc(x('next_t'))} (${esc(tName(n))})</small>` : ''}
  </div>
  <p class="loy-h2">${esc(x('loy_h'))}</p>
  <ul class="loy-ul"><li>${esc(x('loy_1'))}</li><li>${esc(x('loy_2'))}</li><li>${esc(x('loy_3'))}</li></ul>
  <p class="loy-h2">${esc(x('act'))}</p>
  <div class="loy-log">${log.length ? log.map(o => `<div class="loy-li">
      <i class="sg up">+</i><span class="tx">${esc(x('earned'))} · ${esc(o.no)}</span>
      <span class="dt">${esc(fdate(o.d))}</span><b>+${ptsOf(o)}</b></div>`).join('')
    : `<div class="loy-li"><span class="tx">${esc(x('no_act'))}</span></div>`}</div></div>`;
}

function vWish(){
  const ids = wishArr();
  const list = catalog().filter(p => ids.includes(p.id));
  const cards = (typeof A.cardHTML === 'function') ? list.map(A.cardHTML).join('') : '';
  return `${head(x('wish'),'', U ? 'home' : 'welcome')}<div class="acc-wrap">
  ${list.length && cards ? `<div class="rel-grid">${cards}</div>` : empty(x('no_w'), x('no_w_s'))}</div>`;
}

function vTrack(){
  const o = trk && typeof trk === 'object' ? trk : null;
  const s = o ? stat(o) : 0, steps = ['t_new','t_cnf','t_ship','t_done'];
  return `${head(x('track'),'', U ? 'home' : 'welcome')}<div class="acc-wrap">
  <p class="co-p">${esc(x('tr_p'))}</p>
  <form class="acc-form" id="trkForm" novalidate>${fld('no', x('tr_no'), o ? o.no : '', true)}
    <button class="btn-primary" type="submit"><span>${esc(x('find'))}</span></button></form>
  ${trk === false ? `<p class="co-err" style="margin-top:12px">${esc(x('tr_x'))}</p>` : ''}
  ${o ? `<div class="box" style="margin-top:18px"><h3>${esc(o.no)} · ${esc(fdate(o.d))}</h3>
    <div class="tl" style="margin-bottom:0">${steps.map((k,i) => `<div class="tl__s ${i <= s + 1 ? 'on' : ''}">
      <span class="tl__d">${IC.tick}</span><span class="tl__t">${esc(x(k))}</span></div>`).join('')}</div>
    <div class="kv big"><span>${esc(x('tot'))}</span><b>${esc(money(o.total))}</b></div></div>` : ''}</div>`;
}

/* ---------- الرسم ---------- */
function keepDraft(){
  draft = {};
  box.querySelectorAll('input[id], select[id]').forEach(el => { draft[el.id] = el.value; });
}
function putDraft(){
  Object.keys(draft).forEach(id => {
    const el = document.getElementById(id);
    if(el && !el.value) el.value = draft[id];
  });
}

function paint(){
  if(!U && !['welcome','info','track','wish','loyalty'].includes(V)) V = 'welcome';
  document.title = 'Velora — ' + x('ttl');

  let v;
  if(V === 'welcome')       v = vWelcome();
  else if(V === 'info')     v = vInfo();
  else if(V === 'orders')   v = vOrders();
  else if(V === 'order')    v = vOrder();
  else if(V === 'addr')     v = vAddr();
  else if(V === 'addrform') v = vAddrForm();
  else if(V === 'wish')     v = vWish();
  else if(V === 'track')    v = vTrack();
  else if(V === 'loyalty')  v = vLoyalty();
  else                      v = vHome();

  const side = sideHTML();
  box.dataset.v = V;
  box.classList.toggle('has-side', !!side);
  box.innerHTML = side ? `${side}<div class="acc-main">${v}</div>` : v;
  putDraft();
  writeURL();
}

/* ---------- الأحداث ---------- */
box.addEventListener('click', e => {
  const gb = e.target.closest('[data-gen]');
  if(gb){
    gsel = gsel === gb.dataset.gen ? '' : gb.dataset.gen;
    gb.parentNode.querySelectorAll('[data-gen]').forEach(b => b.classList.toggle('on', b === gb && gsel !== ''));
    return;
  }
  if(e.target.closest('#langRow')){ const b = document.getElementById('langBtn'); if(b) b.click(); return; }

  const g = e.target.closest('[data-go]');
  if(g){ keepDraft(); go(g.dataset.go); return; }

  const o = e.target.closest('[data-ord]');
  if(o){ cur = ORD.find(v => String(v.no) === o.dataset.ord) || null; go('order'); return; }

  if(e.target.closest('#accClear')){
    if(!window.confirm(x('clear_q'))) return;
    try{ [UK,ADK,OK,FK].forEach(k => localStorage.removeItem(k)); }catch(err){}
    U = null; AD = []; ORD = []; toast(x('cleared')); go('welcome'); return;
  }

  if(e.target.closest('[data-anew]')){ edit = { i:-1 }; go('addrform'); return; }

  const ae = e.target.closest('[data-ae]');
  if(ae){ const i = +ae.dataset.ae; edit = Object.assign({ i }, AD[i]); go('addrform'); return; }

  const ad = e.target.closest('[data-ad]');
  if(ad){
    const k = +ad.dataset.ad;
    AD = AD.map((a,i) => Object.assign({}, a, { def:i === k }));
    if(!wr(ADK, AD)) toast(x('demo'));
    const a = AD.find(v => v.def);
    if(a) mirror({ gov:a.gov, area:a.area, street:a.street, bld:a.bld, apt:a.apt || '' });
    paint(); return;
  }

  const ax = e.target.closest('[data-ax]');
  if(ax){
    if(!window.confirm(x('del_q'))) return;
    AD.splice(+ax.dataset.ax, 1);
    if(AD.length && !AD.some(a => a.def)) AD[0].def = true;
    wr(ADK, AD); paint(); return;
  }

  if(e.target.closest('[data-wish]')) setTimeout(() => { if(V === 'wish' || V === 'home') paint(); }, 60);
});

box.addEventListener('submit', e => {
  const f = e.target;
  e.preventDefault();
  errs = {};

  if(f.id === 'infoForm'){
    const isNew = !U;
    const nm = val('nm'), ph = val('ph'), em = val('em').toLowerCase();
    if(nm.length < 3) errs.nm = x('e_nm');
    if(!/^01\d{9}$/.test(digits(ph))) errs.ph = x('e_ph');
    if(em && !/^\S+@\S+\.\S+$/.test(em)) errs.em = x('e_em');
    if(Object.keys(errs).length){ keepDraft(); paint(); return toast(errs[Object.keys(errs)[0]]); }

    U = Object.assign({}, U || {}, {
      nm, ph, em, dob:val('dob'),
      gen: gsel !== null ? gsel : ((U && U.gen) || ''),
      d: (U && U.d) || Date.now()
    });
    delete U.p;
    if(!wr(UK, U)) toast(x('demo'));
    gsel = null;
    mirror({ nm:U.nm, ph:U.ph, em:U.em });
    toast(isNew ? x('made') : x('saved'));
    return go('home');
  }

  if(f.id === 'adrForm'){
    if(!val('gov')) errs.gov = x('e_gov');
    ['area','street','bld'].forEach(k => { if(!val(k)) errs[k] = x('e_ad'); });
    if(Object.keys(errs).length){ keepDraft(); paint(); return toast(errs[Object.keys(errs)[0]]); }

    const a = { lab:val('lab'), gov:val('gov'), area:val('area'), street:val('street'),
                bld:val('bld'), apt:val('apt'),
                def: edit && edit.i > -1 ? !!(AD[edit.i] && AD[edit.i].def) : !AD.length };
    if(edit && edit.i > -1) AD[edit.i] = a; else AD.push(a);
    if(!AD.some(v => v.def)) AD[0].def = true;
    if(!wr(ADK, AD)) toast(x('demo'));
    const dd = AD.find(v => v.def);
    if(dd) mirror({ gov:dd.gov, area:dd.area, street:dd.street, bld:dd.bld, apt:dd.apt || '' });
    edit = null; toast(x('saved'));
    return go('addr');
  }

  if(f.id === 'trkForm'){
    const q = val('no').toUpperCase();
    trk = ORD.find(o => String(o.no).toUpperCase() === q) || false;
    paint(); return;
  }
});

/* ---------- التزامن ---------- */
window.VELORA = window.VELORA || {};
const prevOnLang = window.VELORA.onLang;
window.VELORA.onLang = function(){
  if(typeof prevOnLang === 'function'){ try{ prevOnLang.apply(this, arguments); }catch(e){} }
  keepDraft(); paint();
};
document.addEventListener('velora:lang', () => { keepDraft(); paint(); });
document.addEventListener('velora:cur',  () => paint());
document.addEventListener('velora:wish', () => { if(V === 'wish' || V === 'home') paint(); });
window.addEventListener('popstate', () => { readURL(); paint(); });

const yr = document.getElementById('yr');
if(yr) yr.textContent = new Date().getFullYear();

readURL();
paint();
})();
