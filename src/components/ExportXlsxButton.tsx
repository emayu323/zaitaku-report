'use client';

import * as XLSX from 'xlsx';
import { Report } from '@/lib/types'; // Report 型をここから import（パスはプロジェクトに合わせて）

type Props = {
  reports: Report[];
  fileName?: string;
};

function formatDate(d: unknown): string {
  if (!d) return '';
  // Firestore Timestamp でも string でも Date でもそこそこ安全に文字列化
  // @ts-ignore
  if (typeof d?.toDate === 'function') {
    // Firestore Timestamp
    // @ts-ignore
    const dt: Date = d.toDate();
    return dt.toISOString().slice(0, 10);
  }
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (typeof d === 'string') return d;
  return String(d);
}

export default function ExportXlsxButton({ reports, fileName = 'reports.xlsx' }: Props) {
  const handleExport = () => {
    const rows = reports.map((r) => ({
      患者ID: r.patientId ?? '',
      実施日: formatDate(r.date),
      担当者: r.staff ?? '',
      所見: r.findings ?? '',
      指導: r.instruction ?? '',
      バイタル: r.vital ?? '',
      次回計画: (r as any).nextPlan ?? (r as any).next ?? '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'reports');
    XLSX.writeFile(wb, fileName);
  };

  return (
    <button className="btn" onClick={handleExport}>
      Excelにエクスポート
    </button>
  );
}
