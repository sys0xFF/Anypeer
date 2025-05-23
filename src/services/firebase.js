// Firebase service for session storage and peer resolution
// - setFirebaseSession(id, { ip, port })
// - resolvePeerId(id) → { ip, port }

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyAjitoFgwgB5EIPgQrcD8rE5fvKGjkf4dA",
  authDomain: "anypeer-firebase.firebaseapp.com",
  databaseURL: "https://anypeer-firebase-default-rtdb.firebaseio.com",
  projectId: "anypeer-firebase",
  storageBucket: "anypeer-firebase.firebasestorage.app",
  messagingSenderId: "405852966333",
  appId: "1:405852966333:web:06eea0000ccaa094c356d4"
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