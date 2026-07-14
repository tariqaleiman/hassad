import { FirestoreRepository } from "./firestore-repository";
import type { PurchaseInvoice } from "../types/purchase";

export class PurchaseRepository extends FirestoreRepository<PurchaseInvoice> {
  constructor() {
    super("purchase_invoices");
  }
}

export const purchaseRepository = new PurchaseRepository();
