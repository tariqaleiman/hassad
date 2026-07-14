import { z } from "zod";

export const cropCycleSchema = z.object({
  farmId: z.string().min(1, "المزرعة مطلوبة"),
  seasonId: z.string().min(1, "الموسم مطلوب"),
  landId: z.string().min(1, "اختر قطعة الأرض"),
  cropId: z.string().min(1, "اختر المحصول"),
  cropVariety: z.string().optional(),
  cropSubVariety: z.string().optional(),
  plantingMethod: z.enum(["بدار", "زراعة بالجورة", "شتلات خارجية", "إعداد مشتل داخلي", "شتلات من مشتل داخلي", "عقلة"], {
    error: "اختر طريقة الزراعة",
  }),
  isNursery: z.boolean().optional(),
  sourceNurseryId: z.string().optional(),
  areaValue: z.number().min(0.01, "المساحة يجب أن تكون أكبر من صفر"),
  areaUnit: z.enum(["feddan", "qirat", "meter"]),
  plantDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CropCycleSchema = z.infer<typeof cropCycleSchema>;
