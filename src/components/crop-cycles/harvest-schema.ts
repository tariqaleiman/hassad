import { z } from "zod";

export const harvestSchema = z.object({
  harvestDate: z.string().min(1, "تاريخ الحصاد مطلوب"),
  yieldQuantity: z.number({ message: "أدخل رقماً صحيحاً" }).min(0, "الكمية لا يمكن أن تكون سالبة").nullable().optional(),
  yieldUnit: z.string().nullable().optional(),
  yieldGrade: z.string().nullable().optional(),
  actualRevenue: z.number({ message: "أدخل رقماً صحيحاً" }).min(0, "الإيراد لا يمكن أن يكون سالباً").nullable().optional(),
  harvestNotes: z.string().optional(),
});

export type HarvestSchema = z.infer<typeof harvestSchema>;
