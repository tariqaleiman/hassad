import { landRepository } from "@/lib/repositories/land-repository";
import type { Land, LandFormValues } from "@/lib/types/land";

/** تحويل القيمة المُدخلة إلى فدان (1 فدان = 24 قيراط) */
function computeAreaInFeddan(
  areaValue?: number,
  areaUnit?: string
): number | undefined {
  if (areaValue == null || areaValue <= 0) return undefined;
  if (areaUnit === "qirat") return areaValue / 24;
  return areaValue; // default: feddan
}

/** تنظيف البيانات قبل الحفظ */
function prepareForSave(data: LandFormValues): LandFormValues {
  const clean = { ...data };

  // حساب المساحة بالفدان
  clean.areaInFeddan = computeAreaInFeddan(data.areaValue, data.areaUnit);

  // إذا مملوكة → نحذف بيانات الإيجار والمؤجر
  if (clean.ownershipType === "owned") {
    clean.rental = undefined;
    clean.landlord = undefined;
  }

  // إذا مستأجرة مع إيجار ثابت → ننظف حقول المشاركة
  if (clean.rental?.model === "fixed_cost") {
    clean.rental.ownerSharePercent = undefined;
    clean.rental.costSharingModel = undefined;
    // إذا دفعة واحدة → ننظف الأقساط
    if (clean.rental.paymentMethod === "full") {
      clean.rental.installments = undefined;
    }
  }

  // إذا مشاركة محصول → ننظف حقول الإيجار الثابت
  if (clean.rental?.model === "crop_sharing") {
    clean.rental.costType = undefined;
    clean.rental.cost = undefined;
    clean.rental.paymentMethod = undefined;
    clean.rental.installments = undefined;
  }

  return clean;
}

export const landService = {
  list: (): Promise<Land[]> => landRepository.getAll(),
  listByFarm: (farmId: string): Promise<Land[]> => landRepository.getByFarm(farmId),
  get: (id: string): Promise<Land | null> => landRepository.getById(id),
  create: (data: LandFormValues, userId?: string): Promise<Land> =>
    landRepository.create(prepareForSave(data), userId),
  update: (id: string, data: Partial<LandFormValues>, userId?: string): Promise<Land> =>
    landRepository.update(id, prepareForSave(data as LandFormValues), userId),
  remove: (id: string, userId?: string): Promise<void> =>
    landRepository.softDelete(id, userId),
};
