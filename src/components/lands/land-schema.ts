import { z } from "zod";

/* ─── بيانات الآلة الحاسبة للمساحة ─── */
export const areaCalculatorSchema = z.object({
  unit: z.enum(["meter", "nos"]),
  shape: z.enum(["regular", "irregular"]),
  length: z.number().optional(),
  width: z.number().optional(),
  north: z.number().optional(),
  south: z.number().optional(),
  east: z.number().optional(),
  west: z.number().optional(),
});

/* ─── الشريك (في الأرض) ─── */
export const landPartnerSchema = z.object({
  name: z.string().min(2, "اسم الشريك مطلوب"),
  ownerSharePercent: z.number({ message: "النسبة مطلوبة" }).min(0).max(100, "النسبة لا يمكن أن تتجاوز 100"),
  partnerSharePercent: z.number({ message: "النسبة مطلوبة" }).min(0).max(100, "النسبة لا يمكن أن تتجاوز 100"),
});

/* ─── المالك الأصلي (لأرض الإيجار) ─── */
export const landlordSchema = z.object({
  name: z.string().min(2, "اسم المؤجر مطلوب"),
  phone: z.string().optional(),
});

/* ─── الإيجار النقدي ─── */
export const rentCashSchema = z.object({
  type: z.enum(["per_qirat", "per_feddan", "total"]),
  amount: z.number({ message: "قيمة الإيجار مطلوبة" }).min(1, "قيمة الإيجار مطلوبة"),
  duration: z.enum(["yearly", "seasonal"]),
});

/* ─── إيجار المشاركة (بالمحصول) ─── */
export const rentCropShareSchema = z.object({
  ratio: z.enum(["half", "third", "quarter", "custom"]),
  customRatioPercent: z.number({ message: "النسبة مطلوبة" }).optional(),
  costBearing: z.enum(["owner_full", "tenant_full", "shared", "custom"]),
  notes: z.string().optional(),
});

/* ─── بيانات الحيازة ─── */
export const tenureSchema = z.object({
  category: z.enum([
    "owned_full",
    "owned_partner",
    "rented_cash",
    "rented_crop_share",
    "rented_partner"
  ]),
  partner: landPartnerSchema.optional(),
  landlord: landlordSchema.optional(),
  rentCash: rentCashSchema.optional(),
  rentCropShare: rentCropShareSchema.optional(),
});

/* ─── المخطط الرئيسي للأرض ─── */
export const landSchema = z.object({
  farmId: z.string().min(1, "معرف المزرعة مطلوب"),
  name: z.string().min(2, "اسم الأرض مطلوب"),
  areaValue: z.number({ message: "المساحة مطلوبة" }).min(0.01, "المساحة مطلوبة ويجب أن تكون أكبر من صفر"),
  areaUnit: z.enum(["feddan", "qirat"]),
  areaCalculatorData: areaCalculatorSchema.optional(),
  soilType: z.string().optional(),
  irrigationType: z.enum(["غمر", "رش", "تنقيط", "أخرى", ""]).optional(),
  notes: z.string().optional(),
  tenure: tenureSchema,
});

export type LandSchema = z.infer<typeof landSchema>;
