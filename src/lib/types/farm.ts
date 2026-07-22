import type { BaseEntity } from "./common";

/* ─── الشركاء ─── */

export interface FarmPartner {
  id: string; // للمساعدة في النماذج (React Hook Form)
  name: string;
  role?: string; // الدور (شريك مالي، شريك إدارة، إلخ)
  sharePercent?: number; // نسبة الشراكة
  phone?: string;
}

/* ─── المزرعة (الكيان الإداري / البراند) ─── */

export interface Farm extends BaseEntity {
  name: string; // الاسم المألوف أو البراند
  commercialName?: string; // الاسم التجاري الرسمي
  mainLocation?: string; // الموقع الأساسي للإدارة
  phone?: string; // رقم التواصل الخاص بالمزرعة
  ownerId?: string; // معرف مالك الحساب
  ownerName?: string; // اسم المالك (مجلوب من بياناته)
  notes?: string;
  currency?: string; // العملة الافتراضية للمزرعة
  lastClosingDate?: string; // تاريخ آخر إغلاق للفترة المالية
  
  /** قائمة الشركاء في المزرعة */
  partners?: FarmPartner[];
}

/* ─── قيم النموذج ─── */

export interface FarmFormValues {
  name: string;
  commercialName?: string;
  mainLocation?: string;
  phone?: string;
  notes?: string;
  currency?: string;
  lastClosingDate?: string;
  partners?: FarmPartner[];
}
