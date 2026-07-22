import { equipmentRepository } from "../repositories/equipment-repository";
import { maintenanceRepository, fuelLogRepository } from "../repositories/equipment-logs-repository";
import { financeIntegrationService } from "./finance-integration-service";
import type { Equipment, EquipmentFormValues, MaintenanceLog, FuelLog } from "../types/equipment";

export const equipmentService = {
  list: (userId?: string): Promise<Equipment[]> => equipmentRepository.getAll({ userId }),
  listByFarm: (farmId: string, userId?: string): Promise<Equipment[]> => equipmentRepository.getByField("farmId", farmId, userId),
  get: (id: string): Promise<Equipment | null> => equipmentRepository.getById(id),
  create: (data: EquipmentFormValues, userId?: string): Promise<Equipment> => equipmentRepository.create(data, userId),
  update: (id: string, data: Partial<EquipmentFormValues>, userId?: string): Promise<Equipment> => equipmentRepository.update(id, data, userId),
  remove: (id: string, userId?: string): Promise<void> => equipmentRepository.softDelete(id, userId),

  // Maintenance Logs
  addMaintenance: async (data: Omit<MaintenanceLog, "id" | "createdAt" | "updatedAt">, userId?: string) => {
    const log = await maintenanceRepository.create(data, userId);
    
    // Update equipment next maintenance date if provided
    if (data.nextMaintenanceDate) {
      await equipmentRepository.update(data.equipmentId, { 
        lastMaintenanceDate: data.date,
        nextMaintenanceDate: data.nextMaintenanceDate 
      }, userId);
    } else {
      await equipmentRepository.update(data.equipmentId, { lastMaintenanceDate: data.date }, userId);
    }

    // Finance Integration
    if (data.cost > 0) {
      const equipment = await equipmentRepository.getById(data.equipmentId);
      const cashAccount = await financeIntegrationService.getSystemAccount(data.farmId, "100", userId || "");
      const maintenanceExpAccount = await financeIntegrationService.getSystemAccount(data.farmId, "503", userId || "");
      
      if (cashAccount && maintenanceExpAccount) {
        await financeIntegrationService.postJournalEntry(data.farmId, userId || "", {
          type: "صرف",
          date: data.date,
          description: `مصروفات صيانة: ${data.description || data.type} للمعدة (${equipment?.name})`,
          sourceModule: "المعدات",
          sourceId: log.id,
          lines: [
            { accountId: maintenanceExpAccount.id, debit: data.cost, credit: 0, description: `صيانة معدة ${equipment?.name}` },
            { accountId: cashAccount.id, debit: 0, credit: data.cost, description: `سداد مصروف صيانة نقداً` }
          ]
        });
      }
    }
    return log;
  },

  getMaintenanceLogs: (equipmentId: string): Promise<MaintenanceLog[]> => maintenanceRepository.getByEquipment(equipmentId),

  // Fuel Logs
  addFuelLog: async (data: Omit<FuelLog, "id" | "createdAt" | "updatedAt">, userId?: string) => {
    const log = await fuelLogRepository.create(data, userId);

    // Finance Integration
    if (data.cost > 0) {
      const equipment = await equipmentRepository.getById(data.equipmentId);
      const cashAccount = await financeIntegrationService.getSystemAccount(data.farmId, "100", userId || "");
      const fuelExpAccount = await financeIntegrationService.getSystemAccount(data.farmId, "504", userId || "");
      
      if (cashAccount && fuelExpAccount) {
        await financeIntegrationService.postJournalEntry(data.farmId, userId || "", {
          type: "صرف",
          date: data.date,
          description: `تعبئة وقود (${data.quantity} لتر ${data.fuelType}) للمعدة (${equipment?.name})`,
          sourceModule: "المعدات",
          sourceId: log.id,
          lines: [
            { accountId: fuelExpAccount.id, debit: data.cost, credit: 0, description: `وقود معدة ${equipment?.name}` },
            { accountId: cashAccount.id, debit: 0, credit: data.cost, description: `سداد قيمة وقود نقداً` }
          ]
        });
      }
    }
    return log;
  },

  getFuelLogs: (equipmentId: string): Promise<FuelLog[]> => fuelLogRepository.getByEquipment(equipmentId),

  // Depreciation
  postDepreciation: async (equipmentId: string, amount: number, date: string, userId?: string) => {
    const equipment = await equipmentRepository.getById(equipmentId);
    if (!equipment) throw new Error("Equipment not found");

    const accDepAccount = await financeIntegrationService.getSystemAccount(equipment.farmId, "105", userId || "");
    const depExpAccount = await financeIntegrationService.getSystemAccount(equipment.farmId, "505", userId || "");

    if (accDepAccount && depExpAccount) {
      await financeIntegrationService.postJournalEntry(equipment.farmId, userId || "", {
        type: "قيد يومية",
        date: date,
        description: `إثبات مصروف إهلاك للمعدة (${equipment.name})`,
        sourceModule: "المعدات",
        sourceId: equipmentId,
        lines: [
          { accountId: depExpAccount.id, debit: amount, credit: 0, description: `مصروف إهلاك معدة ${equipment.name}` },
          { accountId: accDepAccount.id, debit: 0, credit: amount, description: `مجمع إهلاك معدة ${equipment.name}` }
        ]
      });

      // Update equipment accumulated depreciation
      const currentAcc = equipment.accumulatedDepreciation || 0;
      await equipmentRepository.update(equipmentId, {
        accumulatedDepreciation: currentAcc + amount
      }, userId);
    }
  }
};
