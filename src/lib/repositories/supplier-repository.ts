import { FirestoreRepository } from "./firestore-repository";
import type { Supplier } from "@/lib/types/supplier";

// Supplier Form Values (what we use when creating/editing)
export type SupplierFormValues = Omit<Supplier, "id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt">;

class SupplierRepository extends FirestoreRepository<Supplier, SupplierFormValues> {
  constructor() {
    super("suppliers");
  }
}

export const supplierRepository = new SupplierRepository();
