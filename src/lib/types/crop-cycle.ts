import type { BaseEntity } from "./common";

export type CropCycleStatus = "نشطة" | "محصودة" | "ملغاة";

export type PlantingMethod = "بدار" | "زراعة بالجورة" | "شتلات خارجية" | "إعداد مشتل داخلي" | "شتلات من مشتل داخلي" | "عقلة";

/**
 * دورة المحصول: تبدأ بمجرد إنشاء المحصول داخل الموسم،
 * ولا يشترط تسجيل تاريخ الزراعة أو الحصاد عند الإنشاء (حسب وثيقة التأسيس).
 * ملاحظة: البرسيم ومحاصيل الحشات المتعددة تُدار عبر وحدة "العمليات الزراعية"
 * التي تُسجّل كل حشة/حصاد كعملية مستقلة مرتبطة بهذه الدورة.
 */
export interface CropCycle extends BaseEntity {
  farmId: string;
  landId: string;
  seasonId: string;
  cropId: string;
  cropVariety?: string; // الصنف (مثل: عريض/رفيع)
  cropSubVariety?: string; // السلالة (مثل: سخا 178)
  
  plantingMethod: PlantingMethod;
  isNursery?: boolean;
  sourceNurseryId?: string;
  
  areaValue: number; // مساحة المحصول أو المشتل
  areaUnit: "feddan" | "qirat" | "meter";
  areaInFeddan: number; // للعمليات الحسابية

  plantDate?: string | null;
  harvestDate?: string | null;
  status: CropCycleStatus;
  notes?: string;
}

export interface CropCycleFormValues {
  farmId: string;
  landId: string;
  seasonId: string;
  cropId: string;
  cropVariety?: string;
  cropSubVariety?: string;
  plantingMethod: PlantingMethod;
  isNursery?: boolean;
  sourceNurseryId?: string;
  areaValue: number;
  areaUnit: "feddan" | "qirat" | "meter";
  plantDate?: string;
  notes?: string;
}
