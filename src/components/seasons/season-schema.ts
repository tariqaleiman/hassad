import { z } from "zod";

export const seasonSchema = z.object({
  farmId: z.string().min(1, "اختر المزرعة"),
  name: z.string().min(2, "اسم الموسم مطلوب"),
  type: z.enum(["صيفي", "شتوي", "نيلي", "مخصص"]),
  startDate: z.string().min(1, "تاريخ البداية مطلوب"),
  notes: z.string().optional(),
});

export type SeasonSchema = z.infer<typeof seasonSchema>;
