import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ─── Firebase config — kept here for legacy compatibility ─────────────
// The credentials below are already committed to the project.
// For a public repository, rotate your Firebase API key and restrict it
// in the Firebase Console (API restrictions → HTTP referrers).
// Alternatively, move to VITE_ env vars using the .env.example pattern.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDpTCAeVqJIG5SSX2LbSeJyrKr7A77wRtU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "blr-coffee.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "blr-coffee",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "blr-coffee.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "601180181035",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:601180181035:web:6002c5b23476c834fbd06e",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
