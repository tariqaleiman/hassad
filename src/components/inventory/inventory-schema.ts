import { z } from "zod";

export const inventorySchema = z.object({
  farmId: z.string().min(1, "اختر المزرعة"),
  dictionaryId: z.string().min(1, "الرجاء اختيار صنف من الدليل"),
  initialQuantity: z.number().min(0).optional(),
  initialUnitPrice: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export type InventorySchema = z.infer<typeof inventorySchema>;
