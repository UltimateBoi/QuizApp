import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration - these are public identifiers
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

// Initialize Firebase only on client side and if configured
if (typeof window !== 'undefined' && isFirebaseConfigured) {
  try {
    // Check if Firebase has already been initialized
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Enable persistence for offline support
    if (db) {
      import('firebase/firestore').then(({ enableNetwork, disableNetwork }) => {
        // Enable network by default
        enableNetwork(db!).catch(() => {
          console.warn('Failed to enable Firebase network');
        });
      });
    }
    
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    // Firebase features will be disabled
  }
}

// Export configuration check function
export const checkFirebaseConfig = (): boolean => {
  return isFirebaseConfigured;
};

// Export auth state helper
export const isAuthReady = (): boolean => {
  return auth !== undefined && isFirebaseConfigured;
};

export { auth, db, isFirebaseConfigured };
