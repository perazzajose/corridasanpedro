// sponsors-firestore.js
// Lee la colección "sponsors" de Firestore y se la pasa a app.js
// (función global window.initSponsorsFromFirestore). Si Firestore
// falla o todavía no tiene sponsors cargados, app.js usa los que
// están hardcodeados como respaldo.

import { db } from './firebase-init.js';
import {
  collection, getDocs, query, orderBy,
} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

async function loadSponsorsFromFirestore() {
  const list = [];

  try {
    const q = query(collection(db, 'sponsors'), orderBy('orden', 'asc'));
    const snap = await getDocs(q);
    snap.forEach(docSnap => {
      const { name, logo, desc, url } = docSnap.data();
      if (!name || !logo) return;
      list.push({ name, logo, desc: desc || '', url: url || '#' });
    });
  } catch (err) {
    console.warn('[sponsors] No se pudo leer Firestore, uso sponsors locales de respaldo.', err);
  }

  if (typeof window.initSponsorsFromFirestore === 'function') {
    window.initSponsorsFromFirestore(list);
  }
}

loadSponsorsFromFirestore();
