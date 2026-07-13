import type { BaseEntity } from "./common";

export type SeasonType = "صيفي" | "شتوي" | "نيلي" | "مخصص";
export type SeasonStatus = "مفتوح" | "مغلق";

export interface Season extends BaseEntity {
  farmId: string;
  name: string;
  type: SeasonType;
  startDate: string; // يبدأ الموسم بتاريخ بداية فقط
  endDate?: string | null; // يسجل فقط عند إغلاق الموسم
  status: SeasonStatus;
  notes?: string;
}

export interface SeasonFormValues {
  farmId: string;
  name: string;
  type: SeasonType;
  startDate: string;
  notes?: string;
}
