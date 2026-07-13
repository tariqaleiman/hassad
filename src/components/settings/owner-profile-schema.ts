import { z } from "zod";

export const ownerProfileSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب (حرفين على الأقل)"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type OwnerProfileSchema = z.infer<typeof ownerProfileSchema>;
