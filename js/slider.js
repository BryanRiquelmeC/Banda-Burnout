/* ============================================
   BURNOUT CHILE — Slider de Noticias
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  const track  = document.getElementById('newsTrack');
  const slides = track ? track.querySelectorAll('.news-card') : [];
  const dotsEl = document.getElementById('sliderDots');
  let current  = 0;
  let autoInterval;

  function goTo(n) {
    current = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    // Dots
    if (dotsEl) {
      dotsEl.querySelectorAll('.dot').forEach((d, i) =>
        d.classList.toggle('active', i === current)
      );
    }
  }

  function buildDots() {
    if (!dotsEl) return;
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Slide ${i + 1}`);
      d.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsEl.appendChild(d);
    });
  }

  function resetAuto() {
    clearInterval(autoInterval);
    autoInterval = setInterval(() => goTo(current + 1), 5500);
  }

  document.getElementById('prevNews')?.addEventListener('click', () => {
    goTo(current - 1); resetAuto();
  });
  document.getElementById('nextNews')?.addEventListener('click', () => {
    goTo(current + 1); resetAuto();
  });

  buildDots();
  resetAuto();
});
