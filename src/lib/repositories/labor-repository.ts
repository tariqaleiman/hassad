import { FirestoreRepository } from "./firestore-repository";
import type { 
  LaborLog, LaborLogFormValues,
  LaborAdvance, LaborAdvanceFormValues,
  LaborSettlement, LaborSettlementFormValues 
} from "@/lib/types/labor";

class LaborLogRepository extends FirestoreRepository<LaborLog, LaborLogFormValues> {
  constructor() {
    super("labor-logs");
  }
}

class LaborAdvanceRepository extends FirestoreRepository<LaborAdvance, LaborAdvanceFormValues> {
  constructor() {
    super("labor-advances");
  }
}

class LaborSettlementRepository extends FirestoreRepository<LaborSettlement, LaborSettlementFormValues> {
  constructor() {
    super("labor-settlements");
  }
}

export const laborLogRepository = new LaborLogRepository();
export const laborAdvanceRepository = new LaborAdvanceRepository();
export const laborSettlementRepository = new LaborSettlementRepository();
