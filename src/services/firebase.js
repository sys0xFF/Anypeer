// Firebase service for session storage and peer resolution
// - setFirebaseSession(id, { ip, port })
// - resolvePeerId(id) → { ip, port }

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyDMhRJMQkhcgUUAzsdD4JDj4Z6KlK9ivWs",
  authDomain: "nbome-61c7b.firebaseapp.com",
  databaseURL: "https://nbome-61c7b-default-rtdb.firebaseio.com",
  projectId: "nbome-61c7b",
  storageBucket: "nbome-61c7b.firebasestorage.app",
  messagingSenderId: "445214489648",
  appId: "1:445214489648:web:a87285ad3198ea13e441f5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function setFirebaseSession(id, data) {
  return set(ref(db, `session/${id}`), data);
}

async function resolvePeerId(id) {
  const snapshot = await get(ref(db, `session/${id}`));
  if (!snapshot.exists()) throw new Error("Code not found");
  return snapshot.val(); 
}

module.exports = {
  setFirebaseSession,
  resolvePeerId
};