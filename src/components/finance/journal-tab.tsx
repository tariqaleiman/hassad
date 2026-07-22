import { useState } from "react";
import { useVouchers, useDeleteVoucher } from "@/lib/hooks/use-finance";
import { VoucherViewer } from "./voucher-viewer";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Voucher } from "@/lib/types/finance";
import { useCurrency } from "@/lib/hooks/use-currency";

export function JournalTab({ farmId }: { farmId: string }) {
  const { data: vouchers = [], isLoading } = useVouchers(farmId);
  const deleteVoucher = useDeleteVoucher();
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const { formatMoney } = useCurrency();

  // Filter only journal entries
  const journalEntries = vouchers.filter(v => v.type === "قيد يومية");

  if (isLoading) {
    return <div className="p-12 flex justify-center"><Spinner /></div>;
  }

  const handleView = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-ink">دفتر اليومية العامة</h3>
          <p className="text-sm text-ink-muted mt-1">سجل بجميع القيود المحاسبية (الآلية واليدوية)</p>
        </div>
      </div>

      <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-black/5 dark:bg-white/5 text-ink-muted">
              <tr>
                <th className="p-4 font-semibold w-28">الرقم</th>
                <th className="p-4 font-semibold w-28">التاريخ</th>
                <th className="p-4 font-semibold w-32">المصدر</th>
                <th className="p-4 font-semibold">البيان</th>
                <th className="p-4 font-semibold">الإجمالي</th>
                <th className="p-4 font-semibold w-24">خيارات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {journalEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink-muted">
                    لا يوجد قيود يومية مسجلة حالياً
                  </td>
                </tr>
              ) : (
                journalEntries.map(v => (
                  <tr key={v.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-sm font-semibold text-primary">{v.serialNumber}</td>
                    <td className="p-4 text-sm" dir="ltr">{v.date}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        v.sourceModule === "sales" ? "text-blue-600 bg-blue-50 dark:bg-blue-950/30" : 
                        v.sourceModule === "purchases" ? "text-purple-600 bg-purple-50 dark:bg-purple-950/30" :
                        v.sourceModule === "operations" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" :
                        "text-slate-600 bg-slate-50 dark:bg-slate-900/30"
                      }`}>
                        {v.sourceModule === "sales" ? "مبيعات" : 
                         v.sourceModule === "purchases" ? "مشتريات" : 
                         v.sourceModule === "operations" ? "عمليات زراعية" : 
                         v.sourceModule === "inventory" ? "مخزون" :
                         "قيد آلي"}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-ink font-medium">{v.description}</p>
                    </td>
                    <td className="p-4 font-mono font-bold" dir="ltr">
                      {formatMoney(v.totalAmount)}
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" onClick={() => handleView(v)} className="gap-2">
                        <Eye className="w-4 h-4" /> عرض
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusing VoucherViewer which is generic enough for all vouchers */}
      <VoucherViewer 
        open={!!selectedVoucher}
        voucher={selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
      />
    </div>
  );
}
