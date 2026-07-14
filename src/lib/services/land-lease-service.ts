import { landLeaseOutRepository } from "@/lib/repositories/land-lease-repository";
import type { LandLeaseOut, LandLeaseOutFormValues } from "@/lib/types/land-lease";
import { convertToFeddan } from "@/lib/utils/area";

async function validateAreaConstraint(data: LandLeaseOutFormValues, idToIgnore?: string, userId?: string) {
  const newAreaInFeddan = convertToFeddan(data.areaValue, data.areaUnit);
  
  const { landService } = await import("./land-service");
  // Assuming land leases don't have a season if they are yearly, but if they do:
  // we pass the seasonId if it exists to get available area in that season.
  const areaInfo = await landService.getAvailableArea(
    data.landId, 
    data.seasonId || "", 
    undefined, 
    idToIgnore, 
    userId
  );

  if (newAreaInFeddan > areaInfo.available + 0.001) {
    throw new Error(`لا يمكن تأجير مساحة ${data.areaValue}. المساحة المتاحة هي: ${areaInfo.available.toFixed(2)} فدان`);
  }

  return newAreaInFeddan;
}

export const landLeaseOutService = {
  list: (userId?: string): Promise<LandLeaseOut[]> => landLeaseOutRepository.getAll({ userId }),
  listByLand: (landId: string, userId?: string): Promise<LandLeaseOut[]> => 
    landLeaseOutRepository.getByField("landId", landId, userId),
  listByFarm: (farmId: string, userId?: string): Promise<LandLeaseOut[]> => 
    landLeaseOutRepository.getByField("farmId", farmId, userId),
  
  create: async (data: LandLeaseOutFormValues, userId?: string): Promise<LandLeaseOut> => {
    const areaInFeddan = await validateAreaConstraint(data, undefined, userId);
    return landLeaseOutRepository.create(
      { ...data, areaInFeddan } as unknown as LandLeaseOutFormValues,
      userId
    );
  },
  
  update: async (
    id: string,
    data: Partial<LandLeaseOutFormValues>,
    userId?: string
  ): Promise<LandLeaseOut> => {
    let areaInFeddan;
    if (data.areaValue && data.areaUnit && data.landId) {
      // Need full data to validate
      const existing = await landLeaseOutRepository.getById(id);
      if (existing) {
        const fullData = { ...existing, ...data } as LandLeaseOutFormValues;
        areaInFeddan = await validateAreaConstraint(fullData, id, userId);
      }
    }
    const updateData = areaInFeddan !== undefined ? { ...data, areaInFeddan } : data;
    return landLeaseOutRepository.update(id, updateData, userId);
  },
  
  remove: (id: string, userId?: string): Promise<void> =>
    landLeaseOutRepository.softDelete(id, userId),
};
