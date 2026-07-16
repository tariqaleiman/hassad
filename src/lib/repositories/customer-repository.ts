import { FirestoreRepository } from "./firestore-repository";
import type { Customer } from "@/lib/types/customer";

class CustomerRepository extends FirestoreRepository<Customer, Partial<Customer>> {
  constructor() {
    super("customers");
  }
}

export const customerRepository = new CustomerRepository();
