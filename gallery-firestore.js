// gallery-firestore.js
// Lee la colección "galeria" de Firestore y se la pasa a app.js
// (función global window.initGalleryFromFirestore) para que arme
// el bento grid. Si Firestore falla o todavía no tiene fotos para
// una edición, app.js usa las fotos locales de respaldo.

import { db } from './firebase-init.js';
import {
  collection, getDocs, query, orderBy,
} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

async function loadGalleryFromFirestore() {
  const grouped = {};

  try {
    const q = query(collection(db, 'galeria'), orderBy('orden', 'asc'));
    const snap = await getDocs(q);

    snap.forEach(docSnap => {
      const { edicion, url } = docSnap.data();
      if (!edicion || !url) return;
      if (!grouped[edicion]) grouped[edicion] = [];
      grouped[edicion].push(url);
    });
  } catch (err) {
    console.warn('[galería] No se pudo leer Firestore, uso fotos locales de respaldo.', err);
  }

  if (typeof window.initGalleryFromFirestore === 'function') {
    window.initGalleryFromFirestore(grouped);
  }
}

loadGalleryFromFirestore();
