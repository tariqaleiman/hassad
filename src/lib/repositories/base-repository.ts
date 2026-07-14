import type { BaseEntity } from "@/lib/types/common";

/**
 * واجهة عامة لأي مستودع بيانات في النظام.
 * كل وحدة (مزارع، أراضي، مواسم، ...) تستخدم نفس العقد،
 * بحيث يمكن استبدال التنفيذ (Firestore / Mock / أي مصدر آخر) دون تعديل بقية النظام.
 * هذا يحقق مبدأ "جميع الوحدات تتواصل من خلال طبقة الخدمات وليس بشكل مباشر".
 */
export interface IRepository<T extends BaseEntity, TCreate = Partial<T>> {
  getAll(options?: { includeDeleted?: boolean }): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: TCreate, userId?: string): Promise<T>;
  update(id: string, data: Partial<TCreate>, userId?: string): Promise<T>;
  /** الحذف النهائي من قاعدة البيانات */
  delete(id: string, userId?: string): Promise<void>;
  /** حذف منطقي (Soft Delete) — لا يحذف السجل فعليًا */
  softDelete(id: string, userId?: string): Promise<void>;
  /** استعادة سجل تم حذفه منطقيًا */
  restore(id: string): Promise<void>;
}
