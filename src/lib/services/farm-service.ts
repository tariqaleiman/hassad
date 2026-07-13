import { farmRepository } from "@/lib/repositories/farm-repository";
import type { Farm, FarmFormValues } from "@/lib/types/farm";

/**
 * طبقة الخدمات: الواجهة (UI) لا تتحدث مع Firestore أو المستودعات مباشرة أبدًا،
 * بل تمر دائمًا من هنا.
 */

/** تنظيف البيانات قبل الحفظ */
function prepareForSave(data: FarmFormValues): FarmFormValues {
  const clean = { ...data };
  
  // تأكد من أن قائمة الشركاء نظيفة
  if (clean.partners) {
    clean.partners = clean.partners.filter(p => p.name && p.name.trim() !== "");
  }

  return clean;
}

export const farmService = {
  list: (): Promise<Farm[]> => farmRepository.getAll(),
  get: (id: string): Promise<Farm | null> => farmRepository.getById(id),
  create: (data: FarmFormValues, userId?: string): Promise<Farm> =>
    farmRepository.create(prepareForSave(data), userId),
  update: (
    id: string,
    data: Partial<FarmFormValues>,
    userId?: string
  ): Promise<Farm> =>
    farmRepository.update(id, prepareForSave(data as FarmFormValues), userId),
  remove: (id: string, userId?: string): Promise<void> =>
    farmRepository.softDelete(id, userId),
};
