import { FirestoreRepository } from "./firestore-repository";
import type { InventoryTransaction } from "@/lib/types/inventory";

class InventoryTransactionRepository extends FirestoreRepository<InventoryTransaction, Partial<InventoryTransaction>> {
  constructor() {
    super("inventory_transactions");
  }
}

export const inventoryTransactionRepository = new InventoryTransactionRepository();
