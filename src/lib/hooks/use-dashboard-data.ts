"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "./use-farms";
import { farmingOperationService } from "@/lib/services/farming-operation-service";
import { purchaseService } from "@/lib/services/purchase-service";
import { salesService } from "@/lib/services/sales-service";
import { cropCycleService } from "@/lib/services/crop-cycle-service";

import { cropService } from "@/lib/services/crop-service";

import { cropProgramService } from "@/lib/services/crop-program-service";

export type DashboardDateRange = "all" | "today" | "this_month" | "last_3_months" | "last_6_months" | "this_year" | "custom";

export function useDashboardData(dateRange: DashboardDateRange = "all", customDateRange?: { start?: string, end?: string }) {
  const { user } = useAuth();
  const { data: farms } = useFarms();
  const activeFarm = farms?.[0];

  return useQuery({
    queryKey: ["dashboard-data", user?.uid, activeFarm?.id, dateRange, customDateRange],
    queryFn: async () => {
      if (!activeFarm) return null;

      const [allOperations, allPurchases, allSales, cropCycles, crops, cropPrograms] = await Promise.all([
        farmingOperationService.listOperationsByFarm(activeFarm.id),
        purchaseService.getInvoicesByFarm(activeFarm.id),
        salesService.getInvoicesByFarm(activeFarm.id),
        cropCycleService.listByFarm(activeFarm.id),
        cropService.list(),
        cropProgramService.getProgramsByFarm(activeFarm.id)
      ]);

      const now = new Date();
      let startDate: Date | null = null;
      let endDate: Date | null = null;
      
      if (dateRange === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateRange === "this_month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (dateRange === "last_3_months") {
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      } else if (dateRange === "last_6_months") {
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      } else if (dateRange === "this_year") {
        startDate = new Date(now.getFullYear(), 0, 1);
      } else if (dateRange === "custom") {
        if (customDateRange?.start) startDate = new Date(customDateRange.start);
        if (customDateRange?.end) endDate = new Date(customDateRange.end);
      }

      // Filter functions
      const isDateInRange = (d?: string | null) => {
        if (!d) return true;
        const date = new Date(d);
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
      };

      const operations = allOperations.filter(o => isDateInRange(o.date));
      const purchases = allPurchases.filter(p => isDateInRange(p.invoiceDate));
      const sales = allSales.filter(s => isDateInRange(s.invoiceDate));

      const totalOperationsCost = operations.reduce((sum, op) => sum + (op.totalCost || 0), 0);
      const totalPurchasesCost = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
      const totalExpenses = totalOperationsCost + totalPurchasesCost;

      const totalRevenues = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

      // Latest 5 operations
      const latestOperations = [...operations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      // 1. Cashflow Data (Last 6 months)
      const cashflowMap = new Map<string, { name: string, revenues: number, expenses: number }>();
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleDateString('ar-EG', { month: 'short' });
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        cashflowMap.set(key, { name: monthName, revenues: 0, expenses: 0 });
      }

      sales.forEach(s => {
        if (!s.invoiceDate) return;
        const key = s.invoiceDate.substring(0, 7);
        if (cashflowMap.has(key)) {
          const entry = cashflowMap.get(key)!;
          entry.revenues += s.totalAmount || 0;
        }
      });

      purchases.forEach(p => {
        if (!p.invoiceDate) return;
        const key = p.invoiceDate.substring(0, 7);
        if (cashflowMap.has(key)) {
          const entry = cashflowMap.get(key)!;
          entry.expenses += p.totalAmount || 0;
        }
      });

      operations.forEach(op => {
        if (!op.date) return;
        const key = op.date.substring(0, 7);
        if (cashflowMap.has(key)) {
          const entry = cashflowMap.get(key)!;
          entry.expenses += op.totalCost || 0;
        }
      });

      const cashflowData = Array.from(cashflowMap.values());

      // 2. Crop Distribution Data
      const cropDistributionMap = new Map<string, number>();
      cropCycles.forEach(c => {
        const crop = crops.find(cr => cr.id === c.cropId);
        const name = crop?.name || 'غير محدد';
        cropDistributionMap.set(name, (cropDistributionMap.get(name) || 0) + (c.areaInFeddan || 1));
      });
      const cropDistributionData = Array.from(cropDistributionMap.entries()).map(([name, value]) => ({ name, value }));

      // 3. Expenses Categories
      const expLabor = operations.reduce((sum, op) => sum + (op.laborCost || 0), 0);
      const expEquip = operations.reduce((sum, op) => sum + (op.equipmentCost || 0), 0);
      const expFuel = operations.reduce((sum, op) => sum + (op.fuelCost || 0), 0);
      const expMaterials = operations.reduce((sum, op) => sum + (op.inventoryItems?.reduce((s, i) => s + (i.totalPrice || 0), 0) || 0), 0);
      const expPurchases = totalPurchasesCost;

      const expensesByCategoryData = [
        { name: 'مشتريات موردين', value: expPurchases },
        { name: 'أجور عمالة', value: expLabor },
        { name: 'مواد ومخزون', value: expMaterials },
        { name: 'تشغيل معدات', value: expEquip },
        { name: 'وقود وصيانة', value: expFuel }
      ].filter(item => item.value > 0).sort((a, b) => b.value - a.value);

      // 4. Today's Tasks
      const todayTasks: any[] = [];
      const currentDay = new Date();
      currentDay.setHours(0, 0, 0, 0);

      cropPrograms.forEach(program => {
        if (program.status !== 'active') return;
        const cycle = cropCycles.find(c => c.id === program.cropCycleId);
        if (!cycle || !cycle.plantDate) return;

        const plantDate = new Date(cycle.plantDate);
        plantDate.setHours(0, 0, 0, 0);
        
        // Calculate days difference
        const diffTime = Math.abs(currentDay.getTime() - plantDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const sign = currentDay >= plantDate ? 1 : -1;
        const currentDayNumber = sign * diffDays;

        program.phases?.forEach(phase => {
          if (phase.dayNumber === currentDayNumber) {
            // Check if already executed
            const exec = program.executions?.[phase.id];
            if (!exec || !exec.isCompleted) {
               const crop = crops.find(cr => cr.id === cycle.cropId);
               todayTasks.push({
                 id: `${program.id}-${phase.id}`,
                 title: phase.title,
                 type: phase.type,
                 cropName: crop?.name || 'محصول',
                 farmId: activeFarm.id
               });
            }
          }
        });
      });

      return {
        totalExpenses,
        totalRevenues,
        cropCyclesCount: cropCycles.length,
        latestOperations,
        cashflowData,
        cropDistributionData,
        expensesByCategoryData,
        todayTasks
      };
    },
    enabled: !!user?.uid && !!activeFarm?.id,
  });
}
