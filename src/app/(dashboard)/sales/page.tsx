"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "@/lib/hooks/use-farms";
import { Spinner } from "@/components/ui/spinner";
import { salesService } from "@/lib/services/sales-service";
import { customerService } from "@/lib/services/customer-service";
import { seasonService } from "@/lib/services/season-service";
import { cropCycleService } from "@/lib/services/crop-cycle-service";
import { cropService } from "@/lib/services/crop-service";
import { SalesList } from "@/components/sales/sales-list";
import type { SalesInvoice } from "@/lib/types/sales";
import type { Customer } from "@/lib/types/customer";
import type { Season } from "@/lib/types/season";
import type { CropCycle } from "@/lib/types/crop-cycle";
import type { Crop } from "@/lib/types/crop";

export default function SalesPage() {
  const { user } = useAuth();
  const { data: activeFarms = [], isLoading: isLoadingFarms } = useFarms();
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [cropCycles, setCropCycles] = useState<CropCycle[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (activeFarms.length === 0 || !user) return;

    setLoading(true);
    try {
      const allSales: SalesInvoice[] = [];
      const allCustomers: Customer[] = [];
      const allSeasons: Season[] = [];
      const allCropCycles: CropCycle[] = [];

      for (const farm of activeFarms) {
        const [farmSales, farmCustomers, farmSeasons, farmCropCycles] = await Promise.all([
          salesService.getInvoicesByFarm(farm.id),
          customerService.getCustomersByFarm(farm.id),
          seasonService.listByFarm(farm.id),
          cropCycleService.listByFarm(farm.id)
        ]);

        allSales.push(...farmSales);
        allCustomers.push(...farmCustomers);
        allSeasons.push(...farmSeasons);
        allCropCycles.push(...farmCropCycles);
      }

      allSales.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());

      const allCrops = await cropService.list(user.uid);

      setSalesInvoices(allSales);
      setCustomers(allCustomers);
      setSeasons(allSeasons);
      setCropCycles(allCropCycles);
      setCrops(allCrops);
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
      <div className="p-6 text-center text-ink-muted">
        يرجى إضافة مزرعة أولاً للوصول إلى المبيعات.
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
        <SalesList
          salesInvoices={salesInvoices}
          farms={activeFarms}
          seasons={seasons}
          customers={customers}
          cropCycles={cropCycles}
          crops={crops}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
