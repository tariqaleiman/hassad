import { z } from "zod";

export const paymentSchema = z.object({
  farmId: z.string().min(1, "المزرعة مطلوبة"),
  seasonId: z.string().optional(),
  date: z.string().min(1, "التاريخ مطلوب"),
  type: z.enum(["pay_supplier", "pay_contractor", "receive_from_customer"]),
  
  supplierId: z.string().optional(),
  contractorId: z.string().optional(),
  customerId: z.string().optional(),

  amount: z.number().min(1, "المبلغ يجب أن يكون أكبر من صفر"),
  paymentMethod: z.enum(["cash", "bank", "check"]),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => {
  if (data.type === "pay_supplier" && !data.supplierId) return false;
  if (data.type === "pay_contractor" && !data.contractorId) return false;
  if (data.type === "receive_from_customer" && !data.customerId) return false;
  return true;
}, {
  message: "يجب اختيار الشخص المعني بالدفعة",
  path: ["supplierId"] // Will attach error to one of them
});

export type PaymentSchema = z.infer<typeof paymentSchema>;
