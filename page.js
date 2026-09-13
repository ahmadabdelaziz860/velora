/* Velora — صفحات المحتوى (page.js)
   page.html?p=about | contact | shipping | returns | help | privacy */
(() => {
'use strict';

/* =======================================================
   إعدادات مكان واحد
   ======================================================= */
const HOME = 'velora.html';
const SHOP = 'shop.html';
const SITE = 'https://velora.example';   /* بدّل الدومين ببتاعك */
const WA_FALLBACK = '201000000000';      /* احتياطي فقط لو الملف الرئيسي مش شغال */
const MSGS = 'velora_msgs';
const MSGS_MAX = 50;

const box = document.getElementById('pg');
if(!box) return;

const api = () => (window.VELORA && window.VELORA.api) || null;

/* الرقم من الملف الرئيسي أولًا — مصدر واحد */
const waNum = () => {
  const A = api();
  const n = (A && (A.WA || A.wa)) || (window.CFG && window.CFG.WA) || WA_FALLBACK;
  return String(n).replace(/\D/g,'');
};
const waLink = (msg) =>
  'https://wa.me/' + waNum() + (msg ? '?text=' + encodeURIComponent(msg) : '');

/* =======================================================
   اللغة
   ======================================================= */
function guessLang(){
  const A = api();
  if(A && typeof A.lang === 'function'){
    const v = A.lang();
    if(v === 'ar' || v === 'en') return v;
  }
  const h = (document.documentElement.getAttribute('lang') || '').slice(0,2).toLowerCase();
  if(h === 'ar' || h === 'en') return h;
  try{
    for(let i = 0; i < localStorage.length; i++){
      const k = localStorage.key(i);
      if(!k || !/lang/i.test(k)) continue;
      const v = String(localStorage.getItem(k) || '').replace(/"/g,'').slice(0,2).toLowerCase();
      if(v === 'ar' || v === 'en') return v;
    }
  }catch(e){}
  return (navigator.language || '').slice(0,2).toLowerCase() === 'ar' ? 'ar' : 'en';
}

let lang = guessLang();
const L = (o) => {
  if(o == null) return '';
  if(typeof o === 'string') return o;
  const v = o[lang];
  return (v === undefined || v === null) ? (o.en || '') : v;
};

const UI = {
  ar:{home:'الرئيسية',nf:'الصفحة غير موجودة',
      nfp:'الرابط اللي فتحته مش موجود أو اتغيّر.',backHome:'العودة للرئيسية',
      name:'الاسم',email:'البريد الإلكتروني',subject:'الموضوع',msg:'رسالتك',
      send:'إرسال',sendWa:'إرسال على واتساب',
      sent:'وصلتنا رسالتك، وهنرد عليك في أقرب وقت.',
      req:'من فضلك املأ الاسم والبريد والرسالة.',
      bad:'من فضلك اكتب بريد إلكتروني صحيح.',
      full:'مساحة التخزين ممتلئة، ابعت الرسالة على واتساب.',
      wa:'مساعدة سريعة على واتساب'},
  en:{home:'Home',nf:'Page not found',
      nfp:'The link you opened does not exist or has changed.',backHome:'Back to home',
      name:'Name',email:'Email',subject:'Subject',msg:'Your message',
      send:'Send',sendWa:'Send on WhatsApp',
      sent:'We received your message and will reply shortly.',
      req:'Please fill in name, email and message.',
      bad:'Please enter a valid email address.',
      full:'Storage is full, please send via WhatsApp.',
      wa:'Quick help on WhatsApp'}
};
const t = (k) => (UI[lang] || UI.en)[k] || k;

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const strip = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g,'').trim();

/* =======================================================
   محتوى الصفحات — عدّل النصوص زي ما تحب
   ======================================================= */
const PAGES = {

about:{
  title:{ar:'من نحن',en:'About Us'},
  lead:{ar:'ڤيلورا علامة أزياء نسائية بدأت بفكرة بسيطة: قطع أنيقة تقدر تلبسيها كل يوم، بجودة تستحق سعرها.',
        en:'Velora is a womenswear label built on one simple idea: elegant pieces you can actually wear every day, at a quality worth its price.'},
  blocks:[
    {t:'h',v:{ar:'قصتنا',en:'Our story'}},
    {t:'p',v:{ar:'بدأنا كمشروع صغير بعدد محدود من القطع، وكان التركيز على التفاصيل: الخامة، القَصّة، وراحة اللبس. مع الوقت كبرت العائلة وبقى عندنا مجموعات كاملة، لكن نفس المعيار لسه هو الأساس في كل قطعة بننتجها.',
              en:'We started small with a handful of pieces, focused on the details that matter: fabric, cut, and how it feels to wear. The collections grew, but the standard behind every single piece never changed.'}},
    {t:'h',v:{ar:'اللي بنهتم بيه',en:'What we care about'}},
    {t:'ul',v:{ar:['خامات مختارة بعناية وتتحمل الاستخدام اليومي','قَصّات مدروسة تناسب أجسام حقيقية ومقاسات واقعية','أسعار واضحة من غير مبالغة','خدمة عملاء بترد وبتحل، مش بتأجّل'],
               en:['Carefully selected fabrics made for daily wear','Thoughtful cuts for real bodies and realistic sizing','Honest pricing with no inflated markups','Support that actually answers and solves']}},
    {t:'h',v:{ar:'وعدنا',en:'Our promise'}},
    {t:'p',v:{ar:'لو قطعة وصلتك وهي مش زي ما توقعت، عندك حق الاسترجاع أو الاستبدال بسهولة. هدفنا إنك ترجعي تشتري تاني عن اقتناع، مش عن مرة واحدة.',
              en:'If a piece is not what you expected, returning or exchanging it is straightforward. We would rather earn a second order than push a single sale.'}},
    {t:'btn',v:{ar:'تسوّق الآن',en:'Shop now'},href:SHOP}
  ]
},

shipping:{
  title:{ar:'الشيبنج والتوصيل',en:'Shipping & Delivery'},
  lead:{ar:'بنشحن لكل المحافظات، وكل أوردر بيتم تجهيزه ومراجعته قبل الشحن.',
        en:'We ship nationwide, and every order is checked before it leaves us.'},
  blocks:[
    {t:'h',v:{ar:'مدة التوصيل',en:'Delivery time'}},
    {t:'ul',v:{ar:['القاهرة والجيزة: من يوم لـ ٣ أيام عمل','باقي المحافظات: من ٢ لـ ٥ أيام عمل','الأوردرات اللي بتتأكد بعد ٦ مساءً بتتجهّز في يوم العمل اللي بعده'],
               en:['Cairo & Giza: 1–3 business days','Other governorates: 2–5 business days','Orders confirmed after 6 PM are processed the next business day']}},
    {t:'h',v:{ar:'مصاريف الشحن',en:'Shipping cost'}},
    {t:'p',v:{ar:'مصاريف الشحن بتظهر بالتفصيل قبل تأكيد الأوردر، وبتحسب على حسب المحافظة. الشحن مجاني على الأوردرات اللي بتوصل للحد المعلَن فوق في الشريط.',
              en:'Shipping is calculated by governorate and shown clearly before you confirm. Orders above the threshold announced in the top bar ship free.'}},
    {t:'h',v:{ar:'تتبع الأوردر',en:'Tracking your order'}},
    {t:'p',v:{ar:'بعد الشحن هتوصلك رسالة برقم التتبع. ولو عايز تعرف الحالة في أي وقت، ابعتلنا رقم الأوردر على واتساب ونقولك فورًا.',
              en:'Once shipped you receive a tracking number. For an instant update, send us your order number on WhatsApp.'}},
    {t:'wabtn',v:{ar:'اسأل عن أوردرك على واتساب',en:'Ask about your order on WhatsApp'},
     msg:{ar:'السلام عليكم، عايز أعرف حالة أوردر رقم: ',en:'Hi! I would like to track my order number: '}},
    {t:'h',v:{ar:'الدفع عند الاستلام',en:'Cash on delivery'}},
    {t:'p',v:{ar:'الدفع عند الاستلام متاح، ومسموح بمعاينة الأوردر قبل الدفع في حدود سياسة شركة الشحن.',
              en:'Cash on delivery is available, and inspection before payment is allowed within the courier’s policy.'}}
  ]
},

returns:{
  title:{ar:'الاسترجاع والاستبدال',en:'Returns & Exchanges'},
  lead:{ar:'عندك ١٤ يوم من تاريخ الاستلام تطلب استرجاع أو استبدال أي قطعة.',
        en:'You have 14 days from delivery to request a return or an exchange.'},
  blocks:[
    {t:'h',v:{ar:'شروط القبول',en:'Conditions'}},
    {t:'ul',v:{ar:['القطعة تكون بحالتها الأصلية وغير مستخدمة ومعاها التاج','الملابس الداخلية والأقراط لا تُسترجع لأسباب صحية','القطع المخفّضة بنسبة كبيرة يتم استبدالها فقط','لازم يكون معاك فاتورة الأوردر أو رقمه'],
               en:['The item is unused, in original condition, with tags attached','Underwear and earrings are non-returnable for hygiene reasons','Heavily discounted items are eligible for exchange only','The order invoice or order number is required']}},
    {t:'h',v:{ar:'إزاي بيحصل',en:'How it works'}},
    {t:'ul',v:{ar:['تقدّم طلب الاسترجاع من الموقع برقم الأوردر وسبب الاسترجاع','بنراجع الطلب ونتواصل معاك لتحديد ميعاد الاستلام','يتم فحص القطعة عند وصولها','الاستبدال بيتحسب فورًا، والاسترجاع المالي بيتم في ٥ إلى ٧ أيام عمل'],
               en:['Submit your request on the site with your order number and reason','We review it and contact you to schedule pickup','The item is inspected on arrival','Exchanges ship immediately, refunds are issued within 5–7 business days']}},
    {t:'p',v:{ar:'ملحوظة: في حالة عيب في التصنيع بنتحمّل مصاريف الشحن بالكامل.',
              en:'Note: in case of a manufacturing defect, we cover the full shipping cost.'}},
    {t:'btn',v:{ar:'ابدأ طلب استرجاع أو استبدال',en:'Start a return or exchange'},href:'returns.html'}
  ]
},

help:{
  title:{ar:'مركز المساعدة',en:'Help Center'},
  lead:{ar:'أسرع الأسئلة وأجوبتها. لو ملقيتش اللي بتدور عليه، كلمنا في أي وقت.',
        en:'The quick answers. If you cannot find what you need, just reach out.'},
  blocks:[
    {t:'qa',v:[
      {q:{ar:'إزاي أعرف مقاسي الصح؟',en:'How do I find my size?'},
       a:{ar:'في كل صفحة منتج فيه دليل مقاسات بالسنتيمتر. قيسي قطعة عندك مريحة عليك وقارني بالجدول، وده أدق من الاعتماد على المقاس المعتاد.',
          en:'Every product page includes a size guide in centimetres. Measure a piece you already own and compare, it is more accurate than guessing your usual size.'}},
      {q:{ar:'طرق الدفع المتاحة إيه؟',en:'Which payment methods do you accept?'},
       a:{ar:'الدفع بالكارت، والمحافظ الإلكترونية، والدفع عند الاستلام.',
          en:'Card payments, mobile wallets, and cash on delivery.'}},
      {q:{ar:'أقدر أعدّل أو ألغي الأوردر؟',en:'Can I edit or cancel my order?'},
       a:{ar:'أيوه، قبل ما يتحوّل لحالة «تم الشحن». كلمنا بأسرع وقت برقم الأوردر ونتصرف.',
          en:'Yes, as long as it has not moved to “shipped”. Contact us with your order number as soon as possible.'}},
      {q:{ar:'إزاي أستخدم كود الخصم؟',en:'How do I use a discount code?'},
       a:{ar:'قبل تأكيد الأوردر فيه خانة كود الخصم، اكتب الكود واضغط تطبيق، والخصم هيظهر في الملخص فورًا.',
          en:'Before confirming your order there is a discount code field. Enter the code and apply it, the summary updates instantly.'}},
      {q:{ar:'القطعة اللي عايزها مش متوفرة، أعمل إيه؟',en:'The item I want is out of stock, what now?'},
       a:{ar:'ضيفها في المفضلة، وأول ما ترجع للمخزن هنبلّغك.',
          en:'Add it to your wishlist and we will notify you as soon as it is back.'}}
    ]},
    {t:'btn',v:{ar:'تواصل معنا',en:'Contact us'},href:'page.html?p=contact'}
  ]
},

privacy:{
  title:{ar:'سياسة الخصوصية',en:'Privacy Policy'},
  lead:{ar:'بياناتك ملكك. الصفحة دي بتوضّح بالظبط بناخد إيه، وليه، وإزاي بنحميه.',
        en:'Your data is yours. This page explains exactly what we collect, why, and how we protect it.'},
  blocks:[
    {t:'h',v:{ar:'البيانات اللي بنجمعها',en:'What we collect'}},
    {t:'ul',v:{ar:['الاسم ورقم الموبايل والعنوان لتنفيذ الأوردر وتوصيله','البريد الإلكتروني للتواصل وإرسال حالة الأوردر','بيانات استخدام الموقع بشكل مجمّع لتحسين التجربة'],
               en:['Name, phone and address to fulfil and deliver your order','Email to contact you and send order updates','Aggregated usage data to improve the experience']}},
    {t:'h',v:{ar:'بيانات الدفع',en:'Payment data'}},
    {t:'p',v:{ar:'إحنا مش بنحفظ بيانات الكارت. عمليات الدفع بتتم عن طريق مزوّد دفع معتمد وبيانات الكارت بتروح له مباشرة.',
              en:'We never store card details. Payments are handled directly by a certified payment provider.'}},
    {t:'h',v:{ar:'التخزين على جهازك',en:'Local storage & cookies'}},
    {t:'p',v:{ar:'بنحفظ على متصفحك سلة الشراء والمفضلة واللغة والعملة المختارة فقط. تقدر تمسحها من إعدادات المتصفح، لكن ساعتها بعض المزايا مش هتشتغل زي ما هي.',
              en:'We store only your cart, wishlist, language and currency in your browser. You can clear them from your browser settings, though some features will stop working as intended.'}},
    {t:'h',v:{ar:'المشاركة مع أطراف تانية',en:'Sharing with third parties'}},
    {t:'p',v:{ar:'بنشارك العنوان والموبايل مع شركة الشحن بس، وبالحد اللازم لتسليم الأوردر. مفيش بيع أو تأجير لبياناتك لأي طرف.',
              en:'We share your address and phone with the courier only, and only as needed to deliver. We never sell or rent your data.'}},
    {t:'h',v:{ar:'حقوقك',en:'Your rights'}},
    {t:'p',v:{ar:'تقدر تطلب في أي وقت نسخة من بياناتك أو تعديلها أو حذفها بالكامل، وبنستجيب في مدة لا تزيد عن ١٤ يوم.',
              en:'You may request a copy of your data, correct it, or delete it entirely. We respond within 14 days.'}},
    {t:'btn',v:{ar:'تواصل معنا',en:'Contact us'},href:'page.html?p=contact'}
  ]
},

contact:{
  title:{ar:'تواصل معنا',en:'Contact Us'},
  lead:{ar:'اكتب لنا وهنرد عليك في العادة في نفس يوم العمل.',
        en:'Send us a message. We usually reply the same business day.'},
  blocks:[
    {t:'form'},
    {t:'h',v:{ar:'طرق تواصل تانية',en:'Other ways to reach us'}},
    {t:'ul',v:{ar:['البريد: support@velora.com','ساعات العمل: من السبت للخميس، ١٠ صباحًا لـ ٦ مساءً'],
               en:['Email: support@velora.com','Hours: Saturday to Thursday, 10 AM – 6 PM']}},
    {t:'wa'}
  ]
}

};

const ALIAS = {faq:'help', support:'help', delivery:'shipping', shipment:'shipping',
               refund:'returns', exchange:'returns', policy:'privacy', us:'about',
               track:'shipping', orders:'shipping'};

/* =======================================================
   بناء الصفحة
   ======================================================= */
function fillWa(root){
  (root || document).querySelectorAll('[data-wa]').forEach(a => {
    a.setAttribute('href', waLink(a.getAttribute('data-wa-msg') || ''));
    a.setAttribute('target','_blank');
    a.setAttribute('rel','noopener noreferrer');
  });
}

let DRAFT = {};
function grabDraft(){
  const f = document.getElementById('pgForm');
  if(!f) return;
  DRAFT = {};
  new FormData(f).forEach((v,k) => { DRAFT[k] = v; });
}
function putDraft(){
  const f = document.getElementById('pgForm');
  if(!f) return;
  Object.keys(DRAFT).forEach(k => {
    const el = f.elements[k];
    if(el && 'value' in el) el.value = DRAFT[k];
  });
}

function formHTML(){
  return '<form class="pg-form" id="pgForm" novalidate>'
    + '<label>' + esc(t('name')) + '<input name="name" type="text" autocomplete="name" required></label>'
    + '<label>' + esc(t('email')) + '<input name="email" type="email" autocomplete="email" inputmode="email" required></label>'
    + '<label>' + esc(t('subject')) + '<input name="subject" type="text"></label>'
    + '<label>' + esc(t('msg')) + '<textarea name="msg" rows="5" required></textarea></label>'
    + '<div class="pg-form__row">'
      + '<button class="pg-btn" type="submit">' + esc(t('send')) + '</button>'
      + '<button class="pg-btn pg-btn--wa" type="button" id="pgWa">' + esc(t('sendWa')) + '</button>'
    + '</div>'
    + '<p class="pg-note" id="pgOk" role="status" aria-live="polite" hidden></p>'
    + '</form>';
}

function blockHTML(b){
  switch(b.t){
    case 'h': return '<h2>' + L(b.v) + '</h2>';
    case 'p': return '<p>' + L(b.v) + '</p>';
    case 'ul': {
      const a = L(b.v);
      return Array.isArray(a) ? '<ul>' + a.map(i => '<li>' + i + '</li>').join('') + '</ul>' : '';
    }
    case 'btn':
      return '<a class="pg-btn" href="' + esc(b.href || '#') + '">' + L(b.v) + '</a>';
    case 'wabtn':
      return '<a class="pg-btn pg-btn--wa" data-wa data-wa-msg="' + esc(L(b.msg))
           + '" href="' + esc(waLink(L(b.msg))) + '">' + L(b.v) + '</a>';
    case 'qa': {
      const a = Array.isArray(b.v) ? b.v : [];
      return '<div class="pg-qa">' + a.map(i =>
        '<details><summary>' + L(i.q) + '</summary><div class="a">' + L(i.a) + '</div></details>'
      ).join('') + '</div>';
    }
    case 'wa':
      return '<a class="pg-wa" data-wa href="' + esc(waLink()) + '">' + esc(t('wa')) + '</a>';
    case 'form': return formHTML();
  }
  return '';
}

function pageKey(){
  let k = '';
  try{ k = new URLSearchParams(location.search).get('p') || ''; }catch(e){}
  k = String(k).trim().toLowerCase();
  if(!k) k = 'about';
  return ALIAS[k] || k;
}

function setMeta(name, val){
  const m = document.querySelector('meta[name="' + name + '"]');
  if(m) m.setAttribute('content', val);
}

function paint(){
  grabDraft();
  lang = guessLang();

  const key = pageKey();
  const P = PAGES[key];
  const canon = document.getElementById('pgCanon');

  if(!P){
    document.title = 'Velora — ' + t('nf');
    setMeta('robots','noindex,follow');
    setMeta('description', t('nfp'));
    box.innerHTML = '<h1 class="pg-title">' + esc(t('nf')) + '</h1>'
      + '<p class="pg-lead">' + esc(t('nfp')) + '</p>'
      + '<a class="pg-btn" href="' + esc(HOME) + '">' + esc(t('backHome')) + '</a>';
    return;
  }

  document.title = 'Velora — ' + strip(L(P.title));
  setMeta('robots','index,follow');
  if(P.lead) setMeta('description', strip(L(P.lead)));
  if(canon) canon.setAttribute('href', SITE + '/page.html?p=' + key);

  box.innerHTML =
    '<p class="pg-crumb"><a href="' + esc(HOME) + '">' + esc(t('home')) + '</a> / ' + L(P.title) + '</p>'
    + '<h1 class="pg-title">' + L(P.title) + '</h1>'
    + (P.lead ? '<p class="pg-lead">' + L(P.lead) + '</p>' : '')
    + (Array.isArray(P.blocks) ? P.blocks.map(blockHTML).join('') : '');

  fillWa(box);
  putDraft();
}

/* =======================================================
   فورم التواصل
   ======================================================= */
function readForm(f){
  const d = new FormData(f);
  return {
    name:String(d.get('name') || '').trim(),
    email:String(d.get('email') || '').trim(),
    subject:String(d.get('subject') || '').trim(),
    msg:String(d.get('msg') || '').trim()
  };
}
function say(txt, bad){
  const ok = document.getElementById('pgOk');
  if(!ok) return;
  ok.hidden = false;
  ok.textContent = txt;
  ok.classList.toggle('is-bad', !!bad);
}
function valid(v){
  if(!v.name || !v.email || !v.msg){ say(t('req'), true); return false; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)){ say(t('bad'), true); return false; }
  return true;
}

box.addEventListener('submit', (ev) => {
  const f = ev.target.closest('#pgForm');
  if(!f) return;
  ev.preventDefault();

  const v = readForm(f);
  if(!valid(v)) return;

  let saved = true;
  try{
    let db = JSON.parse(localStorage.getItem(MSGS) || '[]');
    if(!Array.isArray(db)) db = [];
    db.push({ ...v, at:Date.now() });
    if(db.length > MSGS_MAX) db = db.slice(-MSGS_MAX);
    localStorage.setItem(MSGS, JSON.stringify(db));
  }catch(e){ saved = false; }

  f.reset();
  DRAFT = {};
  say(saved ? t('sent') : t('full'), !saved);
});

box.addEventListener('click', (ev) => {
  const btn = ev.target.closest('#pgWa');
  if(!btn) return;
  const f = document.getElementById('pgForm');
  if(!f) return;
  const v = readForm(f);
  if(!valid(v)) return;
  const body = (v.subject ? v.subject + '\n' : '') + v.msg + '\n— ' + v.name + ' (' + v.email + ')';
  window.open(waLink(body), '_blank', 'noopener');
});

/* =======================================================
   التزامن مع الملف الرئيسي
   ======================================================= */
window.VELORA = window.VELORA || {};
const prevOnLang = window.VELORA.onLang;
window.VELORA.onLang = function(){
  if(typeof prevOnLang === 'function'){ try{ prevOnLang.apply(this, arguments); }catch(e){} }
  paint();
};

document.addEventListener('velora:lang', paint);
document.addEventListener('velora:ready', paint, { once:true });
window.addEventListener('popstate', paint);

const yr = document.getElementById('yr');
if(yr) yr.textContent = new Date().getFullYear();

paint();
})();
