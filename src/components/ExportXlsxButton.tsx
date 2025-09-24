'use client';

import * as XLSX from 'xlsx';
import { Report } from '@/lib/types';

export default function ExportXlsxButton({ reports }: { reports: Report[] }) {
  const handleExport = () => {
    const rows = reports.map((r) => ({
      患者ID: r.patientId,
      実施日: r.date,
      担当者: r.assessor,
      所見: r.notes ?? '',
      指導: r.guidance ?? '',
      バイタル: r.vitals ?? '',
      次回計画: r.nextPlan ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'reports');
    XLSX.writeFile(wb, 'reports.xlsx');
  };

  return (
    <button className="btn" onClick={handleExport}>
      Excelにエクスポート
    </button>
  );
}
