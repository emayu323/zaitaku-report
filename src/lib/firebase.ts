// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// App / DB はどこからでも使える
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Auth は「クライアント専用」
 * 直接の export を避け、クライアントでのみ実体を作る getter を用意
 */
let _auth: Auth | null = null;

export function getAuthClient(): Auth {
  if (typeof window === 'undefined') {
    // Server Components で誤って呼ぶと気づけるようにする
    throw new Error('getAuthClient() must be called on the client');
  }

  if (!_auth) {
    _auth = getAuth(app);

    // ローカル開発時のみエミュレータに接続
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      try {
        connectAuthEmulator(_auth, 'http://127.0.0.1:9099');
      } catch {}
      try {
        connectFirestoreEmulator(db, '127.0.0.1', 8080);
      } catch {}
    }
  }
  return _auth;
}
