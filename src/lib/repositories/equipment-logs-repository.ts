import { FirestoreRepository } from "./firestore-repository";
import type { MaintenanceLog, FuelLog } from "@/lib/types/equipment";

class MaintenanceLogRepository extends FirestoreRepository<MaintenanceLog, Omit<MaintenanceLog, "id" | "createdAt" | "updatedAt">> {
  constructor() {
    super("maintenanceLogs");
  }

  async getByEquipment(equipmentId: string): Promise<MaintenanceLog[]> {
    const all = await this.getAll();
    return all.filter((log) => log.equipmentId === equipmentId);
  }
}

class FuelLogRepository extends FirestoreRepository<FuelLog, Omit<FuelLog, "id" | "createdAt" | "updatedAt">> {
  constructor() {
    super("fuelLogs");
  }

  async getByEquipment(equipmentId: string): Promise<FuelLog[]> {
    const all = await this.getAll();
    return all.filter((log) => log.equipmentId === equipmentId);
  }
}

export const maintenanceRepository = new MaintenanceLogRepository();
export const fuelLogRepository = new FuelLogRepository();
