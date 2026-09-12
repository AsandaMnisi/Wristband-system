import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyC0nfig_placeholder_get_real_key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'youtube-data-analysis-506507.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'youtube-data-analysis-506507',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'youtube-data-analysis-506507.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '198586481527',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:198586481527:web:aea281b7168b82aaf73f72',
};

const DATABASE_ID = 'ai-studio-remixuntitled-a35d7ced-7302-4fbf-951c-2c0fc0ee112d';

let appInstance = null;
let dbInstance = null;

function initializeFirebase() {
  if (!appInstance) {
    appInstance = initializeApp(firebaseConfig);
    dbInstance = getFirestore(appInstance, DATABASE_ID);
  }
  return { app: appInstance, db: dbInstance };
}

export function getDb() {
  if (!dbInstance) {
    initializeFirebase();
  }
  return dbInstance;
}

export { firebaseConfig, DATABASE_ID };
