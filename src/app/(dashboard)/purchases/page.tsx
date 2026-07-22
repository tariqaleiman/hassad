"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "@/lib/hooks/use-farms";
import { purchaseService } from "@/lib/services/purchase-service";
import { supplierService } from "@/lib/services/supplier-service";
import { inventoryService } from "@/lib/services/inventory-service";
import { dictionaryService } from "@/lib/services/dictionary-service";
import { PurchasesList } from "@/components/purchases/purchases-list";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import type { PurchaseInvoice } from "@/lib/types/purchase";
import type { Supplier } from "@/lib/types/supplier";
import type { InventoryItem } from "@/lib/types/inventory";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPin } from "lucide-react";

export default function PurchasesPage() {
  const { user } = useAuth();
  const { data: activeFarms = [], isLoading: isLoadingFarms } = useFarms();
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [dictionaryItems, setDictionaryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (activeFarms.length === 0 || !user) return;
    
    setLoading(true);
    try {
      const allInvoices: PurchaseInvoice[] = [];
      const allSuppliers: Supplier[] = [];
      const allInventoryItems: InventoryItem[] = [];

      for (const farm of activeFarms) {
        const [farmInvoices, farmSuppliers, farmItems] = await Promise.all([
          purchaseService.getInvoicesByFarm(farm.id),
          supplierService.getSuppliersByFarm(farm.id),
          inventoryService.listItems(farm.id)
        ]);
        allInvoices.push(...farmInvoices);
        allSuppliers.push(...farmSuppliers);
        allInventoryItems.push(...farmItems);
      }
      
      setInvoices(allInvoices);
      setSuppliers(allSuppliers);
      setInventoryItems(allInventoryItems);

      const dictItems = await dictionaryService.listEntries(user.uid);
      setDictionaryItems(dictItems);
    } catch (error) {
      console.error("Error loading purchases data:", error);
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
        <PurchasesList
          farms={activeFarms}
          invoices={invoices}
          suppliers={suppliers}
          inventoryItems={inventoryItems}
          dictionaryItems={dictionaryItems}
          userId={user?.uid || ""}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
