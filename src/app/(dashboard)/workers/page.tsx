"use client";
import { useState } from "react";
import { Users, BookOpen, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { useFarms } from "@/lib/hooks/use-farms";

import { WorkersList } from "@/components/workers/workers-list";
import { LaborLogsTab } from "@/components/workers/labor-logs-tab";
import { PayrollTab } from "@/components/workers/payroll-tab";

export default function WorkersPage() {
  const { data: farms, isLoading: loadingFarms } = useFarms();
  const myFarm = farms?.[0];
  const [activeTab, setActiveTab] = useState("workers");

  if (!loadingFarms && !myFarm) {
    return (
      <EmptyState
        icon={Users}
        title="أضف مزرعة أولًا"
        description="لإضافة عمالة، يجب أن يكون لديك مزرعة مسجلة في النظام."
        action={
          <Button onClick={() => window.location.href = "/farms"}>الذهاب إلى إعداد المزرعة</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 md:px-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">نظام العمالة واليوميات (HR)</h2>
            <p className="text-ink-muted mt-1 text-sm">إدارة العمال، اليوميات، السلف، وتصفية الرواتب</p>
          </div>
        </div>
      </div>

      {myFarm && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-xl mb-6 bg-paper-sunken border border-border">
            <TabsTrigger value="workers" className="gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white">
              <Users className="w-4 h-4" />
              فريق العمل
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4" />
              اليوميات والحضور
            </TabsTrigger>
            <TabsTrigger value="payroll" className="gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4" />
              السلف وتصفية الحساب
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workers" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
            <WorkersList farmId={myFarm.id} />
          </TabsContent>

          <TabsContent value="logs" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
            <LaborLogsTab farmId={myFarm.id} />
          </TabsContent>

          <TabsContent value="payroll" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
            <PayrollTab farmId={myFarm.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
