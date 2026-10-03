const intro=document.querySelector('#intro');
const openInvite=document.querySelector('#openInvite');
openInvite.addEventListener('click',()=>{
  intro.classList.add('open');
  setTimeout(()=>intro.classList.add('hide'),1200);
  sessionStorage.setItem('invite-opened','1');
});
if(sessionStorage.getItem('invite-opened')) intro.classList.add('hide');

const revealEls=[...document.querySelectorAll('.reveal')];
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.13,rootMargin:'0px 0px -4%'});
revealEls.forEach(el=>io.observe(el));

const menu=document.querySelector('.menu-btn'), shell=document.querySelector('.nav-shell');
menu.addEventListener('click',()=>{const active=shell.classList.toggle('menu-open');menu.setAttribute('aria-expanded',active)});
shell.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{shell.classList.remove('menu-open');menu.setAttribute('aria-expanded','false')}));

const countdown=document.querySelector('.countdown');
const target=new Date(countdown.dataset.date).getTime();
function tick(){
  const d=Math.max(0,target-Date.now());
  const days=Math.floor(d/86400000), hours=Math.floor(d/3600000)%24, mins=Math.floor(d/60000)%60, secs=Math.floor(d/1000)%60;
  countdown.querySelector('[data-days]').textContent=String(days).padStart(3,'0');
  countdown.querySelector('[data-hours]').textContent=String(hours).padStart(2,'0');
  countdown.querySelector('[data-minutes]').textContent=String(mins).padStart(2,'0');
  countdown.querySelector('[data-seconds]').textContent=String(secs).padStart(2,'0');
}
tick();setInterval(tick,1000);

if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const parallaxEls=[...document.querySelectorAll('[data-parallax]')];
  let raf=false;
  addEventListener('scroll',()=>{if(!raf){requestAnimationFrame(()=>{const y=scrollY;parallaxEls.forEach(el=>el.style.transform=`translate3d(0,${y*Number(el.dataset.parallax)}px,0)`);raf=false});raf=true}},{passive:true});
}

const form=document.querySelector('#rsvpForm'),status=document.querySelector('.form-status');
form.addEventListener('submit',e=>{e.preventDefault();const name=new FormData(form).get('name')?.toString().trim().split(' ')[0]||'Você';status.textContent=`${name}, confirmação registrada nesta demonstração. Obrigado!`;form.reset()});
