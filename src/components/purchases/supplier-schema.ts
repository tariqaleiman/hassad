import { z } from "zod";

export const supplierSchema = z.object({
  farmId: z.string().min(1, "اختر المزرعة"),
  supplierType: z.enum(["company", "individual"]).default("individual"),
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  commercialRegister: z.string().optional(),
  email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  initialBalance: z.number().default(0),
  notes: z.string().optional(),
});

export type SupplierSchema = z.infer<typeof supplierSchema>;
