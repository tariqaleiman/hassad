import { FirestoreRepository } from "./firestore-repository";
import type { Equipment, EquipmentFormValues } from "@/lib/types/equipment";

class EquipmentRepository extends FirestoreRepository<Equipment, EquipmentFormValues> {
  constructor() {
    super("equipment");
  }
}

export const equipmentRepository = new EquipmentRepository();
