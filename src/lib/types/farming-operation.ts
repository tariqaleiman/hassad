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
  
  operationType: OperationType | string;
  date: string; // ISO String
  notes?: string;
  
  // ربط بمهمة في برنامج المتابعة
  linkedPhaseId?: string;
  programId?: string;
  
  inventoryItems: OperationInventoryItem[];
  inventoryCost: number; // Total cost from inventory
  
  // تكاليف العمالة
  laborCost: number;
  laborContractorId?: string; // ربط بالمقاول
  laborContractorName?: string; // اسم المقاول للعرض السريع
  laborPaymentMethod?: "cash" | "credit"; // نقدي أو آجل

  // تكاليف المعدات والآلات
  equipmentCost: number;
  equipmentId?: string; // ربط بمعدة مسجلة (مثل ماكينة ري)
  equipmentContractorId?: string;
  equipmentContractorName?: string;
  equipmentPaymentMethod?: "cash" | "credit";
  
  // تكاليف خاصة بالري
  fuelCost?: number; // تكلفة الوقود
  depreciationCost?: number; // إهلاك الماكينة
  
  otherCost: number;
  
  totalCost: number; // inventoryCost + laborCost + equipmentCost + fuelCost + depreciationCost + otherCost
}
