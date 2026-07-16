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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
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

type Tab = "catalog" | "cycles";

export default function CropsPage() {
  const [tab, setTab] = useState<Tab>("cycles");

  return (
    <div className="space-y-5">
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
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
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
        <div className="overflow-x-auto rounded-xl border border-border bg-paper-raised">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs text-ink-muted">
                <th className="p-3 text-start font-medium">المحصول</th>
                <th className="p-3 text-start font-medium">التصنيف</th>
                <th className="p-3 text-start font-medium">نوع الحصاد</th>
                <th className="p-3 text-start font-medium">وحدة الإنتاج</th>
                <th className="p-3 text-start font-medium">وحدة التقاوي</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {crops.map((crop) => (
                <tr key={crop.id} className="group border-b border-border last:border-0">
                  <td className="p-3 font-medium text-ink">{crop.name}</td>
                  <td className="p-3 text-ink-muted">{crop.category || "—"}</td>
                  <td className="p-3">
                    <Badge variant="wheat">{crop.harvestType}</Badge>
                  </td>
                  <td className="p-3 text-ink-muted">{crop.productUnit}</td>
                  <td className="p-3 text-ink-muted">{crop.seedUnit || "—"}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(crop)}
                        aria-label="تعديل"
                        className="rounded-md p-1.5 text-ink-muted hover:bg-paper-sunken hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCrop(crop)}
                        aria-label="حذف"
                        className="rounded-md p-1.5 text-ink-muted hover:bg-danger-bg hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

  if (!isLoading && !hasPrerequisites) {
    return (
      <EmptyState
        icon={Sprout}
        title="أكمل الخطوات الأساسية أولًا"
        description="لإنشاء دورة محصول تحتاج: مزرعة، وقطعة أرض بداخلها، وموسم مفتوح."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={openCreate} disabled={!hasPrerequisites}>
          <Plus className="h-4 w-4" />
          دورة محصول جديدة
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : !cycles || cycles.length === 0 ? (
        <EmptyState
          icon={Wheat}
          title="لا توجد دورات محاصيل بعد"
          description="أنشئ أول دورة محصول لتبدأ في تسجيل العمليات الزراعية عليها."
          action={
            <Button onClick={openCreate}>
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
                        onClick={() => setViewingCycle(cycle)}
                        aria-label="تفاصيل"
                        className="rounded-md p-1.5 text-ink-muted opacity-0 transition-opacity hover:bg-paper-sunken hover:text-ink group-hover:opacity-100"
                      >
                        <Info className="h-4 w-4" />
                      </button>
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
                      <span className="font-bold text-ink">{totalSpent.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-ink-muted"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> الإيرادات:</span>
                      <span className="font-bold text-ink">{actualRevenue > 0 ? actualRevenue.toLocaleString() : expectedRevenue ? `${expectedRevenue.toLocaleString()} (متوقع)` : "0"} ج.م</span>
                    </div>
                    {cycle.status === "محصودة" && netProfit !== 0 && (
                      <div className="flex items-center justify-between text-xs bg-paper-sunken p-1.5 rounded-md mt-1 border border-border/50">
                        <span className="font-medium text-ink-muted">صافي الربح:</span>
                        <span className={cn("font-bold", netProfit > 0 ? "text-emerald-600" : "text-danger")}>
                          {netProfit > 0 ? "+" : ""}{netProfit.toLocaleString()} ج.م
                        </span>
                      </div>
                    )}
                  </div>

                  {cycle.status === "نشطة" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => setHarvestingCycle(cycle)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      تسجيل الحصاد
                    </Button>
                  )}
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
