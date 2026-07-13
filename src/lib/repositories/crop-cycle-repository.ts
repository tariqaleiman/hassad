import { query, where, orderBy, getDocs, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { FirestoreRepository } from "./firestore-repository";
import type { CropCycle, CropCycleFormValues } from "@/lib/types/crop-cycle";

class CropCycleRepository extends FirestoreRepository<CropCycle, CropCycleFormValues> {
  constructor() {
    super("cropCycles");
  }

  async getBySeason(seasonId: string): Promise<CropCycle[]> {
    const q = query(
      this.collectionRef,
      where("seasonId", "==", seasonId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => this.fromDoc(d.id, d.data()))
      .filter((item) => !item.isDeleted);
  }

  async markHarvested(id: string, userId?: string): Promise<void> {
    const ref = doc(this.collectionRef, id);
    await updateDoc(ref, {
      status: "محصودة",
      harvestDate: new Date().toISOString(),
      updatedAt: serverTimestamp(),
      updatedBy: userId ?? null,
    });
  }
}

export const cropCycleRepository = new CropCycleRepository();
