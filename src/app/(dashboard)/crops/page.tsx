"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Wheat,
  Pencil,
  Trash2,
  Download,
  CheckCircle2,
  Sprout,
  Info,
  TrendingUp,
  Wallet,
  Receipt,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { CropForm } from "@/components/crops/crop-form";
import { CropCycleForm } from "@/components/crops/crop-cycle-form";
import { CropCycleDetails } from "@/components/crops/crop-cycle-details";
import { HarvestForm } from "@/components/crop-cycles/harvest-form";
import type { HarvestSchema } from "@/components/crop-cycles/harvest-schema";
import {
  useCreateCrop,
  useCrops,
  useDeleteCrop,
  useSeedCrops,
  useUpdateCrop,
} from "@/lib/hooks/use-crops";
import {
  useCreateCropCycle,
  useCropCycles,
  useUpdateCropCycle,
  useDeleteCropCycle,
  useMarkCropCycleHarvested,
} from "@/lib/hooks/use-crop-cycles";
import { useFarms } from "@/lib/hooks/use-farms";
import { useLands } from "@/lib/hooks/use-lands";
import { useSeasons } from "@/lib/hooks/use-seasons";
import { useOperations } from "@/lib/hooks/use-operations";
import { formatDate } from "@/lib/utils";
import type { Crop } from "@/lib/types/crop";
import type { CropCycle } from "@/lib/types/crop-cycle";
import type { CropSchema } from "@/components/crops/crop-schema";
import type { CropCycleSchema } from "@/components/crops/crop-cycle-schema";
import { useCurrency } from "@/lib/hooks/use-currency";

type Tab = "catalog" | "cycles";

