import type { BaseEntity } from "./common";

export type AccountCategory = "أصول" | "خصوم" | "حقوق ملكية" | "إيرادات" | "مصروفات";

export interface Account extends BaseEntity {
  farmId: string;
  code: string; // Account Code e.g. "1001"
  name: string; // Account Name e.g. "صندوق المزرعة", "بنك الراجحي", "مبيعات طماطم"
  category: AccountCategory;
  isSystemAccount?: boolean; // System accounts cannot be deleted (e.g. Sales, Cash)
  parentAccountId?: string; // For hierarchical charts
  balance: number; // Cached balance
  description?: string;
}

export type VoucherType = "قبض" | "صرف" | "قيد يومية";

export interface VoucherLine {
  accountId: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

export type VoucherSourceModule = "manual" | "sales" | "purchases" | "inventory" | "operations" | "payroll" | "المعدات";

export interface Voucher extends BaseEntity {
  farmId: string;
  serialNumber: string; // Auto-generated e.g. REC-0001
  type: VoucherType;
  date: string; // ISO format
  reference?: string; // External ref like Check # or Invoice #
  description: string; // Main description
  
  totalAmount: number; // Total value of the voucher
  
  // The double entry lines
  lines: VoucherLine[];
  
  // Links to other modules
  sourceModule?: VoucherSourceModule;
  sourceId?: string; // ID of the invoice, operation, etc.
  linkedInvoiceId?: string;
  linkedWorkerId?: string;
  linkedSupplierId?: string;
  linkedCustomerId?: string;
}

// For UI Forms
export interface AccountFormValues {
  code: string;
  name: string;
  category: AccountCategory;
  description?: string;
}

export interface VoucherFormValues {
  type: VoucherType;
  date: string;
  reference?: string;
  description: string;
  
  // Simplified Hybrid Approach:
  // Instead of asking standard users to manually add multiple debits/credits, 
  // we ask them for the "Main Account" (e.g. Cash) and the "Opposite Account" (e.g. Customer)
  // The service layer will convert these into proper Debit/Credit lines based on VoucherType.
  mainAccountId: string; // The Treasury/Bank account
  oppositeAccountId: string; // The Expense/Revenue/Customer/Supplier account
  amount: number;
}
