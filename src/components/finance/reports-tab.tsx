"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrialBalanceReport } from "./reports/trial-balance-report";
import { IncomeStatementReport } from "./reports/income-statement-report";
import { BalanceSheetReport } from "./reports/balance-sheet-report";
import { AccountStatementReport } from "./reports/account-statement-report";
import { PeriodClosing } from "./reports/period-closing";

export function ReportsTab({ farmId, lastClosingDate }: { farmId: string, lastClosingDate?: string }) {
  const [activeReport, setActiveReport] = useState("trial-balance");

  return (
    <div className="space-y-6">
      
      <Tabs value={activeReport} onValueChange={setActiveReport} className="w-full">
        <TabsList className="bg-black/5 dark:bg-white/5 p-1 rounded-xl w-full flex flex-wrap h-auto gap-1">
          <TabsTrigger value="trial-balance" className="rounded-lg flex-1 min-w-[120px] data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-black dark:data-[state=active]:text-white">
            ميزان المراجعة
          </TabsTrigger>
          <TabsTrigger value="income-statement" className="rounded-lg flex-1 min-w-[120px] data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-black dark:data-[state=active]:text-white">
            قائمة الدخل
          </TabsTrigger>
          <TabsTrigger value="balance-sheet" className="rounded-lg flex-1 min-w-[120px] data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-black dark:data-[state=active]:text-white">
            الميزانية العمومية
          </TabsTrigger>
          <TabsTrigger value="account-statement" className="rounded-lg flex-1 min-w-[120px] data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-black dark:data-[state=active]:text-white">
            كشف حساب
          </TabsTrigger>
          <TabsTrigger value="period-closing" className="rounded-lg flex-1 min-w-[120px] data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
            إغلاق الفترة / السنة
          </TabsTrigger>
        </TabsList>

        <div className="mt-8 border border-black/5 dark:border-white/5 rounded-2xl p-6 bg-black/[0.02] dark:bg-white/[0.02]">
          <TabsContent value="trial-balance" className="mt-0">
            <TrialBalanceReport farmId={farmId} />
          </TabsContent>
          
          <TabsContent value="income-statement" className="mt-0">
            <IncomeStatementReport farmId={farmId} />
          </TabsContent>
          
          <TabsContent value="balance-sheet" className="mt-0">
            <BalanceSheetReport farmId={farmId} />
          </TabsContent>

          <TabsContent value="account-statement" className="mt-0">
            <AccountStatementReport farmId={farmId} />
          </TabsContent>

          <TabsContent value="period-closing" className="mt-0">
            <PeriodClosing farmId={farmId} lastClosingDate={lastClosingDate} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
