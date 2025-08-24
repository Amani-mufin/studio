// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAeiefcaHzTnEzGjADVJyJX71bwj1N8vGM",
  authDomain: "memory-app-e51a4.firebaseapp.com",
  projectId: "memory-app-e51a4",
  storageBucket: "memory-app-e51a4.firebasestorage.app",
  messagingSenderId: "216678846115",
  appId: "1:216678846115:web:85a3e8c05fd9bdfcc97916",
  measurementId: "G-BH3M8EWB7P"
};

// Initialize Firebase for SSR
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);

export { app, db };
