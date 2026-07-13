import { FirestoreRepository } from "./firestore-repository";
import type { Farm, FarmFormValues } from "@/lib/types/farm";

class FarmRepository extends FirestoreRepository<Farm, FarmFormValues> {
  constructor() {
    super("farms");
  }
}

// نسخة واحدة (Singleton) تُستخدم في كل التطبيق
export const farmRepository = new FarmRepository();
