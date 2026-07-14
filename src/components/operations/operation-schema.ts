import { z } from "zod";

export const operationInventoryItemSchema = z.object({
  id: z.string(), // local id for useFieldArray
  itemId: z.string().min(1, "اختر الصنف"),
  quantity: z.number().min(0.01, "الكمية يجب أن تكون أكبر من 0"),
  unitPrice: z.number().min(0, "السعر غير صالح"),
});

export const operationSchema = z.object({
  farmId: z.string().min(1, "اختر المزرعة"),
  seasonId: z.string().min(1, "اختر الموسم"),
  cropCycleId: z.string().min(1, "اختر المحصول"),
  
  operationType: z.enum([
    "إعداد أرض", 
    "زراعة", 
    "ري", 
    "تسميد", 
    "رش مبيدات", 
    "عزيق", 
    "حصاد", 
    "أخرى"
  ]),
  date: z.string().min(1, "تاريخ العملية مطلوب"),
  notes: z.string().optional(),
  
  inventoryItems: z.array(operationInventoryItemSchema).optional(),
  
  laborCost: z.number().min(0).optional().default(0),
  equipmentCost: z.number().min(0).optional().default(0),
  otherCost: z.number().min(0).optional().default(0),
});

export type OperationSchema = z.infer<typeof operationSchema>;
export type OperationInventoryItemSchema = z.infer<typeof operationInventoryItemSchema>;
