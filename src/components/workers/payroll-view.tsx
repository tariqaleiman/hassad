import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, CheckCircle2 } from "lucide-react";
import type { Worker } from "@/lib/types/worker";
import type { LaborLog, LaborAdvance } from "@/lib/types/labor";
import { useCurrency } from "@/lib/hooks/use-currency";

interface PayrollViewProps {
  worker: Worker;
  farmId: string;
  unsettledLogs: LaborLog[];
  unsettledAdvances: LaborAdvance[];
  onSettle: (data: any, logIds: string[], advanceIds: string[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function PayrollView({
  worker,
  farmId,
  unsettledLogs,
  unsettledAdvances,
  onSettle,
  onCancel,
  loading,
}: PayrollViewProps) {
  const { formatMoney, currency } = useCurrency();
  const [notes, setNotes] = useState("");
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Calculate totals
  const totalDays = unsettledLogs.filter(l => l.status === "حاضر" || l.status === "نصف يوم" || l.status === "إضافي").length;
  const totalWages = unsettledLogs.reduce((sum, log) => sum + (log.wage || 0), 0);
  const totalAdvances = unsettledAdvances.reduce((sum, adv) => sum + (adv.amount || 0), 0);
  const netPaid = totalWages - totalAdvances;

  // Determine period
  const sortedLogs = [...unsettledLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const periodStart = sortedLogs.length > 0 ? sortedLogs[0].date : settlementDate;
  const periodEnd = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].date : settlementDate;

  const handleSettle = () => {
    onSettle(
      {
        farmId,
        workerId: worker.id,
        workerName: worker.name,
        date: settlementDate,
        periodStart,
        periodEnd,
        totalDays,
        totalAdvances,
        totalWages,
        netPaid,
        paymentMethod,
        notes,
      },
      unsettledLogs.map(l => l.id),
      unsettledAdvances.map(a => a.id)
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 p-2 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-ink">تصفية حساب: {worker.name}</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-paper p-4 rounded-xl shadow-sm">
            <p className="text-xs text-ink-muted mb-1">أيام الحضور</p>
            <p className="text-xl font-bold">{totalDays} يوم</p>
          </div>
          <div className="bg-white dark:bg-paper p-4 rounded-xl shadow-sm">
            <p className="text-xs text-ink-muted mb-1">إجمالي الأجور</p>
            <p className="text-xl font-bold text-sky-600">{formatMoney(totalWages)}</p>
          </div>
          <div className="bg-white dark:bg-paper p-4 rounded-xl shadow-sm">
            <p className="text-xs text-ink-muted mb-1">إجمالي السلف</p>
            <p className="text-xl font-bold text-danger">{formatMoney(totalAdvances)}</p>
          </div>
          <div className="bg-white dark:bg-paper p-4 rounded-xl shadow-sm border-2 border-emerald-200 dark:border-emerald-700">
            <p className="text-xs text-ink-muted mb-1">الصافي للدفع</p>
            <p className={`text-2xl font-bold ${netPaid >= 0 ? 'text-emerald-600' : 'text-danger'}`}>
              {formatMoney(netPaid)}
            </p>
          </div>
        </div>

        {unsettledLogs.length === 0 && unsettledAdvances.length === 0 ? (
          <div className="text-center py-4 text-ink-muted">
            لا توجد يوميات أو سلف معلقة للتصفية.
          </div>
        ) : (
          <div className="space-y-4 bg-white dark:bg-paper p-4 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="settlementDate" className="text-ink font-medium">تاريخ التصفية</Label>
                <Input
                  id="settlementDate"
                  type="date"
                  value={settlementDate}
                  onChange={(e) => setSettlementDate(e.target.value)}
                />
              </div>
              
              {netPaid > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-ink font-medium">وسيلة الدفع للصافي المستحق</Label>
                  <Select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">نقدي كاش (الصندوق)</option>
                    <option value="instapay">إنستاباي (InstaPay)</option>
                    <option value="vodafone_cash">فودافون كاش</option>
                    <option value="orange_cash">أورانج كاش</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="other">أخرى</option>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-ink font-medium">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="مثال: تم تسليم الراتب نقداً..."
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="rounded-full px-6"
        >
          إلغاء
        </Button>
        <Button 
          onClick={handleSettle}
          loading={loading} 
          disabled={unsettledLogs.length === 0 && unsettledAdvances.length === 0}
          className="rounded-full px-8 shadow-sm gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          اعتماد وتسديد {netPaid > 0 ? `${netPaid} ${currency}` : ''}
        </Button>
      </div>
    </div>
  );
}
