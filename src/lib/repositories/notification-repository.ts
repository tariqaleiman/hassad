import { FirestoreRepository } from "./firestore-repository";
import type { AppNotification } from "../types/notification";

class NotificationRepository extends FirestoreRepository<AppNotification, Partial<AppNotification>> {
  constructor() {
    super("notifications");
  }
}

export const notificationRepository = new NotificationRepository();
