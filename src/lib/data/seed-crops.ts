import type { CropFormValues } from "@/lib/types/crop";

/**
 * قاعدة بيانات جاهزة لمعظم المحاصيل المصرية، كما تنص وثيقة التأسيس.
 * تُستخدم لتعبئة قاعدة البيانات مرة واحدة عند أول تشغيل عبر زر "تحميل القائمة الجاهزة".
 */
export const seedCrops: CropFormValues[] = [
  { name: "قمح", category: "حبوب", harvestType: "حصاد واحد", productUnit: "إردب", seedUnit: "كيلوجرام" },
  { 
    name: "أرز", 
    category: "حبوب", 
    harvestType: "حصاد واحد", 
    productUnit: "طن", 
    seedUnit: "كيلوجرام",
    varieties: [
      { name: "عريض", subVarieties: ["سوبر 300", "جيزة 177"] },
      { name: "رفيع", subVarieties: ["سخا 178", "جيزة 178"] }
    ]
  },
  { 
    name: "ذرة شامية", 
    category: "حبوب", 
    harvestType: "حصاد واحد", 
    productUnit: "إردب", 
    seedUnit: "كيلوجرام",
    varieties: [
      { name: "أبيض" },
      { name: "أصفر" }
    ]
  },
  { name: "شعير", category: "حبوب", harvestType: "حصاد واحد", productUnit: "إردب", seedUnit: "كيلوجرام" },
  { name: "قطن", category: "محاصيل صناعية", harvestType: "متعدد الحصاد", harvestBatchName: "جنية / قطفة", productUnit: "قنطار", seedUnit: "كيلوجرام" },
  { name: "قصب السكر", category: "محاصيل صناعية", harvestType: "حصاد واحد", productUnit: "طن", seedUnit: "طن" },
  { name: "بنجر السكر", category: "محاصيل صناعية", harvestType: "حصاد واحد", productUnit: "طن", seedUnit: "كيلوجرام" },
  { name: "بطيخ تسالي (اللب السوبر / الرومي)", category: "محاصيل تسالي", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "كيلوجرام" },
  { name: "دوار الشمس (لب عباد / زيوت)", category: "محاصيل تسالي وزيوت", harvestType: "حصاد واحد", productUnit: "كيلوجرام", seedUnit: "كيلوجرام" },
  { name: "برسيم", category: "أعلاف ومراعي", harvestType: "مستمر", harvestBatchName: "حشة", productUnit: "عقداية", seedUnit: "كيلوجرام" },
  { name: "علف سن الفيل", category: "أعلاف ومراعي", harvestType: "مستمر", harvestBatchName: "حشة / بطن", productUnit: "عقداية", seedUnit: "عقلة" },
  { name: "الحشيشة السعودي", category: "أعلاف ومراعي", harvestType: "مستمر", harvestBatchName: "حشة / بطن", productUnit: "عقداية", seedUnit: "كيلوجرام" },
  { name: "طماطم", category: "خضروات", harvestType: "متعدد الحصاد", harvestBatchName: "جنية", productUnit: "كيلوجرام", seedUnit: "جرام" },
  { name: "بطاطس", category: "خضروات", harvestType: "حصاد واحد", productUnit: "طن", seedUnit: "كيلوجرام" },
  { name: "بصل", category: "خضروات", harvestType: "حصاد واحد", productUnit: "طن", seedUnit: "كيلوجرام" },
  { name: "ثوم", category: "خضروات", harvestType: "حصاد واحد", productUnit: "طن", seedUnit: "كيلوجرام" },
  { name: "فلفل", category: "خضروات", harvestType: "متعدد الحصاد", harvestBatchName: "جنية", productUnit: "كيلوجرام", seedUnit: "جرام" },
  { name: "باذنجان", category: "خضروات", harvestType: "متعدد الحصاد", harvestBatchName: "جنية", productUnit: "كيلوجرام", seedUnit: "جرام" },
  { name: "كوسة", category: "خضروات", harvestType: "متعدد الحصاد", harvestBatchName: "جنية", productUnit: "كيلوجرام", seedUnit: "جرام" },
  { name: "خيار", category: "خضروات", harvestType: "متعدد الحصاد", harvestBatchName: "جنية", productUnit: "كيلوجرام", seedUnit: "جرام" },
  { name: "فول بلدي", category: "بقوليات", harvestType: "حصاد واحد", productUnit: "إردب", seedUnit: "كيلوجرام" },
  { name: "عدس", category: "بقوليات", harvestType: "حصاد واحد", productUnit: "إردب", seedUnit: "كيلوجرام" },
  { name: "موز", category: "فاكهة", harvestType: "مستمر", harvestBatchName: "قطفة", productUnit: "طن", seedUnit: "شتلة" },
  { name: "مانجو", category: "فاكهة", harvestType: "حصاد واحد", productUnit: "طن", seedUnit: "شتلة", varieties: [{ name: "عويس" }, { name: "كيت" }, { name: "زبدية" }] },
  { name: "برتقال", category: "فاكهة", harvestType: "حصاد واحد", productUnit: "طن", seedUnit: "شتلة", varieties: [{ name: "أبو سرة" }, { name: "صيفي" }, { name: "بلدي" }] },
  { name: "عنب", category: "فاكهة", harvestType: "حصاد واحد", productUnit: "طن", seedUnit: "شتلة" },
];
