(() => {
 'use strict';
 const reduce = matchMedia('(prefers-reduced-motion: reduce)');
 const intro = document.getElementById('intro');
 const skip = document.getElementById('skip-intro');
 const header = document.querySelector('header');
 const main = document.querySelector('main');
 const footer = document.querySelector('footer');
 let introTimer, progressFrame;
 function endIntro(focus = false, presentBadge = false) {
   clearTimeout(introTimer);cancelAnimationFrame(progressFrame);intro.classList.remove('is-active');intro.setAttribute('aria-hidden','true');skip.tabIndex=-1;
   document.body.classList.remove('intro-playing');[header,main,footer].forEach(el=>el.inert=false);
   if(presentBadge&&!reduce.matches) spotlightBadge();
   else if(focus) document.querySelector('.brand').focus();
 }
 function playIntro(manual = false) {
   if(reduce.matches)return;
   intro.style.setProperty('--load-progress','0');
   const start=performance.now();const percent=document.getElementById('intro-percent');
   const progress=()=>{const amount=Math.min(1,(performance.now()-start)/1800);intro.style.setProperty('--load-progress',String(amount));percent.textContent=Math.floor(amount*100)+'%';if(amount<1)progressFrame=requestAnimationFrame(progress)};progressFrame=requestAnimationFrame(progress);
   intro.classList.add('is-active');intro.setAttribute('aria-hidden','false');skip.tabIndex=0;
   document.body.classList.add('intro-playing');[header,main,footer].forEach(el=>el.inert=true);
   if(manual)skip.focus();
   introTimer=setTimeout(()=>endIntro(manual,true),2850);
 }
 skip.addEventListener('click',()=>endIntro(true));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&intro.classList.contains('is-active'))endIntro(true)});
 document.getElementById('replay-intro').addEventListener('click',()=>playIntro(true));
 let seen=false;try{seen=sessionStorage.getItem('gf-intro')==='1';sessionStorage.setItem('gf-intro','1')}catch{}
 if(!seen&&!location.hash)playIntro();
 reduce.addEventListener('change',()=>{if(reduce.matches)endIntro()});
 const spotlight=document.getElementById('badge-spotlight');
 let spotlightAnimations=[],spotlightTimer;
 function finishSpotlight(){
  clearTimeout(spotlightTimer);spotlightAnimations.forEach(a=>a.cancel());spotlightAnimations=[];
  spotlight.hidden=true;spotlight.setAttribute('aria-hidden','true');spotlight.classList.remove('landing');spotlight.querySelector('.spotlight-clone')?.remove();
  document.getElementById('badge-rig').style.visibility='';document.body.classList.remove('intro-playing');
  [header,main,footer].forEach(el=>el.inert=false);document.getElementById('skip-spotlight').tabIndex=-1;
 }
 function spotlightBadge(){
  finishSpotlight();const rig=document.getElementById('badge-rig');const box=rig.getBoundingClientRect();
  const clone=rig.cloneNode(true);clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
  clone.classList.add('spotlight-clone');clone.setAttribute('aria-hidden','true');clone.style.width=box.width+'px';clone.style.left=(innerWidth-box.width)/2+'px';clone.style.top=Math.max(0,(innerHeight-box.height)/2-48)+'px';
  spotlight.appendChild(clone);spotlight.hidden=false;spotlight.setAttribute('aria-hidden','false');rig.style.visibility='hidden';document.body.classList.add('intro-playing');
  [header,main,footer].forEach(el=>el.inert=true);document.getElementById('skip-spotlight').tabIndex=0;document.getElementById('skip-spotlight').focus();
  const zoom=innerWidth>760?1.08:Math.min(1,(innerHeight-185)/box.height);
  const introAnimation=clone.animate([{transform:'translateY(40px) scale(.38) rotate(-12deg)',opacity:0},{transform:`translateY(0) scale(${zoom*1.06}) rotate(3deg)`,opacity:1,offset:.65},{transform:`scale(${zoom}) rotate(0deg)`,opacity:1}],{duration:1300,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});spotlightAnimations.push(introAnimation);
  spotlightTimer=setTimeout(()=>{
   spotlight.classList.add('landing');const current=clone.getBoundingClientRect();
   // Mobile keeps the destination in the viewport, without a sideways flight offscreen.
   if(innerWidth<760){rig.scrollIntoView({block:'center',behavior:'instant'})}
   const dest=rig.getBoundingClientRect();const cx=current.left+current.width/2,cy=current.top+current.height/2;
   const dx=dest.left+dest.width/2-cx,dy=dest.top+dest.height/2-cy;
   const animation=clone.animate([{transform:`scale(${zoom})`},{transform:`translate(${dx}px,${dy}px) scale(1)`}],{duration:950,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});spotlightAnimations.push(animation);animation.finished.then(finishSpotlight).catch(()=>{});
  },1900);
 }
 document.getElementById('skip-spotlight').addEventListener('click',finishSpotlight);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!spotlight.hidden)finishSpotlight()});
 reduce.addEventListener('change',()=>{if(reduce.matches)finishSpotlight()});
 const menu=document.querySelector('.menu-toggle'),nav=document.getElementById('mobile-nav');
 function closeMenu(){nav.hidden=true;menu.setAttribute('aria-expanded','false');menu.lastElementChild.textContent='+'}
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.hidden=!open;menu.lastElementChild.textContent=open?'−':'+'});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu()}});
 if('IntersectionObserver' in window&&!reduce.matches){
  document.body.classList.add('motion-ready');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
 }
 const drag=document.getElementById('badge-drag'),badge=document.getElementById('badge'),flip=document.getElementById('flip-badge');
 flip.addEventListener('click',()=>{const flipped=badge.classList.toggle('flipped');flip.setAttribute('aria-pressed',String(flipped));badge.querySelector('.badge-front').setAttribute('aria-hidden',String(flipped));badge.querySelector('.badge-back').setAttribute('aria-hidden',String(!flipped))});
 let pointer=null,startX=0,startY=0,x=0,y=0,angle=4,vx=0,vy=0,va=0,frame=0;
 const paint=()=>{drag.style.transform=`translate3d(${x}px,${y}px,0) rotate(${angle}deg)`};
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function settle(){
   if(reduce.matches){x=y=angle=0;paint();return}
   vx=(vx-x*.055)*.84;vy=(vy-y*.055)*.84;va=(va+(4-angle)*.045)*.86;
   x+=vx;y+=vy;angle+=va;paint();
   if(Math.abs(x)+Math.abs(y)+Math.abs(angle-4)+Math.abs(vx)+Math.abs(vy)+Math.abs(va)>.08)frame=requestAnimationFrame(settle);
   else{x=y=0;angle=4;paint()}
 }
 drag.addEventListener('pointerdown',e=>{if(e.button!==0||reduce.matches)return;cancelAnimationFrame(frame);pointer=e.pointerId;startX=e.clientX-x;startY=e.clientY-y;vx=vy=va=0;drag.classList.add('dragging');drag.setPointerCapture(e.pointerId)});
 drag.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;const max=Math.min(65,(innerWidth-drag.clientWidth)/2-16);x=clamp(e.clientX-startX,-max,max);y=clamp(e.clientY-startY,-35,50);angle=clamp(x*.18,-15,15);paint()});
 function release(e){if(pointer!==e.pointerId)return;pointer=null;drag.classList.remove('dragging');frame=requestAnimationFrame(settle)}
 drag.addEventListener('pointerup',release);drag.addEventListener('pointercancel',release);
 const clock=document.getElementById('clock');
 function updateClock(){const now=new Date();clock.textContent=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'}).format(now);clock.dateTime=now.toISOString()}
 updateClock();setInterval(updateClock,60000);
})();

