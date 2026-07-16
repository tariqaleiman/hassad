import { query, where, orderBy, getDocs, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { FirestoreRepository } from "./firestore-repository";
import type { CropCycle, CropCycleFormValues } from "@/lib/types/crop-cycle";
import type { HarvestSchema } from "@/components/crop-cycles/harvest-schema";

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

  async markHarvested(id: string, harvestData: HarvestSchema, userId?: string): Promise<void> {
    const ref = doc(this.collectionRef, id);
    await updateDoc(ref, {
      status: "محصودة",
      harvestDate: harvestData.harvestDate,
      yieldQuantity: harvestData.yieldQuantity ?? null,
      yieldUnit: harvestData.yieldUnit ?? null,
      yieldGrade: harvestData.yieldGrade ?? null,
      actualRevenue: harvestData.actualRevenue ?? null,
      harvestNotes: harvestData.harvestNotes ?? null,
      updatedAt: serverTimestamp(),
      updatedBy: userId ?? null,
    });
  }
}

export const cropCycleRepository = new CropCycleRepository();
