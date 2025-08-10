// Utilities
const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];

// Page transition on navigation
(function setupPageTransitions(){
  const overlay = qs('.page-transition');
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if(!href || href === '#' || href.startsWith('#') === false) return;
      const target = qs(href);
      if(!target) return;
      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(() => {
        target.scrollIntoView({behavior:'smooth', block:'start'});
        setTimeout(()=> overlay.classList.remove('active'), 500);
      }, 100);
    });
  });
})();

// Typed tagline effect
(function setupTyped(){
  const el = qs('#typed');
  if(!el) return;
  const phrases = ["Innovative IT Mind", "Future-Ready Developer"];
  const separator = " | ";
  let idx = 0, char = 0, isDeleting = false, pause = 1200;
  function type(){
    const current = phrases[idx];
    const shown = isDeleting ? current.slice(0, char--) : current.slice(0, char++);
    el.textContent = shown + (isDeleting ? '' : '');
    const speed = isDeleting ? 45 : 70;
    if(!isDeleting && char === current.length){
      setTimeout(()=> isDeleting = true, pause);
    } else if(isDeleting && char < 0){
      isDeleting = false; idx = (idx + 1) % phrases.length; char = 0;
    }
    setTimeout(type, isDeleting ? speed : speed);
  }
  type();
})();

// Reveal on scroll
(function setupReveal(){
  const io = new IntersectionObserver((entries)=>{
    for(const e of entries){ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } }
  }, {threshold: 0.15});
  qsa('.reveal').forEach(el => io.observe(el));
})();

// Progress bars animation
(function setupProgress(){
  const io = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){
        const wrap = e.target; const bar = qs('.bar', wrap);
        const val = Number(wrap.getAttribute('data-value') || 0);
        requestAnimationFrame(()=>{ bar.style.width = val + '%'; bar.style.inset = `0 ${100-val}% 0 0`; });
        io.unobserve(wrap);
      }
    }
  }, {threshold: 0.4});
  qsa('.progress').forEach(el => io.observe(el));
})();

