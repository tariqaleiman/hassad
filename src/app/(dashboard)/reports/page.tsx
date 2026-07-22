"use client";

import { useState } from "react";
import { useFarms } from "@/lib/hooks/use-farms";
import { useAccounts } from "@/lib/hooks/use-finance";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Scale, PieChart, Landmark } from "lucide-react";
import { useCurrency } from "@/lib/hooks/use-currency";

export default function ReportsPage() {
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  
  const { data: accounts = [], isLoading } = useAccounts(farmId || "");
  const [activeTab, setActiveTab] = useState("trial-balance");
  const { formatMoney } = useCurrency();

  if (!farmId) return null;

  // Calculate Reports Data
  const calculateReports = () => {
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let totalRevenue = 0;
    let totalExpenses = 0;

    const trialBalance: any[] = [];

    accounts.forEach(acc => {
      const bal = acc.balance || 0;
      
      // Categorize for Income Statement & Balance Sheet
      if (acc.category === "أصول") totalAssets += bal;
      else if (acc.category === "خصوم") totalLiabilities += bal;
      else if (acc.category === "حقوق ملكية") totalEquity += bal;
      else if (acc.category === "إيرادات") totalRevenue += bal;
      else if (acc.category === "مصروفات") totalExpenses += bal;

      // Trial Balance
      // Assets & Expenses are normally Debit. Liabilities, Equity, Revenue are normally Credit.
      // Assuming our running balance is Debit = Positive, Credit = Negative for simplicity, 
      // or assuming balance is positive in normal direction.
      // Wait, in finance-integration-service, I wrote: 
      // `isDebitNormal ? (debit - credit) : (credit - debit)`
      // So all balances are POSITIVE if they are in their normal direction.
      let debit = 0;
      let credit = 0;
      if (acc.category === "أصول" || acc.category === "مصروفات") {
        if (bal >= 0) debit = bal; else credit = -bal;
      } else {
        if (bal >= 0) credit = bal; else debit = -bal;
      }

      if (debit > 0 || credit > 0) {
        trialBalance.push({ ...acc, debit, credit });
      }
    });

    const netIncome = totalRevenue - totalExpenses;
    // Balance Sheet Equation: Assets = Liabilities + Equity + Net Income
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity + netIncome;

    const totalDebit = trialBalance.reduce((s, a) => s + a.debit, 0);
    const totalCredit = trialBalance.reduce((s, a) => s + a.credit, 0);

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpenses,
      netIncome,
      totalLiabilitiesAndEquity,
      trialBalance,
      totalDebit,
      totalCredit
    };
  };

  const reports = calculateReports();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 md:px-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">القوائم المالية والتقارير</h2>
            <p className="text-ink-muted mt-1 text-sm">ميزان المراجعة، قائمة الدخل، والميزانية العمومية</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-surface/50 border border-black/5 dark:border-white/5 p-1 flex-wrap h-auto">
          <TabsTrigger value="trial-balance" className="gap-2 flex-1 min-w-[150px] data-[state=active]:bg-sky-500 data-[state=active]:text-white">
            <Scale className="w-4 h-4" />
            ميزان المراجعة
          </TabsTrigger>
          <TabsTrigger value="income" className="gap-2 flex-1 min-w-[150px] data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <PieChart className="w-4 h-4" />
            قائمة الدخل
          </TabsTrigger>
          <TabsTrigger value="balance-sheet" className="gap-2 flex-1 min-w-[150px] data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            <Landmark className="w-4 h-4" />
            الميزانية العمومية
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trial-balance">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 text-center">ميزان المراجعة</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-black/5 dark:bg-white/5">
                  <tr>
                    <th className="p-3 border">كود الحساب</th>
                    <th className="p-3 border">اسم الحساب</th>
                    <th className="p-3 border text-center">مدين</th>
                    <th className="p-3 border text-center">دائن</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.trialBalance.map(acc => (
                    <tr key={acc.id} className="hover:bg-black/5">
                      <td className="p-3 border">{acc.code}</td>
                      <td className="p-3 border">{acc.name}</td>
                      <td className="p-3 border font-mono text-center">{acc.debit > 0 ? formatMoney(acc.debit) : "-"}</td>
                      <td className="p-3 border font-mono text-center">{acc.credit > 0 ? formatMoney(acc.credit) : "-"}</td>
                    </tr>
                  ))}
                  <tr className="bg-black/5 font-bold">
                    <td colSpan={2} className="p-3 border text-center">الإجمالي المرجح</td>
                    <td className="p-3 border font-mono text-center text-emerald-600">{formatMoney(reports.totalDebit)}</td>
                    <td className="p-3 border font-mono text-center text-emerald-600">{formatMoney(reports.totalCredit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <Card className="p-6 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-6 text-center">قائمة الدخل</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-lg">إجمالي الإيرادات (المبيعات)</span>
                <span className="font-mono text-emerald-600">{formatMoney(reports.totalRevenue)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-lg">إجمالي المصروفات والتكاليف</span>
                <span className="font-mono text-rose-600">{formatMoney(reports.totalExpenses)}</span>
              </div>
              <div className="flex justify-between bg-black/5 p-4 rounded-lg mt-4">
                <span className="font-bold text-xl">صافي الدخل (الربح/الخسارة)</span>
                <span className={`font-mono text-xl font-bold ${reports.netIncome >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {formatMoney(reports.netIncome)}
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 text-center">الميزانية العمومية (المركز المالي)</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-4 text-center bg-black/5 py-2">الأصول (الموجودات)</h4>
                <div className="space-y-2">
                  {reports.trialBalance.filter(a => a.category === "أصول").map(acc => (
                    <div key={acc.id} className="flex justify-between border-b border-dashed pb-2">
                      <span>{acc.name}</span>
                      <span className="font-mono">{formatMoney(acc.balance)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-4">
                    <span>إجمالي الأصول</span>
                    <span className="font-mono text-emerald-600">{formatMoney(reports.totalAssets)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4 text-center bg-black/5 py-2">الخصوم وحقوق الملكية</h4>
                <div className="space-y-2">
                  <div className="font-semibold text-rose-600 mb-2">الخصوم (المطلوبات)</div>
                  {reports.trialBalance.filter(a => a.category === "خصوم").map(acc => (
                    <div key={acc.id} className="flex justify-between border-b border-dashed pb-2">
                      <span>{acc.name}</span>
                      <span className="font-mono">{formatMoney(acc.balance)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold py-2 bg-black/5 px-2">
                    <span>إجمالي الخصوم</span>
                    <span className="font-mono">{formatMoney(reports.totalLiabilities)}</span>
                  </div>

                  <div className="font-semibold text-blue-600 mt-6 mb-2">حقوق الملكية</div>
                  {reports.trialBalance.filter(a => a.category === "حقوق ملكية").map(acc => (
                    <div key={acc.id} className="flex justify-between border-b border-dashed pb-2">
                      <span>{acc.name}</span>
                      <span className="font-mono">{formatMoney(acc.balance)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-b border-dashed pb-2">
                    <span>أرباح (خسائر) الفترة</span>
                    <span className={`font-mono ${reports.netIncome >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatMoney(reports.netIncome)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-4">
                    <span>إجمالي الخصوم وحقوق الملكية</span>
                    <span className="font-mono text-blue-600">{formatMoney(reports.totalLiabilitiesAndEquity)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
