"use client";

import { useState, useEffect } from "react";
import { financeService } from "@/lib/services/finance-service";
import { useAccounts } from "@/lib/hooks/use-finance";
import { useCurrency } from "@/lib/hooks/use-currency";
import { Spinner } from "@/components/ui/spinner";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { exportToExcel } from "@/lib/utils/export-excel";
import { Icons } from "@/components/ui/icons";

export function AccountStatementReport({ farmId }: { farmId: string }) {
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts(farmId);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { formatMoney } = useCurrency();

  useEffect(() => {
    if (selectedAccountId) {
      setLoading(true);
      financeService.getAccountStatement(farmId, selectedAccountId).then(res => {
        setData(res);
        setLoading(false);
      });
    } else {
      setData(null);
    }
  }, [farmId, selectedAccountId]);

  const handleExport = () => {
    if (!data) return;
    
    const exportData = data.entries.map((entry: any) => ({
      "التاريخ": new Date(entry.date).toLocaleDateString('ar-EG'),
      "رقم السند": entry.voucherId,
      "البيان": entry.description,
      "مدين": entry.debit > 0 ? entry.debit : '',
      "دائن": entry.credit > 0 ? entry.credit : '',
      "الرصيد": entry.runningBalance
    }));

    exportToExcel(exportData, `كشف_حساب_${data.account.name}_${new Date().toISOString().split('T')[0]}`);
  };

  if (loadingAccounts) return <div className="p-8 flex justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <h3 className="text-xl font-bold text-ink mb-1">كشف حساب تفصيلي (أستاذ مساعد)</h3>
          <p className="text-sm text-gray-500">اختر الحساب لاستعراض حركاته المالية ورصيده الافتتاحي والختامي</p>
        </div>
        
        <div className="w-full md:w-auto flex items-center gap-2">
          <Select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} className="w-full md:w-64">
            <option value="">-- اختر الحساب --</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.category})</option>
            ))}
          </Select>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={handleExport}
              disabled={!data}
              className="px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50 flex items-center gap-2"
              title="تصدير إلى إكسل"
            >
              <Icons.Download className="w-4 h-4" />
              <span className="hidden sm:inline">إكسل</span>
            </button>
            <button 
              onClick={() => window.print()} 
              disabled={!data}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              <Icons.Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة</span>
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="p-12 flex justify-center"><Spinner /></div>}

      {!loading && data && (
        <div className="bg-white dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden">
          {/* Header Info */}
          <div className="p-6 bg-black/5 dark:bg-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">اسم الحساب</p>
              <p className="font-bold">{data.account.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">رقم الحساب</p>
              <p className="font-bold font-mono">{data.account.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">التصنيف</p>
              <p className="font-bold">{data.account.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">الرصيد الافتتاحي</p>
              <p className="font-bold font-mono" dir="ltr">{formatMoney(data.openingBalance)}</p>
            </div>
          </div>

          {/* Lines */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right min-w-[800px]">
              <thead className="bg-black/5 dark:bg-white/5 text-ink font-semibold border-y border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-4 py-3">التاريخ</th>
                  <th className="px-4 py-3">رقم المرجع (القيد)</th>
                  <th className="px-4 py-3">البيان</th>
                  <th className="px-4 py-3">مدين</th>
                  <th className="px-4 py-3">دائن</th>
                  <th className="px-4 py-3">الرصيد التراكمي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {/* Opening Balance Row */}
                <tr className="bg-emerald-50/50 dark:bg-emerald-900/10">
                  <td colSpan={3} className="px-4 py-3 font-semibold text-center text-gray-500">رصيد افتتاحي قبل الفترة</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 font-mono font-semibold" dir="ltr">{formatMoney(data.openingBalance)}</td>
                </tr>

                {data.lines.map((line: any, idx: number) => (
                  <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono">{new Date(line.date).toLocaleDateString("ar-SA")}</td>
                    <td className="px-4 py-3 font-mono text-gray-500">{line.serialNumber}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={line.description}>{line.description || "-"}</td>
                    <td className="px-4 py-3 font-mono text-emerald-600" dir="ltr">{line.debit > 0 ? formatMoney(line.debit) : ""}</td>
                    <td className="px-4 py-3 font-mono text-rose-600" dir="ltr">{line.credit > 0 ? formatMoney(line.credit) : ""}</td>
                    <td className="px-4 py-3 font-mono font-bold" dir="ltr">{formatMoney(line.balance)}</td>
                  </tr>
                ))}

                {data.lines.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">لا توجد حركات مسجلة لهذا الحساب.</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-black/5 dark:bg-white/5 font-bold border-t border-black/5 dark:border-white/5">
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-left">إجمالي الرصيد الختامي:</td>
                  <td colSpan={2}></td>
                  <td className="px-4 py-4 font-mono text-lg text-emerald-700 dark:text-emerald-400" dir="ltr">{formatMoney(data.endingBalance)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
