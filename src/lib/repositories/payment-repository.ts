import { FirestoreRepository } from "./firestore-repository";
import type { Payment } from "@/lib/types/payment";

class PaymentRepository extends FirestoreRepository<Payment, Partial<Payment>> {
  constructor() {
    super("payments");
  }
}

export const paymentRepository = new PaymentRepository();
