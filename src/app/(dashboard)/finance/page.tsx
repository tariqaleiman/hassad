"use client";

import { useFarms } from "@/lib/hooks/use-farms";
import { AccountsTab } from "@/components/finance/accounts-tab";
import { VouchersTab } from "@/components/finance/vouchers-tab";
import { JournalTab } from "@/components/finance/journal-tab";
import { ReportsTab } from "@/components/finance/reports-tab";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wallet, FileText, BarChart3, BookOpen } from "lucide-react";
import { Select } from "@/components/ui/select";
import { useState } from "react";

export default function FinancePage() {
  const { data: farms } = useFarms();
  const [activeTab, setActiveTab] = useState("vouchers");

  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms?.[0]?.id || "");
  const farmId = selectedFarmId || farms?.[0]?.id;

  if (!farmId) {
    return (
      <div className="p-8 text-center text-ink-muted">
        يرجى إعداد بيانات المزرعة في الإعدادات أولاً.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 md:px-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">المالية والحسابات</h2>
            <p className="text-ink-muted mt-1 text-sm">إدارة شجرة الحسابات، سندات القبض والصرف، والتقارير المحاسبية</p>
          </div>
        </div>
        
        {farms && farms.length > 1 && (
          <div className="w-full sm:w-64">
            <Select 
              value={farmId} 
              onChange={(e) => setSelectedFarmId(e.target.value)}
            >
              {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </Select>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-surface/50 border border-black/5 dark:border-white/5 p-1 flex-wrap h-auto">
          <TabsTrigger value="vouchers" className="gap-2 flex-1 min-w-[150px] data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <FileText className="w-4 h-4" />
            سندات القبض والصرف
          </TabsTrigger>
          <TabsTrigger value="journal" className="gap-2 flex-1 min-w-[150px] data-[state=active]:bg-sky-500 data-[state=active]:text-white">
            <BookOpen className="w-4 h-4" />
            دفتر اليومية
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2 flex-1 min-w-[150px] data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Wallet className="w-4 h-4" />
            دليل الحسابات
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2 flex-1 min-w-[150px] data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4" />
            التقارير المالية (كشف الحساب)
          </TabsTrigger>
        </TabsList>

        <Card className="p-6 min-h-[500px]">
          <TabsContent value="vouchers" className="focus-visible:outline-none">
            <VouchersTab farmId={farmId} />
          </TabsContent>

          <TabsContent value="journal" className="focus-visible:outline-none">
            <JournalTab farmId={farmId} />
          </TabsContent>

          <TabsContent value="accounts" className="m-0 focus-visible:outline-none">
            <AccountsTab farmId={farmId} />
          </TabsContent>

          <TabsContent value="reports" className="m-0 focus-visible:outline-none">
            <ReportsTab farmId={farmId} lastClosingDate={farms?.[0]?.lastClosingDate} />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
