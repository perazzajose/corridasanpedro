'use strict';

/* ─────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────── */
const CONFIG = {
  eventDate: new Date(2026, 8, 27, 9, 0, 0), // 27 setiembre 2026, 09:00
  stravaClientId: 'TU_CLIENT_ID_AQUI',
  stravaRedirectUri: window.location.origin + window.location.pathname,
  stravaScope: 'read,activity:read_all',
};

const SPONSORS = [
  {
    name: 'La hogarena',
    logo: 'assets/sponsors/lahogarena.jpg',
    desc: 'Breve descripción de la empresa y su apoyo a la Corrida de San Pedro.',
    url: '#',
  },
  {
    name: 'UPM',
    logo: 'assets/sponsors/upm.jpg',
    desc: 'Breve descripción de la empresa y su apoyo a la Corrida de San Pedro.',
    url: '#',
  },
  {
    name: 'terma',
    logo: 'assets/sponsors/terma.jpg',
    desc: 'Breve descripción de la empresa y su apoyo a la Corrida de San Pedro.',
    url: '#',
  },
  {
    name: 'La hogarena',
    logo: 'assets/sponsors/lahogarena.jpg',
    desc: 'Breve descripción de la empresa y su apoyo a la Corrida de San Pedro.',
    url: '#',
  },
];

const GALLERY_EDITIONS = {
  2024: [
    'assets/recorrido1.jpg',
    'assets/final.jpeg',
    'assets/podio.webp',
  ],
  2025: [
    'assets/2.jpg',
    'assets/1.jpg',
    'assets/3.jpg',
    'assets/4.jpg',
    'assets/5.jpg',
    'assets/6.jpg',
    'assets/8.jpg',
    'assets/9.jpg',
    'assets/10.jpg',
    'assets/11.jpg',
    'assets/12.jpg',
    'assets/14.jpg',
    'assets/cuerdatambores.jpg',
  ],
};

/* ─────────────────────────────────────────────────────────────
───────────────────────────────────────────────────────────── */
function lazyLoadImages(imgs) {
  if (!imgs || !imgs.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const realSrc = img.dataset.src;
      if (!realSrc) return;
      img.src = realSrc;
      img.addEventListener('load', () => { img.style.opacity = '1'; }, { once: true });
      obs.unobserve(img);
    });
  }, { rootMargin: '250px 0px', threshold: 0.01 });

  imgs.forEach(img => observer.observe(img));
}

/* ─────────────────────────────────────────────────────────────
   RENDER: SPONSORS
───────────────────────────────────────────────────────────── */
function renderSponsors() {
  const grid = document.getElementById('sponsorsGrid');
  if (!grid) return;

  grid.innerHTML = SPONSORS.map(s => `
    <article class="category-card reveal">
      <img
        data-src="${s.logo}"
        alt="${s.name}"
        loading="lazy"
        decoding="async"
        style="max-width:220px;max-height:110px;width:100%;height:auto;object-fit:contain;margin:0 auto 20px;display:block;opacity:0;transition:opacity .4s ease;"
      />
      <h3>${s.name}</h3>
      <p class="card-desc">${s.desc}</p>
      <a href="${s.url}" target="_blank" rel="noopener" class="btn-trap btn-trap--card">
        <span class="btn-inner">
          <span class="material-icons-round">open_in_new</span>
          Visitar sitio
        </span>
      </a>
    </article>
  `).join('');

  lazyLoadImages(grid.querySelectorAll('img[data-src]'));
}

/* ─────────────────────────────────────────────────────────────
   RENDER: GALERÍA 
───────────────────────────────────────────────────────────── */
// Patrón bento: 1 foto grande (8 cols x 2 filas) + 4 chicas (4 cols x 1 fila)
// alrededor, repitiendo y alternando de lado para que no quede simétrico.
const BENTO_PATTERN_LEFT  = ['bento-w3 bento-h2', 'bento-w1', 'bento-w1', 'bento-w1', 'bento-w1'];
const BENTO_PATTERN_RIGHT = ['bento-w1', 'bento-w1', 'bento-w3 bento-h2', 'bento-w1', 'bento-w1'];

