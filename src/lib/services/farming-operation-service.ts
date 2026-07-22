import { farmingOperationRepository } from "../repositories/farming-operation-repository";
import { inventoryService } from "./inventory-service";
import { contractorService } from "./contractor-service";
import { financeIntegrationService } from "./finance-integration-service";
import type { FarmingOperation } from "../types/farming-operation";

export const farmingOperationService = {
  list: async (userId?: string): Promise<FarmingOperation[]> => {
    return farmingOperationRepository.getAll({ userId });
  },

  createOperation: async (
    data: Omit<FarmingOperation, "id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt">,
    userId?: string
  ): Promise<FarmingOperation> => {
    
    // 1. Calculate costs
    const inventoryCost = data.inventoryItems?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
    const totalCost = inventoryCost + (data.laborCost || 0) + (data.equipmentCost || 0) + (data.fuelCost || 0) + (data.depreciationCost || 0) + (data.otherCost || 0);

    const operationData = {
      ...data,
      inventoryCost,
      totalCost
    };

    // 2. Save the operation
    const operation = await farmingOperationRepository.create(operationData, userId);

    // 3. Process inventory withdrawals (out transactions)
    if (data.inventoryItems && data.inventoryItems.length > 0) {
      for (const item of data.inventoryItems) {
        await inventoryService.addTransaction({
          farmId: data.farmId,
          itemId: item.itemId,
          type: "out",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          date: data.date,
          referenceType: "عملية زراعية",
          notes: `سحب للعملية الزراعية: ${data.operationType} - محصول: ${data.cropCycleId}`,
        }, userId);
      }
    }

    // 4. Update contractor balances
    if (operationData.laborContractorId && operationData.laborPaymentMethod === "credit" && (operationData.laborCost || 0) > 0) {
      await contractorService.updateBalance(operationData.laborContractorId, operationData.laborCost || 0, userId);
    }
    if (operationData.equipmentContractorId && operationData.equipmentPaymentMethod === "credit" && (operationData.equipmentCost || 0) > 0) {
      await contractorService.updateBalance(operationData.equipmentContractorId, operationData.equipmentCost || 0, userId);
    }

    // 5. Finance Integration (Automated Journal Entry)
    if (userId && totalCost > 0) {
      try {
        await financeIntegrationService.ensureSystemAccounts(data.farmId, userId);
        const cashAcc = await financeIntegrationService.getSystemAccount(data.farmId, "100", userId);
        const inventoryAcc = await financeIntegrationService.getSystemAccount(data.farmId, "102", userId);
        const opsCostAcc = await financeIntegrationService.getSystemAccount(data.farmId, "501", userId);

        const lines = [];

        // Debit Operations Cost
        if (opsCostAcc) {
          lines.push({ accountId: opsCostAcc.id, debit: totalCost, credit: 0, description: `تكاليف عملية زراعية: ${data.operationType}` });
        }

        // Credit Inventory
        if (inventoryAcc && inventoryCost > 0) {
          lines.push({ accountId: inventoryAcc.id, debit: 0, credit: inventoryCost, description: `سحب مواد لعملية زراعية: ${data.operationType}` });
        }

        // Credit Contractors (Labor)
        if (operationData.laborContractorId && operationData.laborPaymentMethod === "credit" && (operationData.laborCost || 0) > 0) {
          const laborContractorAcc = await financeIntegrationService.ensureEntityAccount(data.farmId, "contractor", operationData.laborContractorId, "مقاول عمالة", userId);
          lines.push({ accountId: laborContractorAcc.id, debit: 0, credit: operationData.laborCost!, description: `أجور عمالة لعملية زراعية: ${data.operationType}` });
        } else if ((operationData.laborCost || 0) > 0 && cashAcc) {
          lines.push({ accountId: cashAcc.id, debit: 0, credit: operationData.laborCost!, description: `أجور عمالة نقدية لعملية زراعية: ${data.operationType}` });
        }

        // Credit Contractors (Equipment)
        if (operationData.equipmentContractorId && operationData.equipmentPaymentMethod === "credit" && (operationData.equipmentCost || 0) > 0) {
          const eqContractorAcc = await financeIntegrationService.ensureEntityAccount(data.farmId, "contractor", operationData.equipmentContractorId, "مقاول معدات", userId);
          lines.push({ accountId: eqContractorAcc.id, debit: 0, credit: operationData.equipmentCost!, description: `إيجار معدات لعملية زراعية: ${data.operationType}` });
        } else if ((operationData.equipmentCost || 0) > 0 && cashAcc) {
          lines.push({ accountId: cashAcc.id, debit: 0, credit: operationData.equipmentCost!, description: `إيجار معدات نقدي لعملية زراعية: ${data.operationType}` });
        }

        // Credit Cash for other expenses
        const cashExpenses = (data.fuelCost || 0) + (data.depreciationCost || 0) + (data.otherCost || 0); // Note: Depreciation should theoretically credit Accumulated Depreciation, but for simplicity we throw it in generic/cash here or we can just use Cash for Fuel/Other
        if (cashExpenses > 0 && cashAcc) {
          lines.push({ accountId: cashAcc.id, debit: 0, credit: cashExpenses, description: `مصروفات أخرى لعملية زراعية: ${data.operationType}` });
        }

        if (lines.length >= 2 && opsCostAcc) {
          await financeIntegrationService.postJournalEntry(data.farmId, userId, {
            type: "قيد يومية",
            date: data.date,
            description: `قيد آلي: عملية زراعية ${data.operationType}`,
            sourceModule: "operations",
            sourceId: operation.id,
            lines
          });
        }
      } catch (e) {
        console.error("Finance integration failed for farming operation", e);
      }
    }

    return operation;
  },

  updateOperation: async (
    id: string,
    data: Partial<Omit<FarmingOperation, "id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt">>,
    userId?: string
  ): Promise<FarmingOperation> => {
    // 1. Get existing operation
    const existingOp = await farmingOperationRepository.getById(id);
    if (!existingOp) throw new Error("العملية غير موجودة");

    // 2. Reverse existing inventory transactions
    if (existingOp.inventoryItems && existingOp.inventoryItems.length > 0) {
      for (const item of existingOp.inventoryItems) {
        await inventoryService.addTransaction({
          farmId: existingOp.farmId,
          itemId: item.itemId,
          type: "in",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          date: new Date().toISOString(),
          referenceType: "تسوية",
          notes: `إرجاع مخزون بسبب تعديل عملية زراعية: ${existingOp.operationType}`,
        }, userId);
      }
    }

    // 2.5 Reverse existing contractor balances
    if (existingOp.laborContractorId && existingOp.laborPaymentMethod === "credit" && (existingOp.laborCost || 0) > 0) {
      await contractorService.updateBalance(existingOp.laborContractorId, -(existingOp.laborCost || 0), userId);
    }
    if (existingOp.equipmentContractorId && existingOp.equipmentPaymentMethod === "credit" && (existingOp.equipmentCost || 0) > 0) {
      await contractorService.updateBalance(existingOp.equipmentContractorId, -(existingOp.equipmentCost || 0), userId);
    }

    // 3. Calculate new costs
    const inventoryCost = data.inventoryItems?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
    const totalCost = inventoryCost + (data.laborCost || 0) + (data.equipmentCost || 0) + (data.fuelCost || 0) + (data.depreciationCost || 0) + (data.otherCost || 0);

    const operationData = {
      ...data,
      inventoryCost,
      totalCost
    };

    // 4. Update the operation
    const operation = await farmingOperationRepository.update(id, operationData, userId);

    // 5. Apply new inventory transactions
    if (data.inventoryItems && data.inventoryItems.length > 0) {
      for (const item of data.inventoryItems) {
        await inventoryService.addTransaction({
          farmId: data.farmId || existingOp.farmId,
          itemId: item.itemId,
          type: "out",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          date: data.date || existingOp.date,
          referenceType: "عملية زراعية",
          notes: `سحب للعملية الزراعية: ${data.operationType || existingOp.operationType} - محصول: ${data.cropCycleId || existingOp.cropCycleId}`,
        }, userId);
      }
    }

    // 6. Update new contractor balances
    const finalLaborContractorId = operationData.laborContractorId !== undefined ? operationData.laborContractorId : existingOp.laborContractorId;
    const finalLaborPaymentMethod = operationData.laborPaymentMethod !== undefined ? operationData.laborPaymentMethod : existingOp.laborPaymentMethod;
    const finalLaborCost = operationData.laborCost !== undefined ? operationData.laborCost : existingOp.laborCost;
    
    if (finalLaborContractorId && finalLaborPaymentMethod === "credit" && (finalLaborCost || 0) > 0) {
      await contractorService.updateBalance(finalLaborContractorId, finalLaborCost || 0, userId);
    }

    const finalEquipmentContractorId = operationData.equipmentContractorId !== undefined ? operationData.equipmentContractorId : existingOp.equipmentContractorId;
    const finalEquipmentPaymentMethod = operationData.equipmentPaymentMethod !== undefined ? operationData.equipmentPaymentMethod : existingOp.equipmentPaymentMethod;
    const finalEquipmentCost = operationData.equipmentCost !== undefined ? operationData.equipmentCost : existingOp.equipmentCost;

    if (finalEquipmentContractorId && finalEquipmentPaymentMethod === "credit" && (finalEquipmentCost || 0) > 0) {
      await contractorService.updateBalance(finalEquipmentContractorId, finalEquipmentCost || 0, userId);
    }

    return operation;
  },

  listOperationsByCrop: async (cropCycleId: string): Promise<FarmingOperation[]> => {
    return farmingOperationRepository.getByField("cropCycleId", cropCycleId);
  },
  
  listOperationsByFarm: async (farmId: string): Promise<FarmingOperation[]> => {
    return farmingOperationRepository.getByField("farmId", farmId);
  },

  deleteOperation: async (id: string, userId?: string): Promise<void> => {
    // 1. Get existing operation
    const existingOp = await farmingOperationRepository.getById(id);
    if (!existingOp) throw new Error("العملية غير موجودة");

    // 2. Reverse existing inventory transactions
    if (existingOp.inventoryItems && existingOp.inventoryItems.length > 0) {
      for (const item of existingOp.inventoryItems) {
        await inventoryService.addTransaction({
          farmId: existingOp.farmId,
          itemId: item.itemId,
          type: "in",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          date: new Date().toISOString(),
          referenceType: "تسوية",
          notes: `إرجاع مخزون بسبب حذف عملية زراعية: ${existingOp.operationType}`,
        }, userId);
      }
    }

    // 2.5 Reverse existing contractor balances
    if (existingOp.laborContractorId && existingOp.laborPaymentMethod === "credit" && (existingOp.laborCost || 0) > 0) {
      await contractorService.updateBalance(existingOp.laborContractorId, -(existingOp.laborCost || 0), userId);
    }
    if (existingOp.equipmentContractorId && existingOp.equipmentPaymentMethod === "credit" && (existingOp.equipmentCost || 0) > 0) {
      await contractorService.updateBalance(existingOp.equipmentContractorId, -(existingOp.equipmentCost || 0), userId);
    }

    // 3. Soft delete the operation
    await farmingOperationRepository.softDelete(id, userId);
  }
};
