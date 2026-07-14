import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Wheat, MapPin, CalendarRange, Scale, Target, Sprout, Info } from "lucide-react";
import type { CropCycle } from "@/lib/types/crop-cycle";
import type { Farm } from "@/lib/types/farm";
import type { Land } from "@/lib/types/land";
import type { Season } from "@/lib/types/season";
import type { Crop } from "@/lib/types/crop";

interface CropCycleDetailsProps {
  cycle: CropCycle;
  farm?: Farm;
  land?: Land;
  season?: Season;
  crop?: Crop;
}

export function CropCycleDetails({ cycle, farm, land, season, crop }: CropCycleDetailsProps) {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* رأس التفاصيل */}
      <div className="flex items-start justify-between border-b border-border/40 pb-4">
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

      {cycle.notes && (
        <div className="bg-paper-sunken/50 p-4 rounded-xl border border-border/40">
          <p className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-2">
            <Info className="h-3.5 w-3.5 text-indigo-500" />
            ملاحظات
          </p>
          <p className="text-sm text-ink leading-relaxed">{cycle.notes}</p>
        </div>
      )}
    </div>
  );
}
