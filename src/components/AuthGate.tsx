// src/components/AuthGate.tsx
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase';

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * 子要素を表示する前に Auth の初期化完了を待つゲート
 * サインイン状態は問わず、状態決定(onAuthStateChanged)まで待つ
 */
export default function AuthGate({ children, fallback = null }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = getAuthClient();
    const unsub = onAuthStateChanged(auth, () => setReady(true));
    return () => unsub();
  }, []);

  if (!ready) return <>{fallback}</>;
  return <>{children}</>;
}
