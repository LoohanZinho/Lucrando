
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
// We keep getAuth in case it's needed for other Firebase services, but it's not used for login.
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCstZaRIU1hyIzjGvktfeuhbmX0HSwkTM0",
  authDomain: "lci-dash.firebaseapp.com",
  projectId: "lci-dash",
  storageBucket: "lci-dash.firebasestorage.app",
  messagingSenderId: "627350653326",
  appId: "1:627350653326:web:60089372f6f44da5ffbcdf",
  measurementId: "G-S4ZEW74QBL"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app); // Still initialized, but logic is handled in auth-context
const storage = getStorage(app);

export { app, db, auth, storage };
