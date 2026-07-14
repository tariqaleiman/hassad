import { z } from "zod";

export const seasonSchema = z.object({
  farmId: z.string().min(1, "اختر المزرعة"),
  name: z.string().min(2, "اسم الموسم مطلوب"),
  type: z.enum(["صيفي", "شتوي", "نيلي", "مستديم", "محيّر", "مخصص"]),
  expectedBudget: z.number({ message: "الميزانية غير صحيحة" }).nullable().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export type SeasonSchema = z.infer<typeof seasonSchema>;
