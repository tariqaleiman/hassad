"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { equipmentService } from "@/lib/services/equipment-service";
import type { EquipmentFormValues, MaintenanceLog, FuelLog } from "@/lib/types/equipment";
import { useAuth } from "@/lib/providers/auth-provider";

const EQUIPMENT_KEY = ["equipment"] as const;

export function useEquipment() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...EQUIPMENT_KEY, user?.uid],
    queryFn: () => equipmentService.list(user?.uid ?? ""),
    enabled: !!user?.uid,
  });
}

export function useCreateEquipment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (values: EquipmentFormValues) => equipmentService.create(values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...EQUIPMENT_KEY, user?.uid] });
      toast.success("تم إضافة المعدة بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الإضافة"),
  });
}

export function useUpdateEquipment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<EquipmentFormValues> }) =>
      equipmentService.update(id, values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...EQUIPMENT_KEY, user?.uid] });
      toast.success("تم حفظ التعديلات");
    },
    onError: () => toast.error("حدث خطأ أثناء التعديل"),
  });
}

export function useDeleteEquipment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => equipmentService.remove(id, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...EQUIPMENT_KEY, user?.uid] });
      toast.success("تم حذف المعدة");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });
}

// Logs Hooks
export function useMaintenanceLogs(equipmentId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["maintenance-logs", equipmentId, user?.uid],
    queryFn: () => equipmentService.getMaintenanceLogs(equipmentId),
    enabled: !!user?.uid && !!equipmentId,
  });
}

export function useAddMaintenance() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (data: Omit<MaintenanceLog, "id" | "createdAt" | "updatedAt">) => equipmentService.addMaintenance(data, user?.uid),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["maintenance-logs", variables.equipmentId, user?.uid] });
      qc.invalidateQueries({ queryKey: [...EQUIPMENT_KEY, user?.uid] });
      toast.success("تم إضافة الصيانة وتحديث السجلات");
    },
    onError: () => toast.error("حدث خطأ أثناء الإضافة"),
  });
}

export function useFuelLogs(equipmentId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["fuel-logs", equipmentId, user?.uid],
    queryFn: () => equipmentService.getFuelLogs(equipmentId),
    enabled: !!user?.uid && !!equipmentId,
  });
}

export function useAddFuelLog() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (data: Omit<FuelLog, "id" | "createdAt" | "updatedAt">) => equipmentService.addFuelLog(data, user?.uid),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["fuel-logs", variables.equipmentId, user?.uid] });
      toast.success("تم إضافة الوقود بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الإضافة"),
  });
}

export function usePostDepreciation() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ equipmentId, amount, date }: { equipmentId: string; amount: number; date: string }) => 
      equipmentService.postDepreciation(equipmentId, amount, date, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...EQUIPMENT_KEY, user?.uid] });
      toast.success("تم إثبات الإهلاك المحاسبي بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء إثبات الإهلاك"),
  });
}
