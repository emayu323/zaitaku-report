// src/app/reports/page.tsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import { Timestamp, where, QueryConstraint } from 'firebase/firestore';
import { fetchReportsByPatient, Report } from '@/lib/reportQueries';

const fmt = (ms: number) =>
  ms ? new Date(ms).toLocaleDateString('ja-JP') : '';

export default function ReportsPage() {
  const [patientId, setPatientId] = useState('0001');
  const [from, setFrom] = useState(''); // yyyy-mm-dd
  const [to, setTo] = useState('');
  const [rows, setRows] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  // 期間の入力を QueryConstraint に変換
  const buildDateClauses = useCallback((): QueryConstraint[] => {
    const cs: QueryConstraint[] = [];
    if (from) {
      const t = Timestamp.fromDate(new Date(from + 'T00:00:00'));
      cs.push(where('date', '>=', t));
    }
    if (to) {
      const t = Timestamp.fromDate(new Date(to + 'T23:59:59'));
      cs.push(where('date', '<=', t));
    }
    return cs;
  }, [from, to]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const clauses = buildDateClauses();
      // ★ ここでは orderBy を付けない（ライブラリ側で統一）
      const list = await fetchReportsByPatient(patientId.trim(), clauses);
      setRows(list);
    } catch (e) {
      console.error('fetchReportsByPatient error:', e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [patientId, buildDateClauses]);

  const disabled = useMemo(
    () => !patientId.trim(),
    [patientId]
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-sm text-white">
      <h1 className="text-2xl font-bold mb-8">在宅報告書</h1>

      <section className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-gray-300">患者ID</label>
          <input
            className="bg-neutral-800 rounded px-2 py-1"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="0001 など"
          />

          <label className="text-gray-300 ml-4">期間(開始)</label>
          <input
            type="date"
            className="bg-neutral-800 rounded px-2 py-1"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />

          <label className="text-gray-300 ml-2">期間(終了)</label>
          <input
            type="date"
            className="bg-neutral-800 rounded px-2 py-1"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />

          <button
            onClick={handleSearch}
            disabled={disabled || loading}
            className="ml-3 rounded bg-blue-600 px-3 py-1 disabled:opacity-50"
          >
            {loading ? '検索中…' : '検索'}
          </button>
        </div>
      </section>

      <section className="overflow-x-auto rounded border border-neutral-700">
        <table className="min-w-full">
          <thead className="bg-neutral-900">
            <tr>
              <th className="px-3 py-2 text-left">実施日</th>
              <th className="px-3 py-2 text-left">患者ID</th>
              <th className="px-3 py-2 text-left">担当</th>
              <th className="px-3 py-2 text-left">所見</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-400">
                  データがありません
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-800">
                  <td className="px-3 py-2">{fmt(r.date)}</td>
                  <td className="px-3 py-2">{r.patientId ?? patientId}</td>
                  <td className="px-3 py-2">{r.staff ?? '-'}</td>
                  <td className="px-3 py-2">{r.findings ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
