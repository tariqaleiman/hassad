import { useState } from "react";
import { Plus, Trash2, Printer, CheckCircle2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReportViewer } from "@/components/ui/report-viewer";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LaborAdvanceForm } from "./advance-form";
import { PayrollView } from "./payroll-view";
import { useWorkers } from "@/lib/hooks/use-workers";
import { 
  useLaborAdvances, useCreateLaborAdvance, useDeleteLaborAdvance,
  useLaborLogs, useLaborSettlements, useCreateLaborSettlement, useDeleteLaborSettlement 
} from "@/lib/hooks/use-labor";
import { Spinner } from "@/components/ui/spinner";
import type { LaborAdvanceFormValues, LaborSettlementFormValues, LaborAdvance, LaborSettlement, LaborLog } from "@/lib/types/labor";
import type { Worker } from "@/lib/types/worker";
import { useCurrency } from "@/lib/hooks/use-currency";

export function PayrollTab({ farmId }: { farmId: string }) {
  const { formatMoney, currency } = useCurrency();
  const { data: workers = [] } = useWorkers();
  const { data: logs = [], isLoading: loadingLogs } = useLaborLogs(farmId);
  const { data: advances = [], isLoading: loadingAdvances } = useLaborAdvances(farmId);
  const { data: settlements = [], isLoading: loadingSettlements } = useLaborSettlements(farmId);

  const createAdvance = useCreateLaborAdvance();
  const deleteAdvance = useDeleteLaborAdvance();
  const createSettlement = useCreateLaborSettlement();
  const deleteSettlement = useDeleteLaborSettlement();

  const [advanceFormOpen, setAdvanceFormOpen] = useState(false);
  const [deleteAdvanceId, setDeleteAdvanceId] = useState<string | null>(null);
  
  const [payrollWorkerId, setPayrollWorkerId] = useState<string>("");
  const [payrollViewOpen, setPayrollViewOpen] = useState(false);
  const [deleteSettlementId, setDeleteSettlementId] = useState<string | null>(null);

  const [isReportOpen, setIsReportOpen] = useState(false);

  const isLoading = loadingLogs || loadingAdvances || loadingSettlements;

  const handleAdvanceSubmit = (values: any) => {
    const worker = workers.find(w => w.id === values.workerId);
    createAdvance.mutate({ ...values, workerName: worker?.name || "" } as any, {
      onSuccess: () => setAdvanceFormOpen(false)
    });
  };

  const handlePayrollSubmit = (
    data: any, 
    logIds: string[], 
    advanceIds: string[]
  ) => {
    createSettlement.mutate({ data, logIds, advanceIds, totalWages: data.totalWages }, {
      onSuccess: () => {
        setPayrollViewOpen(false);
        setPayrollWorkerId("");
      }
    });
  };

  const openPayrollForWorker = () => {
    if (payrollWorkerId) {
      setPayrollViewOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8 text-sky-500" />
      </div>
    );
  }

  // Calculate worker's unsettled data for the PayrollView
  const selectedWorker = workers.find(w => w.id === payrollWorkerId);
  const workerUnsettledLogs = logs.filter((l: LaborLog) => l.workerId === payrollWorkerId && !l.settlementId);
  const workerUnsettledAdvances = advances.filter((a: LaborAdvance) => a.workerId === payrollWorkerId && !a.settlementId);

  return (
    <div className="space-y-10">
      
      {/* 1. Settlements / Payroll Action Area */}
      <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-800/30">
        <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          تصفية رواتب العمال (Payroll)
        </h3>
        <p className="text-sm text-ink-muted mb-6">
          اختر عاملاً للبدء في تصفية حسابه. سيقوم النظام بحساب إجمالي الأجور من دفتر اليوميات وخصم إجمالي السلف تلقائياً.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-2 w-full max-w-sm">
            <Label htmlFor="payrollWorker" className="text-ink font-medium">اختر العامل للتصفية</Label>
            <Select 
              id="payrollWorker"
              value={payrollWorkerId}
              onChange={(e) => setPayrollWorkerId(e.target.value)}
              className="w-full bg-white dark:bg-paper"
            >
              <option value="">-- اختر العامل --</option>
              {workers.filter(w => w.status === "نشط").map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </Select>
          </div>
          <Button 
            onClick={openPayrollForWorker} 
            disabled={!payrollWorkerId}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl px-8"
          >
            فتح كشف الحساب
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. Advances List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink text-lg">سجل السلفيات (Advances)</h3>
            <Button onClick={() => setAdvanceFormOpen(true)} size="sm" variant="outline" className="gap-2 rounded-full">
              <Plus className="h-4 w-4" /> صرف سلفة
            </Button>
          </div>
          <div className="bg-paper border border-border rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-paper-sunken border-b border-border text-ink-muted sticky top-0">
                <tr>
                  <th className="p-3 font-medium">التاريخ</th>
                  <th className="p-3 font-medium">العامل</th>
                  <th className="p-3 font-medium">المبلغ</th>
                  <th className="p-3 font-medium">الحالة</th>
                  <th className="p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {advances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <EmptyState
                        icon={DollarSign}
                        title="لا توجد سلفيات مسجلة"
                        description="لم يتم صرف أي سلف نقدية للعمال."
                      />
                    </td>
                  </tr>
                ) : (
                  advances.map((adv: LaborAdvance) => (
                    <tr key={adv.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3">{adv.date}</td>
                      <td className="p-3 font-bold text-ink">{adv.workerName}</td>
                      <td className="p-3 text-danger font-bold">{adv.amount} ${currency}</td>
                      <td className="p-3">
                        {adv.settlementId ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded">مخصومة</span>
                        ) : (
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-1 rounded">معلقة</span>
                        )}
                      </td>
                      <td className="p-3">
                        {!adv.settlementId && (
                          <Button variant="ghost" size="icon" onClick={() => setDeleteAdvanceId(adv.id)} className="h-8 w-8 text-danger hover:bg-danger/10">
                            <Trash2 className="w-3 h-3" />
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

        {/* 3. Settlements List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink text-lg">أرشيف التصفيات المنفذة</h3>
            <Button onClick={() => setIsReportOpen(true)} size="sm" variant="outline" className="gap-2 rounded-full">
              <Printer className="h-4 w-4" /> طباعة الأرشيف
            </Button>
          </div>
          <div className="bg-paper border border-border rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-paper-sunken border-b border-border text-ink-muted sticky top-0">
                <tr>
                  <th className="p-3 font-medium">التاريخ</th>
                  <th className="p-3 font-medium">العامل</th>
                  <th className="p-3 font-medium">المدة</th>
                  <th className="p-3 font-medium">صافي الدفع</th>
                  <th className="p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {settlements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <EmptyState
                        icon={CheckCircle2}
                        title="لا توجد تصفيات سابقة"
                        description="لم يتم إجراء أي تسويات رواتب بعد."
                      />
                    </td>
                  </tr>
                ) : (
                  settlements.map((set: LaborSettlement) => (
                    <tr key={set.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3">{set.date}</td>
                      <td className="p-3 font-bold text-ink">{set.workerName}</td>
                      <td className="p-3 text-xs text-ink-muted" dir="ltr">{set.periodStart} / {set.periodEnd}</td>
                      <td className="p-3 text-emerald-600 font-bold">{formatMoney(set.netPaid)}</td>
                      <td className="p-3">
                        <Button variant="ghost" size="icon" onClick={() => setDeleteSettlementId(set.id)} className="h-8 w-8 text-danger hover:bg-danger/10">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Advance Form */}
      <Dialog open={advanceFormOpen} onClose={() => setAdvanceFormOpen(false)} title="تسجيل سلفة نقدية" className="max-w-2xl">
        <LaborAdvanceForm
          workers={workers}
          onSubmit={handleAdvanceSubmit}
          onCancel={() => setAdvanceFormOpen(false)}
          loading={createAdvance.isPending}
        />
      </Dialog>

      {/* Payroll View Form */}
      <Dialog open={payrollViewOpen} onClose={() => setPayrollViewOpen(false)} title="كشف حساب العامل" className="max-w-3xl">
        {selectedWorker && (
          <PayrollView
            worker={selectedWorker}
            farmId={farmId}
            unsettledLogs={workerUnsettledLogs}
            unsettledAdvances={workerUnsettledAdvances}
            onSettle={handlePayrollSubmit}
            onCancel={() => setPayrollViewOpen(false)}
            loading={createSettlement.isPending}
          />
        )}
      </Dialog>

      {/* Delete Confirms */}
      <ConfirmDialog
        open={!!deleteAdvanceId}
        onClose={() => setDeleteAdvanceId(null)}
        onConfirm={() => deleteAdvanceId && deleteAdvance.mutate(deleteAdvanceId, { onSuccess: () => setDeleteAdvanceId(null) })}
        title="حذف السلفة"
        description="هل أنت متأكد من حذف هذه السلفة نهائياً؟"
        loading={deleteAdvance.isPending}
      />

      <ConfirmDialog
        open={!!deleteSettlementId}
        onClose={() => setDeleteSettlementId(null)}
        onConfirm={() => deleteSettlementId && deleteSettlement.mutate(deleteSettlementId, { onSuccess: () => setDeleteSettlementId(null) })}
        title="إلغاء التصفية"
        description="هل أنت متأكد من إلغاء تصفية الراتب؟ (سيتم إعادة اليوميات والسلف المرتبطة بها لتصبح معلقة مرة أخرى ليتم تصفيتها لاحقاً)"
        loading={deleteSettlement.isPending}
      />

      {/* Report */}
      <ReportViewer
        open={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="أرشيف تصفيات الرواتب"
        data={settlements}
        columns={[
          { header: "التاريخ", accessorKey: "date" },
          { header: "اسم العامل", accessorKey: "workerName" },
          { header: "الفترة (من)", accessorKey: "periodStart" },
          { header: "الفترة (إلى)", accessorKey: "periodEnd" },
          { header: "أيام الحضور", accessorKey: "totalDays" },
          { header: "إجمالي السلف المخصومة", cell: (r) => `${r.totalAdvances} ${currency}` },
          { header: "صافي المدفوع", cell: (r) => `${r.netPaid} ${currency}` },
        ]}
      />
    </div>
  );
}
