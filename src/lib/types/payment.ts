import type { BaseEntity } from "./common";

export type PaymentType = "pay_supplier" | "pay_contractor" | "receive_from_customer";

export interface Payment extends BaseEntity {
  farmId: string;
  seasonId?: string; // Optional: Link payment to a specific season
  date: string; // ISO Date
  
  type: PaymentType;
  
  // References
  supplierId?: string;
  contractorId?: string;
  customerId?: string;

  amount: number;
  paymentMethod: "cash" | "bank" | "check";
  
  referenceNumber?: string; // For checks or bank transfers
  notes?: string;
}

export interface PaymentFormValues {
  farmId: string;
  seasonId?: string;
  date: string;
  type: PaymentType;
  supplierId?: string;
  contractorId?: string;
  customerId?: string;
  amount: number;
  paymentMethod: "cash" | "bank" | "check";
  referenceNumber?: string;
  notes?: string;
}