// 3D tilt on cards
(function setupTilt(){
  const maxTilt = 10; const resetMs = 150;
  qsa('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      const rX = (py - 0.5) * -2 * maxTilt;
      const rY = (px - 0.5) * 2 * maxTilt;
      card.style.transform = `perspective(700px) rotateX(${rX}deg) rotateY(${rY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transition = `transform ${resetMs}ms ease`;
      card.style.transform = '';
      setTimeout(()=> card.style.transition = '', resetMs);
    });
  });
})();

// Parallax on scroll for elements with data-speed
(function setupParallax(){
  const els = qsa('.parallax');
  function onScroll(){
    const y = window.scrollY;
    els.forEach(el => {
      const speed = Number(el.getAttribute('data-speed') || 0.2);
      el.style.transform = `translate3d(0, ${y * speed * 0.2}px, 0)`;
    });
  }
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
})();

// Masonry modal interactions
(function setupProjects(){
  const modal = qs('#projectModal');
  const title = qs('#modalTitle'); const desc = qs('#modalDesc'); const tech = qs('#modalTech'); const link = qs('#modalLink');
  function open(card){
    title.textContent = card.dataset.title || 'Project';
    desc.textContent = card.dataset.desc || '';
    tech.textContent = card.dataset.tech || '';
    link.href = card.dataset.link || '#';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  }
  function close(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
  qsa('.project-card').forEach(card => {
    card.addEventListener('click', ()=> open(card));
    card.addEventListener('keypress', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); open(card);} });
  });
  modal?.addEventListener('click', (e)=>{ if(e.target.hasAttribute('data-close')) close(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
})();

// Contact form: WhatsApp integration and graceful email fallback
(function setupContact(){
  const form = qs('#contactForm');
  const waBtn = qs('#whatsappBtn');
  form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = qs('#name').value.trim();
    const email = qs('#email').value.trim();
    const message = qs('#message').value.trim();
    const subject = encodeURIComponent(`Inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} <${email}>`);
    window.location.href = `mailto:example@example.com?subject=${subject}&body=${body}`;
  });
  waBtn?.addEventListener('click', (e)=>{
    const name = qs('#name').value.trim();
    const message = qs('#message').value.trim();
    const base = waBtn.getAttribute('href').split('?')[0];
    const text = encodeURIComponent(`Hello Gulshan! I am ${name || 'someone'} — ${message || 'let\'s connect.'}`);
    waBtn.setAttribute('href', `${base}?text=${text}`);
  });
})();

// Footer year
(function setYear(){ const y = new Date().getFullYear(); const el = qs('#year'); if(el) el.textContent = y; })();

// Canvas starfield background with depth and color gradient
(function bgCanvas(){
  const canvas = qs('#bg-canvas'); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  const stars = []; const layers = 3; const perLayer = 90;
  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function init(){
    stars.length = 0;
    for(let l=0; l<layers; l++){
      for(let i=0; i<perLayer; i++){
        stars.push({
          x: Math.random()*w,
          y: Math.random()*h,
          z: l+1,
          r: Math.random()*1.8 + 0.4,
          vx: (Math.random()*0.4+0.1) * (l+1),
        });
      }
    }
  }
  let tiltX=0, tiltY=0; // tilt based on mouse
  window.addEventListener('mousemove', (e)=>{
    const cx = window.innerWidth/2; const cy = window.innerHeight/2;
    tiltX = (e.clientX-cx)/cx; tiltY = (e.clientY-cy)/cy;
  }, {passive:true});
  function draw(){
    ctx.clearRect(0,0,w,h);
    // subtle gradient backdrop overlay for depth hue
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,'rgba(0,229,255,0.06)');
    g.addColorStop(1,'rgba(181,23,255,0.06)');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

    for(const s of stars){
      s.x -= s.vx * 0.3; if(s.x < -10) s.x = w + Math.random()*20;
      const parX = s.x + tiltX * (s.z*6); const parY = s.y + tiltY * (s.z*6);
      ctx.beginPath();
      const hue = s.z === 1 ? 180 : s.z === 2 ? 265 : 200;
      ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${0.35 + s.z*0.12})`;
      ctx.arc(parX, parY, s.r + s.z*0.2, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  const ro = new ResizeObserver(()=>{ resize(); init(); });
  ro.observe(canvas);
  resize(); init(); draw();
})();

// Canvas 3D-ish clock in header
(function clock3D(){
  const canvas = qs('#clock3d'); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width; // assume square
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function draw(){
    const now = new Date();
    const w = canvas.clientWidth || 160; const h = canvas.clientHeight || 160;
    canvas.width = Math.floor(w * DPR); canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    const cx = w/2, cy = h/2; const R = Math.min(w,h)/2 - 10;
    ctx.clearRect(0,0,w,h);

    // base shadow
    ctx.save();
    ctx.translate(cx, cy+6);
    ctx.scale(1, 0.2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.arc(0,0,R*0.9,0,Math.PI*2); ctx.fill();
    ctx.restore();

    // tilt effect using time
    const tilt = (Math.sin(now.getSeconds()/60 * Math.PI*2) * 8);

    // ring function
    function ring(progress, inner, outer, color1, color2){
      const start = -Math.PI/2; const end = start + progress * Math.PI*2;
      const grd = ctx.createLinearGradient(-outer, -outer, outer, outer);
      grd.addColorStop(0, color1);
      grd.addColorStop(1, color2);
      ctx.strokeStyle = grd; ctx.lineCap = 'round';
      ctx.lineWidth = outer - inner;
      ctx.beginPath(); ctx.arc(cx, cy-tilt, (inner+outer)/2, start, end); ctx.stroke();

      // inner glow
      ctx.strokeStyle = 'rgba(0,229,255,0.15)';
      ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy-tilt, inner, 0, Math.PI*2); ctx.stroke();
    }

    const sec = now.getSeconds() + now.getMilliseconds()/1000;
    const min = now.getMinutes() + sec/60;
    const hr = (now.getHours()%12) + min/60;

    ring(hr/12, R*0.55, R*0.78, '#00e5ff', '#b517ff');
    ring(min/60, R*0.35, R*0.52, '#b517ff', '#6a00f4');
    ring(sec/60, R*0.18, R*0.30, '#31f5ff', '#00e5ff');

    // center cap
    ctx.fillStyle = '#e6f1ff';
    ctx.beginPath(); ctx.arc(cx, cy-tilt, 3, 0, Math.PI*2); ctx.fill();

    requestAnimationFrame(draw);
  }
  draw();
})();

// Smooth in-view anchor focus for accessibility
(function a11yFixes(){
  window.addEventListener('hashchange', ()=>{
    const id = location.hash.slice(1);
    const el = id && qs('#'+CSS.escape(id));
    if(el){ el.setAttribute('tabindex','-1'); el.focus({preventScroll:true}); setTimeout(()=> el.removeAttribute('tabindex'), 1000); }
  });
})();