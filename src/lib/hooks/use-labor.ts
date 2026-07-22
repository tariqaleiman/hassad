import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/providers/auth-provider";
import { laborService } from "@/lib/services/labor-service";
import type { 
  LaborLogFormValues, LaborAdvanceFormValues, LaborSettlementFormValues 
} from "@/lib/types/labor";

// KEYS
const LOGS_KEY = "laborLogs";
const ADVANCES_KEY = "laborAdvances";
const SETTLEMENTS_KEY = "laborSettlements";

// === LOGS HOOKS ===

export function useLaborLogs(farmId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [LOGS_KEY, farmId, user?.uid],
    queryFn: () => laborService.getLogsByFarm(farmId!, user?.uid ?? ""),
    enabled: !!user?.uid && !!farmId,
  });
}

export function useCreateLaborLog() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (data: LaborLogFormValues) => {
      if (!user?.uid) throw new Error("Unauthorized");
      return laborService.createLog(data, user.uid);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LOGS_KEY] });
      toast.success("تم تسجيل اليومية بنجاح");
    },
    onError: (e: any) => toast.error(e.message || "حدث خطأ"),
  });
}

export function useDeleteLaborLog() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => {
      if (!user?.uid) throw new Error("Unauthorized");
      return laborService.deleteLog(id, user.uid);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LOGS_KEY] });
      toast.success("تم حذف اليومية");
    },
    onError: (e: any) => toast.error(e.message || "حدث خطأ"),
  });
}

// === ADVANCES HOOKS ===

export function useLaborAdvances(farmId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [ADVANCES_KEY, farmId, user?.uid],
    queryFn: () => laborService.getAdvancesByFarm(farmId!, user?.uid ?? ""),
    enabled: !!user?.uid && !!farmId,
  });
}

export function useCreateLaborAdvance() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (data: LaborAdvanceFormValues) => {
      if (!user?.uid) throw new Error("Unauthorized");
      return laborService.createAdvance(data, user.uid);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ADVANCES_KEY] });
      toast.success("تم تسجيل السلفة بنجاح");
    },
    onError: (e: any) => toast.error(e.message || "حدث خطأ"),
  });
}

export function useDeleteLaborAdvance() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => {
      if (!user?.uid) throw new Error("Unauthorized");
      return laborService.deleteAdvance(id, user.uid);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ADVANCES_KEY] });
      toast.success("تم حذف السلفة");
    },
    onError: (e: any) => toast.error(e.message || "حدث خطأ"),
  });
}

// === SETTLEMENTS HOOKS ===

export function useLaborSettlements(farmId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [SETTLEMENTS_KEY, farmId, user?.uid],
    queryFn: () => laborService.getSettlementsByFarm(farmId!, user?.uid ?? ""),
    enabled: !!user?.uid && !!farmId,
  });
}

export function useCreateLaborSettlement() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ data, logIds, advanceIds, totalWages }: { data: LaborSettlementFormValues, logIds: string[], advanceIds: string[], totalWages: number }) => {
      if (!user?.uid) throw new Error("Unauthorized");
      return laborService.createSettlement(data, logIds, advanceIds, totalWages, user.uid);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SETTLEMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [LOGS_KEY] });
      qc.invalidateQueries({ queryKey: [ADVANCES_KEY] });
      toast.success("تم تصفية الحساب بنجاح");
    },
    onError: (e: any) => toast.error(e.message || "حدث خطأ"),
  });
}

export function useDeleteLaborSettlement() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => {
      if (!user?.uid) throw new Error("Unauthorized");
      return laborService.deleteSettlement(id, user.uid);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SETTLEMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [LOGS_KEY] });
      qc.invalidateQueries({ queryKey: [ADVANCES_KEY] });
      toast.success("تم حذف التصفية (يرجى مراجعة حالة اليوميات لتصحيحها)");
    },
    onError: (e: any) => toast.error(e.message || "حدث خطأ"),
  });
}
