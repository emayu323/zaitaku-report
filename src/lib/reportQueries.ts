import {
  query,
  where,
  orderBy,
  collection,
  getDocs,
  type QueryConstraint,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Report } from './types';

// ここを「展開後に id を足す」型に
export type Row = Omit<Report, 'id'> & { id: string };

type RawReport = Record<string, unknown>;

// serverTimestamp() 結果などを number (ms) に寄せる
function toMillis(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const ts = value as Timestamp | { seconds?: number; toMillis?: () => number };
  if (typeof ts?.toMillis === 'function') return ts.toMillis();
  if (typeof ts?.seconds === 'number') return ts.seconds * 1000;
  return 0;
}

// 新旧フィールド差異を吸収して Row に正規化
function normalizeReport(id: string, data: RawReport): Row {
  return {
    id,
    patientId: String(data.patientId ?? ''),
    date: String(data.date ?? ''),
    staff: String(data.staff ?? data.assessor ?? ''),
    findings: String(data.findings ?? data.notes ?? ''),
    instruction: String(data.instruction ?? data.guidance ?? ''),
    vital: String(data.vital ?? data.vitals ?? ''),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

async function fetchFromSubcollection(
  patientId: string,
  clauses: QueryConstraint[]
): Promise<Row[]> {
  try {
    const colRef = collection(db, 'patients', patientId, 'reports');
    const snap = await getDocs(query(colRef, ...clauses, orderBy('date', 'desc')));
    return snap.docs.map((docSnap) => normalizeReport(docSnap.id, docSnap.data()));
  } catch (err) {
    console.error('fetchReportsByPatient subcollection error', err);
    return [];
  }
}

async function fetchFromLegacyCollection(
  patientId: string,
  clauses: QueryConstraint[]
): Promise<Row[]> {
  try {
    const colRef = collection(db, 'reports');
    const legacyClauses = [where('patientId', '==', patientId), ...clauses];
    const snap = await getDocs(query(colRef, ...legacyClauses, orderBy('date', 'desc')));
    return snap.docs.map((docSnap) => normalizeReport(docSnap.id, docSnap.data()));
  } catch (err) {
    // 旧コレクション用なので失敗しても致命的ではない
    console.warn('fetchReportsByPatient legacy collection error', err);
    return [];
  }
}

// 患者ID＋日付範囲で一覧取得（YYYY-MM-DD の文字列）
export async function fetchReportsByPatient(
  patientId: string,
  from?: string,
  to?: string
): Promise<Row[]> {
  if (!patientId) return [];

  const clauses: QueryConstraint[] = [];
  if (from) clauses.push(where('date', '>=', from));
  if (to) clauses.push(where('date', '<=', to));

  const [subRows, legacyRows] = await Promise.all([
    fetchFromSubcollection(patientId, clauses),
    fetchFromLegacyCollection(patientId, clauses),
  ]);

  const merged = [...subRows];
  const knownIds = new Set(merged.map((r) => r.id));
  for (const row of legacyRows) {
    if (!knownIds.has(row.id)) merged.push(row);
  }

  return merged.sort((a, b) => {
    if (a.date === b.date) return b.updatedAt - a.updatedAt;
    return a.date < b.date ? 1 : -1;
  });
}
