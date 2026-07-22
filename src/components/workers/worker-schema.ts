import * as z from "zod";

export const workerSchema = z.object({
  farmId: z.string().min(1, "الرجاء تحديد المزرعة"),
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  phone: z.string().optional(),
  type: z.enum(["يومي", "شهري", "موسمي"]),
  dailyWage: z.number().min(0, "الأجر يجب أن يكون قيمة موجبة").optional(),
  monthlyWage: z.number().min(0, "الأجر يجب أن يكون قيمة موجبة").optional(),
  specialty: z.string().optional(),
  status: z.enum(["نشط", "متوقف"]),
  notes: z.string().optional(),
});

export type WorkerSchema = z.infer<typeof workerSchema>;
