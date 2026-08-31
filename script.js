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
})();
