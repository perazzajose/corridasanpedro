// firebase-init.js
// ─────────────────────────────────────────────────────────────
// Configuración del proyecto de Firebase para "Corrida San Pedro".
//
// Cómo conseguir estos valores:
// 1. https://console.firebase.google.com → crear proyecto nuevo
//    (ej: "corrida-san-pedro").
// 2. Dentro del proyecto: ⚙️ Configuración del proyecto → pestaña
//    "General" → sección "Tus apps" → ícono </> (Web) → registrar app.
// 3. Firebase te muestra un objeto firebaseConfig: copiá esos valores acá abajo.
//
// Después, en el mismo proyecto (100% gratis, sin tarjeta):
// - Build → Firestore Database → Crear base de datos (modo producción).
// - Build → Authentication → Sign-in method → habilitar "Correo/contraseña"
//   → pestaña Users → Add user (vos mismo, con el mail/clave que vas a usar en /admin).
// - Pegá las reglas de seguridad de firestore.rules.txt en la pestaña
//   "Rules" de Firestore.
//
// Las fotos y logos NO se suben a Firebase (eso necesitaría Storage,
// que exige plan Blaze/tarjeta). En su lugar, /admin.html pide pegar
// un link de imagen ya subida a Imgur (o cualquier hosting), y
// Firestore solo guarda ese link.
// ─────────────────────────────────────────────────────────────

import { initializeApp }  from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js';
import { getFirestore }   from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import { getAuth }        from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';

const firebaseConfig = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROYECTO.firebaseapp.com",
  projectId:         "TU_PROYECTO",
  storageBucket:     "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID",
};

export const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);