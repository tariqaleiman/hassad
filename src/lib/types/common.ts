/**
 * كل الكيانات في النظام ترث من هذا النوع الأساسي
 * يحقق مبدأ: الحذف المنطقي + تتبع كل العمليات المهمة (من وثيقة التأسيس، الجزء الثالث والخامس)
 */
export interface BaseEntity {
  id: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean; // Soft Delete
  deletedAt?: string | null;
}

export type ID = string;

/** نتيجة موحّدة لعمليات القوائم المصفّحة */
export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  cursor?: string | null;
}
