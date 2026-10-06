import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBf0TyV2YPc81MUDmmFLablImRR7oMQoDo",
  authDomain: "demon-8ed53.firebaseapp.com",
  projectId: "demon-8ed53",
  storageBucket: "demon-8ed53.firebasestorage.app",
  messagingSenderId: "296893992824",
  appId: "1:296893992824:web:e8a4188ea23fe04826828d",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

window.bwuFirebase = {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
};

window.dispatchEvent(new Event("bwuFirebaseReady"));