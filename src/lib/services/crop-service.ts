import { cropRepository } from "@/lib/repositories/crop-repository";
import type { Crop, CropFormValues } from "@/lib/types/crop";
import { seedCrops } from "@/lib/data/seed-crops";

export const cropService = {
  list: (): Promise<Crop[]> => cropRepository.getAll(),
  get: (id: string): Promise<Crop | null> => cropRepository.getById(id),
  create: (data: CropFormValues, userId?: string): Promise<Crop> =>
    cropRepository.create(data, userId),
  update: (id: string, data: Partial<CropFormValues>, userId?: string): Promise<Crop> =>
    cropRepository.update(id, data, userId),
  remove: (id: string, userId?: string): Promise<void> =>
    cropRepository.softDelete(id, userId),
  /** تعبئة قاعدة البيانات بالمحاصيل المصرية الشائعة (مرة واحدة) */
  seedDefaults: async (userId?: string): Promise<void> => {
    for (const crop of seedCrops) {
      await cropRepository.create(crop, userId);
    }
  },
};
