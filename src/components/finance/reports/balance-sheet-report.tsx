"use client";

import { useState, useEffect } from "react";
import { financeService } from "@/lib/services/finance-service";
import { useCurrency } from "@/lib/hooks/use-currency";
import { Spinner } from "@/components/ui/spinner";

export function BalanceSheetReport({ farmId }: { farmId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { formatMoney } = useCurrency();

  useEffect(() => {
    financeService.getBalanceSheet(farmId).then(res => {
      setData(res);
      setLoading(false);
    });
  }, [farmId]);

  if (loading || !data) return <div className="p-8 flex justify-center"><Spinner /></div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-ink">الميزانية العمومية (المركز المالي)</h3>
        <button onClick={() => window.print()} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          طباعة التقرير
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* الأصول (Assets) */}
        <div className="bg-white dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 bg-black/5 dark:bg-white/5 font-bold text-lg border-b border-black/5">
            الأصول (الموجودات)
          </div>
          <div className="p-4 flex-1 space-y-3">
            {data.assets.map((a: any) => (
              <div key={a.accountId} className="flex justify-between items-center text-sm">
                <span>{a.name}</span>
                <span className="font-mono text-emerald-600" dir="ltr">{formatMoney(a.balance)}</span>
              </div>
            ))}
            {data.assets.length === 0 && <p className="text-sm text-gray-500">لا توجد أرصدة للأصول.</p>}
          </div>
          <div className="p-4 border-t border-black/5 flex justify-between items-center font-bold bg-emerald-50 dark:bg-emerald-950/20">
            <span className="text-emerald-800 dark:text-emerald-300">إجمالي الأصول</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono text-lg" dir="ltr">{formatMoney(data.totalAssets)}</span>
          </div>
        </div>

        {/* الخصوم وحقوق الملكية (Liabilities & Equity) */}
        <div className="bg-white dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 bg-black/5 dark:bg-white/5 font-bold text-lg border-b border-black/5">
            الخصوم وحقوق الملكية
          </div>
          <div className="p-4 flex-1 space-y-6">
            
            {/* الخصوم */}
            <div>
              <h5 className="font-semibold text-rose-700 dark:text-rose-400 mb-2">الخصوم (الالتزامات)</h5>
              <div className="space-y-2">
                {data.liabilities.map((l: any) => (
                  <div key={l.accountId} className="flex justify-between items-center text-sm">
                    <span>{l.name}</span>
                    <span className="font-mono text-rose-600" dir="ltr">{formatMoney(l.balance)}</span>
                  </div>
                ))}
                {data.liabilities.length === 0 && <p className="text-sm text-gray-500">لا توجد أرصدة للخصوم.</p>}
              </div>
            </div>

            {/* حقوق الملكية */}
            <div>
              <h5 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 border-t border-black/5 pt-4">حقوق الملكية</h5>
              <div className="space-y-2">
                {data.equities.map((eq: any) => (
                  <div key={eq.accountId} className="flex justify-between items-center text-sm">
                    <span>{eq.name}</span>
                    <span className="font-mono text-blue-600" dir="ltr">{formatMoney(eq.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>صافي الدخل للفترة (ربح/خسارة)</span>
                  <span className={`font-mono ${data.netIncome >= 0 ? "text-emerald-600" : "text-rose-600"}`} dir="ltr">
                    {formatMoney(data.netIncome)}
                  </span>
                </div>
              </div>
            </div>

          </div>
          <div className="p-4 border-t border-black/5 flex justify-between items-center font-bold bg-blue-50 dark:bg-blue-950/20">
            <span className="text-blue-800 dark:text-blue-300">إجمالي الخصوم وحقوق الملكية</span>
            <span className="text-blue-700 dark:text-blue-400 font-mono text-lg" dir="ltr">{formatMoney(data.totalLiabilitiesAndEquity)}</span>
          </div>
        </div>

      </div>

      {/* Validation Message */}
      {data.totalAssets !== data.totalLiabilitiesAndEquity && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
          <strong>تنبيه:</strong> الميزانية غير متزنة. يرجى مراجعة أرصدة الحسابات والقيود المزدوجة. الفارق: {formatMoney(Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity))}
        </div>
      )}
    </div>
  );
}
