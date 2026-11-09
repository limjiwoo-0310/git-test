// 사용자가 '동작 줄이기'를 켰는지 확인
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const progress = document.querySelector('.progress');
const progressBar = document.querySelector('.progress__bar');
const heroBg = document.querySelector('.hero__bg');
const appBar = document.querySelector('.top-app-bar');
const fab = document.querySelector('.fab');

/* =========================================================
   스크롤할 때 실행되는 효과
   (requestAnimationFrame으로 한 프레임에 한 번만 계산)
   ========================================================= */
let ticking = false;

function updateOnScroll() {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // [효과 3] 스크롤 진행률 : 0(맨 위) ~ 1(맨 아래)
  const ratio = maxScroll > 0 ? scrollY / maxScroll : 0;
  progressBar.style.transform = `scaleX(${ratio})`;
  progress.setAttribute('aria-valuenow', Math.round(ratio * 100));

  // [효과 2] 히어로 배경 패럴랙스 : 스크롤 양의 30%만 따라 내려감
  if (!reduceMotion && scrollY < window.innerHeight) {
    heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
  }

  // M3 Top App Bar : 히어로를 거의 지나면 surface 색 + 엘리베이션
  const pastHero = scrollY > window.innerHeight - appBar.offsetHeight;
  appBar.classList.toggle('is-scrolled', pastHero);

  // FAB : 히어로를 지나면 나타남
  fab.classList.toggle('is-visible', pastHero);

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateOnScroll);
    ticking = true;
  }
}, { passive: true });

window.addEventListener('resize', updateOnScroll);
updateOnScroll();

/* =========================================================
   [효과 1] 아래에서 위로 페이드인 (IntersectionObserver)
   ========================================================= */
document.querySelectorAll('section').forEach((section) => {
  section.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.setProperty('--delay', `${i * 0.1}s`);
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* =========================================================
   M3 리플 효과 : 누른 위치에서 퍼져 나감
   ========================================================= */
document.addEventListener('pointerdown', (e) => {
  const target = e.target.closest('.state-layer');
  if (!target || reduceMotion) return;

  const rect = target.getBoundingClientRect();
  const size = Math.hypot(rect.width, rect.height) * 2;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  target.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

/* =========================================================
   맨 위로 / 부드러운 앵커 이동
   ========================================================= */
const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

document.querySelectorAll('[data-scroll-top]').forEach((btn) => {
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: scrollBehavior }));
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const el = document.querySelector(link.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    const top = el.getBoundingClientRect().top + window.scrollY - appBar.offsetHeight;
    window.scrollTo({ top, behavior: scrollBehavior });
  });
});

/* =========================================================
   라이트 / 다크 테마 전환 (선택값은 브라우저에 저장)
   ========================================================= */
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.material-symbols-rounded');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function isDark() {
  const t = root.dataset.theme;
  return t ? t === 'dark' : systemDark.matches;
}
function syncThemeIcon() {
  themeIcon.textContent = isDark() ? 'light_mode' : 'dark_mode';
  themeToggle.setAttribute('aria-label', isDark() ? '라이트 모드 전환' : '다크 모드 전환');
}

try {
  const saved = localStorage.getItem('theme');
  if (saved) root.dataset.theme = saved;
} catch (_) { /* 저장소를 쓸 수 없는 환경 */ }
syncThemeIcon();

themeToggle.addEventListener('click', () => {
  root.dataset.theme = isDark() ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (_) {}
  syncThemeIcon();
});
systemDark.addEventListener('change', syncThemeIcon);
