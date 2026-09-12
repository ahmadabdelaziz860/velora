/* Velora — Returns & Exchange */
(()=>{
'use strict';
const A=(window.VELORA||{}).api;
if(!A){ console.warn('velora.js api missing'); return; }
const box=document.getElementById('ret');
if(!box) return;
document.body.classList.add('is-ret');
const st=()=>A.lang();

const WIN=14;        /* مدة الاسترجاع بالأيام */
const BONUS=0.05;    /* مكافأة رصيد المتجر */

const T={
en:{ttl:'Returns & Exchange',s1:'Select Order',s2:'Select Items',s3:'Reason',
 next:'Continue',back:'Back',submit:'Submit request',change:'Change',
 deliv:'Delivered',out:'Outside '+WIN+' days',proc:'Not delivered yet',
 note1:'Only delivered orders are eligible. Items must be in original condition.',
 items:'items',total:'Total',ordered:'Ordered',size:'Size',qty:'Qty',
 no_ord:'No eligible orders',no_ord_s:'You can request a return after an order is delivered.',
 go:'Go to shop',login_h:'Sign in first',
 login_p:'You need an account to request a return or an exchange.',signin:'Sign in',
 pick2:'Select items to return or exchange',
 type:'What do you want?',t_ret:'Refund',t_exc:'Exchange',nsize:'New size',
 why:'Why are you returning these items?',
 r_size:'Wrong size',r_dmg:'Damaged on arrival',r_item:'Wrong item',
 r_mind:'Changed my mind',r_qual:'Quality not as expected',r_other:'Other',
 extra:'Additional details (optional)',photos:'Add photos (optional)',pn:'selected',
 method:'Refund method',m_orig:'Original payment',m_cr:'Store credit',bonus:'+5% bonus',
 sum:'Summary',refund:'Refund',credit:'Store credit',
 e_ord:'Choose an order first',e_item:'Choose at least one item',
 e_why:'Choose a reason',e_size:'Choose the new size',
 done_h:'Request received',done_p:'We will review it and contact you to schedule pickup.',
 req:'Request',mine:'Previous requests',newreq:'New request',
 st_new:'Under review',cr_p:'Use this code at checkout:'},
ar:{ttl:'الاسترجاع والاستبدال',s1:'اختر الطلب',s2:'اختر القطع',s3:'السبب',
 next:'متابعة',back:'رجوع',submit:'إرسال الطلب',change:'تغيير',
 deliv:'تم التوصيل',out:'مر أكثر من '+WIN+' يوم',proc:'لسه ماوصلش',
 note1:'الطلبات الموصّلة بس هي المؤهلة، والقطعة لازم تكون بحالتها الأصلية.',
 items:'قطعة',total:'الإجمالي',ordered:'تاريخ الطلب',size:'المقاس',qty:'الكمية',
 no_ord:'مفيش طلبات مؤهلة',no_ord_s:'تقدر تطلب استرجاع بعد ما يوصلك طلب.',
 go:'روح للمتجر',login_h:'سجّل دخولك الأول',
 login_p:'محتاج حساب عشان تطلب استرجاع أو استبدال.',signin:'تسجيل الدخول',
 pick2:'اختر القطع اللي عايز ترجّعها أو تستبدلها',
 type:'عايز تعمل إيه؟',t_ret:'استرجاع المبلغ',t_exc:'استبدال',nsize:'المقاس الجديد',
 why:'إيه سبب الإرجاع؟',
 r_size:'المقاس غلط',r_dmg:'وصل تالف',r_item:'قطعة غير اللي طلبتها',
 r_mind:'غيّرت رأيي',r_qual:'الجودة مش زي المتوقع',r_other:'سبب آخر',
 extra:'تفاصيل إضافية (اختياري)',photos:'إضافة صور (اختياري)',pn:'صورة مختارة',
 method:'طريقة الاسترجاع',m_orig:'نفس وسيلة الدفع',m_cr:'رصيد في المتجر',bonus:'+٥٪ مكافأة',
 sum:'الملخص',refund:'المبلغ',credit:'رصيد المتجر',
 e_ord:'اختر الطلب الأول',e_item:'اختر قطعة واحدة على الأقل',
 e_why:'اختر السبب',e_size:'اختر المقاس الجديد',
 done_h:'وصلنا طلبك',done_p:'هنراجعه ونتواصل معاك لتحديد ميعاد الاستلام.',
 req:'طلب',mine:'طلبات سابقة',newreq:'طلب جديد',
 st_new:'قيد المراجعة',cr_p:'استخدم الكود ده في الشيك أوت:'}};
const x=k=>(T[st()]&&T[st()][k])||T.en[k]||k;

const UK='velora_user',OK='velora_orders',RK='velora_returns',CK='velora_coupons';
const rd=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}};
const wr=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const U=rd(UK,null), ORD=rd(OK,[]);
let REQ=rd(RK,[]);

