// src/lib/types.ts
export type Report = {
  id: string;              // Firestore doc id
  patientId: string;       // 患者ID
  date: string;            // 'YYYY-MM-DD'
  staff: string;           // 担当者
  findings: string;        // 所見
  instruction: string;     // 指導
  vital: string;           // バイタル   ← ※ "vitals" ではなく "vital" に統一
  createdAt: number;
  updatedAt: number;
};

// フォームで使う初期値（必要なら）
export const emptyReport: Pick<Report,
  'patientId' | 'date' | 'staff' | 'findings' | 'instruction' | 'vital'
> = {
  patientId: '',
  date: '',
  staff: '',
  findings: '',
  instruction: '',
  vital: '',
};
