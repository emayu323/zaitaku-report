'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AuthGate from '@/components/AuthGate';
import ExportXlsxButton from '@/components/ExportXlsxButton';
import { Report } from '@/lib/types';

export default function ReportsPage() {
  const [patientId, setPatientId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true); setError(null);
    try {
      if (!patientId) { throw new Error('患者IDで絞り込んでください（最小構成）'); }
      const colRef = collection(db, 'patients', patientId, 'reports');
      const conditions = [];
      if (from) conditions.push(where('date', '>=', from));
      if (to) conditions.push(where('date', '<=', to));
      const q = query(colRef, ...conditions, orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const rows: Report[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setReports(rows);
    } catch (err: any) {
      setError(err.message ?? '読み込みに失敗しました');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初回は未ロード
  }, []);

  return (
    <AuthGate>
      <h2>報告一覧</h2>
      <div className="formGrid" style={{alignItems:'end'}}>
        <input placeholder="患者ID（例：pt-0001）" value={patientId} onChange={(e)=>setPatientId(e.target.value)} />
        <div>
          <label>期間（開始）</label>
          <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
        </div>
        <div>
          <label>期間（終了）</label>
          <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
        </div>
        <button className="btn primary" onClick={fetchReports}>検索</button>
      </div>

      {loading && <p>読み込み中…</p>}
      {error && <p style={{color:'crimson'}}>{error}</p>}

      {!loading && reports.length > 0 && (
        <div>
          <div className="noPrint" style={{display:'flex', gap:8, margin:'8px 0'}}>
            <ExportXlsxButton reports={reports} />
            <button className="btn" onClick={()=>window.print()}>印刷</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>実施日</th>
                <th>患者ID</th>
                <th>担当者</th>
                <th>所見</th>
                <th>指導</th>
                <th>バイタル</th>
                <th>次回計画</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td><span className="badge">{r.patientId}</span></td>
                  <td>{r.assessor}</td>
                  <td>{r.notes}</td>
                  <td>{r.guidance}</td>
                  <td>{r.vitals}</td>
                  <td>{r.nextPlan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AuthGate>
  );
}
