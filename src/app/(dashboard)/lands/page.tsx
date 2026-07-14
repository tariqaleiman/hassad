"use client";

import { useState } from "react";
import { Plus, MapPin, Droplets, Pencil, Trash2, Sprout, Briefcase, Handshake, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { LandForm } from "@/components/lands/land-form";
import { useCreateLand, useDeleteLand, useLands, useUpdateLand } from "@/lib/hooks/use-lands";
import { useFarms } from "@/lib/hooks/use-farms";
import type { Land, OwnershipCategory } from "@/lib/types/land";
import type { LandSchema } from "@/components/lands/land-schema";

export default function LandsPage() {
  const { data: lands, isLoading: loadingLands } = useLands();
  const { data: farms, isLoading: loadingFarms } = useFarms();
  const createLand = useCreateLand();
  const updateLand = useUpdateLand();
  const deleteLand = useDeleteLand();

  const [formOpen, setFormOpen] = useState(false);
  const [editingLand, setEditingLand] = useState<Land | null>(null);
  const [deletingLand, setDeletingLand] = useState<Land | null>(null);

  const myFarm = farms?.[0];
  const isLoading = loadingLands || loadingFarms;

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

  if (!isLoading && !myFarm) {
    return (
      <EmptyState
        icon={Sprout}
        title="أضف مزرعة أولًا"
        description="قطعة الأرض لازم تكون تابعة لمزرعة أو كيان. ابدأ بإعداد بيانات مزرعتك أولاً."
        action={
          <a href="/farms">
            <Button>الذهاب إلى إعداد المزرعة</Button>
          </a>
        }
      />
    );
  }

  const getTenureDetails = (category: OwnershipCategory) => {
    switch (category) {
      case "owned_full": return { label: "مملوكة", icon: Landmark, color: "text-crop-600", bg: "bg-crop-50" };
      case "owned_partner": return { label: "مملوكة (شراكة)", icon: Handshake, color: "text-sky-600", bg: "bg-sky-50" };
      case "rented_cash": return { label: "إيجار نقدي", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" };
      case "rented_crop_share": return { label: "مزارعة (مشاركة)", icon: Sprout, color: "text-emerald-600", bg: "bg-emerald-50" };
      case "rented_partner": return { label: "مستأجرة (إدارة مشتركة)", icon: Handshake, color: "text-indigo-600", bg: "bg-indigo-50" };
      default: return { label: "غير محدد", icon: MapPin, color: "text-ink-muted", bg: "bg-paper-sunken" };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 md:px-0">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">الأراضي</h2>
          <p className="text-ink-muted mt-1 text-sm">إدارة الحيازات والمساحات التابعة للمزرعة</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-full px-6 shadow-sm">
          <Plus className="h-4 w-4" />
          إضافة قطعة أرض
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-crop-500" />
        </div>
      ) : lands?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-paper-sunken/20 p-12 text-center mt-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-wheat-100 text-wheat-600 mb-4 shadow-sm">
            <MapPin className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-2">لا توجد أراضي مسجلة</h3>
          <p className="text-sm text-ink-muted max-w-md mb-8">
            قم بإضافة قطع الأراضي التي تديرها، سواء كانت مملوكة لك بالكامل، أو بنظام الإيجار، أو المزارعة والمشاركة.
          </p>
          <Button onClick={openCreate} className="gap-2 rounded-full px-8 py-6 text-base shadow-md shadow-wheat-500/20 bg-wheat-500 hover:bg-wheat-600 text-white">
            <Plus className="h-5 w-5" />
            إضافة أول قطعة أرض
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lands?.map((land) => {
            const tenureInfo = getTenureDetails(land.tenure?.category || "owned_full");
            const TenureIcon = tenureInfo.icon;

            return (
              <Card key={land.id} className="group relative overflow-hidden rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tenureInfo.bg} ${tenureInfo.color}`}>
                        <TenureIcon className="h-6 w-6" />
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => openEdit(land)}
                          className="rounded-xl p-2 text-ink-muted hover:bg-paper-sunken hover:text-ink transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingLand(land)}
                          className="rounded-xl p-2 text-ink-muted hover:bg-danger-bg hover:text-danger transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-display text-xl font-bold text-ink truncate">{land.name}</h3>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="tabular inline-flex items-center rounded-lg bg-paper-sunken px-3 py-1 text-sm font-bold text-ink">
                        {land.areaValue} {land.areaUnit === "feddan" ? "فدان" : "قيراط"}
                      </span>
                      <span className={`inline-flex items-center rounded-lg px-3 py-1 text-sm font-medium ${tenureInfo.bg} ${tenureInfo.color}`}>
                        {tenureInfo.label}
                      </span>
                    </div>

                    <div className="mt-5 pt-5 border-t border-border/40 grid grid-cols-2 gap-3 text-sm">
                      {land.irrigationType && (
                        <div className="flex items-center gap-2 text-ink-muted">
                          <Droplets className="h-4 w-4 text-sky-500" />
                          <span>{land.irrigationType}</span>
                        </div>
                      )}
                      {land.tenure?.partner && (
                        <div className="flex items-center gap-2 text-ink-muted col-span-2">
                          <Handshake className="h-4 w-4 text-sky-500" />
                          <span className="truncate">شريك: {land.tenure.partner.name} ({land.tenure.partner.partnerSharePercent}%)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {myFarm && (
        <Dialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editingLand ? "تعديل بيانات الأرض" : "تسجيل قطعة أرض جديدة"}
          className="max-w-2xl"
        >
          <LandForm
            defaultValues={editingLand}
            farmId={myFarm.id}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
            loading={createLand.isPending || updateLand.isPending}
          />
        </Dialog>
      )}

      <ConfirmDialog
        open={!!deletingLand}
        onClose={() => setDeletingLand(null)}
        onConfirm={handleDelete}
        title={`حذف الأرض "${deletingLand?.name}"؟`}
        description="سيتم مسح الأرض من سجلات المزرعة، ولا يمكن التراجع عن هذا الإجراء حالياً."
        loading={deleteLand.isPending}
      />
    </div>
  );
}
