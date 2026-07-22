import { useState } from "react";
import { formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Wheat, MapPin, CalendarRange, Scale, Target, Sprout, Info, Calendar } from "lucide-react";
import { CropMonitoring } from "./crop-monitoring";
import type { CropCycle } from "@/lib/types/crop-cycle";
import type { Farm } from "@/lib/types/farm";
import type { Land } from "@/lib/types/land";
import type { Season } from "@/lib/types/season";
import type { Crop } from "@/lib/types/crop";
import type { FarmingOperation } from "@/lib/types/farming-operation";
import { useCurrency } from "@/lib/hooks/use-currency";

interface CropCycleDetailsProps {
  cycle: CropCycle;
  farm?: Farm;
  land?: Land;
  season?: Season;
  crop?: Crop;
  operations?: FarmingOperation[];
}

export function CropCycleDetails({ cycle, farm, land, season, crop, operations = [] }: CropCycleDetailsProps) {
  const { formatMoney, currency } = useCurrency();
  const totalSpent = operations.reduce((acc, op) => acc + (op.totalCost || 0), 0);
  const actualRevenue = cycle.actualRevenue || 0;
  const expectedRevenue = cycle.expectedRevenue || 0;
  const netProfit = actualRevenue - totalSpent;
  const [tab, setTab] = useState<"info" | "program">("info");

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* رأس التفاصيل */}
      <div className="flex flex-col gap-4 border-b border-border/40 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-crop-50 text-crop-600 shadow-sm border border-crop-100">
              <Wheat className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-ink">{crop?.name ?? "غير معروف"}</h2>
              <div className="text-sm text-ink-muted flex items-center gap-2 mt-1">
                <span>{cycle.cropVariety || "بدون صنف محدد"}</span>
                {cycle.cropSubVariety && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-ink-faint"></span>
                    <span>{cycle.cropSubVariety}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Badge variant={cycle.status === "نشطة" ? "default" : "neutral"} className="text-sm px-3 py-1 shadow-sm">
            {cycle.status}
          </Badge>
        </div>
        
        {/* Tabs inside Modal */}
        <div className="flex w-full print:hidden -mb-4">
          <button
            onClick={() => setTab("info")}
            className={cn(
              "flex-1 text-center py-3 text-sm font-bold border-b-2 transition-colors",
              tab === "info" ? "border-crop-600 text-crop-600" : "border-transparent text-ink-muted hover:border-border hover:text-ink"
            )}
          >
            البيانات والمالية
          </button>
          <button
            onClick={() => setTab("program")}
            className={cn(
              "flex-1 flex justify-center items-center gap-2 py-3 text-sm font-bold border-b-2 transition-colors",
              tab === "program" ? "border-crop-600 text-crop-600" : "border-transparent text-ink-muted hover:border-border hover:text-ink"
            )}
          >
            <Calendar className="w-4 h-4" />
            برنامج المتابعة الزراعية
          </button>
        </div>
      </div>

      {tab === "info" ? (
        <>
          {/* التفاصيل الأساسية */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-paper-sunken/50 p-4 rounded-xl border border-border/40 space-y-1">
          <p className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-2">
            <MapPin className="h-3.5 w-3.5 text-sky-500" />
            الموقع
          </p>
          <p className="text-sm font-semibold text-ink">{farm?.name ?? "—"}</p>
          <p className="text-sm text-ink-muted">{land?.name ?? "—"}</p>
        </div>
        
        <div className="bg-paper-sunken/50 p-4 rounded-xl border border-border/40 space-y-1">
          <p className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-2">
            <Scale className="h-3.5 w-3.5 text-amber-500" />
            المساحة
          </p>
          <p className="text-sm font-semibold text-ink">
            {cycle.areaValue} {cycle.areaUnit === "feddan" ? "فدان" : cycle.areaUnit === "qirat" ? "قيراط" : "متر مربع"}
          </p>
          <p className="text-sm text-ink-muted">المعادل: {cycle.areaInFeddan?.toFixed(2) || 0} فدان</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-paper-sunken/50 p-4 rounded-xl border border-border/40 space-y-1">
          <p className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-2">
            <CalendarRange className="h-3.5 w-3.5 text-emerald-500" />
            التواريخ والموسم
          </p>
          <p className="text-sm font-semibold text-ink">{season?.name ?? "—"}</p>
          <p className="text-sm text-ink-muted mt-1">الزراعة: {cycle.plantDate ? formatDate(cycle.plantDate) : "غير محدد"}</p>
          <p className="text-sm text-ink-muted">الحصاد: {cycle.harvestDate ? formatDate(cycle.harvestDate) : "غير محدد"}</p>
        </div>

        <div className="bg-paper-sunken/50 p-4 rounded-xl border border-border/40 space-y-1">
          <p className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-2">
            <Sprout className="h-3.5 w-3.5 text-crop-500" />
            طريقة الزراعة
          </p>
          <p className="text-sm font-semibold text-ink">{cycle.plantingMethod}</p>
          {cycle.isNursery && (
             <Badge variant="wheat" className="mt-2 text-xs">مشتل معزول</Badge>
          )}
        </div>
      </div>

      {/* الجانب المالي */}
      <div className="bg-paper-sunken/30 rounded-xl border border-border/40 overflow-hidden">
        <div className="bg-paper-sunken/60 px-4 py-2 border-b border-border/40 font-medium text-sm text-ink-muted flex items-center gap-2">
          <Target className="h-4 w-4" />
          ملخص مالي
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-ink-muted mb-1">إجمالي المصروفات</p>
            <p className="font-bold text-ink text-lg">{formatMoney(totalSpent)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted mb-1">الإيراد {actualRevenue > 0 ? "الفعلي" : "المتوقع"}</p>
            <p className="font-bold text-emerald-600 text-lg">
              {actualRevenue > 0 ? actualRevenue.toLocaleString() : expectedRevenue > 0 ? expectedRevenue.toLocaleString() : "0"} 
              <span className="text-sm font-normal text-emerald-600/70"> ج.م</span>
            </p>
          </div>
          {(actualRevenue > 0 || totalSpent > 0) && (
            <div className="sm:border-r border-border/50 sm:pr-4">
              <p className="text-xs text-ink-muted mb-1">الربح / الخسارة</p>
              <p className={`font-bold text-lg ${netProfit > 0 ? 'text-emerald-600' : netProfit < 0 ? 'text-danger' : 'text-ink'}`}>
                {netProfit > 0 ? '+' : ''}{formatMoney(netProfit)}
              </p>
            </div>
          )}
        </div>
      </div>

      {cycle.notes && (
        <div className="bg-paper-sunken/50 p-4 rounded-xl border border-border/40">
          <p className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-2">
            <Info className="h-3.5 w-3.5 text-indigo-500" />
            ملاحظات
          </p>
          <p className="text-sm text-ink leading-relaxed">{cycle.notes}</p>
        </div>
      )}
        </>
      ) : (
        <CropMonitoring 
          farmId={cycle.farmId} 
          cropCycleId={cycle.id} 
          plantDate={cycle.plantDate || null} 
        />
      )}
    </div>
  );
}
