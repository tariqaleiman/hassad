"use client";

import { useMemo, useState } from "react";
import { Plus, CalendarRange, Pencil, Trash2, Lock, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { SeasonForm } from "@/components/seasons/season-form";
import {
  useCloseSeason,
  useCreateSeason,
  useDeleteSeason,
  useSeasons,
  useUpdateSeason,
} from "@/lib/hooks/use-seasons";
import { useFarms } from "@/lib/hooks/use-farms";
import { formatDate } from "@/lib/utils";
import type { Season } from "@/lib/types/season";
import type { SeasonSchema } from "@/components/seasons/season-schema";

export default function SeasonsPage() {
  const { data: seasons, isLoading: loadingSeasons } = useSeasons();
  const { data: farms, isLoading: loadingFarms } = useFarms();
  const createSeason = useCreateSeason();
  const updateSeason = useUpdateSeason();
  const deleteSeason = useDeleteSeason();
  const closeSeason = useCloseSeason();

  const [farmFilter, setFarmFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [deletingSeason, setDeletingSeason] = useState<Season | null>(null);
  const [closingSeason, setClosingSeason] = useState<Season | null>(null);

  const farmsById = useMemo(
    () => new Map((farms ?? []).map((f) => [f.id, f])),
    [farms]
  );

  const filtered = useMemo(() => {
    if (!seasons) return [];
    if (!farmFilter) return seasons;
    return seasons.filter((s) => s.farmId === farmFilter);
  }, [seasons, farmFilter]);

  const isLoading = loadingSeasons || loadingFarms;
  const hasFarms = (farms?.length ?? 0) > 0;

  const openCreate = () => {
    setEditingSeason(null);
    setFormOpen(true);
  };

  const openEdit = (season: Season) => {
    setEditingSeason(season);
    setFormOpen(true);
  };

  const handleSubmit = (values: SeasonSchema) => {
    if (editingSeason) {
      updateSeason.mutate(
        { id: editingSeason.id, values },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createSeason.mutate(values, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (!deletingSeason) return;
    deleteSeason.mutate(deletingSeason.id, { onSuccess: () => setDeletingSeason(null) });
  };

  const handleClose = () => {
    if (!closingSeason) return;
    closeSeason.mutate(closingSeason.id, { onSuccess: () => setClosingSeason(null) });
  };

  if (!isLoading && !hasFarms) {
    return (
      <EmptyState
        icon={Sprout}
        title="أضف مزرعة أولًا"
        description="الموسم لازم يكون تابع لمزرعة. ابدأ بإضافة مزرعة من صفحة إدارة المزارع."
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
          إنشاء موسم
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="لا توجد مواسم مسجلة"
          description="أنشئ أول موسم لتبدأ في تسجيل دورات المحاصيل والعمليات الزراعية."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              إنشاء موسم
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((season) => (
            <Card key={season.id} className="group relative">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-crop-50 text-crop-600">
                    <CalendarRange className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(season)}
                      aria-label="تعديل"
                      className="rounded-md p-1.5 text-ink-muted hover:bg-paper-sunken hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSeason(season)}
                      aria-label="حذف"
                      className="rounded-md p-1.5 text-ink-muted hover:bg-danger-bg hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-ink">{season.name}</h3>
                  <Badge variant={season.status === "مفتوح" ? "default" : "neutral"}>
                    {season.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {farmsById.get(season.farmId)?.name ?? "مزرعة غير معروفة"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                  <Badge variant="wheat">{season.type}</Badge>
                  <span>بدأ في {formatDate(season.startDate)}</span>
                  {season.endDate && <span>— أُغلق في {formatDate(season.endDate)}</span>}
                </div>

                {season.status === "مفتوح" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => setClosingSeason(season)}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    إغلاق الموسم
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingSeason ? "تعديل بيانات الموسم" : "إنشاء موسم جديد"}
      >
        <SeasonForm
          defaultValues={editingSeason}
          farms={farms ?? []}
          defaultFarmId={farmFilter}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          loading={createSeason.isPending || updateSeason.isPending}
        />
      </Dialog>

      <ConfirmDialog
        open={!!deletingSeason}
        onClose={() => setDeletingSeason(null)}
        onConfirm={handleDelete}
        title={`حذف موسم "${deletingSeason?.name}"؟`}
        description="سيتم نقله إلى سلة المحذوفات (حذف منطقي) ويمكن استعادته لاحقًا."
        loading={deleteSeason.isPending}
      />

      <ConfirmDialog
        open={!!closingSeason}
        onClose={() => setClosingSeason(null)}
        onConfirm={handleClose}
        title={`إغلاق موسم "${closingSeason?.name}"؟`}
        description="سيُسجَّل تاريخ اليوم كتاريخ نهاية الموسم. لا يمكن التراجع عن هذا الإجراء من هذه الشاشة."
        confirmLabel="إغلاق الموسم"
        loading={closeSeason.isPending}
      />
    </div>
  );
}
