/* ============================================
   BURNOUT CHILE — Galería, Nav activo, Misc
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* Volver al inicio al recargar */
window.addEventListener('beforeunload', function() {
  window.scrollTo(0, 0);
});

history.scrollRestoration = 'manual';

  /* ============ GALERÍA / LIGHTBOX ============ */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox     = document.getElementById('lightbox');
  const lbContent    = document.getElementById('lbContent');
  const lbClose      = document.getElementById('lbClose');
  const lbPrevBtn    = document.getElementById('lbPrev');
  const lbNextBtn    = document.getElementById('lbNext');

  // Colección de contenidos de lightbox (emoji o <img>)
  const lbData = Array.from(galleryItems).map(item => {
    const img = item.querySelector('img');
    return img ? img.src : item.querySelector('.gallery-placeholder')?.textContent.trim() || '🤘';
  });

  let lbIdx = 0;

  function openLb(i) {
    lbIdx = i;
    renderLb();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderLb() {
    const d = lbData[lbIdx];
    if (d.startsWith('http') || d.endsWith('.jpg') || d.endsWith('.png') || d.endsWith('.webp')) {
      lbContent.innerHTML = `<img src="${d}" style="max-width:90vw;max-height:82vh;object-fit:contain;display:block;">`;
    } else {
      lbContent.textContent = d;
    }
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLb(i));
  });
  lbClose?.addEventListener('click', closeLb);
  lbPrevBtn?.addEventListener('click', () => { lbIdx = (lbIdx - 1 + lbData.length) % lbData.length; renderLb(); });
  lbNextBtn?.addEventListener('click', () => { lbIdx = (lbIdx + 1) % lbData.length; renderLb(); });

  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });

  // Teclado
  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLb();
    if (e.key === 'ArrowLeft')   { lbIdx = (lbIdx - 1 + lbData.length) % lbData.length; renderLb(); }
    if (e.key === 'ArrowRight')  { lbIdx = (lbIdx + 1) % lbData.length; renderLb(); }
  });

  /* ============ FLIP CARDS (mobile tap) ============ */
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });

  /* ============ HAMBURGER MENU ============ */
  const hamburger   = document.getElementById('hamburger');
  const navMenu     = document.getElementById('navLinks');

  function closeMenu() {
    navMenu?.classList.remove('open');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
  }

  hamburger?.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Cerrar al hacer click en un link
  navMenu?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // Cerrar al hacer click fuera del menú
  document.addEventListener('click', e => {
    if (navMenu?.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  /* ============ NAV ACTIVO ============ */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');

  function updateNav() {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 80) current = s.id;
    });
    navLinks.forEach(a => {
      const href = a.getAttribute('href').replace('#', '');
      a.classList.toggle('active', href === current);
    });
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ============ BACK TO TOP ============ */
  const backTop = document.querySelector('.back-top');
  window.addEventListener('scroll', () => {
    backTop?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  /* ============ FORMULARIO CONTACTO ============ */
  contactForm?.addEventListener('submit', async function(e) {
  e.preventDefault();

  const nombre  = document.getElementById('cNombre').value.trim();
  const email   = document.getElementById('cEmail').value.trim();
  const asunto  = document.getElementById('cAsunto').value.trim();
  const mensaje = document.getElementById('cMensaje').value.trim();

  document.querySelectorAll('.field-error').forEach(el => el.remove());
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

  let valido = true;

  function marcarError(id, msg) {
    const input = document.getElementById(id);
    input.classList.add('input-error');
    const err = document.createElement('span');
    err.className   = 'field-error';
    err.textContent = msg;
    input.parentElement.appendChild(err);
    valido = false;
  }

  if (!nombre)                                              marcarError('cNombre', '⚠️ El nombre es obligatorio.');
  if (!email)                                               marcarError('cEmail',  '⚠️ El email es obligatorio.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))      marcarError('cEmail',  '⚠️ El email no es válido.');
  if (!asunto)                                              marcarError('cAsunto', '⚠️ El asunto es obligatorio.');
  if (!mensaje)                                             marcarError('cMensaje','⚠️ El mensaje es obligatorio.');
  else if (mensaje.length < 1)                             marcarError('cMensaje','⚠️ El mensaje es muy corto.');

  if (!valido) return;

  try {
    const res = await fetch(SB_URL + '/rest/v1/contacto', {
      method:  'POST',
      headers: SB_HEADERS,
      body:    JSON.stringify({ nombre, email, asunto, mensaje })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    contactSuccess.style.display = 'block';
    contactForm.reset();
    setTimeout(function() { contactSuccess.style.display = 'none'; }, 4000);
  } catch(err) {
    console.error('Error al enviar:', err);
    alert('❌ No se pudo enviar el mensaje. Intenta más tarde.');
  }
  });

  
});