const fdate=ms=>new Date(ms).toLocaleDateString(st()==='ar'?'ar-EG':'en-GB',
  {day:'numeric',month:'short',year:'numeric'});
const days=ms=>(Date.now()-ms)/864e5;
const delivered=o=>days(o.d)>=3;
const eligible=o=>delivered(o)&&days(o.d)<=WIN;
const img=id=>{const p=A.byId(id); const s=Array.isArray(p&&p.img)?p.img[0]:((p&&p.img)||''); return A.U(s,160);};
const sizesOf=id=>((A.byId(id)||{}).sizes)||['S','M','L','XL'];

const IC={back:'<svg viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 cam:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 8.5h2.5L8 6.5h8l1.5 2H20v10H4v-10z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="1.5"/></svg>',
 tick:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5l5 5L20 6.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'};

const S={step:1,ord:null,sel:{},type:'ret',why:'',note:'',method:'orig',photos:0,sizes:{},done:null};

const REASONS=['r_size','r_dmg','r_item','r_mind','r_qual','r_other'];
const selKeys=()=>Object.keys(S.sel).filter(k=>S.sel[k]);
const amount=()=>{ if(!S.ord) return 0;
  return selKeys().reduce((a,k)=>{const i=S.ord.items[+k]; return a+i.price*i.qty;},0); };

function steps(){
  const on=[S.step>=1,S.step>=2,S.step>=3];
  return `<div class="ret-steps">
    <span class="${on[0]?'on':''}">${x('s1')}</span><i>›</i>
    <span class="${on[1]?'on':''}">${x('s2')}</span><i>›</i>
    <span class="${on[2]?'on':''}">${x('s3')}</span></div>`;
}
function head(){
  return `<div class="ret-head">
    <button class="ret-back" id="retBack" aria-label="${x('back')}">${IC.back}</button>
    <h1 class="ret-h1">${x('ttl')}</h1></div>`;
}
function bar(o){
  return `<div class="ret-bar"><div><b>${x('req')} ${o.no}</b>
    <small>${x('ordered')} ${fdate(o.d)} · ${o.items.length} ${x('items')} · ${A.money(o.total)}</small></div>
    <button data-step="1">${x('change')}</button></div>`;
}

/* ---------- 1 ---------- */
function v1(){
  const list=ORD.slice().reverse();
  if(!list.length) return `${head()}${steps()}<div class="ret-empty">
    <b>${x('no_ord')}</b><span>${x('no_ord_s')}</span>
    <a class="pg-btn" href="shop.html">${x('go')}</a></div>`;
  return `${head()}${steps()}
  ${list.map(o=>{
    const ok=eligible(o), tag=!delivered(o)?x('proc'):(ok?x('deliv'):x('out'));
    return `<button class="ret-ord${ok?'':' off'}${S.ord&&S.ord.no===o.no?' on':''}"
      ${ok?`data-ord="${o.no}"`:'disabled'}>
      <span class="ret-ord__t"><b>${o.no}</b><em>${tag}</em></span>
      <span class="ret-thumbs">${o.items.slice(0,4).map(i=>
        `<img src="${img(i.id)}" alt="">`).join('')}</span>
      <span class="ret-ord__f">${o.items.length} ${x('items')} · ${A.money(o.total)}
        <small>${fdate(o.d)}</small></span></button>`;}).join('')}
  <p class="ret-note">${x('note1')}</p>
  <div class="ret-acts"><button class="pg-btn" id="retNext">${x('next')}</button></div>
  ${mine()}`;
}
/* ---------- 2 ---------- */
function v2(){
  const o=S.ord;
  return `${head()}${steps()}${bar(o)}
  <p class="ret-lbl">${x('pick2')}</p>
  ${o.items.map((i,n)=>`<label class="ret-item${S.sel[n]?' on':''}">
    <input type="checkbox" data-sel="${n}" ${S.sel[n]?'checked':''}>
    <span class="ret-chk">${IC.tick}</span>
    <img src="${img(i.id)}" alt="">
    <span class="ret-item__b"><b>${i.n}</b>
      <small>${x('size')}: ${i.size}${i.color?' · ':''}${i.color?`<i class="csw" style="background:${i.color}"></i>`:''}</small>
      <small>${A.money(i.price)} · ${x('qty')}: ${i.qty}</small></span></label>`).join('')}
  <p class="ret-note">${x('note1')}</p>
  <div class="ret-acts"><button class="pg-btn ghost" data-step="1">${x('back')}</button>
    <button class="pg-btn" id="retNext">${x('next')}</button></div>`;
}
/* ---------- 3 ---------- */
function v3(){
  const o=S.ord, amt=amount(), cr=Math.round(amt*(1+BONUS));
  return `${head()}${steps()}${bar(o)}
  <p class="ret-lbl">${x('type')}</p>
  <div class="ret-pay">
    <button data-type="ret" class="${S.type==='ret'?'on':''}">${x('t_ret')}</button>
    <button data-type="exc" class="${S.type==='exc'?'on':''}">${x('t_exc')}</button></div>

  ${S.type==='exc'?`<p class="ret-lbl">${x('nsize')}</p>
    ${selKeys().map(k=>{const i=o.items[+k];
      return `<div class="ret-sz"><span>${i.n}</span>
        <select data-sz="${k}"><option value="">—</option>
        ${sizesOf(i.id).map(s=>`<option ${S.sizes[k]===s?'selected':''}>${s}</option>`).join('')}
        </select></div>`;}).join('')}`:''}

  <p class="ret-lbl">${x('why')}</p>
  <div class="ret-chips">${REASONS.map(r=>
    `<button data-why="${r}" class="${S.why===r?'on':''}">${x(r)}</button>`).join('')}</div>

  <p class="ret-lbl">${x('extra')}</p>
  <textarea class="ret-ta" id="retNote">${S.note}</textarea>

  <p class="ret-lbl">${x('photos')}</p>
  <label class="ret-file">${IC.cam}<input type="file" id="retPh" accept="image/*" multiple hidden>
    <span>${S.photos?S.photos+' '+x('pn'):x('photos')}</span></label>

  ${S.type==='ret'?`<p class="ret-lbl">${x('method')}</p>
  <div class="ret-pay">
    <button data-m="orig" class="${S.method==='orig'?'on':''}">${x('m_orig')}</button>
    <button data-m="cr" class="${S.method==='cr'?'on':''}">${x('m_cr')}<em>${x('bonus')}</em></button>
  </div>`:''}

  <div class="ret-sum"><h3>${x('sum')}</h3>
    <div class="kv"><span>${x('items')}</span><b>${selKeys().length}</b></div>
    <div class="kv big"><span>${S.type==='ret'&&S.method==='cr'?x('credit'):x('refund')}</span>
      <b>${A.money(S.type==='ret'&&S.method==='cr'?cr:amt)}</b></div></div>

  <div class="ret-acts"><button class="pg-btn ghost" data-step="2">${x('back')}</button>
    <button class="pg-btn" id="retSend">${x('submit')}</button></div>`;
}
/* ---------- done ---------- */
function v4(){
  const r=S.done;
  return `${head()}<div class="ret-done"><span class="ret-done__d">${IC.tick}</span>
    <b>${x('done_h')}</b><p>${x('done_p')}</p>
    <p class="ret-code">${x('req')} ${r.no}</p>
    ${r.coupon?`<p class="ret-note">${x('cr_p')}</p><p class="ret-code">${r.coupon}</p>`:''}
    <div class="ret-acts"><a class="pg-btn ghost" href="account.html?v=orders">${x('go')}</a>
      <button class="pg-btn" data-step="1">${x('newreq')}</button></div></div>`;
}
function mine(){
  if(!REQ.length) return '';
  return `<p class="ret-lbl">${x('mine')}</p>
  ${REQ.slice().reverse().map(r=>`<div class="ret-req"><b>${r.no}</b>
    <small>${fdate(r.at)} · ${x(r.type==='exc'?'t_exc':'t_ret')} · ${A.money(r.amount)}</small>
    <em>${x('st_new')}</em></div>`).join('')}`;
}
function vLogin(){
  return `${head()}<div class="ret-empty"><b>${x('login_h')}</b><span>${x('login_p')}</span>
    <a class="pg-btn" href="account.html?v=signin">${x('signin')}</a></div>`;
}

function paint(){
  document.title='Velora — '+x('ttl');
  if(!U){ box.innerHTML=vLogin(); return; }
  box.innerHTML = S.step===4?v4():S.step===3?v3():S.step===2?v2():v1();
  window.scrollTo({top:0});
}

/* ---------- events ---------- */
box.addEventListener('click',e=>{
  const b=e.target.closest('#retBack');
  if(b){ if(S.step>1&&S.step<4) S.step--; else history.length>1?history.back():location.href='page.html?p=returns'; paint(); return; }

  const sp=e.target.closest('[data-step]');
  if(sp){ const n=+sp.dataset.step; if(n===1){S.sel={};S.sizes={};S.why='';S.done=null;} S.step=n; paint(); return; }

  const o=e.target.closest('[data-ord]');
  if(o){ S.ord=ORD.find(v=>v.no===o.dataset.ord); S.sel={}; paint(); return; }

  const ty=e.target.closest('[data-type]');
  if(ty){ S.type=ty.dataset.type; paint(); return; }

  const wy=e.target.closest('[data-why]');
  if(wy){ S.why=wy.dataset.why; paint(); return; }

  const m=e.target.closest('[data-m]');
  if(m){ S.method=m.dataset.m; paint(); return; }

  if(e.target.closest('#retNext')){
    if(S.step===1){ if(!S.ord) return A.toast(x('e_ord'),''); S.step=2; return paint(); }
    if(S.step===2){ if(!selKeys().length) return A.toast(x('e_item'),''); S.step=3; return paint(); }
  }
  if(e.target.closest('#retSend')) send();
});
box.addEventListener('change',e=>{
  const c=e.target.closest('[data-sel]');
  if(c){ S.sel[c.dataset.sel]=c.checked; paint(); return; }
  const z=e.target.closest('[data-sz]');
  if(z){ S.sizes[z.dataset.sz]=z.value; return; }
  const p=e.target.closest('#retPh');
  if(p){ S.photos=p.files.length; paint(); return; }
});
box.addEventListener('input',e=>{ if(e.target.id==='retNote') S.note=e.target.value; });

function send(){
  if(!S.why) return A.toast(x('e_why'),'');
  if(S.type==='exc' && selKeys().some(k=>!S.sizes[k])) return A.toast(x('e_size'),'');
  const amt=amount();
  const r={no:'RT'+String(Date.now()).slice(-6),ord:S.ord.no,at:Date.now(),
    type:S.type,why:S.why,note:S.note,method:S.type==='ret'?S.method:'exc',
    photos:S.photos,amount:amt,status:'new',
    items:selKeys().map(k=>{const i=S.ord.items[+k];
      return {id:i.id,n:i.n,size:i.size,color:i.color||'',qty:i.qty,price:i.price,newSize:S.sizes[k]||''};})};
  if(S.type==='ret'&&S.method==='cr'){
    const code='CR'+Math.random().toString(36).slice(2,7).toUpperCase();
    const cs=rd(CK,[]);
    cs.push({code,value:Math.round(amt*(1+BONUS)),type:'credit',from:r.no,at:Date.now(),used:false});
    wr(CK,cs); r.coupon=code;
  }
  REQ.push(r); wr(RK,REQ);
  S.done=r; S.step=4; paint(); A.toast(x('done_h'));
}

window.VELORA.onLang=paint;
paint();
})();
/* keep scroll position on re-render */
(() => {
  const box = document.getElementById('ret');
  if(!box) return;
  let y = 0, armed = false;

  box.addEventListener('pointerdown', e => {
    if(e.target.closest('[data-next],[data-back],.ret-next,.ret-back')) return;
    y = window.scrollY;
    armed = true;
  }, true);

  new MutationObserver(() => {
    if(!armed) return;
    armed = false;
    window.scrollTo(0, y);
  }).observe(box, { childList:true, subtree:true });
})();

