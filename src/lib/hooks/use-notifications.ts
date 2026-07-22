import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { notificationService } from "../services/notification-service";
import { cropProgramService } from "../services/crop-program-service";
import type { AppNotification } from "../types/notification";
import { useAuth } from "../providers/auth-provider";

export function useNotifications(farmId: string) {
  return useQuery({
    queryKey: ["notifications", farmId],
    queryFn: () => notificationService.getNotificationsByFarm(farmId),
    enabled: !!farmId,
    // Polling every 5 minutes to check for new notifications locally without a backend
    refetchInterval: 1000 * 60 * 5, 
  });
}

export function useNotificationsActions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id, user?.uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: (farmId: string) => notificationService.markAllAsRead(farmId, user?.uid),
    onSuccess: (_, farmId) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", farmId] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id, user?.uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const createNotification = useMutation({
    mutationFn: (data: Partial<AppNotification>) => notificationService.createNotification(data, user?.uid),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", variables.farmId] });
    },
  });

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  };
}

/**
 * محرك فحص وتوليد الإشعارات التلقائي
 * يتم استدعاؤه في المكونات الرئيسية (مثل لوحة القيادة) ليعمل في الخلفية
 */
export function useNotificationEngine(farmId: string) {
  const { createNotification } = useNotificationsActions();
  const { data: notifications } = useNotifications(farmId);
  const { user } = useAuth();

  useEffect(() => {
    if (!farmId || !notifications) return;

    const runEngine = async () => {
      // 1. جلب كل البرامج الزراعية النشطة
      const programs = await cropProgramService.getProgramsByFarm(farmId);
      const activePrograms = programs.filter(p => p.status === "active");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const program of activePrograms) {
        const startD = new Date(program.startDate).getTime();
        const currentDay = Math.floor((today.getTime() - startD) / (1000 * 3600 * 24));

        for (const phase of program.phases) {
          const execution = program.executions[phase.id];
          if (execution?.isCompleted) continue;

          // إذا كانت المهمة مستحقة اليوم أو متأخرة
          if (currentDay >= phase.dayNumber) {
            const isOverdue = currentDay > phase.dayNumber;
            const title = `مهمة ${phase.type} ${isOverdue ? 'متأخرة' : 'مستحقة اليوم'}`;
            const message = `المهمة "${phase.title}" في محصول ${program.cropCycleId.substring(0, 6)} مستحقة. ${phase.description || ''}`;
            
            // تحقق ما إذا كنا قد أرسلنا إشعاراً بهذه المهمة مسبقاً
            const existingNotif = notifications.find(n => 
              n.relatedEntityId === phase.id && 
              n.category === "agricultural"
            );

            if (!existingNotif) {
              createNotification.mutate({
                farmId,
                title,
                message,
                category: "agricultural",
                priority: isOverdue ? "warning" : "info",
                date: new Date().toISOString(),
                isRead: false,
                relatedEntityId: phase.id,
                actionUrl: `/lands/details?id=${program.cropCycleId}` // Temporary routing logic
              });
            }
          }
        }
      }
    };

    runEngine();
  }, [farmId, notifications?.length, createNotification]);
}
