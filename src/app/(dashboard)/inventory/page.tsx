"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "@/lib/hooks/use-farms";
import { inventoryService } from "@/lib/services/inventory-service";
import { dictionaryService } from "@/lib/services/dictionary-service";
import { supplierService } from "@/lib/services/supplier-service";
import { InventoryList } from "@/components/inventory/inventory-list";
import { Spinner } from "@/components/ui/spinner";
import { PurchaseInvoiceForm } from "@/components/purchases/purchase-invoice-form";
import type { InventoryItem } from "@/lib/types/inventory";
import type { Supplier } from "@/lib/types/supplier";

export default function InventoryPage() {
  const { user } = useAuth();
  const { data: activeFarms = [], isLoading: isLoadingFarms } = useFarms();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [dictionaryItems, setDictionaryItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
      
      const allSuppliers: Supplier[] = [];
      for (const farm of activeFarms) {
        const farmSuppliers = await supplierService.getSuppliersByFarm(farm.id);
        allSuppliers.push(...farmSuppliers);
      }
      setSuppliers(allSuppliers);
      
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
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (activeFarms.length === 0) {
    return (
      <div className="p-6 text-center text-ink-muted">
        يرجى إضافة مزرعة أولاً للوصول إلى المخازن.
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
        <InventoryList
          farms={activeFarms}
          items={items}
          dictionaryItems={dictionaryItems}
          suppliers={suppliers}
          userId={user?.uid || ""}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
