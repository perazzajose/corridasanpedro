// admin.js
// Panel de administración de la galería (/admin.html).
// Requiere que firebase-init.js tenga la config real del proyecto,
// y que exista al menos un usuario creado en
// Firebase Console → Authentication → Users.
//
// Las fotos y logos NO se suben a Firebase: se pegan como link
// (subidos antes a Imgur u otro hosting). Firestore solo guarda la URL.

import { auth, db } from './firebase-init.js';
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut,
} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';
import {
  collection, query, where, orderBy, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

// Fotos que ya viven en el repo (assets/), para el botón "Importar".
// Si agregás/renombrás archivos en assets/, actualizá esta lista.
const LOCAL_PHOTOS_BY_EDITION = {
  2024: ['assets/recorrido1.jpg', 'assets/final.jpeg', 'assets/podio.webp'],
  2025: [
    'assets/1.jpg', 'assets/2.jpg', 'assets/3.jpg', 'assets/4.jpg',
    'assets/5.jpg', 'assets/6.jpg', 'assets/8.jpg', 'assets/9.jpg',
    'assets/10.jpg', 'assets/11.jpg', 'assets/12.jpg', 'assets/14.jpg',
    'assets/cuerdatambores.jpg',
  ],
};

let currentYear = '2024';

const els = {
  loginScreen:     document.getElementById('loginScreen'),
  loginForm:       document.getElementById('loginForm'),
  loginEmail:      document.getElementById('loginEmail'),
  loginPassword:   document.getElementById('loginPassword'),
  loginError:      document.getElementById('loginError'),
  loginSubmitBtn:  document.getElementById('loginSubmitBtn'),
  dashboard:       document.getElementById('adminDashboard'),
  logoutBtn:       document.getElementById('logoutBtn'),

  tabs:            document.getElementById('adminTabs'),
  importBtn:       document.getElementById('importBtn'),
  uploadYearLabel: document.getElementById('uploadYearLabel'),
  photoUrlForm:    document.getElementById('photoUrlForm'),
  photoUrlInput:   document.getElementById('photoUrlInput'),
  photoUrlSubmitBtn: document.getElementById('photoUrlSubmitBtn'),
  photoUrlError:   document.getElementById('photoUrlError'),
  photosGrid:      document.getElementById('photosGrid'),
  photosEmpty:     document.getElementById('photosEmpty'),

  sectionTabs:     document.getElementById('adminSectionTabs'),
  sectionGaleria:  document.getElementById('sectionGaleria'),
  sectionSponsors: document.getElementById('sectionSponsors'),

  sponsorForm:      document.getElementById('sponsorForm'),
  sponsorName:      document.getElementById('sponsorName'),
  sponsorUrl:       document.getElementById('sponsorUrl'),
  sponsorDesc:      document.getElementById('sponsorDesc'),
  sponsorLogoUrl:   document.getElementById('sponsorLogoUrl'),
  sponsorSubmitBtn: document.getElementById('sponsorSubmitBtn'),
  sponsorUrlError:  document.getElementById('sponsorUrlError'),
  sponsorsList:     document.getElementById('sponsorsList'),
  sponsorsEmpty:    document.getElementById('sponsorsEmpty'),
};

/* ─────────────────────────────────────────────────────────────
   AUTH
───────────────────────────────────────────────────────────── */
onAuthStateChanged(auth, user => {
  if (user) {
    els.loginScreen.hidden = true;
    els.dashboard.hidden = false;
    loadPhotos(currentYear);
    loadSponsors();
  } else {
    els.loginScreen.hidden = false;
    els.dashboard.hidden = true;
  }
});

els.loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  els.loginError.hidden = true;
  els.loginSubmitBtn.disabled = true;
  try {
    await signInWithEmailAndPassword(auth, els.loginEmail.value.trim(), els.loginPassword.value);
  } catch (err) {
    els.loginError.textContent = 'No pudimos iniciar sesión. Revisá el correo y la contraseña.';
    els.loginError.hidden = false;
    console.error(err);
  } finally {
    els.loginSubmitBtn.disabled = false;
  }
});

els.logoutBtn.addEventListener('click', () => signOut(auth));

/* ─────────────────────────────────────────────────────────────
   SECCIÓN: GALERÍA vs SPONSORS
───────────────────────────────────────────────────────────── */
els.sectionTabs.addEventListener('click', e => {
  const btn = e.target.closest('.admin-section-tab');
  if (!btn) return;
  const section = btn.dataset.section;
  els.sectionTabs.querySelectorAll('.admin-section-tab').forEach(b => {
    b.classList.toggle('admin-section-tab--active', b === btn);
  });
  els.sectionGaleria.hidden = section !== 'galeria';
  els.sectionSponsors.hidden = section !== 'sponsors';
});

/* ─────────────────────────────────────────────────────────────
   TABS DE EDICIÓN (2024 / 2025 / 2026)
───────────────────────────────────────────────────────────── */
els.tabs.addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  currentYear = btn.dataset.year;
  els.tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('tab-btn--active', b === btn));
  els.uploadYearLabel.textContent = currentYear;
  loadPhotos(currentYear);
});

