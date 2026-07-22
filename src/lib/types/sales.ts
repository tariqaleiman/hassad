import type { BaseEntity } from "./common";

export interface SalesInvoiceItem {
  id: string; // Unique ID for the row
  inventoryItemId: string; // المنتج المباع من المخزن
  itemName?: string; // اسم المنتج (للعرض)
  
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice?: number;
}

export interface SalesInvoice extends BaseEntity {
  farmId: string;
  seasonId?: string; // الموسم (اختياري، للربط بماليات الموسم)
  invoiceDate: string; // ISO String
  
  customerId?: string; // العميل المشترى
  customerName?: string; // إذا كان المشتري عابر وليس مسجلاً
  
  paymentMethod: "cash" | "bank_transfer" | "instapay" | "vodafone_cash" | "orange_cash" | "credit" | "other";
  paidAmount: number; // المبلغ المدفوع وقت البيع
  
  items: SalesInvoiceItem[];
  totalAmount: number; // الإجمالي
  
  notes?: string;
}

export interface SalesInvoiceFormValues {
  farmId: string;
  seasonId?: string;
  invoiceDate: string;
  customerId?: string;
  customerName?: string;
  paymentMethod: "cash" | "bank_transfer" | "instapay" | "vodafone_cash" | "orange_cash" | "credit" | "other";
  paidAmount?: number;
  items: SalesInvoiceItem[];
  notes?: string;
}
