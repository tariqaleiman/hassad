import { cropCycleRepository } from "@/lib/repositories/crop-cycle-repository";
import { landRepository } from "@/lib/repositories/land-repository";
import type { CropCycle, CropCycleFormValues } from "@/lib/types/crop-cycle";
import type { HarvestSchema } from "@/components/crop-cycles/harvest-schema";
import { convertToFeddan } from "@/lib/utils/area";

async function validateAreaConstraint(data: CropCycleFormValues, idToIgnore?: string, userId?: string) {
  const newAreaInFeddan = convertToFeddan(data.areaValue, data.areaUnit);
  
  const { landService } = await import("./land-service");
  const areaInfo = await landService.getAvailableArea(data.landId, data.seasonId, idToIgnore, undefined, userId);

  if (newAreaInFeddan > areaInfo.available + 0.001) { // 0.001 for floating point errors
    throw new Error(`لا يمكن إضافة مساحة ${data.areaValue}. المساحة المتاحة في هذه الأرض هي: ${areaInfo.available.toFixed(2)} فدان`);
  }

  return newAreaInFeddan;
}

export const cropCycleService = {
  list: (userId?: string): Promise<CropCycle[]> => cropCycleRepository.getAll({ userId }),
  listByFarm: (farmId: string, userId?: string): Promise<CropCycle[]> => cropCycleRepository.getByField("farmId", farmId, userId),
  listBySeason: (seasonId: string, userId?: string): Promise<CropCycle[]> =>
    cropCycleRepository.getByField("seasonId", seasonId, userId),
  get: (id: string): Promise<CropCycle | null> => cropCycleRepository.getById(id),
  
  create: async (data: CropCycleFormValues, userId?: string): Promise<CropCycle> => {
    const areaInFeddan = await validateAreaConstraint(data, undefined, userId);
    return cropCycleRepository.create(
      { ...data, status: "نشطة", harvestDate: null, areaInFeddan } as unknown as CropCycleFormValues,
      userId
    );
  },
  
  update: async (
    id: string,
    data: Partial<CropCycleFormValues>,
    userId?: string
  ): Promise<CropCycle> => {
    let areaInFeddan;
    if (data.areaValue && data.areaUnit && data.landId && data.seasonId) {
      areaInFeddan = await validateAreaConstraint(data as CropCycleFormValues, id, userId);
    }
    const updateData = areaInFeddan !== undefined ? { ...data, areaInFeddan } : data;
    return cropCycleRepository.update(id, updateData, userId);
  },
  
  markHarvested: (id: string, harvestData: HarvestSchema, userId?: string): Promise<void> =>
    cropCycleRepository.markHarvested(id, harvestData, userId),
  remove: (id: string, userId?: string): Promise<void> =>
    cropCycleRepository.softDelete(id, userId),
};
