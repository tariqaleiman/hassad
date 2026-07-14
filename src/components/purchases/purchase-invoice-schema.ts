import { z } from "zod";

export const purchaseInvoiceItemSchema = z.object({
  id: z.string(), // local id for useFieldArray
  itemId: z.string().optional(),
  
  isNewItem: z.boolean(),
  dictionaryId: z.string().optional(), // Required if isNewItem is true
  
  quantity: z.number().min(0.01, "الكمية يجب أن تكون أكبر من 0"),
  unitPrice: z.number().min(0, "السعر غير صالح"),
});

export const purchaseInvoiceSchema = z.object({
  farmId: z.string().min(1, "اختر المزرعة"),
  invoiceDate: z.string().min(1, "تاريخ الفاتورة مطلوب"),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  paymentMethod: z.enum(["cash", "credit"]),
  paidAmount: z.number().min(0),
  notes: z.string().optional(),
  items: z.array(purchaseInvoiceItemSchema).min(1, "يجب إضافة صنف واحد على الأقل للفاتورة"),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === "credit" && !data.supplierId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "يجب اختيار المورد في حالة الدفع الآجل",
      path: ["supplierId"],
    });
  }
});

export type PurchaseInvoiceSchema = z.infer<typeof purchaseInvoiceSchema>;
export type PurchaseInvoiceItemSchema = z.infer<typeof purchaseInvoiceItemSchema>;
