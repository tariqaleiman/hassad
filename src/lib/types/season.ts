import type { BaseEntity } from "./common";

export type SeasonType = "صيفي" | "شتوي" | "نيلي" | "مستديم" | "محيّر" | "مخصص";
export type SeasonStatus = "مفتوح" | "مغلق";

export interface Season extends BaseEntity {
  farmId: string;
  name: string;
  type: SeasonType;
  startDate?: string | null; // يُستنتج من تاريخ زراعة أول محصول
  endDate?: string | null; // يسجل عند إغلاق الموسم أو يُستنتج من حصاد آخر محصول
  expectedBudget?: number | null;
  expectedRevenue?: number | null;
  description?: string;
  status: SeasonStatus;
  notes?: string;
}

export interface SeasonFormValues {
  farmId: string;
  name: string;
  type: SeasonType;
  expectedBudget?: number | null;
  expectedRevenue?: number | null;
  description?: string;
  notes?: string;
}
