import { seasonRepository } from "@/lib/repositories/season-repository";
import type { Season, SeasonFormValues } from "@/lib/types/season";

export const seasonService = {
  list: (): Promise<Season[]> => seasonRepository.getAll(),
  listByFarm: (farmId: string): Promise<Season[]> => seasonRepository.getByFarm(farmId),
  get: (id: string): Promise<Season | null> => seasonRepository.getById(id),
  create: (data: SeasonFormValues, userId?: string): Promise<Season> =>
    seasonRepository.create(
      { ...data, status: "مفتوح", endDate: null } as unknown as SeasonFormValues,
      userId
    ),
  update: (id: string, data: Partial<SeasonFormValues>, userId?: string): Promise<Season> =>
    seasonRepository.update(id, data, userId),
  close: (id: string, userId?: string): Promise<void> => seasonRepository.close(id, userId),
  remove: (id: string, userId?: string): Promise<void> =>
    seasonRepository.softDelete(id, userId),
};
