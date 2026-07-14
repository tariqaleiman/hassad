import { FirestoreRepository } from "./firestore-repository";
import type { FarmingOperation } from "@/lib/types/farming-operation";

class FarmingOperationRepository extends FirestoreRepository<FarmingOperation> {
  constructor() {
    super("farming_operations");
  }
}

export const farmingOperationRepository = new FarmingOperationRepository();
