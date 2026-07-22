import { useState } from "react";
import { useVouchers, useDeleteVoucher } from "@/lib/hooks/use-finance";
import { VoucherForm } from "./voucher-form";
import { VoucherViewer } from "./voucher-viewer";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Printer } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Voucher } from "@/lib/types/finance";
import { useCurrency } from "@/lib/hooks/use-currency";

export function VouchersTab({ farmId }: { farmId: string }) {
  const { data: vouchers = [], isLoading } = useVouchers(farmId);
  const deleteVoucher = useDeleteVoucher();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [voucherType, setVoucherType] = useState<"قبض" | "صرف">("قبض");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const { formatMoney } = useCurrency();

  if (isLoading) {
    return <div className="p-12 flex justify-center"><Spinner /></div>;
  }

  const handleDelete = (id: string, serial: string) => {
    if (confirm(`هل أنت متأكد من حذف السند "${serial}"؟ سيتم إلغاء تأثيره المحاسبي.`)) {
      deleteVoucher.mutate({ id, farmId });
    }
  };

  const handlePrint = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
  };

  const openForm = (type: "قبض" | "صرف") => {
    setVoucherType(type);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-ink">دفتر السندات</h3>
          <p className="text-sm text-ink-muted mt-1">إصدار واستعراض سندات القبض والصرف</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => openForm("قبض")}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-xl"
          >
            <Plus className="w-4 h-4" />
            سند قبض
          </Button>
          <Button 
            onClick={() => openForm("صرف")}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full px-6 shadow-xl"
          >
            <Plus className="w-4 h-4" />
            سند صرف
          </Button>
        </div>
      </div>

      <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-black/5 dark:bg-white/5 text-ink-muted">
              <tr>
                <th className="p-4 font-semibold w-28">الرقم</th>
                <th className="p-4 font-semibold w-28">التاريخ</th>
                <th className="p-4 font-semibold w-24">النوع</th>
                <th className="p-4 font-semibold">البيان</th>
                <th className="p-4 font-semibold">المبلغ</th>
                <th className="p-4 font-semibold w-32">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink-muted">
                    لا يوجد سندات مسجلة حالياً
                  </td>
                </tr>
              ) : (
                vouchers.map(v => (
                  <tr key={v.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-sm font-semibold text-primary">{v.serialNumber}</td>
                    <td className="p-4 text-sm" dir="ltr">{v.date}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        v.type === "قبض" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "text-rose-600 bg-rose-50 dark:bg-rose-950/30"
                      }`}>
                        {v.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-ink font-medium">{v.description}</p>
                      {v.reference && <p className="text-xs text-ink-muted mt-1">مرجع: {v.reference}</p>}
                    </td>
                    <td className="p-4 font-mono font-bold" dir="ltr">
                      {formatMoney(v.totalAmount)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handlePrint(v)}>
                          <Printer className="w-4 h-4 text-ink-muted hover:text-blue-500 transition-colors" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id, v.serialNumber)}>
                          <Trash2 className="w-4 h-4 text-ink-muted hover:text-rose-500 transition-colors" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <VoucherForm 
          farmId={farmId}
          type={voucherType}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      <VoucherViewer 
        open={!!selectedVoucher}
        voucher={selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
      />
    </div>
  );
}
