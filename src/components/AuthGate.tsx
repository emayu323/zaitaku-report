'use client';

import { ReactNode, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return <div className="container">読み込み中…</div>;
  }

  if (!user) {
    return (
      <div className="container">
        <div className="header">
          <h1>在宅報告書</h1>
          <div className="nav">
            <Link className="btn" href="/login">ログイン</Link>

          </div>
        </div>
        <p>このページを見るには、先にログインしてください。</p>
      </div>
    );
  }

  return <>{children}</>;
}
