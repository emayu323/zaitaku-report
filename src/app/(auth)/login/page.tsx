'use client';

import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/reports');
    } catch (err: any) {
      const code = err?.code || '';
      let msg = 'エラーが発生しました';

      if (code === 'auth/invalid-credential') {
        msg = 'メールまたはパスワードが違います。未登録なら「新規登録」を押してください。';
      } else if (code === 'auth/email-already-in-use') {
        msg = 'このメールは登録済みです。「→ ログインに切替」を押してログインしてください。';
      } else if (code === 'auth/weak-password') {
        msg = 'パスワードは6文字以上にしてください。';
      } else if (code === 'auth/invalid-email') {
        msg = 'メールアドレスの形式を確認してください。';
      }

      setError(`${msg} (${code})`);
    }
  };

  return (
    <div>
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit} className="formGrid" style={{ maxWidth: 480 }}>
        <input
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn primary" type="submit">
            {mode === 'signin' ? 'ログイン' : '新規登録'}
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? '→ 新規登録に切替' : '→ ログインに切替'}
          </button>
        </div>

        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
    </div>
  );
}
