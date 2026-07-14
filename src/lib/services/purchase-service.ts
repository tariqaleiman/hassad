import { purchaseRepository } from "../repositories/purchase-repository";
import { inventoryRepository } from "../repositories/inventory-repository";
import { dictionaryRepository } from "../repositories/dictionary-repository";
import { inventoryService } from "./inventory-service";
import { supplierService } from "./supplier-service";
import type { PurchaseInvoice, PurchaseInvoiceItem } from "../types/purchase";

export const purchaseService = {
  createInvoice: async (
    data: Omit<PurchaseInvoice, "id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt">,
    userId?: string
  ): Promise<PurchaseInvoice> => {
    // 1. Process items first to ensure they exist and have an ID & Name
    const processedItems = [];
    for (const item of data.items) {
      let actualItemId = item.itemId;
      let actualName = item.name || "";

      // a. Create item if it doesn't exist
      if (item.isNewItem || !actualItemId) {
        if (!item.dictionaryId) throw new Error("يجب اختيار صنف من الدليل للأصناف الجديدة");
        
        const dictItem = await dictionaryRepository.getById(item.dictionaryId);
        if (!dictItem) throw new Error("الصنف غير موجود في الدليل");
        
        actualName = [dictItem.mainType, dictItem.subType, dictItem.variety].filter(Boolean).join(" - ");

        const newItem = await inventoryRepository.create({
          farmId: data.farmId,
          name: actualName,
          category: dictItem.category,
          unit: dictItem.unit,
          quantity: 0,
          averageCost: 0,
        }, userId);
        actualItemId = newItem.id;
      }

      processedItems.push({
        ...item,
        itemId: actualItemId,
        name: actualName,
        isNewItem: false
      });
    }

    // 2. Save the invoice header
    const invoiceData = {
      ...data,
      items: processedItems
    };
    const invoice = await purchaseRepository.create(invoiceData, userId);

    // 3. Create the inventory 'in' transactions
    for (const item of processedItems) {
      if (item.itemId) {
        await inventoryService.addTransaction({
          farmId: data.farmId,
          itemId: item.itemId,
          type: "in",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          date: data.invoiceDate,
          referenceType: "مشتريات",
          notes: data.supplierName ? `فاتورة مجمعة - مورد: ${data.supplierName}` : "فاتورة مشتريات مجمعة",
        }, userId);
      }
    }

    // 4. Update supplier balance if there's unpaid amount
    if (data.supplierId) {
      const debtAmount = data.totalAmount - data.paidAmount;
      if (debtAmount > 0) {
        await supplierService.updateBalance(data.supplierId, debtAmount, userId);
      }
    }

    return invoice;
  },
  
  listInvoices: (farmId: string): Promise<PurchaseInvoice[]> => {
    return purchaseRepository.getByField("farmId", farmId);
  },

  deleteInvoice: async (id: string, userId?: string): Promise<void> => {
    await purchaseRepository.delete(id, userId);
  }
};
