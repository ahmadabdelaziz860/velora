/* ===== VELORA — Loyalty (v2) ===== */
(()=>{
'use strict';
const A=(window.VELORA||{}).api;
if(!A){ console.warn('velora.js api missing'); return; }
const box=document.querySelector('#loy'); if(!box) return;
document.body.classList.add('is-loy');

/* ---- إعدادات سريعة ---- */
const PER=10, REVIEW_PTS=20, REF_PTS=100;
const TIERS=[{k:'silver',min:0},{k:'gold',min:300},{k:'plat',min:700}];
const LKEY='velora_loyalty', CKEY='velora_coupons', OKEY='velora_orders', RKEY='velora_reviews';

const rd=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
const wr=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const st=()=>A.lang();

const T={
en:{ttl:'Loyalty',pts:'points',since:'Member since',
 silver:'Silver member',gold:'Gold member',plat:'Platinum member',max:'Top tier reached',
 ord:'Orders',rw:'Rewards',rv:'Reviews',avail:'Available rewards',hist:'Points history',
 ship:'Free shipping',off10:'10% off',gift:'Free product',redeem:'Redeem',
 refT:'Refer a friend',refS:'Share your link and earn '+REF_PTS+' points.',share:'Copy link',
 copied:'Link copied',need:'Not enough points',got:'Redeemed · code ',
 eOrd:'Earned +{p} pts · order {r}',eRev:'Earned +{p} pts · review',
 eRed:'Redeemed −{p} pts · {r}',eRef:'Earned +{p} pts · referral',
 emp:'No points yet',empS:'Your first order will start earning points.',go:'Go to shop'},
ar:{ttl:'نقاط الولاء',pts:'نقطة',since:'عضو من',
 silver:'عضو فضي',gold:'عضو ذهبي',plat:'عضو بلاتيني',max:'أعلى مستوى',
 ord:'الطلبات',rw:'المكافآت',rv:'التقييمات',avail:'المكافآت المتاحة',hist:'سجل النقاط',
 ship:'شحن مجاني',off10:'خصم ١٠٪',gift:'منتج مجاني',redeem:'استبدال',
 refT:'ادعُ صديقًا',refS:'شارك رابطك واكسب '+REF_PTS+' نقطة.',share:'نسخ الرابط',
 copied:'تم نسخ الرابط',need:'النقاط غير كافية',got:'تم الاستبدال · الكود ',
 eOrd:'+{p} نقطة · طلب {r}',eRev:'+{p} نقطة · تقييم',
 eRed:'−{p} نقطة · {r}',eRef:'+{p} نقطة · دعوة صديق',
 emp:'مفيش نقاط لسه',empS:'أول طلب هيبدأ يجمّعلك نقاط.',go:'روح للمتجر'}};
const x=k=>(T[st()]&&T[st()][k])||T.en[k]||k;
const fmt=(s,o)=>s.replace(/\{(\w+)\}/g,(m,k)=>o[k]);
const loc=()=>st()==='ar'?'ar-EG-u-nu-latn':'en-GB';
const fday=ms=>new Date(ms||Date.now()).toLocaleDateString(loc(),{day:'numeric',month:'short'});
const fmon=ms=>new Date(ms||Date.now()).toLocaleDateString(loc(),{month:'short',year:'numeric'});

let L=rd(LKEY,null);
if(!L||typeof L.pts!=='number') L={pts:0,since:Date.now(),log:[],ref:''};
if(!Array.isArray(L.log)) L.log=[];
if(!L.ref) L.ref='VL'+Math.random().toString(36).slice(2,7).toUpperCase();

const IC={
back:'<svg viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
star:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 3.6l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.8 1-5.9L3.5 9.8l5.9-.8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
bag:'<svg viewBox="0 0 24 24" fill="none"><path d="M7.5 7.7v-1c0-2.2 1.8-4.4 4.1-4.6 2.7-.3 4.9 1.8 4.9 4.5v1.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M9 22h6c4 0 4.7-1.6 4.9-3.6l.8-6C21 10 20.3 8 16 8H8c-4.3 0-5 2-4.7 4.4l.7 6C4.3 20.4 5 22 9 22z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
gift:'<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="8.5" width="17" height="12" rx="2.4" stroke="currentColor" stroke-width="1.6"/><path d="M12 8.5v12M3.5 13.5h17" stroke="currentColor" stroke-width="1.6"/><path d="M12 8.5S10.8 4 8.6 4a2.3 2.3 0 000 4.5M12 8.5S13.2 4 15.4 4a2.3 2.3 0 010 4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
truck:'<svg viewBox="0 0 24 24" fill="none"><path d="M2.8 7.5h10.4v9H2.8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13.2 10.5h3.6l3.4 3.3v2.7h-7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="6.6" cy="18" r="1.8" stroke="currentColor" stroke-width="1.6"/><circle cx="16.8" cy="18" r="1.8" stroke="currentColor" stroke-width="1.6"/></svg>',
pct:'<svg viewBox="0 0 24 24" fill="none"><path d="M6.5 17.5L17.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="8.2" cy="8.2" r="2.4" stroke="currentColor" stroke-width="1.6"/><circle cx="15.8" cy="15.8" r="2.4" stroke="currentColor" stroke-width="1.6"/></svg>',
link:'<svg viewBox="0 0 24 24" fill="none"><path d="M10.5 13.5a4 4 0 006 .5l2.2-2.2a4 4 0 00-5.7-5.7L11.8 7.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M13.5 10.5a4 4 0 00-6-.5L5.3 12.2a4 4 0 005.7 5.7l1.2-1.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'};

const REWARDS=[
 {id:'ship', cost:200, type:'ship', val:0,  ic:IC.truck},
 {id:'off10',cost:500, type:'pct',  val:10, ic:IC.pct},
 {id:'gift', cost:700, type:'gift', val:0,  ic:IC.gift}];

function sync(){
 const ords=rd(OKEY,[]); if(Array.isArray(ords)) ords.forEach(o=>{
   const ref=o.no||o.id; if(!ref) return;
   if(L.log.some(e=>e.src==='order'&&e.ref===ref)) return;
   const p=Math.floor(Number(o.total||0)/PER); if(p<=0) return;
   L.log.push({t:'+',p,src:'order',ref,d:o.d||Date.now()}); L.pts+=p;
 });
 const revs=rd(RKEY,[]); if(Array.isArray(revs)) revs.forEach((r,i)=>{
   const ref=r.id||('r'+i);
   if(L.log.some(e=>e.src==='review'&&e.ref===ref)) return;
   L.log.push({t:'+',p:REVIEW_PTS,src:'review',ref,d:r.d||r.date||Date.now()}); L.pts+=REVIEW_PTS;
 });
 L.log.sort((a,b)=>(b.d||0)-(a.d||0));
 wr(LKEY,L);
}
function tier(){let c=TIERS[0];TIERS.forEach(t=>{if(L.pts>=t.min)c=t});
 return {c,n:TIERS[TIERS.indexOf(c)+1]||null};}

function render(){
 document.title='Velora — '+x('ttl');
 const {c,n}=tier();
 const pct=n?Math.max(3,Math.min(100,Math.round((L.pts-c.min)/(n.min-c.min)*100))):100;
 const ords=rd(OKEY,[]); const nOrd=Array.isArray(ords)?ords.length:0;
 const nRw=L.log.filter(e=>e.t==='-').length;
 const nRv=L.log.filter(e=>e.src==='review').length;

 const rws=REWARDS.map(r=>`<div class="loy-rw"><div class="im">${r.ic}</div><div class="bd">
   <div class="nm">${x(r.id)}</div><div class="cs">${r.cost} ${x('pts')}</div>
   <button data-rw="${r.id}" ${L.pts>=r.cost?'':'disabled'}>${x('redeem')}</button></div></div>`).join('');

 const logs=L.log.length? `<div class="loy-log">${L.log.slice(0,25).map(e=>{
     const s=e.src==='order'?fmt(x('eOrd'),{p:e.p,r:e.ref})
            :e.src==='review'?fmt(x('eRev'),{p:e.p})
            :e.src==='referral'?fmt(x('eRef'),{p:e.p})
            :fmt(x('eRed'),{p:e.p,r:e.code||x(e.ref)});
     return `<div class="loy-li"><span class="sg ${e.t==='+'?'up':''}">${e.t==='+'?'+':'−'}</span>
       <span class="tx">${s}</span><span class="dt">${fday(e.d)}</span></div>`;}).join('')}</div>`
   : `<div class="empty" style="padding:34px 0">
      <b style="display:block;color:var(--ink);font-weight:400;margin-bottom:5px">${x('emp')}</b>
      <span>${x('empS')}</span><br><a class="cta" href="shop.html" style="margin-top:14px">${x('go')}</a></div>`;

 box.innerHTML=`<div class="acc-head">
   <button class="acc-back" id="loyBack" aria-label="Back">${IC.back}</button>
   <h1 class="acc-h1">${x('ttl')}<small>${x(c.k)}</small></h1></div>
 <div class="loy-wrap">
   <div class="loy-hero"><div class="loy-star">${IC.star}</div><div class="h-in">
     <div class="loy-tier">${x(c.k)}</div>
     <div class="loy-pts">${L.pts}<span>${x('pts')}</span></div>
     <div class="loy-bar"><span class="tr"><span class="fl" style="width:${pct}%"></span></span>
       <span class="nx">${n?L.pts+' / '+n.min:x('max')}</span></div>
     <div class="loy-since">${x('since')} ${fmon(L.since)}</div></div></div>
   <div class="loy-stats">
     <div class="loy-stat">${IC.bag}<b>${nOrd}</b><i>${x('ord')}</i></div>
     <div class="loy-stat">${IC.gift}<b>${nRw}</b><i>${x('rw')}</i></div>
     <div class="loy-stat">${IC.star}<b>${nRv}</b><i>${x('rv')}</i></div></div>
   <h2 class="loy-h2">${x('avail')}</h2>
   <div class="loy-row">${rws}</div>
   <div class="loy-ref"><span class="ic">${IC.link}</span><div class="bd">
     <div class="nm">${x('refT')}</div><div class="sb">${x('refS')}</div></div>
     <button id="loyShare">${x('share')}</button></div>
   <h2 class="loy-h2">${x('hist')}</h2>
   ${logs}</div>`;
}

box.addEventListener('click',e=>{
 if(e.target.closest('#loyBack')){ history.length>1?history.back():location.href='account.html'; return; }
 if(e.target.closest('#loyShare')){
   const u=location.origin+location.pathname.replace(/loyalty\.html$/,'')+'?ref='+L.ref;
   (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject())
     .then(()=>A.toast(x('copied'),'')).catch(()=>prompt('Link',u));
   return; }
 const b=e.target.closest('[data-rw]'); if(!b) return;
 const r=REWARDS.find(v=>v.id===b.dataset.rw); if(!r) return;
 if(L.pts<r.cost){ A.toast(x('need'),''); return; }
 L.pts-=r.cost;
 const code='VLR-'+Math.random().toString(36).slice(2,7).toUpperCase();
 const cs=rd(CKEY,[]); cs.push({code,type:r.type,val:r.val,used:false}); wr(CKEY,cs);
 L.log.unshift({t:'-',p:r.cost,src:'reward',ref:r.id,code,d:Date.now()});
 wr(LKEY,L); render(); A.toast(x('got')+code,'');
});

const ref=new URLSearchParams(location.search).get('ref');
if(ref && ref!==L.ref && !L.log.some(e=>e.src==='referral')){
 L.pts+=REF_PTS; L.log.unshift({t:'+',p:REF_PTS,src:'referral',ref,d:Date.now()}); wr(LKEY,L);
}

window.VELORA.onLang=render;
sync(); render();
/* ---------- الشريط الجانبي في الديسك توب ---------- */
(function loySide(){
  const SI={
   usr:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7.5" r="4.2" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 20.5c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
   pin:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="1.7"/><path d="M8 12.3l2.6 2.6L16 9.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
   hrt:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 20.7C9 19.6 3.2 15.6 3.2 9.6a4.9 4.9 0 019-2.7 4.9 4.9 0 019 2.7c0 6-5.8 10-8.8 11.1z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
   box:'<svg viewBox="0 0 24 24" fill="none"><path d="M20.5 8.5v7c0 1-.5 1.8-1.4 2.3l-6 3.4c-.7.4-1.5.4-2.2 0l-6-3.4A2.6 2.6 0 013.5 15.5v-7c0-1 .5-1.8 1.4-2.3l6-3.4c.7-.4 1.5-.4 2.2 0l6 3.4c.9.5 1.4 1.3 1.4 2.3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3.8 7.2L12 12l8.2-4.8M12 12v9.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'};

  const SL={
   en:{me:'My Profile',orders:'My Orders',addrs:'My Addresses',info:'Information',wish:'Wishlist',track:'Track your order',loyalty:'Loyalty Account'},
   ar:{me:'حسابي',orders:'طلباتي',addrs:'عناويني',info:'بياناتي',wish:'المفضلة',track:'تتبع طلبك',loyalty:'نقاط الولاء'}};
  const s=k=>(SL[st()]&&SL[st()][k])||SL.en[k];
  const ini=n=>String(n||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();

  function sideHTML(){
    const U=rd('velora_user',null); if(!U) return '';
    const AD=rd('velora_addresses',[]), OR=rd(OKEY,[]), W=(A.wish||[]);
    const items=[
      ['home',   s('me'),     SI.usr, ''],
      ['orders', s('orders'), IC.bag, (OR||[]).length],
      ['addr',   s('addrs'),  SI.pin, (AD||[]).length],
      ['info',   s('info'),   SI.usr, ''],
      ['wish',   s('wish'),   SI.hrt, W.length],
      ['track',  s('track'),  SI.box, '']
    ];
    return `<aside class="acc-side" aria-label="${s('me')}">
      <div class="acc-side__u">
        <span class="acc-side__av">${ini(U.nm)}</span>
        <span class="acc-side__who"><b>${U.nm}</b><small>${U.em||U.ph||''}</small></span>
      </div>
      <nav class="acc-side__nav">
        ${items.map(([v,lb,ic,n])=>`<a class="acc-side__i" href="account.html?v=${v}">
          <span class="acc-side__ic">${ic}</span><span class="acc-side__t">${lb}</span>${n?`<em>${n}</em>`:''}
        </a>`).join('')}
        <a class="acc-side__i on" href="loyalty.html">
          <span class="acc-side__ic">${IC.gift}</span>
          <span class="acc-side__t">${s('loyalty')}</span><em>${L.pts}</em>
        </a>
      </nav>
    </aside>`;
  }

  const base=render;
  render=function(){
    base();
    const side=sideHTML(); if(!side) return;
    box.classList.add('has-side');
    box.innerHTML=side+'<div class="acc-main">'+box.innerHTML+'</div>';
  };
  window.VELORA.onLang=render;
  render();
})();
})();
