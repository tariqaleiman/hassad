"use client";

import { useState } from "react";
import { Plus, Tractor, Pencil, Trash2, CalendarDays, Settings, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { EquipmentForm } from "@/components/equipment/equipment-form";
import { EquipmentDetailsModal } from "@/components/equipment/equipment-details-modal";
import { useEquipment, useCreateEquipment, useUpdateEquipment, useDeleteEquipment } from "@/lib/hooks/use-equipment";
import { useFarms } from "@/lib/hooks/use-farms";
import { useCurrency } from "@/lib/hooks/use-currency";
import type { Equipment } from "@/lib/types/equipment";
import type { EquipmentSchema } from "@/components/equipment/equipment-schema";
import { formatDate } from "@/lib/utils";

export default function EquipmentPage() {
  const { data: equipmentList, isLoading: loadingEquipment } = useEquipment();
  const { data: farms, isLoading: loadingFarms } = useFarms();
  
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();
  const deleteEquipment = useDeleteEquipment();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);
  const [detailsEquipment, setDetailsEquipment] = useState<Equipment | null>(null);

  const { formatMoney } = useCurrency();

  const myFarm = farms?.[0];
  const isLoading = loadingEquipment || loadingFarms;

  const openCreate = () => {
    setEditingEquipment(null);
    setFormOpen(true);
  };

  const openEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setFormOpen(true);
  };

  const handleSubmit = (values: EquipmentSchema) => {
    if (editingEquipment) {
      updateEquipment.mutate(
        { id: editingEquipment.id, values },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createEquipment.mutate(values, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (!deletingEquipment) return;
    deleteEquipment.mutate(deletingEquipment.id, { onSuccess: () => setDeletingEquipment(null) });
  };

  if (!isLoading && !myFarm) {
    return (
      <EmptyState
        icon={Tractor}
        title="أضف مزرعة أولًا"
        description="لإضافة معدات، يجب أن يكون لديك مزرعة مسجلة في النظام."
        action={
          <Button onClick={() => window.location.href = "/farms"}>الذهاب إلى إعداد المزرعة</Button>
        }
      />
    );
  }

  const getStatusColor = (status: string) => {
    if (status === "يعمل") return "bg-emerald-500 text-white";
    if (status === "في الصيانة") return "bg-amber-500 text-white";
    return "bg-danger text-white";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 md:px-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Tractor className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">المعدات والآلات</h2>
            <p className="text-ink-muted mt-1 text-sm">إدارة جرارات، حصادات، ومعدات الري وتواريخ الصيانة</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-full px-6 shadow-sm bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="h-4 w-4" />
          إضافة معدة جديدة
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-orange-500" />
        </div>
      ) : equipmentList?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-paper-sunken/20 p-12 text-center mt-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-4 shadow-sm">
            <Tractor className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-2">لا توجد معدات مسجلة</h3>
          <p className="text-sm text-ink-muted max-w-md mb-8">
            قم بإضافة الآلات والمعدات الزراعية مثل الجرارات ومضخات الري لتتبع حالتها وصيانتها وقيمتها.
          </p>
          <Button onClick={openCreate} className="gap-2 rounded-full px-8 py-6 text-base shadow-md shadow-orange-500/20 bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-5 w-5" />
            إضافة أول معدة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {equipmentList?.map((eq) => {
            const accDep = eq.accumulatedDepreciation || 0;
            const purchVal = eq.purchaseValue || 0;
            const depPercent = purchVal > 0 ? Math.min(100, Math.round((accDep / purchVal) * 100)) : 0;
            
            return (
            <Card key={eq.id} className="group relative overflow-hidden rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-0">
                <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl shadow-sm z-10 ${getStatusColor(eq.status)}`}>
                  {eq.status}
                </div>
                <div className="p-6 cursor-pointer" onClick={() => setDetailsEquipment(eq)}>
                  <div className="mb-4 flex items-start justify-between mt-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-400 to-orange-600 text-white shadow-md shadow-orange-500/20 border-2 border-paper">
                      <Tractor className="h-6 w-6" />
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(eq); }}
                        className="rounded-xl p-2 text-ink-muted hover:bg-paper-sunken hover:text-ink transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingEquipment(eq); }}
                        className="rounded-xl p-2 text-ink-muted hover:bg-danger-bg hover:text-danger transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold text-ink truncate">{eq.name}</h3>
                  
                  <div className="flex flex-wrap gap-2 my-4">
                    <span className="inline-flex items-center rounded-lg bg-orange-50 dark:bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-700 dark:text-orange-400">
                      <Settings className="h-3.5 w-3.5 ml-1.5" />
                      {eq.type}
                    </span>
                  </div>

                  <div className="space-y-3 mt-4 pt-4 border-t border-border/40">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />تاريخ الشراء:</span>
                      <span className="font-medium text-ink">{eq.purchaseDate ? formatDate(eq.purchaseDate) : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted flex items-center gap-1.5"><Wrench className="h-4 w-4" />الصيانة القادمة:</span>
                      <span className={`font-bold ${eq.nextMaintenanceDate && new Date(eq.nextMaintenanceDate) < new Date() ? 'text-danger' : 'text-amber-600'}`}>
                        {eq.nextMaintenanceDate ? formatDate(eq.nextMaintenanceDate) : "—"}
                      </span>
                    </div>
                    {eq.purchaseValue !== undefined && (
                      <div className="bg-paper-sunken p-3 rounded-xl mt-4 border border-border/40">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-ink-muted font-bold">قيمة المعدة:</span>
                          <span className="font-bold text-emerald-600 font-mono">{formatMoney(eq.purchaseValue)}</span>
                        </div>
                        {depPercent > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-ink-muted">
                              <span>تم إهلاك {depPercent}%</span>
                              <span className="font-mono text-rose-600">{formatMoney(accDep)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-border/50 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${depPercent}%` }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      )}

      {myFarm && (
        <Dialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editingEquipment ? "تعديل بيانات المعدة" : "إضافة معدة جديدة"}
          className="max-w-2xl"
        >
          <EquipmentForm
            defaultValues={editingEquipment}
            farmId={myFarm.id}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
            loading={createEquipment.isPending || updateEquipment.isPending}
          />
        </Dialog>
      )}

      <ConfirmDialog
        open={!!deletingEquipment}
        onClose={() => setDeletingEquipment(null)}
        onConfirm={handleDelete}
        title={`حذف المعدة "${deletingEquipment?.name}"؟`}
        description="سيتم مسح بيانات المعدة نهائياً من النظام."
        loading={deleteEquipment.isPending}
      />

      <EquipmentDetailsModal
        equipment={detailsEquipment}
        open={!!detailsEquipment}
        onClose={() => setDetailsEquipment(null)}
      />
    </div>
  );
}
