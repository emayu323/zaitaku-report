'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// まず設定値を読む
const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// どれか欠けていたらコンソールに出す（原因特定用）
for (const [k, v] of Object.entries(cfg)) {
  if (!v) console.error(`Missing env: ${k}`);
}

// Firebase App を初期化（多重初期化を避ける）
const app = getApps().length ? getApps()[0] : initializeApp(cfg);

// ★通信方式を“ロングポーリング強制”にする
// 説明：ブラウザやネット環境によっては通常の通信方式(WebChannel)が失敗するため、
// 長いポーリングに切り替えると安定します。
initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Firestore / Auth をエクスポート
export const db = getFirestore(app);
export const auth = getAuth(app);

// デバッグ（確認できたら消してOK）
console.log('firebaseConfig', {
  projectId: cfg.projectId,
  authDomain: cfg.authDomain,
  storageBucket: cfg.storageBucket,
  appId: cfg.appId,
});
