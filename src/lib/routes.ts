// 型安全にルートを組み立てるヘルパー
import type { Route } from 'next';

export function toEditReportRoute(reportId: string, patientId: string): Route {
  const href = `/reports/${reportId}/edit?pid=${encodeURIComponent(patientId)}`;
  return href as Route;
}

export function toNewReportRoute(patientId?: string): Route {
  const href = patientId
    ? `/reports/new?pid=${encodeURIComponent(patientId)}`
    : '/reports/new';
  return href as Route;
}
