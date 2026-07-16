import { FirestoreRepository } from "./firestore-repository";
import type { SalesInvoice } from "@/lib/types/sales";

class SalesInvoiceRepository extends FirestoreRepository<SalesInvoice, Partial<SalesInvoice>> {
  constructor() {
    super("salesInvoices");
  }
}

export const salesInvoiceRepository = new SalesInvoiceRepository();
