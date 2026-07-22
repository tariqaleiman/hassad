"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "@/lib/hooks/use-farms";
import { Spinner } from "@/components/ui/spinner";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { salesService } from "@/lib/services/sales-service";
import { customerService } from "@/lib/services/customer-service";
import { seasonService } from "@/lib/services/season-service";
import { cropCycleService } from "@/lib/services/crop-cycle-service";
import { cropService } from "@/lib/services/crop-service";
import { SalesList } from "@/components/sales/sales-list";
import type { SalesInvoice } from "@/lib/types/sales";
import type { Customer } from "@/lib/types/customer";
import type { Season } from "@/lib/types/season";
import type { InventoryItem } from "@/lib/types/inventory";
import { inventoryService } from "@/lib/services/inventory-service";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPin } from "lucide-react";

export default function SalesPage() {
  const { user } = useAuth();
  const { data: activeFarms = [], isLoading: isLoadingFarms } = useFarms();
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (activeFarms.length === 0 || !user) return;

    setLoading(true);
    try {
      const allSales: SalesInvoice[] = [];
      const allCustomers: Customer[] = [];
      const allSeasons: Season[] = [];
      const allInventoryItems: InventoryItem[] = [];

      for (const farm of activeFarms) {
        const [farmSales, farmCustomers, farmSeasons, farmInventory] = await Promise.all([
          salesService.getInvoicesByFarm(farm.id),
          customerService.getCustomersByFarm(farm.id),
          seasonService.listByFarm(farm.id),
          inventoryService.listItems(farm.id)
        ]);

        allSales.push(...farmSales);
        allCustomers.push(...farmCustomers);
        allSeasons.push(...farmSeasons);
        allInventoryItems.push(...farmInventory);
      }

      allSales.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());

      setSalesInvoices(allSales);
      setCustomers(allCustomers);
      setSeasons(allSeasons);
      setInventoryItems(allInventoryItems);
    } catch (error) {
      console.error("Error loading sales data:", error);
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
      <EmptyState icon={MapPin} title="لا توجد مزارع" description="يرجى إضافة مزرعة أولاً للوصول إلى هذا القسم." />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {loading ? (
        <PageSkeleton />
      ) : (
        <SalesList
          salesInvoices={salesInvoices}
          farms={activeFarms}
          seasons={seasons}
          customers={customers}
          inventoryItems={inventoryItems}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
