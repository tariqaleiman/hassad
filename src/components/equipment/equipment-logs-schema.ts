import * as z from "zod";

export const maintenanceLogSchema = z.object({
  equipmentId: z.string().min(1, "معرف المعدة مطلوب"),
  farmId: z.string().min(1, "معرف المزرعة مطلوب"),
  date: z.string().min(1, "التاريخ مطلوب"),
  type: z.string().min(1, "نوع الصيانة مطلوب"),
  cost: z.number().min(0, "التكلفة يجب أن تكون موجبة"),
  performedBy: z.string().optional(),
  description: z.string().optional(),
  nextMaintenanceDate: z.string().optional(),
});

export type MaintenanceLogSchema = z.infer<typeof maintenanceLogSchema>;

export const fuelLogSchema = z.object({
  equipmentId: z.string().min(1, "معرف المعدة مطلوب"),
  farmId: z.string().min(1, "معرف المزرعة مطلوب"),
  date: z.string().min(1, "التاريخ مطلوب"),
  fuelType: z.string().min(1, "نوع الوقود مطلوب"),
  quantity: z.number().min(0.1, "الكمية يجب أن تكون موجبة"),
  cost: z.number().min(0, "التكلفة يجب أن تكون موجبة"),
  odometerOrHours: z.number().min(0, "القراءة يجب أن تكون موجبة").optional(),
  notes: z.string().optional(),
});

export type FuelLogSchema = z.infer<typeof fuelLogSchema>;
