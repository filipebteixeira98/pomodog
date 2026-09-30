import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase web configuration identifies this development project; rules protect data.
const config = {
  apiKey: "AIzaSyD9316qNwLJKQedJeybDr2V3nR7hXL_08A",
  authDomain: "pomodog-dev-2026.firebaseapp.com",
  projectId: "pomodog-dev-2026",
  appId: "1:248701391721:web:364a9830dc3776ea00e3f8",
  messagingSenderId: "248701391721",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(config);
export const db = getFirestore(firebaseApp);
