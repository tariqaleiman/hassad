"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "@/lib/hooks/use-farms";
import { Spinner } from "@/components/ui/spinner";
import { paymentService } from "@/lib/services/payment-service";
import { supplierService } from "@/lib/services/supplier-service";
import { contractorService } from "@/lib/services/contractor-service";
import { customerService } from "@/lib/services/customer-service";
import { seasonService } from "@/lib/services/season-service";
import { DebtsList } from "@/components/debts/debts-list";
import type { Payment } from "@/lib/types/payment";
import type { Supplier } from "@/lib/types/supplier";
import type { Contractor } from "@/lib/types/contractor";
import type { Customer } from "@/lib/types/customer";
import type { Season } from "@/lib/types/season";

export default function DebtsPage() {
  const { user } = useAuth();
  const { data: activeFarms = [], isLoading: isLoadingFarms } = useFarms();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (activeFarms.length === 0 || !user) return;

    setLoading(true);
    try {
      const allPayments: Payment[] = [];
      const allSuppliers: Supplier[] = [];
      const allContractors: Contractor[] = [];
      const allCustomers: Customer[] = [];
      const allSeasons: Season[] = [];

      for (const farm of activeFarms) {
        const [farmPayments, farmSuppliers, farmContractors, farmCustomers, farmSeasons] = await Promise.all([
          paymentService.getPaymentsByFarm(farm.id),
          supplierService.getSuppliersByFarm(farm.id),
          contractorService.getContractorsByFarm(farm.id),
          customerService.getCustomersByFarm(farm.id),
          seasonService.listByFarm(farm.id)
        ]);

        allPayments.push(...farmPayments);
        allSuppliers.push(...farmSuppliers);
        allContractors.push(...farmContractors);
        allCustomers.push(...farmCustomers);
        allSeasons.push(...farmSeasons);
      }

      allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setPayments(allPayments);
      setSuppliers(allSuppliers);
      setContractors(allContractors);
      setCustomers(allCustomers);
      setSeasons(allSeasons);
    } catch (error) {
      console.error("Error loading debts data:", error);
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
        يرجى إضافة مزرعة أولاً للوصول إلى قسم الديون والمدفوعات.
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
        <DebtsList
          payments={payments}
          farms={activeFarms}
          seasons={seasons}
          suppliers={suppliers}
          contractors={contractors}
          customers={customers}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
