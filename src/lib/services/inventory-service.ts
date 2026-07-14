import { inventoryRepository } from "@/lib/repositories/inventory-repository";
import { inventoryTransactionRepository } from "@/lib/repositories/inventory-transaction-repository";
import type { InventoryItem, InventoryItemFormValues, InventoryTransaction } from "@/lib/types/inventory";
import { where, type QueryConstraint } from "firebase/firestore";

export const inventoryService = {
  listItems: (farmId: string): Promise<InventoryItem[]> => 
    inventoryRepository.getByField("farmId", farmId),
    
  getItem: (id: string): Promise<InventoryItem | null> => 
    inventoryRepository.getById(id),
    
  listTransactions: (farmId: string, itemId?: string): Promise<InventoryTransaction[]> => {
    const constraints: QueryConstraint[] = [where("farmId", "==", farmId)];
    if (itemId) constraints.push(where("itemId", "==", itemId));
    return inventoryTransactionRepository.getAll({ constraints });
  },

  createItem: async (data: InventoryItemFormValues, userId?: string): Promise<InventoryItem> => {
    // 1. Create the base item with 0 quantity and 0 average cost
    const itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt"> = {
      farmId: data.farmId,
      name: data.name,
      category: data.category,
      unit: data.unit,
      quantity: 0,
      averageCost: 0,
      notes: data.notes,
    };
    
    const newItem = await inventoryRepository.create(itemData as any, userId);

    // 2. If initial balance is provided, create an 'in' transaction
    if (data.initialQuantity && data.initialQuantity > 0 && data.initialUnitPrice && data.initialUnitPrice >= 0) {
      await inventoryService.addTransaction({
        farmId: data.farmId,
        itemId: newItem.id,
        type: "in",
        quantity: data.initialQuantity,
        unitPrice: data.initialUnitPrice,
        totalPrice: data.initialQuantity * data.initialUnitPrice,
        date: new Date().toISOString(),
        referenceType: "رصيد افتتاحي",
        notes: "رصيد افتتاحي عند إنشاء الصنف"
      }, userId);
      
      // Fetch the updated item after the transaction
      const updatedItem = await inventoryRepository.getById(newItem.id);
      return updatedItem!;
    }

    return newItem;
  },

  updateItem: (id: string, data: Partial<InventoryItemFormValues>, userId?: string): Promise<InventoryItem> => {
    const updateData: Partial<InventoryItem> = {
      name: data.name,
      category: data.category,
      unit: data.unit,
      notes: data.notes,
    };
    // Note: We don't update quantity or averageCost directly through this method
    return inventoryRepository.update(id, updateData, userId);
  },

  removeItem: async (id: string, userId?: string): Promise<void> => {
    // Hard delete the item completely from the database
    await inventoryRepository.delete(id, userId);
    // Ideally we should also soft delete associated transactions, or just leave them since they might be needed for history
  },

  addTransaction: async (
    data: Omit<InventoryTransaction, "id" | "createdAt" | "updatedAt">, 
    userId?: string
  ): Promise<InventoryTransaction> => {
    // 1. Get current item to calculate new moving average cost and quantity
    const item = await inventoryRepository.getById(data.itemId);
    if (!item) throw new Error("الصنف غير موجود");

    let newQuantity = item.quantity;
    let newAverageCost = item.averageCost;

    if (data.type === "in") {
      // Calculate new moving average cost
      const currentTotalValue = item.quantity * item.averageCost;
      const incomingTotalValue = data.quantity * data.unitPrice;
      
      newQuantity = item.quantity + data.quantity;
      
      if (newQuantity > 0) {
        newAverageCost = (currentTotalValue + incomingTotalValue) / newQuantity;
      }
    } else if (data.type === "out") {
      // Verify sufficient stock (optional, depending on business logic if negative stock is allowed)
      if (item.quantity < data.quantity) {
        console.warn(`Insufficient stock for item ${item.name}. Current: ${item.quantity}, Requested: ${data.quantity}`);
        // We can either throw an error or allow negative stock. For farming, sometimes they use before recording.
        // We'll allow it for now, or throw error depending on strictness. Let's allow but warn.
      }
      
      newQuantity = item.quantity - data.quantity;
      // Average cost does not change on 'out'
    }

    // 2. Save the transaction
    const transaction = await inventoryTransactionRepository.create(data as any, userId);

    // 3. Update the item's stock and average cost
    await inventoryRepository.update(item.id, {
      quantity: newQuantity,
      averageCost: newAverageCost,
    }, userId);

    return transaction;
  }
};
