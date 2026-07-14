import type { BaseEntity } from "./common";

export interface Supplier extends BaseEntity {
  farmId: string;
  name: string;
  supplierType?: "company" | "individual";
  companyName?: string;
  taxId?: string;
  commercialRegister?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: "active" | "inactive";
  initialBalance: number;
  balance: number; // الرصيد الحالي (الدين المستحق للمورد)
  notes?: string;
}
