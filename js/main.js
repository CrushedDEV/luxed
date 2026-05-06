/* ============================================================
   LUXED — Main JavaScript
   ============================================================ */

// ─── Navigation ────────────────────────────────────────────
const nav       = document.querySelector('.nav');
const mobileBtn = document.querySelector('.nav-mobile-btn');
const mobileMenu = document.querySelector('.nav-mobile');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

if (mobileBtn) {
  mobileBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    mobileBtn.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

document.querySelectorAll('.nav-mobile a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    mobileBtn && mobileBtn.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Active nav link
(function() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
})();

// ─── Scroll Animations ─────────────────────────────────────
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

// ─── Animated Counters ─────────────────────────────────────
function animateCounter(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1800;
  const start    = performance.now();

  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('es') + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) animateCounter(e.target); });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterIO.observe(el));

// ─── Tabs ───────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const scope = btn.closest('[data-tabs]') || document;
    scope.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    scope.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = scope.querySelector(`[data-panel="${btn.dataset.tab}"]`);
    if (panel) panel.classList.add('active');
  });
});

// ─── Filter System ─────────────────────────────────────────
const filterChips = document.querySelectorAll('.filter-chip');

filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const group = chip.closest('.filter-chips');
    if (group) group.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    applyFilters();
  });
});

const searchInput  = document.querySelector('.filter-search input');
const sortSelect   = document.querySelector('#sort-select');
const availSelect  = document.querySelector('#avail-select');

if (searchInput)  searchInput.addEventListener('input', applyFilters);
if (sortSelect)   sortSelect.addEventListener('change', applyFilters);
if (availSelect)  availSelect.addEventListener('change', applyFilters);

function applyFilters() {
  const grid = document.querySelector('.tech-cards-grid');
  if (!grid) return;

  const query  = searchInput ? searchInput.value.toLowerCase() : '';
  const avail  = availSelect ? availSelect.value : 'all';
  const activeChip = document.querySelector('.filter-chips .filter-chip.active');
  const skill  = activeChip ? activeChip.dataset.filter : 'all';

  const cards = [...grid.querySelectorAll('[data-tech-card]')];
  let visible = 0;

  cards.forEach(card => {
    const name     = (card.dataset.name     || '').toLowerCase();
    const skills   = (card.dataset.skills   || '').toLowerCase();
    const location = (card.dataset.location || '').toLowerCase();
    const cardAvail = card.dataset.avail || 'all';

    const matchSearch = !query || name.includes(query) || skills.includes(query) || location.includes(query);
    const matchSkill  = skill === 'all' || skills.includes(skill);
    const matchAvail  = avail === 'all' || cardAvail === avail;

    const show = matchSearch && matchSkill && matchAvail;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  const empty = grid.querySelector('.empty-state');
  if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
}

// ─── Multi-step Form ────────────────────────────────────────
const msForm = document.querySelector('[data-multistep]');
if (msForm) {
  let currentStep = 0;
  const steps  = [...msForm.querySelectorAll('.form-step')];
  const inds   = [...msForm.querySelectorAll('.step-ind')];
  const nextBtns = msForm.querySelectorAll('[data-next]');
  const prevBtns = msForm.querySelectorAll('[data-prev]');

  function goTo(n) {
    steps[currentStep].classList.remove('active');
    inds[currentStep].classList.remove('active');
    inds[currentStep].classList.add('done');

    if (n < currentStep) inds[currentStep].classList.remove('done');

    currentStep = n;
    steps[currentStep].classList.add('active');
    inds[currentStep].classList.add('active');
    inds[currentStep].classList.remove('done');

    msForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  nextBtns.forEach(btn => btn.addEventListener('click', () => {
    if (currentStep < steps.length - 1) goTo(currentStep + 1);
  }));
  prevBtns.forEach(btn => btn.addEventListener('click', () => {
    if (currentStep > 0) goTo(currentStep - 1);
  }));
}

// ─── Form Submission ────────────────────────────────────────
document.querySelectorAll('form[data-form]').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Enviando…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = orig;
      btn.disabled = false;
      form.reset();
      showToast('✓ Mensaje enviado. Te contactaremos en menos de 24h.');
    }, 1400);
  });
});

// ─── Toast ──────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="toast-icon">✓</span>${msg}`;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 4000);
}

// ─── Canvas Network ─────────────────────────────────────────
(function() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [], raf;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    init();
  }

  function init() {
    particles = [];
    const n = Math.floor((canvas.width * canvas.height) / 15000);
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.8,
        a: Math.random() * 0.55 + 0.2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const maxD = 130;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxD) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(201,168,76,${(1 - d / maxD) * 0.22})`;
          ctx.lineWidth = 0.7;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${p.a})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf); else draw();
  });

  resize();
  draw();
})();

// ─── Hero entry animation ───────────────────────────────────
window.addEventListener('load', () => {
  const els = document.querySelectorAll('.hero-eyebrow, .hero-title, .hero-subtitle, .hero-ctas, .hero-proof');
  els.forEach((el, i) => {
    el.style.cssText = `opacity:0;transform:translateY(18px);transition:opacity .65s ease ${i*0.13}s,transform .65s ease ${i*0.13}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }));
  });
});
