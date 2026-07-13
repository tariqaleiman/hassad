"use client";

import { useMemo, useState } from "react";
import { Plus, MapPin, Droplets, Pencil, Trash2, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { LandForm } from "@/components/lands/land-form";
import { useCreateLand, useDeleteLand, useLands, useUpdateLand } from "@/lib/hooks/use-lands";
import { useFarms } from "@/lib/hooks/use-farms";
import type { Land } from "@/lib/types/land";
import type { LandSchema } from "@/components/lands/land-schema";

export default function LandsPage() {
  const { data: lands, isLoading: loadingLands } = useLands();
  const { data: farms, isLoading: loadingFarms } = useFarms();
  const createLand = useCreateLand();
  const updateLand = useUpdateLand();
  const deleteLand = useDeleteLand();

  const [farmFilter, setFarmFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingLand, setEditingLand] = useState<Land | null>(null);
  const [deletingLand, setDeletingLand] = useState<Land | null>(null);

  const farmsById = useMemo(
    () => new Map((farms ?? []).map((f) => [f.id, f])),
    [farms]
  );

  const filtered = useMemo(() => {
    if (!lands) return [];
    if (!farmFilter) return lands;
    return lands.filter((l) => l.farmId === farmFilter);
  }, [lands, farmFilter]);

  const isLoading = loadingLands || loadingFarms;
  const hasFarms = (farms?.length ?? 0) > 0;

  const openCreate = () => {
    setEditingLand(null);
    setFormOpen(true);
  };

  const openEdit = (land: Land) => {
    setEditingLand(land);
    setFormOpen(true);
  };

  const handleSubmit = (values: LandSchema) => {
    if (editingLand) {
      updateLand.mutate(
        { id: editingLand.id, values },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createLand.mutate(values, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (!deletingLand) return;
    deleteLand.mutate(deletingLand.id, { onSuccess: () => setDeletingLand(null) });
  };

  if (!isLoading && !hasFarms) {
    return (
      <EmptyState
        icon={Sprout}
        title="أضف مزرعة أولًا"
        description="قطعة الأرض لازم تكون تابعة لمزرعة. ابدأ بإضافة مزرعة من صفحة إدارة المزارع."
        action={
          <a href="/farms">
            <Button>الذهاب إلى المزارع</Button>
          </a>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={farmFilter}
          onChange={(e) => setFarmFilter(e.target.value)}
          className="sm:max-w-xs"
        >
          <option value="">كل المزارع</option>
          {farms?.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </Select>
        <Button onClick={openCreate} disabled={!hasFarms}>
          <Plus className="h-4 w-4" />
          إضافة قطعة أرض
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="لا توجد أراضٍ مسجلة"
          description="أضف أول قطعة أرض لتبدأ في إنشاء المواسم والمحاصيل عليها."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              إضافة قطعة أرض
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((land) => (
            <Card key={land.id} className="group relative">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-crop-50 text-crop-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(land)}
                      aria-label="تعديل"
                      className="rounded-md p-1.5 text-ink-muted hover:bg-paper-sunken hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingLand(land)}
                      aria-label="حذف"
                      className="rounded-md p-1.5 text-ink-muted hover:bg-danger-bg hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-display text-base font-bold text-ink">{land.name}</h3>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {farmsById.get(land.farmId)?.name ?? "مزرعة غير معروفة"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="tabular inline-flex items-center rounded-full bg-wheat-100 px-2.5 py-1 text-xs font-medium text-wheat-600">
                    {land.areaInFeddan} فدان
                  </span>
                  {land.irrigationType && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-500">
                      <Droplets className="h-3 w-3" />
                      {land.irrigationType}
                    </span>
                  )}
                  {land.soilType && (
                    <span className="inline-flex items-center rounded-full bg-soil-100 px-2.5 py-1 text-xs font-medium text-soil-600">
                      {land.soilType}
                    </span>
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
        title={editingLand ? "تعديل قطعة الأرض" : "إضافة قطعة أرض جديدة"}
      >
        <LandForm
          defaultValues={editingLand}
          farms={farms ?? []}
          defaultFarmId={farmFilter}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          loading={createLand.isPending || updateLand.isPending}
        />
      </Dialog>

      <ConfirmDialog
        open={!!deletingLand}
        onClose={() => setDeletingLand(null)}
        onConfirm={handleDelete}
        title={`حذف قطعة أرض "${deletingLand?.name}"؟`}
        description="سيتم نقلها إلى سلة المحذوفات (حذف منطقي) ويمكن استعادتها لاحقًا."
        loading={deleteLand.isPending}
      />
    </div>
  );
}
