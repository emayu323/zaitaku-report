export type Report = {
  id?: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  assessor: string;
  notes?: string;
  guidance?: string;
  vitals?: string;
  nextPlan?: string;
  createdAt?: any;
  updatedAt?: any;
};
