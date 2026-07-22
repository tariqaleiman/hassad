import type { BaseEntity } from "./common";

export type WorkerType = "يومي" | "شهري" | "موسمي";
export type WorkerStatus = "نشط" | "متوقف";

export interface Worker extends BaseEntity {
  farmId: string;
  name: string;
  phone?: string;
  type: WorkerType;
  dailyWage?: number;
  monthlyWage?: number;
  specialty?: string; // ري، حصاد، رش، عام
  status: WorkerStatus;
  notes?: string;
}

export interface WorkerFormValues {
  farmId: string;
  name: string;
  phone?: string;
  type: WorkerType;
  dailyWage?: number;
  monthlyWage?: number;
  specialty?: string;
  status: WorkerStatus;
  notes?: string;
}
