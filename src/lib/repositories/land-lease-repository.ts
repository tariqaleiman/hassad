import { FirestoreRepository } from "./firestore-repository";
import type { LandLeaseOut, LandLeaseOutFormValues } from "../types/land-lease";

class LandLeaseOutRepository extends FirestoreRepository<LandLeaseOut, LandLeaseOutFormValues> {
  constructor() {
    super("land_leases_out");
  }
}

export const landLeaseOutRepository = new LandLeaseOutRepository();
