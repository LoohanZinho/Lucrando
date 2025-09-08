// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCstZaRIU1hyIzjGvktfeuhbmX0HSwkTM0",
  authDomain: "lci-dash.firebaseapp.com",
  projectId: "lci-dash",
  storageBucket: "lci-dash.firebasestorage.app",
  messagingSenderId: "627350653326",
  appId: "1:627350653326:web:60089372f6f44da5ffbcdf",
  measurementId: "G-S4ZEW74QBL"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}


export { app, analytics };
