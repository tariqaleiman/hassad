"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "@/lib/hooks/use-farms";
import { inventoryService } from "@/lib/services/inventory-service";
import { dictionaryService } from "@/lib/services/dictionary-service";
import { InventoryList } from "@/components/inventory/inventory-list";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import type { InventoryItem } from "@/lib/types/inventory";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPin } from "lucide-react";

export default function InventoryPage() {
  const { user } = useAuth();
  const { data: activeFarms = [], isLoading: isLoadingFarms } = useFarms();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [dictionaryItems, setDictionaryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (activeFarms.length === 0 || !user) return;
    
    setLoading(true);
    try {
      const allItems: InventoryItem[] = [];
      for (const farm of activeFarms) {
        const farmItems = await inventoryService.listItems(farm.id);
        allItems.push(...farmItems);
      }
      setItems(allItems);
      
      const dictItems = await dictionaryService.listEntries(user.uid);
      setDictionaryItems(dictItems);
    } catch (error) {
      console.error("Error loading inventory data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFarms, user]);

  if (isLoadingFarms) {
    return <PageSkeleton />;
  }

  if (activeFarms.length === 0) {
    return (
      <EmptyState icon={MapPin} title="لا توجد مزارع" description="يرجى إضافة مزرعة أولاً للوصول إلى هذا القسم." />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {loading ? (
        <PageSkeleton />
      ) : (
        <InventoryList
          farms={activeFarms}
          items={items}
          dictionaryItems={dictionaryItems}
          userId={user?.uid || ""}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
