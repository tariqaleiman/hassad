import { z } from "zod";

export const cropCycleSchema = z.object({
  farmId: z.string().min(1, "اختر المزرعة"),
  landId: z.string().min(1, "اختر قطعة الأرض"),
  seasonId: z.string().min(1, "اختر الموسم"),
  cropId: z.string().min(1, "اختر المحصول"),
  cropVariety: z.string().optional(),
  cropSubVariety: z.string().optional(),
  plantingMethod: z.enum(["بدار", "زراعة بالجورة", "شتلات خارجية", "إعداد مشتل داخلي", "شتلات من مشتل داخلي", "عقلة"], {
    error: "اختر طريقة الزراعة",
  }),
  isNursery: z.boolean().optional(),
  sourceNurseryId: z.string().optional(),
  areaValue: z.coerce.number().min(0.01, "أدخل المساحة بشكل صحيح"),
  areaUnit: z.enum(["feddan", "qirat", "meter"], { error: "اختر وحدة المساحة" }),
  plantDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CropCycleSchema = z.infer<typeof cropCycleSchema>;
