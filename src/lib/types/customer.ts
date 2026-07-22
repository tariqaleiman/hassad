import type { BaseEntity } from "./common";

export interface Customer extends BaseEntity {
  farmId: string;
  name: string;
  legalType?: "شركة" | "فرد";
  customerCategories?: string[];
  customCategory?: string;
  companyName?: string;
  taxId?: string;
  commercialRegister?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: "active" | "inactive";
  initialBalance: number;
  balance: number; // الرصيد الحالي المستحق لك
  notes?: string;
}

export interface CustomerFormValues {
  farmId: string;
  name: string;
  legalType?: "شركة" | "فرد";
  customerCategories?: string[];
  customCategory?: string;
  companyName?: string;
  taxId?: string;
  commercialRegister?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: "active" | "inactive";
  initialBalance?: number;
  notes?: string;
}

export interface CustomerPayment extends BaseEntity {
  customerId: string;
  farmId: string;
  amount: number;
  date: string;
  paymentMethod: "cash" | "bank_transfer" | "instapay" | "vodafone_cash" | "orange_cash" | "other";
  reference?: string;
  notes?: string;
}

export interface CustomerPaymentFormValues {
  customerId: string;
  farmId: string;
  amount: number;
  date: string;
  paymentMethod: "cash" | "bank_transfer" | "instapay" | "vodafone_cash" | "orange_cash" | "other";
  reference?: string;
  notes?: string;
}

