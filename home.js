
{
  const preview = document.getElementById('hku-preview');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let heroAnimations = [];
  function playHero() {
    for (const animation of heroAnimations) animation.cancel();
    heroAnimations = [];
    if (reducedMotion.matches) return;
    heroAnimations = Array.from(preview.querySelectorAll('.hero > :not(.pattern)'), (element, index) =>
      element.animate(
        [{clipPath: 'inset(0 50%)', opacity: .25}, {clipPath: 'inset(0 0)', opacity: 1}],
        {duration: element.matches('h1') ? 1700 : 1150, delay: 200 + index * 220,
         easing: 'cubic-bezier(.2,.68,.23,1)', fill: 'backwards'}
      )
    );
  }

  const entrance = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) playHero();
  }, {threshold: .15});
  entrance.observe(preview.querySelector('.hero'));
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) playHero();
  });

  const host = preview.querySelector('.host');
  let hostAnimations = [];
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || reducedMotion.matches) return;
    for (const animation of hostAnimations) animation.cancel();
    hostAnimations = Array.from(host.children, (element, index) => element.animate(
      [{clipPath: 'inset(0 50%)', opacity: .25, transform: 'translateY(16px)'},
       {clipPath: 'inset(0 0)', opacity: 1, transform: 'translateY(0)'}],
      {duration: 780, delay: index * 110, easing: 'cubic-bezier(.2,.68,.23,1)', fill: 'backwards'}
    ));
  }, {root: preview, threshold: .25}).observe(host);

  const grid = preview.querySelector('.speakers');
  preview.classList.add('motion-ready');
  const header = preview.querySelector('.top');
  let gridObserver;
  new ResizeObserver(() => {
    preview.style.setProperty('--header-height', header.offsetHeight + 'px');
    gridObserver?.disconnect();
    gridObserver = new IntersectionObserver(([entry]) => {
      grid.classList.toggle('keynotes-visible', entry.isIntersecting);
    }, {root: preview, rootMargin: `-${header.offsetHeight}px 0px 0px`, threshold: .25});
    gridObserver.observe(grid);
  }).observe(header);

  let scrollFrame = 0;
  function cancelScroll() {
    cancelAnimationFrame(scrollFrame);
  }
  for (const event of ['wheel', 'touchstart', 'keydown']) {
    preview.addEventListener(event, cancelScroll, {passive: true});
  }
  for (const link of preview.querySelectorAll('a[href^="#"]')) {
    link.addEventListener('click', (event) => {
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      cancelScroll();
      const start = preview.scrollTop;
      const headerHeight = header.offsetHeight;
      const end = target.id === 'hku-home' ? 0 : Math.min(preview.scrollHeight - preview.clientHeight,
        Math.max(0, start + target.getBoundingClientRect().top - preview.getBoundingClientRect().top - headerHeight));
      target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
      if (reducedMotion.matches) {
        preview.scrollTop = end;
        return;
      }
      const begin = performance.now();
      const duration = Math.min(1450, Math.max(980, Math.abs(end - start) * 1.5));
      function glide(now) {
        const fraction = Math.min(1, (now - begin) / duration);
        preview.scrollTop = start + (end - start) * (1 - (1 - fraction) ** 3);
        if (fraction < 1) scrollFrame = requestAnimationFrame(glide);
      }
      scrollFrame = requestAnimationFrame(glide);
    });
  }
  for (const button of preview.querySelectorAll('[data-speaker]')) {
    const dialog = document.getElementById(button.dataset.speaker);
    button.addEventListener('click', () => dialog.showModal());
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => button.focus({preventScroll: true}));
  }
}