function bentoClassesFor(count) {
  // Secciones chicas (2 o 3 fotos): todas del mismo tamaño, una sola fila prolija.
  if (count <= 3) {
    const span = count === 1 ? 'bento-w3' : count === 2 ? 'bento-w2' : 'bento-w1';
    return Array(count).fill(span);
  }

  const classes = [];
  let side = 0; // alterna patrón izq/der cada 5 fotos
  while (classes.length < count) {
    const pattern = side % 2 === 0 ? BENTO_PATTERN_LEFT : BENTO_PATTERN_RIGHT;
    classes.push(...pattern);
    side++;
  }
  classes.length = count;

  // Si sobran 1 o 2 fotos sueltas al final del patrón, que llenen fila entera.
  const remainder = count % 5;
  if (remainder === 1) classes[count - 1] = 'bento-w3';
  if (remainder === 2) { classes[count - 2] = 'bento-w2'; classes[count - 1] = 'bento-w2'; }

  return classes;
}

function renderBentoEdition(containerId, srcs) {
  const container = document.getElementById(containerId);
  if (!container || !srcs || !srcs.length) return;

  const classes = bentoClassesFor(srcs.length);

  container.innerHTML = srcs.map((src, i) => `
    <div class="bento-full-item ${classes[i]}">
      <img
        data-src="${src}"
        alt="Corrida de San Pedro"
        loading="lazy"
        decoding="async"
        style="opacity:0;transition:opacity .4s ease;"
      />
    </div>
  `).join('');

  lazyLoadImages(container.querySelectorAll('img[data-src]'));
}

function renderBentoFull() {
  Object.entries(GALLERY_EDITIONS).forEach(([year, srcs]) => {
    renderBentoEdition(`bentoFull${year}`, srcs);
  });
}

/* ─────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!navbar) return;

  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  const closeMenu = () => {
    links?.classList.remove('open');
    toggle?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('visible');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
  };

  closeMenu();

  const closeButton = document.getElementById('navClose');

  const openMenu = () => {
    links?.classList.add('open');
    toggle?.classList.add('open');
    toggle?.setAttribute('aria-expanded', 'true');
    backdrop.classList.add('visible');
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
  };

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
  navbar.classList.toggle('scrolled', window.scrollY > 60);

  if (toggle && links) {
    toggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = links.classList.contains('open');
      isOpen ? closeMenu() : openMenu();
    });

    backdrop.addEventListener('click', closeMenu);
    closeButton?.addEventListener('click', closeMenu);

    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) closeMenu();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }
}

/* ─────────────────────────────────────────────────────────────
   FLOATING MOBILE CTA
───────────────────────────────────────────────────────────── */
function initFloatingCta() {
  const cta = document.getElementById('floatingCta');
  if (!cta) return;

  // Show after scrolling past the hero
  const hero = document.getElementById('hero');
  const observer = new IntersectionObserver(
    ([entry]) => {
      cta.classList.toggle('visible', !entry.isIntersecting);
    },
    { threshold: 0.1 }
  );
  if (hero) observer.observe(hero);
}

/* ─────────────────────────────────────────────────────────────
   COUNTDOWN
───────────────────────────────────────────────────────────── */
function initCountdown() {
  const els = {
    days:  document.getElementById('cdDays'),
    hours: document.getElementById('cdHours'),
    mins:  document.getElementById('cdMins'),
    secs:  document.getElementById('cdSecs'),
  };
  if (!els.days) return;

  function update() {
    const diff = CONFIG.eventDate - new Date();
    if (diff <= 0) {
      Object.values(els).forEach(el => { if (el) el.textContent = '00'; });
      return;
    }
    els.days.textContent  = String(Math.floor(diff / 86400000)).padStart(2, '0');
    els.hours.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
    els.mins.textContent  = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    els.secs.textContent  = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  }
  update();
  setInterval(update, 1000);
}

