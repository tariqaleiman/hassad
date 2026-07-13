import type { BaseEntity } from "./common";

export type HarvestType = "حصاد واحد" | "متعدد الحصاد" | "مستمر";

/** سجل في قاعدة بيانات المحاصيل (مرجع عام، غير مرتبط بمزرعة معينة) */
export interface Crop extends BaseEntity {
  name: string;
  category?: string;
  harvestType: HarvestType;
  productUnit: string; // وحدة الإنتاج
  seedUnit?: string; // وحدة التقاوي
  notes?: string;
}

export interface CropFormValues {
  name: string;
  category?: string;
  harvestType: HarvestType;
  productUnit: string;
  seedUnit?: string;
  notes?: string;
}
