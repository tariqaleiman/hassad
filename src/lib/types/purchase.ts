import type { BaseEntity } from "./common";
import type { ItemCategory } from "./inventory";

export interface PurchaseInvoiceItem {
  id: string; // Unique ID for the row (can be UUID)
  itemId?: string; // If selecting an existing item
  
  // If it's a completely new item, we need these to create it:
  isNewItem: boolean;
  dictionaryId?: string;
  name: string;
  category: ItemCategory;
  unit: string;
  
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseInvoice extends BaseEntity {
  farmId: string;
  invoiceDate: string; // ISO String
  supplierId?: string;
  supplierName?: string; // For legacy invoices or one-offs without formal supplier
  paymentMethod: "cash" | "credit";
  paidAmount: number;
  notes?: string;
  items: PurchaseInvoiceItem[];
  totalAmount: number;
}
