import type { BaseEntity } from "./common";

export interface Customer extends BaseEntity {
  farmId: string;
  name: string;
  customerType?: "شركة" | "فرد" | "تاجر تجزئة";
  companyName?: string;
  phone?: string;
  address?: string;
  status?: "active" | "inactive";
  initialBalance: number;
  balance: number; // الرصيد الحالي (الدين المستحق على العميل لصالحك)
  notes?: string;
}

export interface CustomerFormValues {
  farmId: string;
  name: string;
  customerType?: "شركة" | "فرد" | "تاجر تجزئة";
  companyName?: string;
  phone?: string;
  address?: string;
  initialBalance: number;
  notes?: string;
}
