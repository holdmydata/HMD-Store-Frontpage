(() => {
  const cookie = document.querySelector('#cookie');
  const accept = document.querySelector('#cookieAccept');
  try { if (cookie && localStorage.getItem('ms-cookie-consent') === 'accepted') cookie.hidden = true; } catch (_) { /* storage may be disabled */ }
  accept?.addEventListener('click', () => { try { localStorage.setItem('ms-cookie-consent', 'accepted'); } catch (_) {} if (cookie) cookie.hidden = true; });
  const layers = [...document.querySelectorAll('[data-speed]')];
  let ticking = false;
  const move = () => { const y = window.scrollY; layers.forEach(layer => { layer.style.transform = `translate3d(0, ${Math.min(y * Number(layer.dataset.speed), 220)}px, 0)`; }); ticking = false; };
  window.addEventListener('scroll', () => { if (!ticking) { window.requestAnimationFrame(move); ticking = true; } }, { passive: true });
  document.querySelector('.menu')?.addEventListener('click', () => { const nav = document.querySelector('.site-header nav'); nav.style.display = nav.style.display === 'flex' ? '' : 'flex'; nav.style.flexDirection = 'column'; nav.style.position = 'absolute'; nav.style.top = '65px'; nav.style.right = '20px'; nav.style.background = '#211d2b'; nav.style.padding = '18px'; });
  const shareTotal = document.querySelector('[data-share-total]');
  const shareInputs = [...document.querySelectorAll('[data-share]')];
  if (shareTotal && shareInputs.length) {
    const values = { visit: 0.10, insight: 0.10, offers: 0.10 };
    const updateShare = () => {
      const total = Math.min(0.30, shareInputs.filter(input => input.checked).reduce((sum, input) => sum + values[input.dataset.share], 0));
      shareTotal.textContent = `~$${total.toFixed(2)}`;
    };
    shareInputs.forEach(input => input.addEventListener('change', updateShare));
    updateShare();
  }
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
  const directoryGrid = document.querySelector('#directoryGrid');
  if (directoryGrid) {
    const search = document.querySelector('#shopSearch'), count = document.querySelector('#directoryCount'), empty = document.querySelector('#directoryEmpty');
    const apiBase = new URLSearchParams(window.location.search).get('api') || window.HMD_API_BASE || 'https://storefront.holdmydata.store';
    let entries = [], debounce;
    const text = value => value == null ? '' : String(value);
    const mono = name => { const el = document.createElement('div'); el.className = 'shop-mono'; el.textContent = text(name).trim().split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase() || '??'; return el; };
    const hours = value => { if (!value || value.v !== 1 || !Array.isArray(value.days)) return 'Hours not listed'; const labels = {sun:'Sun',mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat'}; const open = value.days.filter(day => day && !day.closed && day.open && day.close); if (!open.length) return 'Closed — check with the shop'; const fmt = time => { const [h, m] = time.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2,'0')}${h >= 12 ? 'pm' : 'am'}`; }; return open.map(day => `${labels[day.day] || day.day} ${fmt(day.open)}–${fmt(day.close)}`).join(' · '); };
    const render = list => { directoryGrid.replaceChildren(); empty.hidden = list.length !== 0; if (!list.length) { count.textContent = entries.length ? '0 matching shops' : 'No member shops yet'; if (entries.length) { empty.querySelector('h2').textContent = 'No shops match that.'; empty.querySelector('.empty-copy').textContent = "Try a city, a name, or what you're looking for."; empty.querySelector('a').textContent = 'Clear search'; } return; } count.textContent = list.length === entries.length ? `${entries.length} member shops` : `${list.length} of ${entries.length} shops`; list.forEach(shop => { const card = document.createElement('article'); card.className = 'shop-card'; card.setAttribute('role','listitem'); const media = document.createElement('div'); media.className = 'shop-media'; if (shop.photoUrl) { const img = document.createElement('img'); img.className = 'shop-photo'; img.alt = text(shop.name); img.src = text(shop.photoUrl); img.onerror = () => media.replaceChildren(mono(shop.name)); media.append(img); } else media.append(mono(shop.name)); const body = document.createElement('div'); body.className = 'shop-card-body'; const name = document.createElement('h3'), nameLink = document.createElement('a'); nameLink.href = `https://storefront.holdmydata.store/login?role=customer&shop=${encodeURIComponent(shop.slug)}`; nameLink.textContent = text(shop.name); name.append(nameLink); const desc = document.createElement('p'); desc.textContent = text(shop.description || 'A member shop in your neighborhood.'); const detail = document.createElement('p'); detail.className = 'shop-detail'; detail.textContent = [shop.addressLine1, shop.addressLine2, [shop.city, shop.state].filter(Boolean).join(', '), shop.postalCode].filter(Boolean).join(' · ') || 'Address not listed'; const open = document.createElement('p'); open.className = 'shop-detail'; open.textContent = hours(shop.hours); const cta = document.createElement('a'); cta.className = 'text-link'; cta.href = nameLink.href; cta.setAttribute('aria-label', `See my rewards at ${text(shop.name)}`); cta.textContent = 'See my rewards ↗'; body.append(name, desc, detail, open, cta); card.append(media, body); directoryGrid.append(card); }); };
    search?.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(() => { const query = search.value.trim().toLowerCase(); render(entries.filter(shop => [shop.name, shop.description, shop.city, shop.state].some(value => text(value).toLowerCase().includes(query)))); }, 150); });
    empty?.querySelector('a')?.addEventListener('click', event => { if (event.currentTarget.textContent === 'Clear search') { event.preventDefault(); search.value = ''; render(entries); search.focus(); } });
    fetch(`${apiBase.replace(/\/$/, '')}/graphql`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({query:'{ storeDirectory { id name slug addressLine1 addressLine2 city state postalCode photoUrl description hours } }'}), signal:AbortSignal.timeout(8000)}).then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); }).then(payload => { if (payload.errors) throw new Error(payload.errors[0]?.message || 'GraphQL error'); entries = Array.isArray(payload.data?.storeDirectory) ? payload.data.storeDirectory : []; search.disabled = false; render(entries); }).catch(error => { console.warn('HMD Storefront directory unavailable:', error.message); directoryGrid.replaceChildren(); empty.hidden = false; empty.querySelector('h2').textContent = "We couldn't reach the directory."; empty.querySelector('.empty-copy').textContent = 'The network is still growing — try again in a moment.'; empty.querySelector('a').textContent = 'Reload'; empty.querySelector('a').href = window.location.href; count.textContent = ''; });
  }
})();
