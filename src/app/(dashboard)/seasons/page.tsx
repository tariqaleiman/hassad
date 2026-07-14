"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, CalendarRange, Pencil, Trash2, Lock, Sprout, Wallet, ArrowLeft, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { formatDate, cn } from "@/lib/utils";
import type { Season } from "@/lib/types/season";
import type { SeasonSchema } from "@/components/seasons/season-schema";

const seasonColors: Record<string, string> = {
  "صيفي": "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30",
  "شتوي": "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30",
  "مستديم": "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
  "نيلي": "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30",
  "محيّر": "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
  "مخصص": "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30",
};

export default function SeasonsPage() {
  const { data: seasons, isLoading: loadingSeasons } = useSeasons();
  const { data: farms, isLoading: loadingFarms } = useFarms();
  const createSeason = useCreateSeason();
  const updateSeason = useUpdateSeason();
  const deleteSeason = useDeleteSeason();
  const closeSeason = useCloseSeason();

  const [formOpen, setFormOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [deletingSeason, setDeletingSeason] = useState<Season | null>(null);
  const [closingSeason, setClosingSeason] = useState<Season | null>(null);

  const isLoading = loadingSeasons || loadingFarms;
  const activeFarm = farms?.[0];

  const filteredSeasons = seasons?.filter((s) => s.farmId === activeFarm?.id) || [];

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

  if (!isLoading && !activeFarm) {
    return (
      <EmptyState
        icon={Sprout}
        title="مرحباً بك في حصاد!"
        description="نظام المواسم يعتمد على المزرعة. الرجاء إضافة مزرعتك الأولى للبدء في تنظيم مواسمك الزراعية بكل فخامة وسهولة."
        action={
          <Link href="/farms">
            <Button className="shadow-lg hover:shadow-xl transition-all">إعداد مزرعتي الآن</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink">المواسم الزراعية</h1>
          <p className="text-ink-muted text-sm mt-1">أدر مواسمك الزراعية بدقة وراقب ميزانيتك ومحاصيلك.</p>
        </div>
        <Button onClick={openCreate} disabled={!activeFarm} className="shadow-md hover:shadow-lg transition-all gap-2">
          <Plus className="h-4 w-4" />
          موسم جديد
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8 text-crop-500" />
        </div>
      ) : filteredSeasons.length === 0 ? (
        <div className="bg-paper-sunken/40 border border-border/50 rounded-3xl p-10 backdrop-blur-sm">
          <EmptyState
            icon={CalendarRange}
            title="ابدأ موسمك الزراعي الأول 🌾"
            description="كل نجاح يبدأ بخطوة. قم بإنشاء موسمك الأول لتبدأ في تسجيل دورات المحاصيل وتتبع النفقات بكل احترافية."
            action={
              <Button onClick={openCreate} className="mt-2 shadow-lg hover:shadow-xl transition-all px-8">
                <Plus className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                إنشاء موسم
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredSeasons.map((season) => (
            <Card key={season.id} className="group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-paper to-paper-sunken border-border/40">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-crop-400 to-crop-600 opacity-0 transition-opacity group-hover:opacity-100" />
              
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="neutral" className={cn("px-3 py-1 font-medium border text-xs shadow-sm", seasonColors[season.type] || seasonColors["مخصص"])}>
                      {season.type}
                    </Badge>
                    
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 bg-paper/80 backdrop-blur-md rounded-full shadow-sm border border-border/50 p-1">
                      <button
                        onClick={(e) => { e.preventDefault(); openEdit(season); }}
                        className="rounded-full p-2 text-ink-muted hover:bg-crop-50 hover:text-crop-600 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); setDeletingSeason(season); }}
                        className="rounded-full p-2 text-ink-muted hover:bg-danger-bg hover:text-danger transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <Link href={`/seasons/${season.id}`} className="block focus:outline-none group/link">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-bold text-ink group-hover/link:text-crop-600 transition-colors">{season.name}</h3>
                      <ArrowLeft className="h-5 w-5 text-ink-muted opacity-0 -translate-x-4 transition-all group-hover/link:opacity-100 group-hover/link:translate-x-0 group-hover/link:text-crop-600" />
                    </div>
                    {season.description && (
                      <p className="mt-2 text-sm text-ink-muted line-clamp-2 leading-relaxed">
                        {season.description}
                      </p>
                    )}
                  </Link>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-ink-muted">
                      <CalendarRange className="h-4 w-4 text-crop-500/70" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-ink-lighter uppercase tracking-wider">الفترة الزمنية</span>
                        <span className="font-medium text-ink">
                          {season.startDate ? formatDate(season.startDate) : "لم يبدأ بعد"}
                          {season.endDate ? ` — ${formatDate(season.endDate)}` : " — مستمر"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-ink-muted">
                      <Wallet className="h-4 w-4 text-crop-500/70" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-ink-lighter uppercase tracking-wider">الميزانية التقديرية</span>
                        <span className="font-medium text-ink">
                          {season.expectedBudget ? `${season.expectedBudget.toLocaleString()} ج.م` : "لم تُحدد"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50 bg-paper-sunken/50 p-4 flex items-center justify-between">
                  <Badge variant={season.status === "مفتوح" ? "default" : "neutral"} className="shadow-sm">
                    {season.status}
                  </Badge>
                  
                  {season.status === "مفتوح" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-ink-muted hover:text-ink hover:bg-paper font-medium"
                      onClick={() => setClosingSeason(season)}
                    >
                      <Lock className="h-3.5 w-3.5 rtl:ml-1.5 ltr:mr-1.5" />
                      إغلاق الموسم
                    </Button>
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
        title={editingSeason ? "تعديل بيانات الموسم" : "إنشاء موسم جديد"}
      >
        <SeasonForm
          defaultValues={editingSeason}
          farmId={activeFarm?.id ?? ""}
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
        description="سيتم نقله إلى سلة المحذوفات. الإجراء قابل للتراجع عبر التواصل مع الدعم."
        loading={deleteSeason.isPending}
      />

      <ConfirmDialog
        open={!!closingSeason}
        onClose={() => setClosingSeason(null)}
        onConfirm={handleClose}
        title={`إغلاق موسم "${closingSeason?.name}"؟`}
        description="سيُسجَّل تاريخ اليوم كتاريخ نهاية الموسم. يمكنك إعادة فتحه لاحقاً من التفاصيل إذا لزم الأمر."
        confirmLabel="تأكيد الإغلاق"
        loading={closeSeason.isPending}
      />
    </div>
  );
}