/* ─────────────────────────────────────────────────────────────
   CARGAR FOTOS DE LA EDICIÓN ACTIVA
───────────────────────────────────────────────────────────── */
async function loadPhotos(year) {
  els.photosGrid.innerHTML = '';
  els.photosEmpty.hidden = false;
  els.photosEmpty.textContent = 'Cargando fotos…';
  els.photosGrid.appendChild(els.photosEmpty);

  try {
    const q = query(
      collection(db, 'galeria'),
      where('edicion', '==', String(year)),
      orderBy('orden', 'asc'),
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      els.photosEmpty.textContent = 'Todavía no hay fotos cargadas para esta edición.';
      return;
    }

    els.photosGrid.innerHTML = '';
    snap.forEach(docSnap => {
      els.photosGrid.appendChild(buildPhotoCard(docSnap.id, docSnap.data()));
    });
  } catch (err) {
    els.photosEmpty.textContent = 'Error al cargar las fotos. Revisá la consola / reglas de Firestore.';
    console.error(err);
  }
}

function buildPhotoCard(id, data) {
  const card = document.createElement('div');
  card.className = 'admin-photo-card';
  card.innerHTML = `
    <img src="${data.url}" alt="" loading="lazy" />
    <div class="admin-photo-footer">
      <input type="number" value="${data.orden ?? 0}" title="Orden" />
      <button type="button" class="admin-photo-delete">
        <span class="material-icons-round">delete</span> Borrar
      </button>
    </div>
  `;

  const ordenInput = card.querySelector('input[type="number"]');
  ordenInput.addEventListener('change', async () => {
    try {
      await updateDoc(doc(db, 'galeria', id), { orden: Number(ordenInput.value) || 0 });
    } catch (err) {
      console.error(err);
      alert('No se pudo guardar el orden.');
    }
  });

  const delBtn = card.querySelector('.admin-photo-delete');
  delBtn.addEventListener('click', async () => {
    if (!confirm('¿Borrar esta foto de la galería?')) return;
    delBtn.disabled = true;
    try {
      await deleteDoc(doc(db, 'galeria', id));
      card.remove();
      if (!els.photosGrid.querySelector('.admin-photo-card')) {
        els.photosEmpty.hidden = false;
        els.photosEmpty.textContent = 'Todavía no hay fotos cargadas para esta edición.';
        els.photosGrid.appendChild(els.photosEmpty);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo borrar la foto.');
      delBtn.disabled = false;
    }
  });

  return card;
}

/* ─────────────────────────────────────────────────────────────
   AGREGAR FOTO NUEVA (pegando un link, ej. de Imgur)
───────────────────────────────────────────────────────────── */
async function nextOrdenFor(year) {
  const snap = await getDocs(query(collection(db, 'galeria'), where('edicion', '==', String(year))));
  let max = -1;
  snap.forEach(d => { const o = d.data().orden ?? 0; if (o > max) max = o; });
  return max + 1;
}

els.photoUrlForm.addEventListener('submit', async e => {
  e.preventDefault();
  els.photoUrlError.hidden = true;

  const url = els.photoUrlInput.value.trim();
  if (!url) return;

  els.photoUrlSubmitBtn.disabled = true;
  try {
    const year = currentYear;
    const orden = await nextOrdenFor(year);
    await addDoc(collection(db, 'galeria'), {
      edicion: String(year),
      url,
      orden,
      creado: serverTimestamp(),
    });
    els.photoUrlForm.reset();
    loadPhotos(year);
  } catch (err) {
    console.error(err);
    els.photoUrlError.textContent = 'No se pudo guardar. Revisá la consola / reglas de Firestore.';
    els.photoUrlError.hidden = false;
  } finally {
    els.photoUrlSubmitBtn.disabled = false;
  }
});

/* ─────────────────────────────────────────────────────────────
   IMPORTAR FOTOS ACTUALES DEL SITIO (una sola vez, sin duplicar)
───────────────────────────────────────────────────────────── */
els.importBtn.addEventListener('click', async () => {
  if (!confirm('Esto registra en Firestore las fotos que ya están en assets/. ¿Continuar?')) return;
  els.importBtn.disabled = true;
  els.importBtn.textContent = 'Importando...';

  try {
    let imported = 0;
    for (const [year, urls] of Object.entries(LOCAL_PHOTOS_BY_EDITION)) {
      const existingSnap = await getDocs(query(collection(db, 'galeria'), where('edicion', '==', String(year))));
      const existingUrls = new Set();
      existingSnap.forEach(d => existingUrls.add(d.data().url));

      let orden = existingSnap.size;
      for (const url of urls) {
        if (existingUrls.has(url)) continue;
        await addDoc(collection(db, 'galeria'), {
          edicion: String(year),
          url,
          orden: orden++,
          creado: serverTimestamp(),
        });
        imported++;
      }
    }
    alert(imported ? `Se importaron ${imported} fotos nuevas.` : 'No había fotos nuevas para importar.');
    loadPhotos(currentYear);
  } catch (err) {
    console.error(err);
    alert('Hubo un error importando. Revisá la consola.');
  } finally {
    els.importBtn.disabled = false;
    els.importBtn.innerHTML = '<span class="material-icons-round">cloud_download</span> Importar fotos actuales del sitio';
  }
});

/* ─────────────────────────────────────────────────────────────
   SPONSORS: CARGAR
───────────────────────────────────────────────────────────── */
async function loadSponsors() {
  els.sponsorsList.innerHTML = '';
  els.sponsorsEmpty.hidden = false;
  els.sponsorsEmpty.textContent = 'Cargando sponsors…';
  els.sponsorsList.appendChild(els.sponsorsEmpty);

  try {
    const q = query(collection(db, 'sponsors'), orderBy('orden', 'asc'));
    const snap = await getDocs(q);

    if (snap.empty) {
      els.sponsorsEmpty.textContent = 'Todavía no hay sponsors cargados.';
      return;
    }

    els.sponsorsList.innerHTML = '';
    snap.forEach(docSnap => {
      els.sponsorsList.appendChild(buildSponsorCard(docSnap.id, docSnap.data()));
    });
  } catch (err) {
    els.sponsorsEmpty.textContent = 'Error al cargar sponsors. Revisá la consola / reglas de Firestore.';
    console.error(err);
  }
}

function buildSponsorCard(id, data) {
  const card = document.createElement('div');
  card.className = 'admin-sponsor-card';
  card.innerHTML = `
    <div class="admin-sponsor-card-top">
      <img src="${data.logo}" alt="${data.name || ''}" loading="lazy" />
      <div class="admin-sponsor-card-fields">
        <input type="text" class="sp-name" value="${(data.name || '').replace(/"/g, '&quot;')}" placeholder="Nombre" />
        <input type="url" class="sp-url" value="${(data.url || '').replace(/"/g, '&quot;')}" placeholder="https://..." />
      </div>
    </div>
    <textarea class="sp-desc" rows="2" placeholder="Descripción breve">${data.desc || ''}</textarea>
    <label class="admin-sponsor-logo-label">
      <span>Link del logo</span>
      <input type="url" class="sp-logo" value="${(data.logo || '').replace(/"/g, '&quot;')}" placeholder="https://i.imgur.com/..." />
    </label>
    <div class="admin-sponsor-card-footer">
      <button type="button" class="admin-photo-delete sp-delete">
        <span class="material-icons-round">delete</span> Borrar
      </button>
    </div>
  `;

  const nameInput = card.querySelector('.sp-name');
  const urlInput  = card.querySelector('.sp-url');
  const descInput = card.querySelector('.sp-desc');
  const logoInput = card.querySelector('.sp-logo');
  const imgEl     = card.querySelector('img');

  const saveField = async (field, value) => {
    try {
      await updateDoc(doc(db, 'sponsors', id), { [field]: value });
    } catch (err) {
      console.error(err);
      alert('No se pudo guardar el cambio.');
    }
  };
  nameInput.addEventListener('change', () => saveField('name', nameInput.value.trim()));
  urlInput.addEventListener('change', () => saveField('url', urlInput.value.trim()));
  descInput.addEventListener('change', () => saveField('desc', descInput.value.trim()));
  logoInput.addEventListener('change', () => {
    const val = logoInput.value.trim();
    saveField('logo', val);
    imgEl.src = val;
  });

  const delBtn = card.querySelector('.sp-delete');
  delBtn.addEventListener('click', async () => {
    if (!confirm(`¿Borrar el sponsor "${data.name}"?`)) return;
    delBtn.disabled = true;
    try {
      await deleteDoc(doc(db, 'sponsors', id));
      card.remove();
      if (!els.sponsorsList.querySelector('.admin-sponsor-card')) {
        els.sponsorsEmpty.hidden = false;
        els.sponsorsEmpty.textContent = 'Todavía no hay sponsors cargados.';
        els.sponsorsList.appendChild(els.sponsorsEmpty);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo borrar el sponsor.');
      delBtn.disabled = false;
    }
  });

  return card;
}

/* ─────────────────────────────────────────────────────────────
   SPONSORS: AGREGAR (pegando el link del logo, ej. de Imgur)
───────────────────────────────────────────────────────────── */
els.sponsorForm.addEventListener('submit', async e => {
  e.preventDefault();
  els.sponsorUrlError.hidden = true;

  const name = els.sponsorName.value.trim();
  const url  = els.sponsorUrl.value.trim() || '#';
  const desc = els.sponsorDesc.value.trim();
  const logo = els.sponsorLogoUrl.value.trim();

  if (!logo) return;

  els.sponsorSubmitBtn.disabled = true;
  try {
    const existingSnap = await getDocs(collection(db, 'sponsors'));
    const orden = existingSnap.size;

    await addDoc(collection(db, 'sponsors'), {
      name, url, desc, logo, orden, creado: serverTimestamp(),
    });

    els.sponsorForm.reset();
    loadSponsors();
  } catch (err) {
    console.error(err);
    els.sponsorUrlError.textContent = 'No se pudo guardar. Revisá la consola / reglas de Firestore.';
    els.sponsorUrlError.hidden = false;
  } finally {
    els.sponsorSubmitBtn.disabled = false;
  }
});