export default function CropsPage() {
  const { formatMoney, currency } = useCurrency();
  const [tab, setTab] = useState<Tab>("cycles");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Wheat className="h-5 w-5" />
            </div>
            المحاصيل الزراعية
          </h1>
          <p className="text-ink-muted text-sm mt-1">إدارة المحاصيل ودوراتها الزراعية ومتابعة الحصاد</p>
        </div>
      </div>

      <div className="inline-flex rounded-lg border border-border bg-paper-raised p-1">
        <TabButton active={tab === "cycles"} onClick={() => setTab("cycles")}>
          دورات المحاصيل
        </TabButton>
        <TabButton active={tab === "catalog"} onClick={() => setTab("catalog")}>
          قاعدة بيانات المحاصيل
        </TabButton>
      </div>

      {tab === "cycles" ? <CycleTab /> : <CatalogTab />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-crop-500 text-white dark:text-black" : "text-ink-muted hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

/* ---------------------------- قاعدة المحاصيل ---------------------------- */

function CatalogTab() {
  const { data: crops, isLoading } = useCrops();
  const createCrop = useCreateCrop();
  const updateCrop = useUpdateCrop();
  const deleteCrop = useDeleteCrop();
  const seedCrops = useSeedCrops();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [deletingCrop, setDeletingCrop] = useState<Crop | null>(null);

  const openCreate = () => {
    setEditingCrop(null);
    setFormOpen(true);
  };
  const openEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setFormOpen(true);
  };

  const handleSubmit = (values: CropSchema) => {
    if (editingCrop) {
      updateCrop.mutate(
        { id: editingCrop.id, values },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createCrop.mutate(values, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (!deletingCrop) return;
    deleteCrop.mutate(deletingCrop.id, { onSuccess: () => setDeletingCrop(null) });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          قاعدة بيانات مرجعية للمحاصيل، تُستخدم عند إنشاء أي دورة محصول جديدة.
        </p>
        <div className="flex gap-2">
          {(crops?.length ?? 0) === 0 && (
            <Button
              variant="wheat"
              onClick={() => seedCrops.mutate()}
              loading={seedCrops.isPending}
            >
              <Download className="h-4 w-4" />
              تحميل القائمة الجاهزة
            </Button>
          )}
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            إضافة محصول
          </Button>
        </div>
      </div>

      {isLoading ? (
        <PageSkeleton />
      ) : !crops || crops.length === 0 ? (
        <EmptyState
          icon={Wheat}
          title="قاعدة بيانات المحاصيل فارغة"
          description="حمّل القائمة الجاهزة لمعظم المحاصيل المصرية، أو أضف محاصيلك الخاصة."
          action={
            <Button variant="wheat" onClick={() => seedCrops.mutate()} loading={seedCrops.isPending}>
              <Download className="h-4 w-4" />
              تحميل القائمة الجاهزة
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {crops.map((crop) => (
            <Card key={crop.id} className="group overflow-hidden rounded-2xl border-border/50 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="relative h-40 bg-crop-100 dark:bg-crop-900/30">
                {crop.imageUrl ? (
                  <img src={crop.imageUrl} alt={crop.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-crop-500/30">
                    <Wheat className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex opacity-0 transition-opacity group-hover:opacity-100 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg shadow-sm border border-border/50">
                  <button
                    onClick={() => openEdit(crop)}
                    className="p-2 text-ink-muted hover:text-ink transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <div className="w-px bg-border/50 my-2" />
                  <button
                    onClick={() => setDeletingCrop(crop)}
                    className="p-2 text-ink-muted hover:text-danger transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge variant="wheat" className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-black/90">
                    {crop.harvestType}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-lg font-bold text-ink">{crop.name}</h3>
                  {crop.category && <span className="text-xs font-bold text-ink-muted bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md border border-border/50">{crop.category}</span>}
                </div>
                <div className="space-y-1.5 mt-3 text-sm text-ink-muted">
                  <div className="flex justify-between items-center bg-paper-sunken px-2.5 py-1.5 rounded-md border border-border/50">
                    <span>وحدة الإنتاج:</span>
                    <span className="font-bold text-ink">{crop.productUnit}</span>
                  </div>
                  {crop.seedUnit && (
                    <div className="flex justify-between items-center bg-paper-sunken px-2.5 py-1.5 rounded-md border border-border/50">
                      <span>وحدة التقاوي:</span>
                      <span className="font-bold text-ink">{crop.seedUnit}</span>
                    </div>
                  )}
                  {crop.varieties && crop.varieties.length > 0 && (
                    <div className="flex justify-between items-center bg-paper-sunken px-2.5 py-1.5 rounded-md border border-border/50">
                      <span>عدد الأصناف المسجلة:</span>
                      <span className="font-bold text-ink">{crop.varieties.length}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingCrop ? "تعديل بيانات المحصول" : "إضافة محصول جديد"}
      >
        <CropForm
          defaultValues={editingCrop}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          loading={createCrop.isPending || updateCrop.isPending}
        />
      </Dialog>

      <ConfirmDialog
        open={!!deletingCrop}
        onClose={() => setDeletingCrop(null)}
        onConfirm={handleDelete}
        title={`حذف محصول "${deletingCrop?.name}"؟`}
        description="سيتم نقله إلى سلة المحذوفات (حذف منطقي) ويمكن استعادته لاحقًا."
        loading={deleteCrop.isPending}
      />
    </div>
  );
}

/* ---------------------------- دورات المحاصيل ---------------------------- */

function CycleTab() {
  const { data: cycles, isLoading: loadingCycles } = useCropCycles();
  const { data: farms, isLoading: loadingFarms } = useFarms();
  const { data: lands, isLoading: loadingLands } = useLands();
  const { data: seasons, isLoading: loadingSeasons } = useSeasons();
  const { data: crops, isLoading: loadingCrops } = useCrops();
  const { data: operations, isLoading: loadingOps } = useOperations();

  const createCycle = useCreateCropCycle();
  const updateCycle = useUpdateCropCycle();
  const markHarvested = useMarkCropCycleHarvested();
  const deleteCycle = useDeleteCropCycle();
  const { formatMoney, currency } = useCurrency();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<CropCycle | null>(null);
  const [viewingCycle, setViewingCycle] = useState<CropCycle | null>(null);
  const [deletingCycle, setDeletingCycle] = useState<CropCycle | null>(null);
  const [harvestingCycle, setHarvestingCycle] = useState<CropCycle | null>(null);

  const openCreate = () => {
    setEditingCycle(null);
    setFormOpen(true);
  };

  const openEdit = (cycle: CropCycle) => {
    setEditingCycle(cycle);
    setFormOpen(true);
  };

  const isLoading =
    loadingCycles || loadingFarms || loadingLands || loadingSeasons || loadingCrops || loadingOps;

  const landsById = useMemo(() => new Map((lands ?? []).map((l) => [l.id, l])), [lands]);
  const seasonsById = useMemo(
    () => new Map((seasons ?? []).map((s) => [s.id, s])),
    [seasons]
  );
  const cropsById = useMemo(() => new Map((crops ?? []).map((c) => [c.id, c])), [crops]);
  const farmsById = useMemo(() => new Map((farms ?? []).map((f) => [f.id, f])), [farms]);

  const hasPrerequisites =
    (farms?.length ?? 0) > 0 && (lands?.length ?? 0) > 0 && (seasons?.length ?? 0) > 0;

  const handleSubmit = (values: CropCycleSchema) => {
    if (editingCycle) {
      updateCycle.mutate(
        { id: editingCycle.id, values },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createCycle.mutate(values, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (!deletingCycle) return;
    deleteCycle.mutate(deletingCycle.id, { onSuccess: () => setDeletingCycle(null) });
  };

  const handleHarvest = (harvestData: HarvestSchema) => {
    if (!harvestingCycle) return;
    markHarvested.mutate({ id: harvestingCycle.id, harvestData }, { onSuccess: () => setHarvestingCycle(null) });
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!hasPrerequisites && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            ملاحظة: لإنشاء دورة محصول جديدة، تأكد من إعداد المزرعة، قطعة الأرض، والموسم الزراعي أولاً.
          </p>
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={openCreate} disabled={!hasPrerequisites}>
          <Plus className="h-4 w-4" />
          دورة محصول جديدة
        </Button>
      </div>

      {!cycles || cycles.length === 0 ? (
        <EmptyState
          icon={Wheat}
          title="لا توجد دورات محاصيل بعد"
          description="أنشئ أول دورة محصول لتبدأ في تسجيل العمليات الزراعية عليها."
          action={
            <Button onClick={openCreate} disabled={!hasPrerequisites}>
              <Plus className="h-4 w-4" />
              دورة محصول جديدة
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cycles.map((cycle) => {
            const crop = cropsById.get(cycle.cropId);
            const cycleOps = operations?.filter(op => op.cropCycleId === cycle.id) || [];
            const totalSpent = cycleOps.reduce((acc, op) => acc + (op.totalCost || 0), 0);
            const actualRevenue = cycle.actualRevenue || 0;
            const expectedRevenue = cycle.expectedRevenue || 0;
            const netProfit = actualRevenue - totalSpent;
            
            return (
              <Card key={cycle.id} className="group relative">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-crop-50 text-crop-600">
                      <Wheat className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={cycle.status === "نشطة" ? "default" : "neutral"}>
                        {cycle.status}
                      </Badge>
                      <button
                        onClick={() => openEdit(cycle)}
                        aria-label="تعديل"
                        className="rounded-md p-1.5 text-ink-muted opacity-0 transition-opacity hover:bg-paper-sunken hover:text-ink group-hover:opacity-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCycle(cycle)}
                        aria-label="حذف"
                        className="rounded-md p-1.5 text-ink-muted opacity-0 transition-opacity hover:bg-danger-bg hover:text-danger group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display text-base font-bold text-ink">
                    {crop?.name ?? "محصول غير معروف"}
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {farmsById.get(cycle.farmId)?.name} — {landsById.get(cycle.landId)?.name}
                  </p>

                  <div className="mt-3 space-y-1 text-xs text-ink-muted">
                    <p>الموسم: {seasonsById.get(cycle.seasonId)?.name ?? "—"}</p>
                    {cycle.plantDate && <p>تاريخ الزراعة: {formatDate(cycle.plantDate)}</p>}
                    {cycle.harvestDate && <p>تاريخ الحصاد: {formatDate(cycle.harvestDate)}</p>}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-ink-muted"><Receipt className="h-3.5 w-3.5 text-amber-500" /> المصروفات:</span>
                      <span className="font-bold text-ink">{formatMoney(totalSpent)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-ink-muted"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> الإيرادات:</span>
                      <span className="font-bold text-ink">{actualRevenue > 0 ? actualRevenue.toLocaleString() : expectedRevenue ? `${expectedRevenue.toLocaleString()} (متوقع)` : "0"} ${currency}</span>
                    </div>
                    {cycle.status === "محصودة" && netProfit !== 0 && (
                      <div className="flex items-center justify-between text-xs bg-paper-sunken p-1.5 rounded-md mt-1 border border-border/50">
                        <span className="font-medium text-ink-muted">صافي الربح:</span>
                        <span className={cn("font-bold", netProfit > 0 ? "text-emerald-600" : "text-danger")}>
                          {netProfit > 0 ? "+" : ""}{formatMoney(netProfit)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/40 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-crop-600 border-crop-200 hover:bg-crop-50"
                      onClick={() => setViewingCycle(cycle)}
                    >
                      <Calendar className="h-3.5 w-3.5 ml-1" />
                      برنامج المتابعة والتفاصيل
                    </Button>
                    
                    {cycle.status === "نشطة" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setHarvestingCycle(cycle)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
                        تسجيل الحصاد
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title={editingCycle ? "تعديل دورة المحصول" : "دورة محصول جديدة"}>
        <CropCycleForm
          farms={farms ?? []}
          lands={lands ?? []}
          seasons={seasons ?? []}
          crops={crops ?? []}
          defaultValues={editingCycle}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          loading={createCycle.isPending || updateCycle.isPending}
        />
      </Dialog>

      <Dialog open={!!viewingCycle} onClose={() => setViewingCycle(null)} title="تفاصيل الدورة الزراعية" className="max-w-2xl">
        {viewingCycle && (
          <CropCycleDetails 
            cycle={viewingCycle}
            farm={farmsById.get(viewingCycle.farmId)}
            land={landsById.get(viewingCycle.landId)}
            season={seasonsById.get(viewingCycle.seasonId)}
            crop={cropsById.get(viewingCycle.cropId)}
            operations={operations?.filter(op => op.cropCycleId === viewingCycle.id) || []}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={!!deletingCycle}
        onClose={() => setDeletingCycle(null)}
        onConfirm={handleDelete}
        title="حذف دورة المحصول؟"
        description="سيتم نقلها إلى سلة المحذوفات (حذف منطقي) ويمكن استعادتها لاحقًا."
        loading={deleteCycle.isPending}
      />

      <Dialog 
        open={!!harvestingCycle} 
        onClose={() => setHarvestingCycle(null)} 
        title="تسجيل حصاد المحصول"
        className="max-w-xl"
      >
        {harvestingCycle && (
          <HarvestForm
            cycle={harvestingCycle}
            onSubmit={handleHarvest}
            onCancel={() => setHarvestingCycle(null)}
            loading={markHarvested.isPending}
          />
        )}
      </Dialog>
    </div>
  );
}
