import { z } from "zod";

export const ownerProfileSchema = z.object({
  // User Data
  name: z.string().min(2, "الاسم مطلوب (حرفين على الأقل)"),
  phone: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  dateOfBirth: z.string().optional(),
  userLocation: z.string().optional(),
  avatar: z.string().optional(),

  // Company Data
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  commercialRegister: z.string().optional(),
  establishmentDate: z.string().optional(),
  companyLocation: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  logo: z.string().optional(),
});

export type OwnerProfileSchema = z.infer<typeof ownerProfileSchema>;
