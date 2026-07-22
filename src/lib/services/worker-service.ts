import { workerRepository } from "../repositories/worker-repository";
import type { Worker, WorkerFormValues } from "../types/worker";

export const workerService = {
  list: (userId?: string): Promise<Worker[]> => workerRepository.getAll({ userId }),
  listByFarm: (farmId: string, userId?: string): Promise<Worker[]> => workerRepository.getByField("farmId", farmId, userId),
  get: (id: string): Promise<Worker | null> => workerRepository.getById(id),
  create: (data: WorkerFormValues, userId?: string): Promise<Worker> => workerRepository.create(data, userId),
  update: (id: string, data: Partial<WorkerFormValues>, userId?: string): Promise<Worker> => workerRepository.update(id, data, userId),
  remove: (id: string, userId?: string): Promise<void> => workerRepository.softDelete(id, userId),
};
