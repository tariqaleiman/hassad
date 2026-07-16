import { z } from "zod";

export const operationInventoryItemSchema = z.object({
  id: z.string(), // local id for useFieldArray
  itemId: z.string().min(1, "اختر الصنف"),
  quantity: z.number().min(0.01, "الكمية يجب أن تكون أكبر من 0"),
  mainQuantity: z.number().optional(),
  subQuantity: z.number().optional(),
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
    "تكاليف سابقة",
    "أخرى"
  ]),
  date: z.string().min(1, "تاريخ العملية مطلوب"),
  notes: z.string().optional(),
  
  inventoryItems: z.array(operationInventoryItemSchema).optional(),
  
  laborCost: z.number().min(0).optional().default(0),
  laborContractorId: z.string().optional(),
  laborPaymentMethod: z.enum(["cash", "credit"]).optional().default("cash"),

  equipmentCost: z.number().min(0).optional().default(0),
  equipmentContractorId: z.string().optional(),
  equipmentPaymentMethod: z.enum(["cash", "credit"]).optional().default("cash"),

  otherCost: z.number().min(0).optional().default(0),
});

export type OperationSchema = z.infer<typeof operationSchema>;
export type OperationInventoryItemSchema = z.infer<typeof operationInventoryItemSchema>;
