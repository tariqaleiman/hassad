import type { BaseEntity } from "./common";

export type OperationType = 
  | "إعداد أرض" 
  | "زراعة" 
  | "ري" 
  | "تسميد" 
  | "رش مبيدات" 
  | "عزيق" 
  | "حصاد" 
  | "أخرى";

export interface OperationInventoryItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface FarmingOperation extends BaseEntity {
  farmId: string;
  seasonId: string;
  cropCycleId: string;
  
  operationType: OperationType;
  date: string; // ISO String
  notes?: string;
  
  inventoryItems: OperationInventoryItem[];
  inventoryCost: number; // Total cost from inventory
  
  laborCost: number;
  equipmentCost: number;
  otherCost: number;
  
  totalCost: number; // inventoryCost + laborCost + equipmentCost + otherCost
}
