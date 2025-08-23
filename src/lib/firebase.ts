// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "wish-weaver-nup7u",
  appId: "1:508748030131:web:6f729785be79a3a02dd0c6",
  storageBucket: "wish-weaver-nup7u.firebasestorage.app",
  apiKey: "AIzaSyDq9fJuYVLNYFevrQxWjLIhnmgthKQSY9U",
  authDomain: "wish-weaver-nup7u.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "508748030131"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
