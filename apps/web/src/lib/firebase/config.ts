import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, initializeAuth, browserLocalPersistence, browserPopupRedirectResolver } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCm8LxSLljkqwiqiXc-7047LRF_ep5baF8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'santmat-satsang-prachar.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'santmat-satsang-prachar',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'santmat-satsang-prachar.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '488234518159',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:488234518159:android:8b440fb731b0900b05d2fa',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-2E8E0G3PCF',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let authInstance;
const globalStorage = typeof window !== 'undefined' ? (window as any) : {};
if (globalStorage.__firebaseAuthInstance) {
  authInstance = globalStorage.__firebaseAuthInstance;
} else {
  try {
    authInstance = initializeAuth(app, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
    globalStorage.__firebaseAuthInstance = authInstance;
  } catch (e) {
    authInstance = getAuth(app);
  }
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = authInstance;
export const functions = getFunctions(app, 'us-central1');

export default app;
