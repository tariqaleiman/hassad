import { FirestoreRepository } from "./firestore-repository";
import type { CustomerPayment } from "@/lib/types/customer";

class CustomerPaymentRepository extends FirestoreRepository<CustomerPayment, Partial<CustomerPayment>> {
  constructor() {
    super("customerPayments");
  }
}

export const customerPaymentRepository = new CustomerPaymentRepository();
