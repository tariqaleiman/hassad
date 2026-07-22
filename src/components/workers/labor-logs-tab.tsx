import { useState } from "react";
import { Plus, Trash2, Printer, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReportViewer } from "@/components/ui/report-viewer";
import { EmptyState } from "@/components/ui/empty-state";
import { LaborLogForm } from "@/components/workers/labor-log-form";
import { useWorkers } from "@/lib/hooks/use-workers";
import { useLaborLogs, useCreateLaborLog, useDeleteLaborLog } from "@/lib/hooks/use-labor";
import { useOperations } from "@/lib/hooks/use-operations";
import { useCropCycles } from "@/lib/hooks/use-crop-cycles";
import { Spinner } from "@/components/ui/spinner";
import type { LaborLogFormValues, LaborLog } from "@/lib/types/labor";
import { useCurrency } from "@/lib/hooks/use-currency";

export function LaborLogsTab({ farmId }: { farmId: string }) {
  const { formatMoney, currency } = useCurrency();
  const { data: workers = [] } = useWorkers();
  const { data: logs = [], isLoading } = useLaborLogs(farmId);
  const { data: operations = [] } = useOperations();
  const { data: crops = [] } = useCropCycles();

  const createLog = useCreateLaborLog();
  const deleteLog = useDeleteLaborLog();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleSubmit = (values: any) => {
    const worker = workers.find(w => w.id === values.workerId);
    createLog.mutate({ ...values, workerName: worker?.name || "" } as any, {
      onSuccess: () => setFormOpen(false)
    });
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteLog.mutate(deleteConfirmId, {
        onSuccess: () => setDeleteConfirmId(null)
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8 text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button onClick={() => setIsReportOpen(true)} variant="outline" className="gap-2 rounded-full px-6 shadow-sm">
          <Printer className="h-4 w-4" />
          طباعة كشف الحضور
        </Button>
        <Button onClick={() => setFormOpen(true)} className="gap-2 rounded-full px-6 shadow-sm">
          <Plus className="h-4 w-4" />
          تسجيل يومية
        </Button>
      </div>

      <div className="bg-paper border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-paper-sunken border-b border-border text-ink-muted">
              <tr>
                <th className="p-4 font-medium">التاريخ</th>
                <th className="p-4 font-medium">العامل</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">الأجر المستحق</th>
                <th className="p-4 font-medium">العملية/المحصول</th>
                <th className="p-4 font-medium">حالة الدفع</th>
                <th className="p-4 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState
                      icon={BookOpen}
                      title="لا توجد يوميات مسجلة"
                      description="لم يتم تسجيل أي حضور أو انصراف للعمال بعد."
                    />
                  </td>
                </tr>
              ) : (
                logs.map((log: LaborLog) => (
                  <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4" dir="ltr">{log.date}</td>
                    <td className="p-4 font-bold text-ink">{log.workerName}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        log.status === "حاضر" ? "bg-emerald-500/10 text-emerald-600" :
                        log.status === "غائب" ? "bg-danger-bg text-danger" :
                        "bg-amber-500/10 text-amber-600"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-emerald-600 font-bold">{log.wage} ${currency}</td>
                    <td className="p-4 text-ink-muted">
                      {log.operationId ? "عملية زراعية" : log.cropCycleId ? "محصول" : "عام"}
                    </td>
                    <td className="p-4">
                      {log.settlementId ? (
                        <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-md">تم الدفع</span>
                      ) : (
                        <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md">معلق</span>
                      )}
                    </td>
                    <td className="p-4">
                      {!log.settlementId && (
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(log.id)} className="text-danger hover:bg-danger/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title="تسجيل حضور ويومية" className="max-w-2xl">
        <LaborLogForm
          workers={workers}
          operations={operations}
          crops={crops}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          loading={createLog.isPending}
        />
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف اليومية"
        description="هل أنت متأكد من حذف هذه اليومية؟ سيتم خصم هذا اليوم والأجر من حساب العامل."
        loading={deleteLog.isPending}
      />

      <ReportViewer
        open={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="كشف الحضور واليوميات"
        data={logs}
        columns={[
          { header: "التاريخ", accessorKey: "date" },
          { header: "اسم العامل", accessorKey: "workerName" },
          { header: "الحالة", accessorKey: "status" },
          { header: "الأجر المستحق", cell: (row) => `${row.wage} ${currency}` },
          { header: "الارتباط", cell: (row) => row.operationId ? "عملية" : row.cropCycleId ? "محصول" : "عام" },
        ]}
      />
    </div>
  );
}
