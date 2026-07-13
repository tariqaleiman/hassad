import { z } from "zod";

export const landSchema = z.object({
  farmId: z.string().min(1, "اختر المزرعة"),
  name: z.string().min(2, "اسم قطعة الأرض مطلوب"),
  areaInFeddan: z.number().positive("المساحة مطلوبة"),
  soilType: z.string().optional(),
  irrigationType: z.enum(["غمر", "رش", "تنقيط", "أخرى"]).optional(),
  notes: z.string().optional(),
});

export type LandSchema = z.infer<typeof landSchema>;
