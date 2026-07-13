import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { OwnerProfile } from "@/lib/types/owner";

const DOC_PATH = "settings/ownerProfile";

/** مستودع بيانات المالك — مستند واحد في Firestore */
export const ownerRepository = {
  async get(): Promise<OwnerProfile | null> {
    const ref = doc(db, DOC_PATH);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      address: data.address ?? "",
      updatedAt:
        data.updatedAt?.toDate?.().toISOString() ?? data.updatedAt ?? null,
    };
  },

  async save(profile: OwnerProfile): Promise<void> {
    const ref = doc(db, DOC_PATH);
    await setDoc(ref, { ...profile, updatedAt: serverTimestamp() });
  },
};
