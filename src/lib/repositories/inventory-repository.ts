import { FirestoreRepository } from "./firestore-repository";
import type { InventoryItem } from "@/lib/types/inventory";

class InventoryRepository extends FirestoreRepository<InventoryItem, Partial<InventoryItem>> {
  constructor() {
    super("inventory_items");
  }
}

export const inventoryRepository = new InventoryRepository();
