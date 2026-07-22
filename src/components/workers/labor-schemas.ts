import { z } from "zod";

export const laborLogSchema = z.object({
  workerId: z.string().min(1, "اختر العامل"),
  date: z.string().min(1, "تاريخ اليومية مطلوب"),
  status: z.enum(["حاضر", "غائب", "نصف يوم", "إضافي"]),
  wage: z.coerce.number().min(0, "الأجر يجب أن يكون 0 أو أكثر"),
  operationId: z.string().optional(),
  cropCycleId: z.string().optional(),
  notes: z.string().optional(),
});

export type LaborLogSchema = z.infer<typeof laborLogSchema>;

export const laborAdvanceSchema = z.object({
  workerId: z.string().min(1, "اختر العامل"),
  date: z.string().min(1, "تاريخ السلفة مطلوب"),
  amount: z.coerce.number().min(1, "مبلغ السلفة يجب أن يكون أكبر من 0"),
  paymentMethod: z.enum(["cash", "bank_transfer", "instapay", "vodafone_cash", "orange_cash", "other"]),
  reason: z.string().optional(),
});

export type LaborAdvanceSchema = z.infer<typeof laborAdvanceSchema>;

export const laborSettlementSchema = z.object({
  workerId: z.string().min(1, "اختر العامل"),
  date: z.string().min(1, "تاريخ التصفية مطلوب"),
  periodStart: z.string().min(1, "تاريخ البداية مطلوب"),
  periodEnd: z.string().min(1, "تاريخ النهاية مطلوب"),
  netPaid: z.coerce.number().min(0, "صافي الدفع يجب أن يكون 0 أو أكثر"),
  paymentMethod: z.enum(["cash", "bank_transfer", "instapay", "vodafone_cash", "orange_cash", "other"]),
  notes: z.string().optional(),
});

export type LaborSettlementSchema = z.infer<typeof laborSettlementSchema>;
