'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { collection, getDocs, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toEditReportRoute, toNewReportRoute } from '@/lib/routes';

type Report = {
  id: string;
  patientId: string;
  date: string;     // YYYY-MM-DD で保存している想定（Date保管なら適宜変換）
  staff?: string;
  finding?: string; // 所見など、実際のフィールド名に合わせて調整可
  guidance?: string;
  vital?: string;
  nextPlan?: string;
};

export default function ReportsPage() {
  const router = useRouter();

  // フィルタ UI 状態
  const [patientId, setPatientId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>(''); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState<string>('');     // YYYY-MM-DD

  // データ状態
  const [loading, setLoading] = useState<boolean>(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Firestore クエリを組み立てる（必要に応じて where を追加）
  const qRef = useMemo(() => {
    const base = collection(db, 'reports'); // ← コレクション名が違う場合は修正
    const conds: any[] = [];

    if (patientId.trim()) {
      conds.push(where('patientId', '==', patientId.trim()));
    }
    // 日付は YYYY-MM-DD 文字列で保存している想定
    if (dateFrom) conds.push(where('date', '>=', dateFrom));
    if (dateTo)   conds.push(where('date', '<=', dateTo));

    // 並び順：最新日付が上に来るように
    conds.push(orderBy('date', 'desc'));

    return query(base, ...conds);
  }, [patientId, dateFrom, dateTo]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const snap = await getDocs(qRef);
      const rows: Report[] = snap.docs.map((d) => {
        const v = d.data() as any;
        // 日付が Timestamp の場合は文字列に変換（保存形式に合わせて調整）
        let dateStr = v.date;
        if (v.date instanceof Timestamp) {
          const dt = v.date.toDate();
          const y = dt.getFullYear();
          const m = String(dt.getMonth() + 1).padStart(2, '0');
          const d2 = String(dt.getDate()).padStart(2, '0');
          dateStr = `${y}-${m}-${d2}`;
        }
        return {
          id: d.id,
          patientId: v.patientId ?? '',
          date: dateStr ?? '',
          staff: v.staff ?? '',
          finding: v.finding ?? '',
          guidance: v.guidance ?? '',
          vital: v.vital ?? '',
          nextPlan: v.nextPlan ?? '',
        };
      });
      setReports(rows);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? '取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 初回ロード（お好みで外してもOK）
  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 編集遷移（Typed Routes）
  const goEdit = (r: Report) => {
    const href: Route = toEditReportRoute(r.id, r.patientId);
    router.push(href);
  };

  // 新規作成（患者IDが入っていればクエリで渡す）
  const goNew = () => {
    const href: Route = toNewReportRoute(patientId.trim() || undefined);
    router.push(href);
  };

  return (
    <main className="container" style={{ padding: '24px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h1 style={{ marginRight: 'auto' }}>在宅報告書</h1>
        <Link className="btn" href={'/' as Route}>Home</Link>
        <button className="btn" onClick={goNew}>新規作成</button>
      </header>

      <section style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr 1fr 120px' }}>
        <div>
          <label>患者ID</label>
          <input
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="0001 など"
            className="input"
          />
        </div>
        <div>
          <label>期間（開始）</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label>期間（終了）</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input"
          />
        </div>
        <div style={{ alignSelf: 'end' }}>
          <button className="btn primary" onClick={fetchReports} disabled={loading}>
            {loading ? '検索中…' : '検索'}
          </button>
        </div>
      </section>

      {error && (
        <p style={{ color: 'crimson', marginTop: 12 }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: 20, overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: 880 }}>
          <thead>
            <tr>
              <th style={{ width: 120 }}>実施日</th>
              <th style={{ width: 120 }}>患者ID</th>
              <th style={{ width: 120 }}>担当</th>
              <th>所見</th>
              <th style={{ width: 100 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 && !loading && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>
                  データがありません
                </td>
              </tr>
            )}
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.patientId}</td>
                <td>{r.staff}</td>
                <td style={{ whiteSpace: 'pre-wrap' }}>{r.finding ?? ''}</td>
                <td>
                  <button className="btn" onClick={() => goEdit(r)}>編集</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .btn {
          border: 1px solid #555;
          padding: 6px 12px;
          border-radius: 6px;
          background: transparent;
        }
        .btn.primary {
          background: #1677ff;
          color: #fff;
          border-color: #1677ff;
        }
        .input {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #555;
          border-radius: 6px;
          background: transparent;
          color: inherit;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th, .table td {
          border-bottom: 1px solid #333;
          padding: 8px 10px;
          text-align: left;
        }
      `}</style>
    </main>
  );
}
