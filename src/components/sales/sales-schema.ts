import { z } from "zod";

export const salesInvoiceItemSchema = z.object({
  id: z.string(),
  cropCycleId: z.string().min(1, "اختر المحصول"),
  quantity: z.number().min(0.01, "الكمية مطلوبة"),
  unit: z.string().min(1, "الوحدة مطلوبة"),
  unitPrice: z.number().min(0, "السعر مطلوب"),
});

export const salesInvoiceSchema = z.object({
  farmId: z.string().min(1, "المزرعة مطلوبة"),
  seasonId: z.string().optional(),
  invoiceDate: z.string().min(1, "تاريخ الفاتورة مطلوب"),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  paymentMethod: z.enum(["cash", "credit"]),
  paidAmount: z.number().min(0).default(0),
  items: z.array(salesInvoiceItemSchema).min(1, "أضف محصولاً واحداً على الأقل للفاتورة"),
  notes: z.string().optional(),
});

export type SalesInvoiceSchema = z.infer<typeof salesInvoiceSchema>;
export type SalesInvoiceItemSchema = z.infer<typeof salesInvoiceItemSchema>;
