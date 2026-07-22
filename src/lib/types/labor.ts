import type { BaseEntity } from "./common";

export type AttendanceStatus = "حاضر" | "غائب" | "نصف يوم" | "إضافي";

export interface LaborLog extends BaseEntity {
  farmId: string;
  workerId: string;
  workerName: string;
  date: string; // ISO date format YYYY-MM-DD
  status: AttendanceStatus;
  wage: number; // Final wage for this specific log (could be negative if absent, or zero)
  operationId?: string; // Link to specific farming operation
  cropCycleId?: string; // Link to specific crop cycle
  notes?: string;
  settlementId?: string; // If this log has been paid/settled, link to the settlement
}

export interface LaborAdvance extends BaseEntity {
  farmId: string;
  workerId: string;
  workerName: string;
  date: string;
  amount: number;
  paymentMethod?: "cash" | "bank_transfer" | "instapay" | "vodafone_cash" | "orange_cash" | "other";
  reason?: string;
  settlementId?: string; // If this advance has been deducted in a settlement
}

export interface LaborSettlement extends BaseEntity {
  farmId: string;
  workerId: string;
  workerName: string;
  date: string;
  periodStart: string;
  periodEnd: string;
  totalDays: number;
  totalAdvances: number;
  totalWages: number;
  netPaid: number;
  paymentMethod?: "cash" | "bank_transfer" | "instapay" | "vodafone_cash" | "orange_cash" | "other";
  notes?: string;
}

export interface LaborLogFormValues {
  farmId: string;
  workerId: string;
  date: string;
  status: AttendanceStatus;
  wage: number;
  operationId?: string;
  cropCycleId?: string;
  notes?: string;
}

export interface LaborAdvanceFormValues {
  farmId: string;
  workerId: string;
  date: string;
  amount: number;
  paymentMethod: "cash" | "bank_transfer" | "instapay" | "vodafone_cash" | "orange_cash" | "other";
  reason?: string;
}

export interface LaborSettlementFormValues {
  farmId: string;
  workerId: string;
  date: string;
  periodStart: string;
  periodEnd: string;
  netPaid: number;
  paymentMethod: "cash" | "bank_transfer" | "instapay" | "vodafone_cash" | "orange_cash" | "other";
  notes?: string;
}
