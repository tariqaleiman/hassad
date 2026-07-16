import { z } from "zod";

export const seasonSchema = z.object({
  farmId: z.string().min(1, "اختر المزرعة"),
  name: z.string().min(2, "اسم الموسم مطلوب"),
  type: z.enum(["صيفي", "شتوي", "نيلي", "مستديم", "محيّر", "مخصص"]),
  expectedBudget: z.number().min(0, "الميزانية لا يمكن أن تكون سالبة").nullable().optional(),
  expectedRevenue: z.number().min(0, "الإيراد المتوقع لا يمكن أن يكون سالباً").nullable().optional(),
  startDate: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export type SeasonSchema = z.infer<typeof seasonSchema>;
