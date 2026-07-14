import type { BaseEntity } from "./common";

export type ItemCategory = 
  | "تقاوي" 
  | "أسمدة حرة" 
  | "أسمدة مدعمة" 
  | "مغذيات" 
  | "مبيدات" 
  | "محروقات وزيوت" 
  | "محاصيل تامة" 
  | "نواتج ثانوية" 
  | "أخرى";

export type TransactionType = "in" | "out";

export interface InventoryItem extends BaseEntity {
  farmId: string;
  name: string; // e.g., يوريا 46%
  category: ItemCategory;
  unit: string; // e.g., شيكارة 50ك, لتر, طن
  quantity: number; // Current stock available
  averageCost: number; // Moving average cost per unit
  notes?: string;
}

export interface InventoryTransaction extends BaseEntity {
  farmId: string;
  itemId: string;
  type: TransactionType;
  quantity: number;
  unitPrice: number; // For 'in', this is purchase price. For 'out', this is averageCost at the time of operation
  totalPrice: number; // quantity * unitPrice
  date: string; // ISO Date
  referenceType: "رصيد افتتاحي" | "مشتريات" | "عملية زراعية" | "تسوية";
  referenceId?: string; // ID of the purchase invoice or the agricultural operation
  notes?: string;
}

export interface InventoryItemFormValues {
  farmId: string;
  name: string;
  category: ItemCategory;
  unit: string;
  initialQuantity?: number;
  initialUnitPrice?: number;
  notes?: string;
}
