import { query, where, orderBy, getDocs, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { FirestoreRepository } from "./firestore-repository";
import type { Season, SeasonFormValues } from "@/lib/types/season";
import type { CloseSeasonSchema } from "@/components/seasons/close-season-schema";

class SeasonRepository extends FirestoreRepository<Season, SeasonFormValues> {
  constructor() {
    super("seasons");
  }

  async getByFarm(farmId: string): Promise<Season[]> {
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

  async close(id: string, data: CloseSeasonSchema, userId?: string): Promise<void> {
    const ref = doc(this.collectionRef, id);
    await updateDoc(ref, {
      status: "مغلق",
      endDate: data.endDate,
      notes: data.notes || "",
      updatedAt: serverTimestamp(),
      updatedBy: userId ?? null,
    });
  }
}

export const seasonRepository = new SeasonRepository();
