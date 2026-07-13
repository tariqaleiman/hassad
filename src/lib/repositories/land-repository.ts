import {
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { FirestoreRepository } from "./firestore-repository";
import type { Land, LandFormValues } from "@/lib/types/land";

class LandRepository extends FirestoreRepository<Land, LandFormValues> {
  constructor() {
    super("lands");
  }

  async getByFarm(farmId: string): Promise<Land[]> {
    const q = query(
      this.collectionRef,
      where("farmId", "==", farmId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => this.fromDoc(d.id, d.data()))
      .filter((item) => !item.isDeleted);
  }
}

export const landRepository = new LandRepository();
