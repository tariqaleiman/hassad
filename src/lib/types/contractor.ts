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
  legalType?: "شركة" | "فرد";
  types: ContractorType[];
  customType?: string; // إذا كان من ضمن الأنواع "أخرى"
  companyName?: string;
  taxId?: string;
  commercialRegister?: string;
  email?: string;
  phone?: string;
  address?: string;
  initialBalance: number; // رصيد افتتاحي (ديون سابقة)
  balance: number; // الرصيد الحالي المستحق للمقاول
  status?: "active" | "inactive";
  notes?: string;
}

export interface ContractorFormValues {
  farmId: string;
  name: string;
  legalType?: "شركة" | "فرد";
  types: ContractorType[];
  customType?: string;
  companyName?: string;
  taxId?: string;
  commercialRegister?: string;
  email?: string;
  phone?: string;
  address?: string;
  initialBalance?: number;
  status?: "active" | "inactive";
  notes?: string;
}
