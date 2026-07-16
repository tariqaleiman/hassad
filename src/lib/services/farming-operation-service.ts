import { farmingOperationRepository } from "../repositories/farming-operation-repository";
import { inventoryService } from "./inventory-service";
import { contractorService } from "./contractor-service";
import type { FarmingOperation } from "../types/farming-operation";

export const farmingOperationService = {
  createOperation: async (
    data: Omit<FarmingOperation, "id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt">,
    userId?: string
  ): Promise<FarmingOperation> => {
    
    // 1. Calculate costs
    const inventoryCost = data.inventoryItems?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
    const totalCost = inventoryCost + (data.laborCost || 0) + (data.equipmentCost || 0) + (data.otherCost || 0);

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
    const totalCost = inventoryCost + (data.laborCost || 0) + (data.equipmentCost || 0) + (data.otherCost || 0);

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
