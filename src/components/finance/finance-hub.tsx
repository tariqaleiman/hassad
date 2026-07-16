"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingDown, TrendingUp, Users, Tractor, Store, Landmark, Leaf, Calendar, MapPin } from "lucide-react";
import type { FarmingOperation } from "@/lib/types/farming-operation";
import type { PurchaseInvoice } from "@/lib/types/inventory";
import type { SalesInvoice } from "@/lib/types/sales";
import type { Customer } from "@/lib/types/customer";
import type { Supplier } from "@/lib/types/supplier";
import type { Contractor } from "@/lib/types/contractor";
import type { CropCycle } from "@/lib/types/crop-cycle";
import type { Crop } from "@/lib/types/crop";
import type { Season } from "@/lib/types/season";
import type { Land } from "@/lib/types/land";

interface FinanceData {
  farmId: string;
  operations: FarmingOperation[];
  purchases: PurchaseInvoice[];
  sales: SalesInvoice[];
  customers: Customer[];
  suppliers: Supplier[];
  contractors: Contractor[];
  cropCycles: CropCycle[];
  crops: Crop[];
  seasons: Season[];
  lands: Land[];
}

export function FinanceHub({
  data,
  userId,
  onUpdate
}: {
  data: FinanceData;
  userId: string;
  onUpdate: () => void;
}) {
  const [activeTab, setActiveTab] = useState("summary");

  // Calculations
  const totalOperationsCost = data.operations.reduce((sum, op) => sum + (op.totalCost || 0), 0);
  const totalPurchasesCost = data.purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalExpenses = totalOperationsCost + totalPurchasesCost;

  const totalSalesRevenue = data.sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalRevenues = totalSalesRevenue; // Can add other revenues later

  const netProfit = totalRevenues - totalExpenses;

  // Debts (Liabilities - What we owe)
  const totalSupplierDebt = data.suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);
  const totalContractorDebt = data.contractors.reduce((sum, c) => sum + (c.balance || 0), 0);
  const totalLiabilities = totalSupplierDebt + totalContractorDebt;

  // Assets (Receivables - What is owed to us)
  const totalCustomerDebt = data.customers.reduce((sum, c) => sum + (c.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-paper p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold font-display text-ink flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Landmark className="h-6 w-6" />
            </div>
            المركز المالي الشامل
          </h1>
          <p className="text-sm text-ink-muted mt-2">نظرة عامة على الإيرادات، المصروفات، والديون للمزرعة</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-paper border border-border rounded-xl p-1 h-auto">
          <TabsTrigger value="summary" className="py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg font-bold">
            الملخص المالي
          </TabsTrigger>
          <TabsTrigger value="expenses" className="py-3 data-[state=active]:bg-danger/10 data-[state=active]:text-danger rounded-lg font-bold">
            المصروفات
          </TabsTrigger>
          <TabsTrigger value="revenues" className="py-3 data-[state=active]:bg-success/10 data-[state=active]:text-success rounded-lg font-bold">
            الإيرادات
          </TabsTrigger>
          <TabsTrigger value="debts" className="py-3 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 rounded-lg font-bold">
            الديون والمستحقات
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="summary" className="space-y-6 m-0">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-paper p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-success/10 text-success">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-ink-muted">إجمالي الإيرادات</h3>
                </div>
                <div>
                  <p className="text-3xl font-bold font-display text-success">{totalRevenues.toLocaleString()}</p>
                  <p className="text-sm text-ink-muted mt-1">ج.م</p>
                </div>
              </div>

              <div className="bg-paper p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-danger/10 text-danger">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-ink-muted">إجمالي المصروفات</h3>
                </div>
                <div>
                  <p className="text-3xl font-bold font-display text-danger">{totalExpenses.toLocaleString()}</p>
                  <p className="text-sm text-ink-muted mt-1">ج.م</p>
                </div>
              </div>

              <div className="bg-paper p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-ink-muted">صافي الربح / الخسارة</h3>
                </div>
                <div>
                  <p className={`text-3xl font-bold font-display ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                    {Math.abs(netProfit).toLocaleString()} {netProfit < 0 ? '-' : ''}
                  </p>
                  <p className="text-sm text-ink-muted mt-1">ج.م</p>
                </div>
              </div>

              <div className="bg-paper p-5 rounded-2xl border border-amber-500/30 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-amber-500/50"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Store className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-ink-muted">إجمالي الديون (عليك)</h3>
                </div>
                <div>
                  <p className="text-3xl font-bold font-display text-amber-600 dark:text-amber-400">{totalLiabilities.toLocaleString()}</p>
                  <p className="text-sm text-ink-muted mt-1">للموردين والمقاولين</p>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* To do: Charts and Breakdowns */}
               <div className="bg-paper p-6 rounded-2xl border border-border shadow-sm">
                  <h3 className="font-bold text-lg text-ink mb-4">نظرة على الديون المستحقة</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-paper-sunken/50 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-amber-600" />
                        <span className="font-medium">للموردين</span>
                      </div>
                      <span className="font-bold text-amber-600">{totalSupplierDebt.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-paper-sunken/50 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <Tractor className="w-5 h-5 text-amber-600" />
                        <span className="font-medium">للمقاولين</span>
                      </div>
                      <span className="font-bold text-amber-600">{totalContractorDebt.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium">لك عند العملاء</span>
                      </div>
                      <span className="font-bold text-emerald-600">{totalCustomerDebt.toLocaleString()} ج.م</span>
                    </div>
                  </div>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="m-0">
             <div className="bg-paper p-6 rounded-2xl border border-border shadow-sm">
               <h2 className="text-xl font-bold mb-4">تفصيل المصروفات</h2>
               <p className="text-ink-muted">سيتم عرض تحليل تفصيلي للمصروفات حسب نوع العملية وتكاليف المشتريات.</p>
               {/* Todo: breakdown by operation type */}
             </div>
          </TabsContent>

          <TabsContent value="revenues" className="m-0">
             <div className="bg-paper p-6 rounded-2xl border border-border shadow-sm">
               <h2 className="text-xl font-bold mb-4">تفصيل الإيرادات</h2>
               <p className="text-ink-muted">سيتم عرض المبيعات وإيرادات المحاصيل المختلفة.</p>
               {/* Todo: list of sales invoices or chart */}
             </div>
          </TabsContent>

          <TabsContent value="debts" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* ديون علينا */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-danger flex items-center gap-2">
                  <TrendingDown className="w-6 h-6" />
                  ديون مستحقة للدفع (عليك)
                </h2>
                
                {/* Suppliers */}
                <div className="bg-paper p-5 rounded-2xl border border-border shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-ink">
                    <Store className="w-5 h-5 text-indigo-500" />
                    الموردين
                  </h3>
                  <div className="space-y-3">
                    {data.suppliers.filter(s => (s.balance || 0) > 0).length === 0 ? (
                      <p className="text-ink-muted text-sm text-center py-4">لا توجد ديون للموردين</p>
                    ) : (
                      data.suppliers.filter(s => (s.balance || 0) > 0).map(s => (
                        <div key={s.id} className="flex justify-between items-center p-3 bg-paper-sunken/50 rounded-xl">
                          <span className="font-medium">{s.name}</span>
                          <span className="font-bold text-danger">{(s.balance || 0).toLocaleString()} ج.م</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Contractors */}
                <div className="bg-paper p-5 rounded-2xl border border-border shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-ink">
                    <Tractor className="w-5 h-5 text-amber-500" />
                    المقاولين
                  </h3>
                  <div className="space-y-3">
                    {data.contractors.filter(c => (c.balance || 0) > 0).length === 0 ? (
                      <p className="text-ink-muted text-sm text-center py-4">لا توجد ديون للمقاولين</p>
                    ) : (
                      data.contractors.filter(c => (c.balance || 0) > 0).map(c => (
                        <div key={c.id} className="flex justify-between items-center p-3 bg-paper-sunken/50 rounded-xl">
                          <span className="font-medium">{c.name} <span className="text-xs text-ink-muted font-normal mr-2">({c.type})</span></span>
                          <span className="font-bold text-danger">{(c.balance || 0).toLocaleString()} ج.م</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ديون لنا */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-success flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  ديون مستحقة للتحصيل (لك)
                </h2>
                
                {/* Customers */}
                <div className="bg-paper p-5 rounded-2xl border border-border shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-ink">
                    <Users className="w-5 h-5 text-emerald-500" />
                    العملاء
                  </h3>
                  <div className="space-y-3">
                    {data.customers.filter(c => (c.balance || 0) > 0).length === 0 ? (
                      <p className="text-ink-muted text-sm text-center py-4">لا توجد أموال مستحقة عند العملاء</p>
                    ) : (
                      data.customers.filter(c => (c.balance || 0) > 0).map(c => (
                        <div key={c.id} className="flex justify-between items-center p-3 bg-paper-sunken/50 rounded-xl">
                          <span className="font-medium">{c.name}</span>
                          <span className="font-bold text-success">{(c.balance || 0).toLocaleString()} ج.م</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
