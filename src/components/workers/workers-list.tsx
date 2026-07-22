"use client";

import { useState } from "react";
import { Plus, Users, Pencil, Trash2, ShieldCheck, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { WorkerForm } from "@/components/workers/worker-form";
import { useWorkers, useCreateWorker, useUpdateWorker, useDeleteWorker } from "@/lib/hooks/use-workers";
import type { Worker } from "@/lib/types/worker";
import type { WorkerSchema } from "@/components/workers/worker-schema";
import { useCurrency } from "@/lib/hooks/use-currency";

export function WorkersList({ farmId }: { farmId: string }) {
  const { formatMoney, currency } = useCurrency();
  const { data: workers, isLoading } = useWorkers();
  const createWorker = useCreateWorker();
  const updateWorker = useUpdateWorker();
  const deleteWorker = useDeleteWorker();

  const [formOpen, setFormOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [deletingWorker, setDeletingWorker] = useState<Worker | null>(null);

  const openCreate = () => {
    setEditingWorker(null);
    setFormOpen(true);
  };

  const openEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setFormOpen(true);
  };

  const handleSubmit = (values: WorkerSchema) => {
    if (editingWorker) {
      updateWorker.mutate(
        { id: editingWorker.id, values },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createWorker.mutate(values, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (!deletingWorker) return;
    deleteWorker.mutate(deletingWorker.id, { onSuccess: () => setDeletingWorker(null) });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8 text-sky-500" />
      </div>
    );
  }

  if (workers?.length === 0) {
    return (
      <>
        <EmptyState
          icon={Users}
          title="لا يوجد عمال مسجلين"
          description="قم بإضافة العمالة المؤقتة أو الدائمة لتتمكن من تعيينهم في العمليات الزراعية وتتبع أجورهم بسهولة."
          action={
            <Button onClick={openCreate} className="gap-2 rounded-full px-8 shadow-sm">
              <Plus className="h-4 w-4" />
              إضافة أول عامل
            </Button>
          }
        />
        <Dialog open={formOpen} onClose={() => setFormOpen(false)} title="إضافة عامل جديد" className="max-w-2xl">
          <WorkerForm farmId={farmId} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} loading={createWorker.isPending} />
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2 rounded-full px-6 shadow-sm">
          <Plus className="h-4 w-4" />
          إضافة عامل جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {workers?.map((worker) => (
          <Card key={worker.id} className="group relative overflow-hidden rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-0">
              <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl shadow-sm z-10 ${
                worker.status === "نشط" ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
              }`}>
                {worker.status}
              </div>
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between mt-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-sky-600 text-white shadow-md shadow-sky-500/20 border-2 border-paper">
                    <span className="text-2xl font-bold font-display">{worker.name?.[0]}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(worker)}
                      className="rounded-xl p-2 text-ink-muted hover:bg-paper-sunken hover:text-ink transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingWorker(worker)}
                      className="rounded-xl p-2 text-ink-muted hover:bg-danger-bg hover:text-danger transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold text-ink truncate">{worker.name}</h3>
                <p className="text-ink-muted text-sm mt-1 mb-4 flex items-center gap-1.5" dir="ltr">
                  {worker.phone || "بدون رقم هاتف"}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="inline-flex items-center rounded-lg bg-sky-50 dark:bg-sky-500/10 px-3 py-1 text-sm font-medium text-sky-700 dark:text-sky-400">
                    <Briefcase className="h-3.5 w-3.5 ml-1.5" />
                    {worker.type}
                  </span>
                  {worker.specialty && (
                    <span className="inline-flex items-center rounded-lg bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-400">
                      <ShieldCheck className="h-3.5 w-3.5 ml-1.5" />
                      {worker.specialty}
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border/40 bg-paper-sunken/40 rounded-xl p-4">
                  {worker.type === "يومي" ? (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-ink-muted">الأجر اليومي المتوقع:</span>
                      <span className="font-bold text-ink">{worker.dailyWage ? `${worker.dailyWage} ${currency}` : "غير محدد"}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-ink-muted">الراتب الشهري المتوقع:</span>
                      <span className="font-bold text-ink">{worker.monthlyWage ? `${worker.monthlyWage} ${currency}` : "غير محدد"}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingWorker ? "تعديل بيانات العامل" : "إضافة عامل جديد"}
        className="max-w-2xl"
      >
        <WorkerForm
          defaultValues={editingWorker}
          farmId={farmId}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          loading={createWorker.isPending || updateWorker.isPending}
        />
      </Dialog>

      <ConfirmDialog
        open={!!deletingWorker}
        onClose={() => setDeletingWorker(null)}
        onConfirm={handleDelete}
        title={`حذف العامل "${deletingWorker?.name}"؟`}
        description="سيتم مسح بيانات العامل نهائياً ولن تتمكن من تعيينه في أي عمليات مستقبلية. العمليات السابقة التي تم تعيينه فيها قد تفقد الربط."
        loading={deleteWorker.isPending}
      />
    </div>
  );
}
