import type { BaseEntity } from "./common";

export type HarvestType = "حصاد واحد" | "متعدد الحصاد" | "مستمر";

export interface CropVariety {
  name: string;
  subVarieties?: string[];
}

/** سجل في قاعدة بيانات المحاصيل (مرجع عام، غير مرتبط بمزرعة معينة) */
export interface Crop extends BaseEntity {
  name: string;
  category?: string;
  harvestType: HarvestType;
  harvestBatchName?: string; // مسمى الدفعة: حشة، بطن، جنية، قطفة
  productUnit: string; // وحدة الإنتاج
  seedUnit?: string; // وحدة التقاوي
  varieties?: CropVariety[]; // الأصناف المتفرعة
  notes?: string;
}

export interface CropFormValues {
  name: string;
  category?: string;
  harvestType: HarvestType;
  harvestBatchName?: string;
  productUnit: string;
  seedUnit?: string;
  varieties?: CropVariety[];
  notes?: string;
}
