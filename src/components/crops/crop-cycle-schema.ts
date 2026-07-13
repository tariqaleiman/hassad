import { z } from "zod";

export const cropCycleSchema = z.object({
  farmId: z.string().min(1, "اختر المزرعة"),
  landId: z.string().min(1, "اختر قطعة الأرض"),
  seasonId: z.string().min(1, "اختر الموسم"),
  cropId: z.string().min(1, "اختر المحصول"),
  plantDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CropCycleSchema = z.infer<typeof cropCycleSchema>;
