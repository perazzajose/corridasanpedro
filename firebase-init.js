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

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkOMlEspSCKSIahXEx0w5RWZAhuuwQyBU",
  authDomain: "corrida-san-pedro.firebaseapp.com",
  projectId: "corrida-san-pedro",
  storageBucket: "corrida-san-pedro.firebasestorage.app",
  messagingSenderId: "802944791255",
  appId: "1:802944791255:web:9278b78a888085f085f692",
  measurementId: "G-BSGLC3KE0P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);