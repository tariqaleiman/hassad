import { FirestoreRepository } from "./firestore-repository";
import type { Voucher } from "@/lib/types/finance";

class VoucherRepository extends FirestoreRepository<Voucher, Partial<Voucher>> {
  constructor() {
    super("vouchers");
  }
}

export const voucherRepository = new VoucherRepository();
