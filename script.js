// 사용자가 '동작 줄이기'를 켰는지 확인
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const progressBar = document.querySelector('.progress__bar');
const heroBg = document.querySelector('.hero__bg');

/* =========================================================
   스크롤할 때 실행되는 효과
   (requestAnimationFrame으로 한 프레임에 한 번만 계산해서 부드럽게)
   ========================================================= */
let ticking = false;

function updateOnScroll() {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // [효과 3] 스크롤 진행률 프로그래스 바 : 0(맨 위) ~ 1(맨 아래)
  const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
  progressBar.style.transform = `scaleX(${progress})`;

  // [효과 2] 히어로 배경 패럴랙스 : 스크롤 양의 30%만큼만 따라 내려가서 느리게 움직이는 것처럼 보임
  if (!reduceMotion && scrollY < window.innerHeight) {
    heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
  }

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
   [효과 1] 아래에서 위로 페이드인
   IntersectionObserver: 요소가 화면에 들어오면 .is-visible 클래스 추가
   ========================================================= */

// 같은 섹션 안에서는 제목 → 문장 → 이미지 순서로 조금씩 늦게 나타나도록 지연값 부여
document.querySelectorAll('section').forEach((section) => {
  section.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.setProperty('--delay', `${i * 0.15}s`);
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target); // 한 번 나타나면 더 이상 감시하지 않음
    }
  });
}, {
  threshold: 0.15,                 // 요소가 15% 보이면 실행
  rootMargin: '0px 0px -50px 0px'  // 화면 하단보다 조금 위에서 실행
});

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
