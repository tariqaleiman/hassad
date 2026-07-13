import { cropCycleRepository } from "@/lib/repositories/crop-cycle-repository";
import type { CropCycle, CropCycleFormValues } from "@/lib/types/crop-cycle";

export const cropCycleService = {
  list: (): Promise<CropCycle[]> => cropCycleRepository.getAll(),
  listBySeason: (seasonId: string): Promise<CropCycle[]> =>
    cropCycleRepository.getBySeason(seasonId),
  get: (id: string): Promise<CropCycle | null> => cropCycleRepository.getById(id),
  create: (data: CropCycleFormValues, userId?: string): Promise<CropCycle> =>
    cropCycleRepository.create(
      { ...data, status: "نشطة", harvestDate: null } as unknown as CropCycleFormValues,
      userId
    ),
  update: (
    id: string,
    data: Partial<CropCycleFormValues>,
    userId?: string
  ): Promise<CropCycle> => cropCycleRepository.update(id, data, userId),
  markHarvested: (id: string, userId?: string): Promise<void> =>
    cropCycleRepository.markHarvested(id, userId),
  remove: (id: string, userId?: string): Promise<void> =>
    cropCycleRepository.softDelete(id, userId),
};
