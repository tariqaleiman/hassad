import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { OwnerProfile } from "@/lib/types/owner";

/** مستودع بيانات المالك — مستند خاص بكل مستخدم */
export const ownerRepository = {
  async get(userId: string): Promise<OwnerProfile | null> {
    if (!userId) return null;
    const ref = doc(db, `users/${userId}`);
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

  async save(profile: OwnerProfile, userId: string): Promise<void> {
    if (!userId) throw new Error("userId is required to save profile");
    const ref = doc(db, `users/${userId}`);
    await setDoc(ref, { ...profile, updatedAt: serverTimestamp() }, { merge: true });
  },
};
