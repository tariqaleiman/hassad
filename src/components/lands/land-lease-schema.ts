import { z } from "zod";

export const landLeaseSchema = z.object({
  farmId: z.string().min(1, "المزرعة مطلوبة"),
  seasonId: z.string().optional(),
  landId: z.string().min(1, "اختر الأرض"),
  tenantName: z.string().min(2, "اسم المستأجر مطلوب"),
  tenantPhone: z.string().optional(),
  areaValue: z.number().min(0.01, "المساحة يجب أن تكون أكبر من صفر"),
  areaUnit: z.enum(["feddan", "qirat", "meter"]),
  duration: z.enum(["season", "year"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  rentAmount: z.number().min(0, "قيمة الإيجار يجب أن تكون صفر أو أكثر"),
  notes: z.string().optional(),
  status: z.enum(["نشط", "منتهي", "ملغى"]),
});

export type LandLeaseSchema = z.infer<typeof landLeaseSchema>;
