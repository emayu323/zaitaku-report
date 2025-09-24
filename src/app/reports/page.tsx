// src/app/reports/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchReportsByPatient, type Row } from '@/lib/reportQueries';

// 日付入力(YYYY-MM-DD)ヘルパ
function toInputDate(d?: Date) {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default function ReportsPage() {
  // フィルタ
  const [patientId, setPatientId] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>(toInputDate(new Date()));
  const [toDate, setToDate] = useState<string>(toInputDate(new Date()));

  // 一覧データ
  const [reports, setReports] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSearch = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const rows = await fetchReportsByPatient(
        patientId.trim(),
        fromDate || undefined,
        toDate || undefined
      );
      setReports(rows);
      if (rows.length === 0) setMessage('データがありません');
    } catch (e) {
      console.error(e);
      setMessage('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 初回は空のまま（必要ならここで onSearch()）
  useEffect(() => {
    // onSearch();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">在宅報告書</h1>

      {/* 検索フォーム */}
      <div className="grid gap-3 sm:grid-cols-[160px_200px_200px_auto] items-end">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">患者ID</span>
          <input
            className="input"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="0001 など"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">期間（開始）</span>
          <input
            className="input"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">期間（終了）</span>
          <input
            className="input"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>

        <button className="btn primary h-10" onClick={onSearch} disabled={loading}>
          {loading ? '検索中…' : '検索'}
        </button>
      </div>

      {/* 一覧テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-zinc-800">
              <th className="px-3 py-2">実施日</th>
              <th className="px-3 py-2">患者ID</th>
              <th className="px-3 py-2">担当</th>
              <th className="px-3 py-2">所見</th>
              <th className="px-3 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b border-zinc-900/50">
                <td className="px-3 py-2 whitespace-pre-wrap">{r.date}</td>
                <td className="px-3 py-2">{r.patientId}</td>
                <td className="px-3 py-2">{r.staff}</td>
                <td className="px-3 py-2">
                  <div className="whitespace-pre-wrap text-zinc-300">{r.findings}</div>
                  {r.vital && (
                    <div className="mt-1 text-xs text-zinc-500">バイタル: {r.vital}</div>
                  )}
                </td>
                <td className="px-3 py-2">
                  {/* ← ここがポイント：オブジェクト形式で Typed Routes に準拠 */}
                  <Link
                    href={{
                      pathname: `/reports/${r.id}/edit` as `/reports/${string}/edit`,
                      query: { pid: r.patientId },
                    }}
                    className="rounded bg-zinc-700 px-2 py-1 text-xs hover:bg-zinc-600"
                  >
                    編集
                  </Link>
                </td>
              </tr>
            ))}

            {reports.length === 0 && !loading && (
              <tr>
                <td colSpan={5} style={{ padding: '12px 16px', textAlign: 'center', color: '#888' }}>
                  {message ?? 'データがありません'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Excel エクスポートを使うならここにボタン（必要に応じて） */}
      {/* <ExportXlsxButton reports={reports} /> */}
    </div>
  );
}
