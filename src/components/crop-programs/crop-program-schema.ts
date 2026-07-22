import { z } from "zod";

export const cropProgramPhaseSchema = z.object({
  id: z.string().optional(),
  dayNumber: z.coerce.number(), // يمكن أن يكون سالباً للمهام قبل الزراعة (مثل المشتل أو تجهيز الأرض)
  type: z.array(z.string()).min(1, "اختر نوع عملية واحد على الأقل"),
  title: z.string().min(2, "عنوان المهمة مطلوب"),
  description: z.string().optional(),
});

export const cropProgramSchema = z.object({
  name: z.string().min(2, "اسم البرنامج مطلوب"),
  cropId: z.string().min(1, "اختر المحصول"),
  plantingMethods: z.array(z.string()).optional(),
  description: z.string().optional(),
  phases: z.array(cropProgramPhaseSchema).min(1, "يجب إضافة مهمة واحدة على الأقل"),
});

export type CropProgramSchema = z.infer<typeof cropProgramSchema>;
