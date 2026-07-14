import { landLeaseOutRepository } from "@/lib/repositories/land-lease-repository";
import type { LandLeaseOut, LandLeaseOutFormValues } from "@/lib/types/land-lease";
import { convertToFeddan } from "@/lib/utils/area";
import { landService } from "./land-service";

async function validateAreaConstraint(data: LandLeaseOutFormValues, idToIgnore?: string, userId?: string) {
  const newAreaInFeddan = convertToFeddan(data.areaValue, data.areaUnit);
  
  // We need seasonId to check available area properly. 
  // If it's a yearly lease, it blocks across seasons, but for validation we can check against current/selected season.
  const checkSeasonId = data.seasonId || "general"; 
  
  const areaInfo = await landService.getAvailableArea(data.landId, checkSeasonId, undefined, idToIgnore, userId);

  if (newAreaInFeddan > areaInfo.available + 0.001) {
    throw new Error(`لا يمكن تأجير مساحة ${data.areaValue}. المساحة المتاحة في هذه الأرض هي: ${areaInfo.available.toFixed(2)} فدان`);
  }

  return newAreaInFeddan;
}

export const landLeaseService = {
  list: (userId?: string): Promise<LandLeaseOut[]> => landLeaseOutRepository.getAll({ userId }),
  listByLand: (landId: string, userId?: string): Promise<LandLeaseOut[]> =>
    landLeaseOutRepository.getByField("landId", landId, userId),
  get: (id: string): Promise<LandLeaseOut | null> => landLeaseOutRepository.getById(id),
  
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
      areaInFeddan = await validateAreaConstraint(data as LandLeaseOutFormValues, id, userId);
    }
    const updateData = areaInFeddan !== undefined ? { ...data, areaInFeddan } : data;
    return landLeaseOutRepository.update(id, updateData, userId);
  },
  
  remove: (id: string, userId?: string): Promise<void> =>
    landLeaseOutRepository.softDelete(id, userId),
};
