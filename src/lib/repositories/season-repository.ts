import { query, where, orderBy, getDocs, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { FirestoreRepository } from "./firestore-repository";
import type { Season, SeasonFormValues } from "@/lib/types/season";

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

  /** إغلاق الموسم: يسجل تاريخ النهاية فقط عند الإغلاق، كما تنص وثيقة التأسيس */
  async close(id: string, userId?: string): Promise<void> {
    const ref = doc(this.collectionRef, id);
    await updateDoc(ref, {
      status: "مغلق",
      endDate: new Date().toISOString(),
      updatedAt: serverTimestamp(),
      updatedBy: userId ?? null,
    });
  }
}

export const seasonRepository = new SeasonRepository();