/* ─────────────────────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(
    entries => entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement?.children || [])
        .filter(el => el.classList.contains('reveal'));
      const delay = siblings.indexOf(entry.target) * 90;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      obs.unobserve(entry.target);
    }),
    { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────────────────────────
   BENTO CAROUSEL (mobile)
───────────────────────────────────────────────────────────── */
function initCarousel() {
  const track  = document.getElementById('carouselTrack');
  const prev   = document.getElementById('carouselPrev');
  const next   = document.getElementById('carouselNext');
  const dotsWrap = document.getElementById('carouselDots');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  if (!slides.length) return;

  let current  = 0;
  let startX   = 0;
  let isDragging = false;

  // Build dots
  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  function goTo(idx) {
    if (slides.length <= 1) {
      current = 0;
    } else {
      current = (idx + slides.length) % slides.length;
    }
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap?.querySelectorAll('.carousel-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  }

  prev?.addEventListener('click', () => goTo(current - 1));
  next?.addEventListener('click', () => goTo(current + 1));

  // Touch/swipe
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (!isDragging) return;
    const delta = e.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 40) goTo(delta < 0 ? current + 1 : current - 1);
    isDragging = false;
  });

  // Auto-advance
  setInterval(() => goTo(current + 1), 5000);
}

/* ─────────────────────────────────────────────────────────────
   WINNERS TABS
───────────────────────────────────────────────────────────── */
function initFranjaTabs() {
  document.querySelectorAll('.category-card').forEach(card => {
    const tabs = card.querySelectorAll('.franja-tab');
    const badge = card.querySelector('[data-franja-badge]');
    const title = card.querySelector('[data-franja-title]');
    const date = card.querySelector('[data-franja-date]');
    const price = card.querySelector('[data-franja-price]');
    const note = card.querySelector('[data-franja-note]');

    if (!tabs.length || !badge || !title || !date || !price || !note) return;

    const activate = button => {
      tabs.forEach(tab => {
        const isActive = tab === button;
        tab.classList.toggle('franja-tab--active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      badge.textContent = button.dataset.badge || '';
      title.textContent = button.dataset.title || '';
      date.textContent = button.dataset.date || '';
      price.textContent = button.dataset.price || '';
      note.textContent = button.dataset.note || '';
    };

    tabs.forEach(tab => tab.addEventListener('click', () => activate(tab)));
    activate(tabs[0]);
  });
}

function initWinnersTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('tab-btn--active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('tab-panel--active'));
      btn.classList.add('tab-btn--active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(target)?.classList.add('tab-panel--active');
    });
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.querySelectorAll('.dist-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.dist;
        panel.querySelectorAll('.dist-tab').forEach(b => b.classList.remove('dist-tab--active'));
        panel.querySelectorAll('.dist-table').forEach(t => t.classList.remove('dist-table--active'));
        btn.classList.add('dist-tab--active');
        panel.querySelector(`#${target}`)?.classList.add('dist-table--active');
      });
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   SMOOTH SCROLL
───────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   LIGHTBOX MODAL
───────────────────────────────────────────────────────────── */
function initLightbox() {
  let modal = document.querySelector('.lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Cerrar galería">&times;</button>
        <button class="lightbox-nav lightbox-prev" aria-label="Foto anterior">
          <span class="material-icons-round">chevron_left</span>
        </button>
        <div class="lightbox-tap-zone lightbox-tap-zone--left" aria-hidden="true"></div>
        <img class="lightbox-img" src="" alt="" />
        <div class="lightbox-tap-zone lightbox-tap-zone--right" aria-hidden="true"></div>
        <button class="lightbox-nav lightbox-next" aria-label="Foto siguiente">
          <span class="material-icons-round">chevron_right</span>
        </button>
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const img       = modal.querySelector('.lightbox-img');
  const caption   = modal.querySelector('.lightbox-caption');
  const closeBtn  = modal.querySelector('.lightbox-close');
  const prevBtn   = modal.querySelector('.lightbox-prev');
  const nextBtn   = modal.querySelector('.lightbox-next');
  const tapLeft   = modal.querySelector('.lightbox-tap-zone--left');
  const tapRight  = modal.querySelector('.lightbox-tap-zone--right');

  let gallerySet = [];
  let currentIndex = 0;

  const updateNavVisibility = () => {
    const hide = gallerySet.length <= 1;
    prevBtn.hidden = hide;
    nextBtn.hidden = hide;
    tapLeft.style.display  = hide ? 'none' : 'block';
    tapRight.style.display = hide ? 'none' : 'block';
  };

  const renderImage = (labelOverride) => {
    const item = gallerySet[currentIndex];
    if (!item) return;
    img.src = item.src;
    img.alt = item.alt || 'Imagen de la Corrida San Pedro';
    caption.textContent = labelOverride ?? (item.label || item.alt || '');
  };

  const goTo = direction => {
    if (gallerySet.length <= 1) return;
    currentIndex = (currentIndex + direction + gallerySet.length) % gallerySet.length;

    img.style.opacity = '0';
    img.style.transform = `translateX(${direction > 0 ? '-18px' : '18px'})`;

    setTimeout(() => {
      renderImage();
      img.style.transition = 'none';
      img.style.transform = `translateX(${direction > 0 ? '18px' : '-18px'})`;
      void img.offsetWidth;
      img.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      img.style.opacity = '1';
      img.style.transform = 'translateX(0)';
    }, 220);
  };

  const next = () => goTo(1);
  const prev = () => goTo(-1);

  const openLightbox = (targetImg, selector) => {
    const nodes = Array.from(document.querySelectorAll(selector));
    gallerySet = nodes.map(node => {
      const parent = node.parentElement;
      const labelEl = parent.querySelector('.bento-label') || parent.querySelector('.gallery-overlay span') || parent.querySelector('span');
      return {
        src: node.src,
        alt: node.alt,
        label: labelEl ? labelEl.textContent.trim() : node.alt,
      };
    });
    currentIndex = nodes.indexOf(targetImg);
    if (currentIndex < 0) currentIndex = 0;

    updateNavVisibility();
    img.style.transition = 'none';
    img.style.transform = 'translateX(0)';
    img.style.opacity = '1';
    renderImage();

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { if (!modal.classList.contains('active')) img.src = ''; }, 350);
  };

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  tapLeft.addEventListener('click', prev);
  tapRight.addEventListener('click', next);

  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  window.addEventListener('keydown', e => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Swipe táctil
  let touchStartX = 0;
  modal.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  modal.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) delta < 0 ? next() : prev();
  });

  const selectors = [
    '.bento-item img',
    '.carousel-slide img',
    '.winners-img-banner img',
    '.bento-full-item img',
    '.gallery-grid-item img',
    '.route-image img'
  ];

  document.body.addEventListener('click', e => {
    const targetImg = e.target.closest('img');
    if (!targetImg) return;

    const matchedSelector = selectors.find(sel => targetImg.matches(sel));
    if (matchedSelector) {
      openLightbox(targetImg, matchedSelector);
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFloatingCta();
  initCountdown();
  renderSponsors();   
  renderBentoFull();  
  initReveal();      
  initCarousel();
  initFranjaTabs();
  initWinnersTabs();
  initSmoothScroll();
  initLightbox();

  console.log('%c🌿 Corrida de San Pedro', 'color:#2D6A4F;font-size:18px;font-weight:bold;');
  console.log('%cDurazno, Uruguay', 'color:#74C69D;');
});