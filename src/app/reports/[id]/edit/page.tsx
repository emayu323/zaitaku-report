'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Report } from '@/lib/types';
import { emptyReport } from '@/lib/types';

type Form = Pick<Report, 'patientId' | 'date' | 'staff' | 'findings' | 'instruction' | 'vital'>;

export default function EditReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const pidFromQuery = search.get('pid') ?? '';

  const [form, setForm] = useState<Form>({ ...emptyReport, patientId: pidFromQuery });

  // 汎用 onChange（Form のキーだけを受け付ける）
  const onChange =
    (k: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [k]: e.target.value }));
    };

  // 既存データの読み込み
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'reports', params.id));
      if (snap.exists()) {
        const data = snap.data() as Report;
        setForm({
          patientId: data.patientId ?? '',
          date: data.date ?? '',
          staff: data.staff ?? '',
          findings: data.findings ?? '',
          instruction: data.instruction ?? '',
          vital: data.vital ?? '',
        });
      }
    };
    load();
  }, [params.id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDoc(doc(db, 'reports', params.id), {
      ...form,
      updatedAt: serverTimestamp(),
    });
    router.push(`/reports?pid=${form.patientId}`); // 変更後に一覧へ戻る等
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
      <label>
        <div>患者ID</div>
        <input value={form.patientId} onChange={onChange('patientId')} />
      </label>

      <label>
        <div>実施日</div>
        <input type="date" value={form.date} onChange={onChange('date')} />
      </label>

      <label>
        <div>担当者</div>
        <input value={form.staff} onChange={onChange('staff')} />
      </label>

      <label>
        <div>所見</div>
        <textarea rows={3} value={form.findings} onChange={onChange('findings')} />
      </label>

      <label>
        <div>指導</div>
        <textarea rows={3} value={form.instruction} onChange={onChange('instruction')} />
      </label>

      <label>
        <div>バイタル</div>
        <textarea rows={2} value={form.vital} onChange={onChange('vital')} />
      </label>

      <div>
        <button className="btn primary" type="submit">保存</button>
      </div>
    </form>
  );
}
