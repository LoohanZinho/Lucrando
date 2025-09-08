import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCstZaRIU1hyIzjGvktfeuhbmX0HSwkTM0",
  authDomain: "lci-dash.firebaseapp.com",
  projectId: "lci-dash",
  storageBucket: "lci-dash.appspot.com",
  messagingSenderId: "627350653326",
  appId: "1:627350653326:web:60089372f6f44da5ffbcdf",
  measurementId: "G-S4ZEW74QBL"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
