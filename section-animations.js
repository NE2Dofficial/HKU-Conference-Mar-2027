
{
  const root = document.getElementById('hku-preview');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new WeakMap();
  const selector = '.subpage, .profile-publications';
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || motion.matches) continue;
      const section = entry.target;
      for (const animation of running.get(section) || []) animation.cancel();
      const children = [...section.children].flatMap(element =>
        element.matches('.schedule-timeline, .abstract-call') ? [...element.children] : [element]
      );
      running.set(section, children.map((element, index) =>
        element.animate(
          [{clipPath:'inset(0 50%)',opacity:.25,transform:'translateY(16px)'},
           {clipPath:'inset(0 0)',opacity:1,transform:'translateY(0)'}],
          {duration:element.matches('h1,h2')?1120:780,delay:index*110,
           easing:'cubic-bezier(.2,.68,.23,1)',fill:'backwards'}
        )
      ));
    }
  }, {root,threshold:.05});
  for (const section of root.querySelectorAll(selector)) observer.observe(section);
}
