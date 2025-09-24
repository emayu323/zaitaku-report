'use client';

import { useState } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import AuthGate from '@/components/AuthGate';

export default function NewReportPage() {
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [assessor, setAssessor] = useState('');
  const [notes, setNotes] = useState('');
  const [guidance, setGuidance] = useState('');
  const [vitals, setVitals] = useState('');
  const [nextPlan, setNextPlan] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const router = useRouter();

  const saveReport = async () => {
    // 親ドキュメント（patients/{patientId}）を先に用意（存在していればmerge）
    await setDoc(
      doc(db, 'patients', patientId),
      { id: patientId, updatedAt: serverTimestamp() },
      { merge: true }
    );

    // サブコレクションに1件追加
    const colRef = collection(db, 'patients', patientId, 'reports');
    await addDoc(colRef, {
      patientId,
      date, // input type=date は yyyy-mm-dd で入る
      assessor,
      notes,
      guidance,
      vitals,
      nextPlan,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!patientId.trim() || !date || !assessor.trim()) {
      setError('患者ID・実施日・担当者は必須です');
      return;
    }

    try {
      setSaving(true);
      // タイムアウト（15秒）を付けて“固まる”を防ぐ
      const timeout = new Promise((_, rej) =>
        setTimeout(() => rej(new Error('タイムアウトしました（通信に失敗）')), 15000)
      );
      await Promise.race([saveReport(), timeout]);
      router.push('/reports');
    } catch (err: any) {
      console.error('save error:', err);
      const code = err?.code || '';
      const msg = err?.message || '保存に失敗しました';
      setError(`${msg}${code ? ` (${code})` : ''}`);
      setInfo('ブラウザの開発者ツール(Console)にも詳細が出ています。');
    } finally {
      setSaving(false);
    }
  };

  // ルール/接続の切り分け用 簡易テスト
  const handleTestWrite = async () => {
    setError(null);
    setInfo(null);
    try {
      const colRef = collection(db, 'debugWrites');
      await addDoc(colRef, { at: new Date().toISOString() });
      setInfo('テスト保存成功：debugWrites に書けました。');
    } catch (err: any) {
      console.error('test write error:', err);
      setError(`テスト保存失敗：${err?.message || err} ${err?.code ? `(${err.code})` : ''}`);
    }
  };

  return (
    <AuthGate>
      <h2>報告の新規作成</h2>
      <form onSubmit={handleSubmit} className="formGrid">
        <input
          placeholder="患者ID（例：pt-0001 でも 0001 でも可）"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input
          placeholder="担当者（例：山田）"
          value={assessor}
          onChange={(e) => setAssessor(e.target.value)}
        />
        <textarea placeholder="所見" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <textarea placeholder="指導" value={guidance} onChange={(e) => setGuidance(e.target.value)} />
        <textarea placeholder="バイタル" value={vitals} onChange={(e) => setVitals(e.target.value)} />
        <textarea placeholder="次回計画" value={nextPlan} onChange={(e) => setNextPlan(e.target.value)} />

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </button>
          <button className="btn" type="button" onClick={handleTestWrite} disabled={saving}>
            テスト保存
          </button>
          {error && <span style={{ color: 'crimson' }}>{error}</span>}
          {info && <span className="badge">{info}</span>}
        </div>
      </form>
    </AuthGate>
  );
}
