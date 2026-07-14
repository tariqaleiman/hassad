import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  where,
  type CollectionReference,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { BaseEntity } from "@/lib/types/common";
import type { IRepository } from "./base-repository";

/**
 * مستودع عام يعتمد على Firestore.
 * يطبّق تلقائيًا: Timestamps، الحذف المنطقي، واستبعاد السجلات المحذوفة من القوائم.
 * أي وحدة جديدة (مزارع، أراضي، مخزون...) تنشئ مستودعها الخاص بوراثة/تركيب هذا الصف
 * بدل إعادة كتابة نفس منطق Firestore من جديد (مبدأ عدم تكرار الكود).
 */
export class FirestoreRepository<
  T extends BaseEntity,
  TCreate = Partial<T>
> implements IRepository<T, TCreate>
{
  protected collectionRef: CollectionReference;

  constructor(protected collectionName: string) {
    this.collectionRef = collection(db, collectionName);
  }

  async getAll(options?: {
    includeDeleted?: boolean;
    constraints?: QueryConstraint[];
    userId?: string;
  }): Promise<T[]> {
    try {
      const constraints: QueryConstraint[] = [
        ...(options?.constraints ?? []),
      ];
      
      if (!options?.includeDeleted) {
        constraints.unshift(where("isDeleted", "==", false));
      }

      if (options?.userId) {
        constraints.push(where("createdBy", "==", options.userId));
      }
      
      const q = query(this.collectionRef, ...constraints);
      const snap = await getDocs(q);
      let items = snap.docs.map((d) => this.fromDoc(d.id, d.data()));
      
      // Sort in-memory to avoid requiring a composite index in Firestore
      items.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA; // desc
      });
      
      return items;
    } catch (error: any) {
      if (error.name === "AbortError" || error.message?.includes("abort")) {
        console.warn("Firestore request aborted during Fast Refresh.");
        return [];
      }
      throw error;
    }
  }

  async getByField(field: string, value: unknown, userId?: string): Promise<T[]> {
    try {
      const constraints: QueryConstraint[] = [
        where(field, "==", value),
        where("isDeleted", "==", false)
      ];

      if (userId) {
        constraints.push(where("createdBy", "==", userId));
      }

      const q = query(this.collectionRef, ...constraints);
      const snap = await getDocs(q);
      let items = snap.docs.map((d) => this.fromDoc(d.id, d.data()));
      
      // Sort in-memory to avoid requiring a composite index
      items.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA; // desc
      });
      
      return items;
    } catch (error: any) {
      if (error.name === "AbortError" || error.message?.includes("abort")) return [];
      throw error;
    }
  }

  async getById(id: string, includeDeleted: boolean = false): Promise<T | null> {
    try {
      const ref = doc(this.collectionRef, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      
      const data = snap.data();
      if (!includeDeleted && data.isDeleted) return null;
      
      return this.fromDoc(snap.id, data);
    } catch (error: any) {
      if (error.name === "AbortError" || error.message?.includes("abort")) return null;
      throw error;
    }
  }

  async create(data: TCreate, userId?: string): Promise<T> {
    const payload = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId ?? null,
      updatedBy: userId ?? null,
      isDeleted: false,
      deletedAt: null,
    };
    const ref = await addDoc(this.collectionRef, payload);
    const created = await this.getById(ref.id);
    if (!created) throw new Error("فشل إنشاء السجل");
    return created;
  }

  async update(id: string, data: Partial<TCreate>, userId?: string): Promise<T> {
    const ref = doc(this.collectionRef, id);
    
    // Remove undefined values to avoid Firestore errors
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {} as any);

    await updateDoc(ref, {
      ...cleanedData,
      updatedAt: serverTimestamp(),
      updatedBy: userId ?? null,
    });
    const updated = await this.getById(id);
    if (!updated) throw new Error("السجل غير موجود");
    return updated;
  }

  async delete(id: string, userId?: string): Promise<void> {
    const ref = doc(this.collectionRef, id);
    await deleteDoc(ref);
  }

  async softDelete(id: string, userId?: string): Promise<void> {
    const ref = doc(this.collectionRef, id);
    await updateDoc(ref, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: userId ?? null,
    });
  }

  async restore(id: string): Promise<void> {
    const ref = doc(this.collectionRef, id);
    await updateDoc(ref, {
      isDeleted: false,
      deletedAt: null,
      updatedAt: serverTimestamp(),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected fromDoc(id: string, data: any): T {
    return {
      id,
      ...data,
      createdAt: data.createdAt?.toDate?.().toISOString() ?? data.createdAt ?? null,
      updatedAt: data.updatedAt?.toDate?.().toISOString() ?? data.updatedAt ?? null,
      deletedAt: data.deletedAt?.toDate?.().toISOString() ?? data.deletedAt ?? null,
    } as T;
  }
}
