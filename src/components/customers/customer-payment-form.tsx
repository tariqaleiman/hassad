"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCurrency } from "@/lib/hooks/use-currency";
import type { CustomerPaymentFormValues } from "@/lib/types/customer";

const paymentSchema = z.object({
  amount: z.number().min(1, "المبلغ يجب أن يكون أكبر من صفر"),
  date: z.string().min(1, "تاريخ الدفع مطلوب"),
  paymentMethod: z.enum(["cash", "bank_transfer", "instapay", "vodafone_cash", "orange_cash", "other"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export function CustomerPaymentForm({
  customerId,
  farmId,
  customerName,
  currentBalance,
  onSubmit,
  loading,
  onCancel,
}: {
  customerId: string;
  farmId: string;
  customerName: string;
  currentBalance: number;
  onSubmit: (values: CustomerPaymentFormValues) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const { formatMoney } = useCurrency();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: currentBalance > 0 ? currentBalance : 0,
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "cash",
      reference: "",
      notes: "",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const submitWrapper = (data: z.infer<typeof paymentSchema>) => {
    onSubmit({
      ...data,
      customerId,
      farmId,
    });
  };

  return (
    <form onSubmit={handleSubmit(submitWrapper)} className="space-y-6">
      <div className="bg-sky-50 dark:bg-sky-500/10 p-4 rounded-xl border border-sky-100 dark:border-sky-500/20 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-sky-600/80">الدين المستحق على العميل</p>
          <p className="font-bold text-sky-700 dark:text-sky-400">{customerName}</p>
        </div>
        <div className="text-left">
          <p className="text-2xl font-bold text-sky-700 dark:text-sky-400">{formatMoney(currentBalance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="amount">المبلغ المدفوع *</Label>
          <Input 
            id="amount" 
            type="number" 
            step="0.01" 
            className="text-lg font-bold"
            {...register("amount", { valueAsNumber: true })} 
          />
          {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date">تاريخ الدفع *</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="paymentMethod">طريقة الدفع *</Label>
          <Select id="paymentMethod" {...register("paymentMethod")}>
            <option value="cash">نقدي (كاش)</option>
            <option value="instapay">إنستاباي (InstaPay)</option>
            <option value="vodafone_cash">فودافون كاش</option>
            <option value="orange_cash">أورانج كاش</option>
            <option value="bank_transfer">تحويل بنكي</option>
            <option value="other">أخرى</option>
          </Select>
          {errors.paymentMethod && <p className="text-xs text-red-500">{errors.paymentMethod.message}</p>}
        </div>

        {paymentMethod !== "cash" && (
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="reference">رقم العملية / المرجع (اختياري)</Label>
            <Input 
              id="reference" 
              placeholder="مثال: رقم التحويل، رقم الهاتف المحول منه..." 
              {...register("reference")} 
            />
          </div>
        )}

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="notes">ملاحظات (اختياري)</Label>
          <Textarea 
            id="notes" 
            placeholder="أي تفاصيل إضافية حول الدفعة..." 
            rows={2} 
            {...register("notes")} 
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          إلغاء
        </Button>
        <Button type="submit" disabled={loading} className="bg-success text-white hover:bg-success/90">
          {loading ? "جاري الحفظ..." : "تسجيل الدفعة"}
        </Button>
      </div>
    </form>
  );
}
