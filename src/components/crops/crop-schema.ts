import { z } from "zod";

export const cropSchema = z.object({
  name: z.string().min(2, "اسم المحصول مطلوب"),
  category: z.string().optional(),
  imageUrl: z.string().url("رابط الصورة غير صالح").optional().or(z.literal("")),
  harvestType: z.enum(["حصاد واحد", "متعدد الحصاد", "مستمر"]),
  harvestBatchName: z.string().optional(),
  productUnit: z.string().min(1, "وحدة الإنتاج مطلوبة"),
  seedUnit: z.string().optional(),
  varieties: z.array(z.object({
    name: z.string().min(1, "اسم الصنف مطلوب"),
    subVarietiesText: z.string().optional()
  })).optional(),
  notes: z.string().optional(),
});

export type CropSchema = z.infer<typeof cropSchema>;
