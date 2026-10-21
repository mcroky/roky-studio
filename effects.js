document.getElementById('year').textContent = new Date().getFullYear();

if (new URLSearchParams(window.location.search).get('sent') === '1') {
  const status = document.getElementById('feedback-status');
  status.textContent = '의견을 보내주셔서 감사합니다!';
  status.classList.add('feedback-success');
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

if (!reducedMotion.matches) {
  const revealItems = document.querySelectorAll(
    '.section-heading, .project-content, .update-card, .feedback-copy, .feedback-form, .about-layout > div'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

    revealItems.forEach((item, index) => {
      item.classList.add('reveal-item');
      item.style.setProperty('--reveal-delay', `${(index % 3) * 90}ms`);
      observer.observe(item);
    });
    document.body.classList.add('motion-ready');
  }

  if (finePointer.matches) {
    const hero = document.querySelector('.hero');
    const heroArt = document.querySelector('.hero-art');

    hero.addEventListener('pointermove', (event) => {
      const box = hero.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      heroArt.style.setProperty('--art-x', `${(x * 18).toFixed(1)}px`);
      heroArt.style.setProperty('--art-y', `${(y * 18).toFixed(1)}px`);
    });
    hero.addEventListener('pointerleave', () => {
      heroArt.style.removeProperty('--art-x');
      heroArt.style.removeProperty('--art-y');
    });

    document.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const box = card.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width;
        const y = (event.clientY - box.top) / box.height;
        card.style.setProperty('--tilt-x', `${((0.5 - y) * 5).toFixed(1)}deg`);
        card.style.setProperty('--tilt-y', `${((x - 0.5) * 5).toFixed(1)}deg`);
        card.style.setProperty('--shine-x', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--shine-y', `${(y * 100).toFixed(1)}%`);
        card.style.setProperty('--shine-opacity', '1');
      });
      card.addEventListener('pointerleave', () => {
        for (const property of ['--tilt-x', '--tilt-y', '--shine-x', '--shine-y', '--shine-opacity']) {
          card.style.removeProperty(property);
        }
      });
    });
  }
}
