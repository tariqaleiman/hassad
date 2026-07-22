import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers/auth-provider";
import { financeService } from "@/lib/services/finance-service";
import type { AccountFormValues, VoucherFormValues } from "@/lib/types/finance";
import { toast } from "sonner";

// --- Accounts Hooks ---

export function useAccounts(farmId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["accounts", farmId, user?.uid],
    queryFn: async () => {
      if (!user || !farmId) return [];
      return financeService.getAccountsByFarm(farmId, user.uid);
    },
    enabled: !!user && !!farmId,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: AccountFormValues & { farmId: string }) => {
      if (!user) throw new Error("يجب تسجيل الدخول");
      return financeService.createAccount(data, user.uid);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["accounts", variables.farmId] });
      toast.success("تم إضافة الحساب بنجاح");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء الإضافة");
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, farmId }: { id: string; farmId: string }) => {
      if (!user) throw new Error("يجب تسجيل الدخول");
      return financeService.deleteAccount(id, user.uid);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["accounts", variables.farmId] });
      toast.success("تم حذف الحساب بنجاح");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء الحذف");
    },
  });
}

// --- Vouchers Hooks ---

export function useVouchers(farmId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["vouchers", farmId, user?.uid],
    queryFn: async () => {
      if (!user || !farmId) return [];
      return financeService.getVouchersByFarm(farmId, user.uid);
    },
    enabled: !!user && !!farmId,
  });
}

export function useCreateVoucher() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: VoucherFormValues & { farmId: string }) => {
      if (!user) throw new Error("يجب تسجيل الدخول");
      return financeService.createVoucher(data, user.uid);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vouchers", variables.farmId] });
      queryClient.invalidateQueries({ queryKey: ["accounts", variables.farmId] }); // Update balances
      toast.success("تم إصدار السند بنجاح");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء إصدار السند");
    },
  });
}

export function useDeleteVoucher() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, farmId }: { id: string; farmId: string }) => {
      if (!user) throw new Error("يجب تسجيل الدخول");
      return financeService.deleteVoucher(id, user.uid);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vouchers", variables.farmId] });
      queryClient.invalidateQueries({ queryKey: ["accounts", variables.farmId] }); // Update balances
      toast.success("تم حذف السند وإلغاء قيوده بنجاح");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء حذف السند");
    },
  });
}
