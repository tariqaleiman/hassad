import { z } from "zod";
import { AccountCategory, VoucherType } from "@/lib/types/finance";

export const accountSchema = z.object({
  code: z.string().min(1, "رقم الحساب مطلوب"),
  name: z.string().min(1, "اسم الحساب مطلوب"),
  category: z.enum(["أصول", "خصوم", "حقوق ملكية", "إيرادات", "مصروفات"]),
  description: z.string().optional(),
});

export type AccountSchema = z.infer<typeof accountSchema>;

export const voucherSchema = z.object({
  type: z.enum(["قبض", "صرف", "قيد يومية"]),
  date: z.string().min(1, "التاريخ مطلوب"),
  reference: z.string().optional(),
  description: z.string().min(1, "البيان مطلوب"),
  mainAccountId: z.string().min(1, "الحساب الرئيسي (الخزينة/البنك) مطلوب"),
  oppositeAccountId: z.string().min(1, "الحساب المقابل مطلوب"),
  amount: z.coerce.number().min(0.01, "المبلغ يجب أن يكون أكبر من 0"),
});

export type VoucherSchema = z.infer<typeof voucherSchema>;
