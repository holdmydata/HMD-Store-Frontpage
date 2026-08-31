(() => {
  const cookie = document.querySelector('#cookie');
  const accept = document.querySelector('#cookieAccept');
  if (cookie && localStorage.getItem('ms-cookie-consent') === 'accepted') cookie.hidden = true;
  accept?.addEventListener('click', () => { localStorage.setItem('ms-cookie-consent', 'accepted'); if (cookie) cookie.hidden = true; });
  const layers = [...document.querySelectorAll('[data-speed]')];
  let ticking = false;
  const move = () => { const y = window.scrollY; layers.forEach(layer => { layer.style.transform = `translate3d(0, ${Math.min(y * Number(layer.dataset.speed), 220)}px, 0)`; }); ticking = false; };
  window.addEventListener('scroll', () => { if (!ticking) { window.requestAnimationFrame(move); ticking = true; } }, { passive: true });
  document.querySelector('.menu')?.addEventListener('click', () => { const nav = document.querySelector('.site-header nav'); nav.style.display = nav.style.display === 'flex' ? '' : 'flex'; nav.style.flexDirection = 'column'; nav.style.position = 'absolute'; nav.style.top = '65px'; nav.style.right = '20px'; nav.style.background = '#211d2b'; nav.style.padding = '18px'; });
  document.querySelectorAll('[data-diagram]').forEach(stage => {
    const carousel = stage.querySelector('.diagram-carousel');
    const panels = [...stage.querySelectorAll('.diagram-panel')];
    const dots = stage.querySelector('.diagram-dots');
    if (!carousel || !dots || !panels.length) return;
    panels.forEach((panel, index) => {
      const dot = document.createElement('button'); dot.type = 'button'; dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Show diagram step ${index + 1}`); dot.setAttribute('aria-selected', index === 0);
      dot.addEventListener('click', () => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })); dots.append(dot);
    });
    const setActive = () => { const index = Math.min(panels.length - 1, Math.max(0, Math.round(carousel.scrollLeft / panels[0].offsetWidth))); [...dots.children].forEach((dot, i) => dot.setAttribute('aria-selected', i === index)); };
    carousel.addEventListener('scroll', setActive, { passive: true });
    stage.querySelector('[data-carousel-prev]')?.addEventListener('click', () => carousel.scrollBy({ left: -panels[0].offsetWidth, behavior: 'smooth' }));
    stage.querySelector('[data-carousel-next]')?.addEventListener('click', () => carousel.scrollBy({ left: panels[0].offsetWidth, behavior: 'smooth' }));
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('in-view')), { threshold: .15 }).observe(stage);
  });
})();
