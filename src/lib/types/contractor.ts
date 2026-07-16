import type { BaseEntity } from "./common";

export type ContractorType =
  | "عمالة"
  | "جرار زراعي"
  | "آلات حصاد"
  | "نقل"
  | "أخرى";

export interface Contractor extends BaseEntity {
  farmId: string;
  name: string;
  phone?: string;
  type: ContractorType;
  customType?: string; // إذا كان النوع "أخرى"
  initialBalance: number; // رصيد افتتاحي (ديون سابقة)
  balance: number; // الرصيد الحالي المستحق للمقاول
  status?: "active" | "inactive";
  notes?: string;
}

export interface ContractorFormValues {
  farmId: string;
  name: string;
  phone?: string;
  type: ContractorType;
  customType?: string;
  initialBalance: number;
  notes?: string;
}
