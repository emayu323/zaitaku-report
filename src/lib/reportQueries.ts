// src/lib/reportQueries.ts
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

export type Report = {
  id: string;
  patientId?: string;
  date: number;        // ms (clientで扱いやすくする)
  staff?: string;
  findings?: string;
  createdAt?: number;
  updatedAt?: number;
};

// Timestamp/Date/number を ms に寄せる
const toMillis = (v: unknown): number => {
  if (v == null) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (v instanceof Timestamp) return v.toMillis();
  if (v instanceof Date) return v.getTime();
  // Firestore Emulator の文字列日付なども一応ケア
  const parsed = new Date(String(v)).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalize = (id: string, data: DocumentData): Report => ({
  id,
  patientId: data.patientId ?? undefined,
  date: toMillis(data.date),
  staff: data.staff ?? undefined,
  findings: data.findings ?? undefined,
  createdAt: toMillis(data.createdAt),
  updatedAt: toMillis(data.updatedAt),
});

/**
 * patients/{patientId}/reports を検索
 * 並び順はこの関数内で date の降順に統一
 */
export const fetchReportsByPatient = async (
  patientId: string,
  clauses: QueryConstraint[] = []
): Promise<Report[]> => {
  // サブコレクション（患者ごと）
  const colRef = collection(db, 'patients', patientId, 'reports');

  // 重要：orderBy はここで一元管理（ページ側では付けない）
  const q = query(colRef, ...clauses, orderBy('date', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map((d) => normalize(d.id, d.data()));
};
