"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CalendarRange, Plus, Leaf, Map as MapIcon, Activity, CheckCircle2, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { CropCycleForm } from "@/components/crop-cycles/crop-cycle-form";
import { useSeasons } from "@/lib/hooks/use-seasons";
import { useCropCycles, useCreateCropCycle, useMarkCropCycleHarvested, useDeleteCropCycle } from "@/lib/hooks/use-crop-cycles";
import { useLands } from "@/lib/hooks/use-lands";
import { useCrops } from "@/lib/hooks/use-crops";
import { formatDate } from "@/lib/utils";
import type { CropCycleSchema } from "@/components/crop-cycles/crop-cycle-schema";
import type { CropCycle } from "@/lib/types/crop-cycle";

function SeasonDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const { data: seasons, isLoading: loadingSeasons } = useSeasons();
  const { data: cropCycles, isLoading: loadingCycles } = useCropCycles();
  const { data: lands, isLoading: loadingLands } = useLands();
  const { data: crops, isLoading: loadingCrops } = useCrops();

  const createCropCycle = useCreateCropCycle();
  const markHarvested = useMarkCropCycleHarvested();
  const deleteCropCycle = useDeleteCropCycle();

  const [formOpen, setFormOpen] = useState(false);
  const [harvestingCycle, setHarvestingCycle] = useState<CropCycle | null>(null);
  const [deletingCycle, setDeletingCycle] = useState<CropCycle | null>(null);

  const season = seasons?.find((s) => s.id === id);
  const cycles = useMemo(() => cropCycles?.filter((c) => c.seasonId === id) || [], [cropCycles, id]);

  const landsById = useMemo(() => new Map(lands?.map(l => [l.id, l])), [lands]);
  const cropsById = useMemo(() => new Map(crops?.map(c => [c.id, c])), [crops]);

  const isLoading = loadingSeasons || loadingCycles || loadingLands || loadingCrops;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8 text-crop-500" />
      </div>
    );
  }

  if (!season) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-ink">الموسم غير موجود</h2>
        <Link href="/seasons" className="text-crop-600 hover:underline mt-2 inline-block">العودة لقائمة المواسم</Link>
      </div>
    );
  }

  const handleCreate = (values: CropCycleSchema) => {
    createCropCycle.mutate(values as any, { onSuccess: () => setFormOpen(false) });
  };

  const handleHarvest = () => {
    if (!harvestingCycle) return;
    markHarvested.mutate(harvestingCycle.id, { onSuccess: () => setHarvestingCycle(null) });
  };

  const handleDelete = () => {
    if (!deletingCycle) return;
    deleteCropCycle.mutate(deletingCycle.id, { onSuccess: () => setDeletingCycle(null) });
  };

  // Stats
  const activeCycles = cycles.filter(c => c.status === "نشطة").length;
  const harvestedCycles = cycles.filter(c => c.status === "محصودة").length;

  const farmTotalArea = lands?.reduce((acc, l) => acc + (l.areaInFeddan || 0), 0) || 0;
  const plantedArea = cycles.reduce((acc, c) => acc + (c.areaInFeddan || 0), 0);
  const plantedPercentage = farmTotalArea > 0 ? Math.min((plantedArea / farmTotalArea) * 100, 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/seasons">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-paper-sunken border shadow-sm bg-paper">
              <ArrowRight className="h-5 w-5 rtl:rotate-0 ltr:rotate-180" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-ink">{season.name}</h1>
              <Badge variant={season.status === "مفتوح" ? "default" : "neutral"} className="shadow-sm">
                {season.status}
              </Badge>
            </div>
            <p className="text-sm text-ink-muted mt-1">{season.type}</p>
          </div>
        </div>
        
        {season.status === "مفتوح" && (
          <Button onClick={() => setFormOpen(true)} className="shadow-md hover:shadow-lg transition-all gap-2">
            <Plus className="h-4 w-4" />
            زراعة محصول
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-amber-100 text-amber-600 p-3 rounded-xl shadow-sm">
              <MapIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-ink-muted mb-1">استغلال الأراضي</p>
              <div className="flex justify-between items-end">
                <p className="text-xl font-bold text-ink truncate">{plantedArea > 0 ? plantedArea.toFixed(2) : "0"} / {farmTotalArea.toFixed(1)} <span className="text-sm font-normal text-ink-muted">فدان</span></p>
                <span className="text-xs font-bold text-amber-600 mr-2">{plantedPercentage.toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-crop-100 text-crop-600 p-3 rounded-xl shadow-sm">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-muted">المحاصيل النشطة</p>
              <p className="text-2xl font-bold text-ink">{activeCycles}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl shadow-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-muted">تم حصادها</p>
              <p className="text-2xl font-bold text-ink">{harvestedCycles}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-sky-100 text-sky-600 p-3 rounded-xl shadow-sm">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-muted">الميزانية التقديرية</p>
              <p className="text-xl font-bold text-ink">{season.expectedBudget ? `${season.expectedBudget.toLocaleString()} ج.م` : "غير محددة"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4 border-t border-border/40">
        <h2 className="text-xl font-bold font-display text-ink mb-6 flex items-center gap-2">
          <Leaf className="h-5 w-5 text-crop-500" />
          دورات المحاصيل (Crop Cycles)
        </h2>
        
        {cycles.length === 0 ? (
          <div className="bg-paper-sunken/40 border border-border/50 rounded-3xl p-10 backdrop-blur-sm">
            <EmptyState
              icon={Leaf}
              title="لا توجد محاصيل مزروعة"
              description="لم تقم بإضافة أي محاصيل لهذا الموسم بعد. انقر على زر زراعة محصول للبدء."
              action={
                season.status === "مفتوح" && (
                  <Button onClick={() => setFormOpen(true)} className="mt-2 shadow-md">
                    <Plus className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                    زراعة محصول
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cycles.map((cycle) => (
              <Card key={cycle.id} className="group overflow-hidden rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant={cycle.status === "نشطة" ? "wheat" : cycle.status === "محصودة" ? "default" : "neutral"} className="shadow-sm">
                        {cycle.status}
                      </Badge>
                      <button
                        onClick={() => setDeletingCycle(cycle)}
                        className="rounded-xl p-2 text-ink-muted hover:bg-danger-bg hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-bold text-ink font-display mb-4">
                      {cropsById.get(cycle.cropId)?.name ?? "محصول غير معروف"}
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-ink-muted">
                        <div className="bg-paper-sunken p-1.5 rounded-md border border-border/40">
                          <MapIcon className="h-4 w-4 text-crop-500" />
                        </div>
                        <span className="font-medium text-ink/80">{landsById.get(cycle.landId)?.name ?? "أرض غير معروفة"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-ink-muted">
                        <div className="bg-paper-sunken p-1.5 rounded-md border border-border/40">
                          <Activity className="h-4 w-4 text-crop-500" />
                        </div>
                        <span className="font-medium text-ink/80">المساحة: <strong className="text-ink">{cycle.areaValue}</strong> {cycle.areaUnit === "feddan" ? "فدان" : "قيراط"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-ink-muted">
                        <div className="bg-paper-sunken p-1.5 rounded-md border border-border/40">
                          <CalendarRange className="h-4 w-4 text-crop-500" />
                        </div>
                        <span className="font-medium text-ink/80">{cycle.plantDate ? `زُرع في ${formatDate(cycle.plantDate)}` : "لم يُسجل تاريخ الزراعة"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {cycle.status === "نشطة" && (
                    <div className="bg-paper-sunken/30 p-4 border-t border-border/40 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => setHarvestingCycle(cycle)} className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        تسجيل الحصاد
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title="زراعة محصول جديد">
        <CropCycleForm
          farmId={season.farmId}
          seasonId={season.id}
          lands={lands ?? []}
          crops={crops ?? []}
          onSubmit={handleCreate}
          onCancel={() => setFormOpen(false)}
          loading={createCropCycle.isPending}
        />
      </Dialog>

      <ConfirmDialog
        open={!!harvestingCycle}
        onClose={() => setHarvestingCycle(null)}
        onConfirm={handleHarvest}
        title="تأكيد حصاد المحصول"
        description="هل أنت متأكد أنك تريد تسجيل حصاد هذا المحصول؟ سيتم تغيير حالته إلى محصودة."
        confirmLabel="نعم، تم الحصاد"
        loading={markHarvested.isPending}
      />

      <ConfirmDialog
        open={!!deletingCycle}
        onClose={() => setDeletingCycle(null)}
        onConfirm={handleDelete}
        title="حذف الدورة الزراعية"
        description="سيتم حذف هذه الدورة بالكامل ولن تظهر في الإحصائيات. هذا الإجراء لا يمكن التراجع عنه."
        loading={deleteCropCycle.isPending}
      />
    </div>
  );
}

export default function SeasonDetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8 text-crop-500" />
      </div>
    }>
      <SeasonDetailsContent />
    </Suspense>
  );
}
