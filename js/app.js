/* ============================================================
   BATEMA FRANCIS — Portfolio JS
   ============================================================ */

/* ---------- THEME ---------- */
(function () {
  const saved = localStorage.getItem('bf-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.setAttribute('data-theme', 'dark');
})();

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('bf-theme', next);
  updateThemeIcon();
}
function updateThemeIcon() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('.theme-toggle').forEach(b => (b.textContent = dark ? '☀️' : '🌙'));
}

/* ---------- NAV ---------- */
function toggleMenu() {
  document.querySelector('.nav-links')?.classList.toggle('open');
}

/* ---------- SCROLL REVEAL ---------- */
function initReveal() {
  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          // animate skill bars
          e.target.querySelectorAll('.bar i[data-w]').forEach(b => (b.style.width = b.dataset.w + '%'));
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ---------- NAV SHRINK ---------- */
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) nav.style.boxShadow = '0 6px 30px rgba(10,37,64,0.10)';
    else nav.style.boxShadow = 'none';
  });
}

/* ---------- 3D TILT HERO CARD ---------- */
function init3DTilt() {
  const card = document.querySelector('.hero-card');
  const stage = document.querySelector('.hero-stage');
  if (!card || !stage) return;

  // scroll-driven rotation
  function onScroll() {
    const y = Math.min(window.scrollY, 600);
    const rot = 14 - (y / 600) * 14;
    const scale = 1 - (y / 600) * 0.08;
    card.style.transform = `rotateX(${rot}deg) scale(${scale})`;
  }
  onScroll();
  window.addEventListener('scroll', onScroll);

  // mouse parallax
  stage.addEventListener('mousemove', e => {
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateY(${px * 12}deg) rotateX(${-py * 12}deg) scale(1.02)`;
  });
  stage.addEventListener('mouseleave', onScroll);
}

/* ---------- PRODUCTS DATA ---------- */
const DEFAULT_PRODUCTS = [
  { name: 'NovaShop', type: 'E-Commerce', icon: '🛒', desc: 'A blazing-fast headless e-commerce platform with cart, payments, and real-time inventory.', tags: ['React', 'Node', 'Stripe'], color: 'linear-gradient(150deg,#0b5fff,#2f86ff)', cat: 'ecommerce' },
  { name: 'TaskFlow', type: 'Web App', icon: '✅', desc: 'A collaborative project & task management web app with boards, automations and live sync.', tags: ['Vue', 'Firebase', 'PWA'], color: 'linear-gradient(150deg,#1670ff,#0a2540)', cat: 'webapp' },
  { name: 'FitPulse', type: 'Mobile App', icon: '💪', desc: 'A cross-platform fitness tracking app with workout plans, analytics and wearables sync.', tags: ['Flutter', 'Dart', 'GraphQL'], color: 'linear-gradient(150deg,#2f86ff,#7db4ff)', cat: 'mobile' },
  { name: 'PayBridge', type: 'Software / API', icon: '💳', desc: 'A secure fintech payment gateway & API handling multi-currency transactions at scale.', tags: ['Go', 'Postgres', 'Docker'], color: 'linear-gradient(150deg,#0a2540,#0b5fff)', cat: 'software' },
  { name: 'EduSphere', type: 'Web App', icon: '🎓', desc: 'An online learning platform with live classes, quizzes, certificates and progress tracking.', tags: ['Next.js', 'Prisma', 'AWS'], color: 'linear-gradient(150deg,#1670ff,#2f86ff)', cat: 'webapp' },
  { name: 'ShopWear', type: 'E-Commerce', icon: '👕', desc: 'A modern fashion storefront with AR try-on, wishlist and seamless mobile checkout.', tags: ['Shopify', 'Liquid', 'JS'], color: 'linear-gradient(150deg,#0b5fff,#0a2540)', cat: 'ecommerce' },
];

function getProducts() {
  const stored = localStorage.getItem('bf-products');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return DEFAULT_PRODUCTS.slice();
}
function saveProducts(list) {
  localStorage.setItem('bf-products', JSON.stringify(list));
}

let CURRENT_FILTER = 'all';
let SELECTED_EMOJI = '🚀';

function productCardHTML(p, i) {
  const tags = (p.tags || []).map(t => `<span>${t}</span>`).join('');
  return `<article class="glass pcard reveal d${(i % 3) + 1}" data-cat="${p.cat || 'software'}">
    <div class="thumb" style="background:${p.color || 'linear-gradient(150deg,#0b5fff,#2f86ff)'}">${p.icon || '🚀'}</div>
    <div class="body">
      <span class="ptype">${p.type || 'Software'}</span>
      <h3>${escapeHtml(p.name)}</h3>
      <p>${escapeHtml(p.desc)}</p>
      <div class="ptags">${tags}</div>
      <a class="plink" href="#" onclick="viewProduct(${i});return false;">View project <span class="arrow">→</span></a>
    </div>
  </article>`;
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  const list = getProducts();
  const filtered = list.map((p, i) => ({ p, i })).filter(({ p }) => CURRENT_FILTER === 'all' || p.cat === CURRENT_FILTER);

  grid.innerHTML =
    filtered.map(({ p, i }) => productCardHTML(p, i)).join('') +
    `<article class="glass pcard add reveal" onclick="openModal()">
      <div class="plus">+</div>
      <h3>Add a Product</h3>
      <p style="max-width:200px">Showcase a new website, web app or software project</p>
    </article>`;

  // re-run reveal for new nodes
  grid.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}

function setFilter(cat, btn) {
  CURRENT_FILTER = cat;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderProducts();
}

function viewProduct(i) {
  const p = getProducts()[i];
  if (p) showToast(`🔗 ${p.name} — demo link coming soon`);
}

/* ---------- MODAL ---------- */
function openModal() {
  const ov = document.getElementById('modal');
  if (!ov) return;
  ov.classList.add('show');
  SELECTED_EMOJI = '🚀';
  document.querySelectorAll('.emoji-picker button').forEach((b, idx) => b.classList.toggle('sel', idx === 0));
  document.getElementById('pf-name').focus();
}
function closeModal() {
  document.getElementById('modal')?.classList.remove('show');
}
function pickEmoji(btn, emoji) {
  SELECTED_EMOJI = emoji;
  document.querySelectorAll('.emoji-picker button').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
}
function submitProduct(e) {
  e.preventDefault();
  const name = document.getElementById('pf-name').value.trim();
  const type = document.getElementById('pf-type').value;
  const desc = document.getElementById('pf-desc').value.trim();
  const tags = document.getElementById('pf-tags').value.split(',').map(t => t.trim()).filter(Boolean);
  if (!name || !desc) return;

  const catMap = { 'E-Commerce': 'ecommerce', 'Web App': 'webapp', 'Mobile App': 'mobile', 'Software / API': 'software' };
  const colors = [
    'linear-gradient(150deg,#0b5fff,#2f86ff)',
    'linear-gradient(150deg,#1670ff,#0a2540)',
    'linear-gradient(150deg,#2f86ff,#7db4ff)',
    'linear-gradient(150deg,#0a2540,#0b5fff)',
  ];
  const list = getProducts();
  list.push({
    name, type, desc, tags,
    icon: SELECTED_EMOJI,
    cat: catMap[type] || 'software',
    color: colors[list.length % colors.length],
  });
  saveProducts(list);
  closeModal();
  e.target.reset();
  CURRENT_FILTER = 'all';
  document.querySelectorAll('.chip').forEach((c, idx) => c.classList.toggle('active', idx === 0));
  renderProducts();
  showToast('✅ Product added to your showcase!');
}

function resetProducts() {
  localStorage.removeItem('bf-products');
  renderProducts();
  showToast('↩️ Showcase reset to defaults');
}

/* ---------- CONTACT FORM ---------- */
function submitContact(e) {
  e.preventDefault();
  e.target.reset();
  showToast('📨 Message sent! Francis will reply soon.');
}

/* ---------- TOAST ---------- */
let toastTimer;
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ---------- UTIL ---------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------- COUNTER ANIMATION ---------- */
function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      let n = 0;
      const step = Math.max(1, target / 50);
      const t = setInterval(() => {
        n += step;
        if (n >= target) { n = target; clearInterval(t); }
        el.textContent = Math.floor(n) + suffix;
      }, 26);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => obs.observe(el));
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  updateThemeIcon();
  initReveal();
  initNavScroll();
  init3DTilt();
  initCounters();
  renderProducts();

  document.getElementById('modal')?.addEventListener('click', e => {
    if (e.target.id === 'modal') closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});
