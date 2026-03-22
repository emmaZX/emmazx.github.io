// ─── SCROLL REVEAL ─────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// ─── ACTIVE NAV ─────────────────────────────
const page = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === page || (page === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ─── RESUME TABS ────────────────────────────
const tabs = document.querySelectorAll('.rtab');
const panes = document.querySelectorAll('.resume-pane');
if (tabs.length) {
  panes[0]?.classList.add('active');
  tabs[0]?.classList.add('active');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target)?.classList.add('active');
    });
  });
}

// ─── COUNT-UP ANIMATION ──────────────────────
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const isDecimal = String(target).includes('.');
  const start = performance.now();
  const duration = 1200;
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = isDecimal ? (eased * target).toFixed(2) : Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
const statNums = document.querySelectorAll('.stat-n[data-count]');
if (statNums.length) {
  const so = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); so.unobserve(e.target); } });
  }, { threshold: 0.5 });
  statNums.forEach(el => so.observe(el));
}
