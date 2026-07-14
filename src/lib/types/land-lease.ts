import type { BaseEntity } from "./common";

export type LeaseDurationType = "season" | "year";

export interface LandLeaseOut extends BaseEntity {
  farmId: string;
  seasonId?: string; // إذا كان الإيجار لموسم معين
  landId: string;
  
  tenantName: string; // اسم المستأجر
  tenantPhone?: string; // هاتف المستأجر
  
  areaValue: number; // مساحة الإيجار
  areaUnit: "feddan" | "qirat" | "meter";
  areaInFeddan: number; // للعمليات الحسابية
  
  duration: LeaseDurationType; // موسم أم سنة
  startDate?: string;
  endDate?: string;
  
  rentAmount: number; // الإيراد من الإيجار
  notes?: string;
  status: "نشط" | "منتهي" | "ملغى";
}

export interface LandLeaseOutFormValues {
  farmId: string;
  seasonId?: string;
  landId: string;
  tenantName: string;
  tenantPhone?: string;
  areaValue: number;
  areaUnit: "feddan" | "qirat" | "meter";
  duration: LeaseDurationType;
  startDate?: string;
  endDate?: string;
  rentAmount: number;
  notes?: string;
  status: "نشط" | "منتهي" | "ملغى";
}
