// Импорт Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// *** ВАЖНО: замените на свои реальные данные из консоли Firebase ***
const firebaseConfig = {
    apiKey: "AIzaSyC2bI6cu5TPiiheX-6Z0N62xwPmwOPLe2U",
    authDomain: "mylanguageapp-1201f.firebaseapp.com",
    projectId: "mylanguageapp-1201f",
    storageBucket: "mylanguageapp-1201f.firebasestorage.app",
    messagingSenderId: "883324202239",
    appId: "1:883324202239:web:08c8805d499e75cd36f0ca"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);