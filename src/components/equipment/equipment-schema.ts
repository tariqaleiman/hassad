import * as z from "zod";

export const equipmentSchema = z.object({
  farmId: z.string().min(1, "الرجاء تحديد المزرعة"),
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  type: z.enum(["جرار", "محراث", "رشاش", "حصادة", "مضخة ري", "أخرى"]),
  status: z.enum(["يعمل", "معطل", "في الصيانة"]),
  purchaseDate: z.string().optional(),
  purchaseValue: z.number().min(0, "القيمة يجب أن تكون موجبة").optional(),
  usefulLifeYears: z.number().min(1, "العمر الافتراضي يجب أن يكون سنة على الأقل").optional(),
  salvageValue: z.number().min(0, "قيمة الخردة يجب أن تكون موجبة").optional(),
  lastMaintenanceDate: z.string().optional(),
  nextMaintenanceDate: z.string().optional(),
  notes: z.string().optional(),
});

export type EquipmentSchema = z.infer<typeof equipmentSchema>;
