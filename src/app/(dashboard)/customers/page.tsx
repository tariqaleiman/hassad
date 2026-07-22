"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "@/lib/hooks/use-farms";
import { Spinner } from "@/components/ui/spinner";
import { customerService } from "@/lib/services/customer-service";
import { CustomerList } from "@/components/customers/customer-list";
import type { Customer } from "@/lib/types/customer";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPin } from "lucide-react";

export default function CustomersPage() {
  const { user } = useAuth();
  const { data: activeFarms = [], isLoading: isLoadingFarms } = useFarms();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (activeFarms.length === 0 || !user) return;

    setLoading(true);
    try {
      const allCustomers: Customer[] = [];
      for (const farm of activeFarms) {
        const farmCustomers = await customerService.getCustomersByFarm(farm.id);
        allCustomers.push(...farmCustomers);
      }
      setCustomers(allCustomers);
    } catch (error) {
      console.error("Error loading customers:", error);
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
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <CustomerList
          customers={customers}
          farms={activeFarms}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
