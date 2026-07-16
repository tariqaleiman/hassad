import { z } from "zod";

export const closeSeasonSchema = z.object({
  endDate: z.string().min(1, "تاريخ الإغلاق الفعلي مطلوب"),
  notes: z.string().optional(),
});

export type CloseSeasonSchema = z.infer<typeof closeSeasonSchema>;
