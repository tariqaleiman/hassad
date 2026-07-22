import type { BaseEntity } from "./common";

export type EquipmentType = "جرار" | "محراث" | "رشاش" | "حصادة" | "مضخة ري" | "أخرى";
export type EquipmentStatus = "يعمل" | "معطل" | "في الصيانة";

export interface Equipment extends BaseEntity {
  farmId: string;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  purchaseDate?: string;
  purchaseValue?: number;
  usefulLifeYears?: number; // العمر الافتراضي بالسنوات
  salvageValue?: number; // القيمة الخردة
  accumulatedDepreciation?: number; // مجمع الإهلاك (يتم تحديثه آلياً)
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
}

export interface MaintenanceLog extends BaseEntity {
  equipmentId: string;
  farmId: string;
  date: string;
  type: string; // نوع الصيانة (دورية، طارئة)
  cost: number;
  performedBy?: string;
  description?: string;
  nextMaintenanceDate?: string;
}

export interface FuelLog extends BaseEntity {
  equipmentId: string;
  farmId: string;
  date: string;
  fuelType: string;
  quantity: number; // اللترات
  cost: number;
  odometerOrHours?: number; // قراءة العداد
  notes?: string;
}

export interface EquipmentFormValues {
  farmId: string;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  purchaseDate?: string;
  purchaseValue?: number;
  usefulLifeYears?: number;
  salvageValue?: number;
  accumulatedDepreciation?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
}
