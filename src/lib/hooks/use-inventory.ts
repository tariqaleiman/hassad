"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inventoryService } from "@/lib/services/inventory-service";
import type { InventoryItem } from "@/lib/types/inventory";
import { useAuth } from "@/lib/providers/auth-provider";

const INVENTORY_KEY = ["inventory"] as const;

export function useInventory(farmId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...INVENTORY_KEY, farmId, user?.uid],
    queryFn: () => inventoryService.listItems(farmId || ""),
    enabled: !!user?.uid && !!farmId,
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof inventoryService.addTransaction>[0]) => 
      inventoryService.addTransaction(data, user?.uid),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEY });
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions", variables.farmId] });
    },
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof inventoryService.createItem>[0]) => 
      inventoryService.createItem(data, user?.uid),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEY });
      toast.success("تم إضافة الصنف للمخزن بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة الصنف للمخزن");
    }
  });
}
