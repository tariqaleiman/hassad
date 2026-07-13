import type { BaseEntity } from "./common";

export type CropCycleStatus = "نشطة" | "محصودة" | "ملغاة";

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
  plantDate?: string;
  notes?: string;
}
