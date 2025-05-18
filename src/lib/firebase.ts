// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: "AIzaSyA5gI7GS-gpkPhy6aSeE10mk-JoJN8L1ac",
//   authDomain: "studentworkflow-5fc83.firebaseapp.com",
//   projectId: "studentworkflow-5fc83",
//   storageBucket: "studentworkflow-5fc83.firebasestorage.app",
//   messagingSenderId: "402308960680",
//   appId: "1:402308960680:web:b750f271a51d0591104d9d",
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig); // Initializing Firebase
const auth = getAuth(app);  // Firebase Auth
const db = getFirestore(app); // Firestore

export { app, auth, db };
