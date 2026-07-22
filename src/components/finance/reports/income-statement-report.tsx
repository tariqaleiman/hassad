"use client";

import { useState, useEffect } from "react";
import { financeService } from "@/lib/services/finance-service";
import { useCurrency } from "@/lib/hooks/use-currency";
import { Spinner } from "@/components/ui/spinner";

import { exportToExcel } from "@/lib/utils/export-excel";
import { Icons } from "@/components/ui/icons";

export function IncomeStatementReport({ farmId }: { farmId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { formatMoney } = useCurrency();

  useEffect(() => {
    financeService.getIncomeStatement(farmId).then(res => {
      setData(res);
      setLoading(false);
    });
  }, [farmId]);

  const handleExport = () => {
    if (!data) return;
    
    const exportData: any[] = [];
    exportData.push({ "البند": "الإيرادات", "القيمة": "" });
    data.revenues.forEach((r: any) => exportData.push({ "البند": r.name, "القيمة": r.amount }));
    exportData.push({ "البند": "إجمالي الإيرادات", "القيمة": data.totalRevenues });
    
    exportData.push({ "البند": "", "القيمة": "" });
    exportData.push({ "البند": "المصروفات", "القيمة": "" });
    data.expenses.forEach((e: any) => exportData.push({ "البند": e.name, "القيمة": e.amount }));
    exportData.push({ "البند": "إجمالي المصروفات", "القيمة": data.totalExpenses });
    
    exportData.push({ "البند": "", "القيمة": "" });
    exportData.push({ "البند": "صافي الربح / الخسارة", "القيمة": data.netIncome });

    exportToExcel(exportData, `قائمة_الدخل_${new Date().toISOString().split('T')[0]}`);
  };

  if (loading || !data) return <div className="p-8 flex justify-center"><Spinner /></div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-ink">قائمة الدخل (الأرباح والخسائر)</h3>
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

      <div className="bg-white dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden">
        
        {/* الإيرادات */}
        <div className="p-6">
          <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-4 border-b border-black/5 pb-2">الإيرادات</h4>
          <div className="space-y-3">
            {data.revenues.map((r: any) => (
              <div key={r.id} className="flex justify-between items-center text-sm">
                <span>{r.name}</span>
                <span className="font-mono" dir="ltr">{formatMoney(r.amount)}</span>
              </div>
            ))}
            {data.revenues.length === 0 && <p className="text-sm text-gray-500">لا توجد حركات إيرادات مسجلة.</p>}
          </div>
          <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center font-bold">
            <span>إجمالي الإيرادات</span>
            <span className="text-emerald-600 font-mono" dir="ltr">{formatMoney(data.totalRevenues)}</span>
          </div>
        </div>

        {/* المصروفات */}
        <div className="p-6 bg-black/5 dark:bg-white/5 border-t border-black/5">
          <h4 className="text-lg font-bold text-rose-700 dark:text-rose-400 mb-4 border-b border-black/5 pb-2">المصروفات يخصم منها:</h4>
          <div className="space-y-3">
            {data.expenses.map((e: any) => (
              <div key={e.id} className="flex justify-between items-center text-sm">
                <span>{e.name}</span>
                <span className="font-mono" dir="ltr">{formatMoney(e.amount)}</span>
              </div>
            ))}
            {data.expenses.length === 0 && <p className="text-sm text-gray-500">لا توجد حركات مصروفات مسجلة.</p>}
          </div>
          <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center font-bold">
            <span>إجمالي المصروفات</span>
            <span className="text-rose-600 font-mono" dir="ltr">{formatMoney(data.totalExpenses)}</span>
          </div>
        </div>

        {/* صافي الدخل */}
        <div className={`p-6 border-t ${data.netIncome >= 0 ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900" : "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900"}`}>
          <div className="flex justify-between items-center text-xl font-black">
            <span className={data.netIncome >= 0 ? "text-emerald-800 dark:text-emerald-300" : "text-rose-800 dark:text-rose-300"}>
              {data.netIncome >= 0 ? "صافي الربح" : "صافي الخسارة"}
            </span>
            <span className={`font-mono ${data.netIncome >= 0 ? "text-emerald-600" : "text-rose-600"}`} dir="ltr">
              {formatMoney(Math.abs(data.netIncome))}
            </span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
