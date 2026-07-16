import { FirestoreRepository } from "./firestore-repository";
import type { Contractor } from "@/lib/types/contractor";

class ContractorRepository extends FirestoreRepository<Contractor, Partial<Contractor>> {
  constructor() {
    super("contractors");
  }
}

export const contractorRepository = new ContractorRepository();
