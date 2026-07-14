import { z } from "zod";

export const cropSchema = z.object({
  name: z.string().min(2, "اسم المحصول مطلوب"),
  category: z.string().optional(),
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
