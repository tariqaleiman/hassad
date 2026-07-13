import { z } from "zod";

/* ─── مخطط الشريك ─── */
export const partnerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  role: z.string().optional(),
  sharePercent: z
    .number()
    .min(0, "النسبة يجب أن تكون بين 0 و 100")
    .max(100, "النسبة يجب أن تكون بين 0 و 100")
    .optional(),
  phone: z.string().optional(),
});

/* ─── المخطط الأساسي للمزرعة ─── */
export const farmSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  commercialName: z.string().optional(),
  mainLocation: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  partners: z.array(partnerSchema).optional(),
});

export type FarmSchema = z.infer<typeof farmSchema>;
