"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "@/lib/hooks/use-farms";
import { Spinner } from "@/components/ui/spinner";
import { farmingOperationService } from "@/lib/services/farming-operation-service";
import { inventoryService } from "@/lib/services/inventory-service";
import { OperationsList } from "@/components/operations/operations-list";
import type { FarmingOperation } from "@/lib/types/farming-operation";
import type { Season } from "@/lib/types/season";
import type { CropCycle } from "@/lib/types/crop-cycle";
import type { InventoryItem } from "@/lib/types/inventory";
import { seasonService } from "@/lib/services/season-service";
import { cropCycleService } from "@/lib/services/crop-cycle-service";
import { cropService } from "@/lib/services/crop-service";
import type { Crop } from "@/lib/types/crop";

export default function OperationsPage() {
  const { user } = useAuth();
  const { data: activeFarms = [], isLoading: isLoadingFarms } = useFarms();
  const [operations, setOperations] = useState<FarmingOperation[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [cropCycles, setCropCycles] = useState<CropCycle[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (activeFarms.length === 0 || !user) return;
    
    setLoading(true);
    try {
      const allOps: FarmingOperation[] = [];
      const allSeasons: Season[] = [];
      const allCrops: CropCycle[] = [];
      const allItems: InventoryItem[] = [];

      for (const farm of activeFarms) {
        const [farmOps, farmSeasons, farmCrops, farmItems] = await Promise.all([
          farmingOperationService.listOperationsByFarm(farm.id),
          seasonService.listByFarm(farm.id),
          cropCycleService.listByFarm(farm.id),
          inventoryService.listItems(farm.id)
        ]);
        
        allOps.push(...farmOps);
        allSeasons.push(...farmSeasons);
        allCrops.push(...farmCrops);
        allItems.push(...farmItems);
      }
      
      allOps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const allCropsData = await cropService.list(user.uid);

      setOperations(allOps);
      setSeasons(allSeasons);
      setCropCycles(allCrops);
      setCrops(allCropsData);
      setInventoryItems(allItems);
    } catch (error) {
      console.error("Error loading operations data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFarms, user]);

  if (isLoadingFarms) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (activeFarms.length === 0) {
    return (
      <div className="p-6 text-center text-ink-muted">
        يرجى إضافة مزرعة أولاً للوصول إلى العمليات الزراعية.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <OperationsList
          farms={activeFarms}
          seasons={seasons}
          cropCycles={cropCycles}
          crops={crops}
          inventoryItems={inventoryItems}
          operations={operations}
          userId={user?.uid || ""}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
