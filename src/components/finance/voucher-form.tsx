import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { voucherSchema, type VoucherSchema } from "./finance-schemas";
import { useCreateVoucher, useAccounts } from "@/lib/hooks/use-finance";
import { toast } from "sonner";
import { format } from "date-fns";

interface VoucherFormProps {
  farmId: string;
  type: "قبض" | "صرف";
  onClose: () => void;
}

export function VoucherForm({ farmId, type, onClose }: VoucherFormProps) {
  const createVoucher = useCreateVoucher();
  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts(farmId);

  const { register, handleSubmit, formState: { errors } } = useForm<VoucherSchema>({
    resolver: zodResolver(voucherSchema) as any,
    defaultValues: {
      type: type,
      date: format(new Date(), "yyyy-MM-dd"),
      reference: "",
      description: "",
      amount: 0,
      mainAccountId: "",
      oppositeAccountId: "",
    }
  });

  const onSubmit = async (data: VoucherSchema) => {
    createVoucher.mutate({ ...data, farmId }, {
      onSuccess: () => onClose()
    });
  };

  const isReceipt = type === "قبض";

  // Filter accounts for better UX
  // Main accounts: usually Cash/Bank (Assets)
  const treasuryAccounts = accounts.filter(a => a.category === "أصول" && (a.name.includes("صندوق") || a.name.includes("خزينة") || a.name.includes("بنك")));
  // Fallback to all assets if none match standard names
  const mainAccountsList = treasuryAccounts.length > 0 ? treasuryAccounts : accounts.filter(a => a.category === "أصول");
  
  // Opposite accounts: Revenue for receipt, Expense/Supplier for payment (but we allow all except treasury for flexibility)
  const oppositeAccountsList = accounts.filter(a => !mainAccountsList.find(ma => ma.id === a.id));

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      title={`إصدار سند ${type}`}
      description="سيتم إنشاء قيد محاسبي مزدوج تلقائياً بناءً على الحسابات المختارة."
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تاريخ السند</Label>
              <Input type="date" {...register("date")} />
              {errors.date && <p className="text-sm text-rose-500">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>المبلغ</Label>
              <Input type="number" step="0.01" {...register("amount")} placeholder="0.00" dir="ltr" />
              {errors.amount && <p className="text-sm text-rose-500">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>البيان / الوصف</Label>
            <Input {...register("description")} placeholder="اكتب تفاصيل الحركة (مثال: دفعة مقدمة من العميل...)" />
            {errors.description && <p className="text-sm text-rose-500">{errors.description.message}</p>}
          </div>

          <div className="bg-surface/50 p-4 rounded-xl border border-black/5 dark:border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-ink mb-2">التوجيه المحاسبي</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isReceipt ? "يُقبض إلى حساب (المدين)" : "يُصرف من حساب (الدائن)"}</Label>
                <Select {...register("mainAccountId")} disabled={isLoadingAccounts}>
                  <option value="">-- اختر الصندوق/البنك --</option>
                  {mainAccountsList.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </Select>
                {errors.mainAccountId && <p className="text-sm text-rose-500">{errors.mainAccountId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>{isReceipt ? "المُستلم منه (الدائن)" : "المدفوع لأجله (المدين)"}</Label>
                <Select {...register("oppositeAccountId")} disabled={isLoadingAccounts}>
                  <option value="">-- اختر الحساب المقابل --</option>
                  {oppositeAccountsList.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.category})</option>
                  ))}
                  {/* Fallback to show all accounts in case logic filters out something needed */}
                  {oppositeAccountsList.length === 0 && accounts.map(a => (
                     <option key={a.id} value={a.id}>{a.name} ({a.category})</option>
                  ))}
                </Select>
                {errors.oppositeAccountId && <p className="text-sm text-rose-500">{errors.oppositeAccountId.message}</p>}
              </div>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              * في سندات {isReceipt ? "القبض" : "الصرف"}، يكون الصندوق/البنك هو الطرف {isReceipt ? "المدين" : "الدائن"} (الذي {isReceipt ? "زادت" : "نقصت"} قيمته)، بينما يكون الطرف الآخر هو الطرف {isReceipt ? "الدائن" : "المدين"}.
            </p>
          </div>

          <div className="space-y-2">
            <Label>رقم المرجع (اختياري)</Label>
            <Input {...register("reference")} placeholder="رقم شيك، رقم فاتورة خارجية..." />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <Button type="button" variant="ghost" onClick={onClose}>إلغاء</Button>
            <Button 
              type="submit" 
              disabled={createVoucher.isPending} 
              className={`text-white rounded-full px-6 ${
                isReceipt ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {createVoucher.isPending ? "جاري الإصدار..." : "إصدار واعتماد السند"}
            </Button>
          </div>
      </form>
    </Dialog>
  );
}
