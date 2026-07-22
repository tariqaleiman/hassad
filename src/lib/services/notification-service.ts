import { notificationRepository } from "../repositories/notification-repository";
import type { AppNotification } from "../types/notification";

export const notificationService = {
  createNotification: async (data: Partial<AppNotification>, userId?: string): Promise<AppNotification> => {
    return notificationRepository.create(data, userId);
  },
  
  getNotificationsByFarm: async (farmId: string): Promise<AppNotification[]> => {
    const all = await notificationRepository.getByField("farmId", farmId);
    // ترتيب تنازلي حسب التاريخ (الأحدث أولاً)
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  markAsRead: async (id: string, userId?: string): Promise<void> => {
    await notificationRepository.update(id, { isRead: true }, userId);
  },

  markAllAsRead: async (farmId: string, userId?: string): Promise<void> => {
    const unread = await notificationRepository.getByField("farmId", farmId);
    const updates = unread.filter(n => !n.isRead).map(n => 
      notificationRepository.update(n.id, { isRead: true }, userId)
    );
    await Promise.all(updates);
  },

  deleteNotification: async (id: string, userId?: string): Promise<void> => {
    await notificationRepository.delete(id, userId);
  }
};
