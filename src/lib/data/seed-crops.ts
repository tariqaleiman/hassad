import type { CropFormValues } from "@/lib/types/crop";

/**
 * قاعدة بيانات جاهزة لمعظم المحاصيل المصرية، كما تنص وثيقة التأسيس.
 * تُستخدم لتعبئة قاعدة البيانات مرة واحدة عند أول تشغيل عبر زر "تحميل القائمة الجاهزة".
 */
export const seedCrops: CropFormValues[] = [
  { name: "قمح", category: "حبوب", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "كيلوجرام" },
  { name: "أرز", category: "حبوب", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "كيلوجرام" },
  { name: "ذرة شامية", category: "حبوب", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "كيلوجرام" },
  { name: "شعير", category: "حبوب", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "كيلوجرام" },
  { name: "قطن", category: "محاصيل صناعية", harvestType: "متعدد الحصاد", productUnit: "قنطار", seedUnit: "كيلوجرام" },
  { name: "قصب السكر", category: "محاصيل صناعية", harvestType: "حصاد واحد", productUnit: "طن", seedUnit: "طن" },
  { name: "بنجر السكر", category: "محاصيل صناعية", harvestType: "حصاد واحد", productUnit: "طن", seedUnit: "كيلوجرام" },
  { name: "برسيم", category: "أعلاف", harvestType: "مستمر", productUnit: "طن", seedUnit: "كيلوجرام" },
  { name: "طماطم", category: "خضروات", harvestType: "متعدد الحصاد", productUnit: "كيلوجرام", seedUnit: "جرام" },
  { name: "بطاطس", category: "خضروات", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "كيلوجرام" },
  { name: "بصل", category: "خضروات", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "كيلوجرام" },
  { name: "ثوم", category: "خضروات", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "كيلوجرام" },
  { name: "فلفل", category: "خضروات", harvestType: "متعدد الحصاد", productUnit: "كيلوجرام", seedUnit: "جرام" },
  { name: "باذنجان", category: "خضروات", harvestType: "متعدد الحصاد", productUnit: "كيلوجرام", seedUnit: "جرام" },
  { name: "كوسة", category: "خضروات", harvestType: "متعدد الحصاد", productUnit: "كيلوجرام", seedUnit: "جرام" },
  { name: "خيار", category: "خضروات", harvestType: "متعدد الحصاد", productUnit: "كيلوجرام", seedUnit: "جرام" },
  { name: "فول بلدي", category: "بقوليات", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "كيلوجرام" },
  { name: "عدس", category: "بقوليات", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "كيلوجرام" },
  { name: "موز", category: "فاكهة", harvestType: "مستمر", productUnit: "كيلوجرام", seedUnit: "شتلة" },
  { name: "مانجو", category: "فاكهة", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "شتلة" },
  { name: "برتقال", category: "فاكهة", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "شتلة" },
  { name: "عنب", category: "فاكهة", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "شتلة" },
];
