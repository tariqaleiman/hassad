import type { BaseEntity } from "./common";

export type NotificationCategory = "agricultural" | "financial" | "administrative";
export type NotificationPriority = "info" | "warning" | "critical";

/**
 * يمثل الإشعارات والتنبيهات الموجهة للمزارع
 */
export interface AppNotification extends BaseEntity {
  farmId: string;
  title: string;
  message: string;
  category: NotificationCategory; // زراعي، مالي، إداري
  priority: NotificationPriority;
  date: string;
  isRead: boolean;
  actionUrl?: string; // مسار توجيه عند النقر على الإشعار
  relatedEntityId?: string; // مثل معرف الدورة الزراعية أو معرف الفاتورة
}
