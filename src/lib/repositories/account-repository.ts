import { FirestoreRepository } from "./firestore-repository";
import type { Account, AccountFormValues } from "@/lib/types/finance";

class AccountRepository extends FirestoreRepository<Account, Partial<Account>> {
  constructor() {
    super("accounts");
  }
}

export const accountRepository = new AccountRepository();
