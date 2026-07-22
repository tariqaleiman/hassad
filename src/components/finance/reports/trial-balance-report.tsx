"use client";

import { useState, useEffect } from "react";
import { financeService } from "@/lib/services/finance-service";
import { useCurrency } from "@/lib/hooks/use-currency";
import { Spinner } from "@/components/ui/spinner";

import { exportToExcel } from "@/lib/utils/export-excel";
import { Icons } from "@/components/ui/icons";

export function TrialBalanceReport({ farmId }: { farmId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatMoney } = useCurrency();

  useEffect(() => {
    financeService.getTrialBalance(farmId).then(res => {
      setData(res);
      setLoading(false);
    });
  }, [farmId]);

  const handleExport = () => {
    if (!data || data.length === 0) return;
    
    const exportData = data.map((acc: any) => ({
      "رقم الحساب": acc.code,
      "اسم الحساب": acc.name,
      "التصنيف": acc.category,
      "إجمالي المدين": acc.totalDebit,
      "إجمالي الدائن": acc.totalCredit,
      "الرصيد الحالي": acc.balance
    }));

    exportToExcel(exportData, `ميزان_المراجعة_${new Date().toISOString().split('T')[0]}`);
  };

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>;

  const totalDebit = data.reduce((sum, a) => sum + a.totalDebit, 0);
  const totalCredit = data.reduce((sum, a) => sum + a.totalCredit, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-ink">ميزان المراجعة</h3>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors flex items-center gap-2"
          >
            <Icons.Download className="w-4 h-4" />
            تصدير إكسل
          </button>
          <button 
            onClick={() => window.print()} 
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Icons.Printer className="w-4 h-4" />
            طباعة
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/40">
        <table className="w-full text-sm text-right">
          <thead className="bg-black/5 dark:bg-white/5 text-ink font-semibold">
            <tr>
              <th className="px-4 py-3">رقم الحساب</th>
              <th className="px-4 py-3">اسم الحساب</th>
              <th className="px-4 py-3">التصنيف</th>
              <th className="px-4 py-3">إجمالي المدين</th>
              <th className="px-4 py-3">إجمالي الدائن</th>
              <th className="px-4 py-3">الرصيد الحالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {data.map(acc => (
              <tr key={acc.accountId} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono">{acc.code}</td>
                <td className="px-4 py-3">{acc.name}</td>
                <td className="px-4 py-3">{acc.category}</td>
                <td className="px-4 py-3 font-mono text-emerald-600" dir="ltr">{formatMoney(acc.totalDebit)}</td>
                <td className="px-4 py-3 font-mono text-rose-600" dir="ltr">{formatMoney(acc.totalCredit)}</td>
                <td className="px-4 py-3 font-mono font-semibold" dir="ltr">{formatMoney(acc.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-black/5 dark:bg-white/5 font-bold">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-left">الإجماليات:</td>
              <td className="px-4 py-3 font-mono text-emerald-700" dir="ltr">{formatMoney(totalDebit)}</td>
              <td className="px-4 py-3 font-mono text-rose-700" dir="ltr">{formatMoney(totalCredit)}</td>
              <td className="px-4 py-3">
                {totalDebit === totalCredit ? (
                  <span className="text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md text-xs">متزن</span>
                ) : (
                  <span className="text-rose-600 bg-rose-100 px-2 py-1 rounded-md text-xs">غير متزن</span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
