import {
    query,
    where,
    orderBy,
    collection,
    getDocs,
    type QueryConstraint, // 追加（あれば）
  } from 'firebase/firestore';
  import { db } from './firebase';
  import type { Report } from './types';
  
  // ここを「展開後に id を足す」型に
  export type Row = Omit<Report, 'id'> & { id: string };
  
  // 患者ID＋日付範囲で一覧取得（YYYY-MM-DD の文字列）
  export async function fetchReportsByPatient(
    patientId: string,
    from?: string,
    to?: string
  ): Promise<Row[]> {
    try {
      const colRef = collection(db, 'reports');
  
      const clauses: QueryConstraint[] = [where('patientId', '==', patientId)];
      if (from) clauses.push(where('date', '>=', from));
      if (to) clauses.push(where('date', '<=', to));
  
      // 複合インデックス: patientId, date desc, __name__
      const q = query(colRef, ...clauses, orderBy('date', 'desc'), orderBy('__name__'));
  
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data() as Omit<Report, 'id'>;
        return { ...data, id: d.id }; // 先に展開 → 最後に id を足す（重複警告を回避）
      });
    } catch (e) {
      console.error('fetchReportsByPatient error', e);
      return [];
    }
  }
  