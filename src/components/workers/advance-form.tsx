import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, DollarSign } from "lucide-react";
import { laborAdvanceSchema, type LaborAdvanceSchema } from "./labor-schemas";
import type { Worker } from "@/lib/types/worker";

interface LaborAdvanceFormProps {
  workers: Worker[];
  defaultValues?: Partial<LaborAdvanceSchema>;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function LaborAdvanceForm({
  workers,
  defaultValues,
  onSubmit,
  onCancel,
  loading,
}: LaborAdvanceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<LaborAdvanceSchema>({
    resolver: zodResolver(laborAdvanceSchema) as any,
    defaultValues: {
      date: defaultValues?.date || new Date().toISOString().split("T")[0],
      amount: defaultValues?.amount || 0,
      paymentMethod: defaultValues?.paymentMethod || "cash",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Worker */}
        <div className="space-y-2">
          <Label htmlFor="workerId" className="text-ink font-medium">العامل</Label>
          <Select 
            id="workerId"
            {...register("workerId")}
            className="w-full"
            disabled={!!defaultValues?.workerId}
          >
            <option value="">-- اختر العامل --</option>
            {workers.filter(w => w.status === "نشط" || w.id === defaultValues?.workerId).map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
          {errors.workerId && <p className="text-sm text-danger">{errors.workerId.message}</p>}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-ink font-medium">تاريخ السلفة</Label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <Input
              id="date"
              type="date"
              className="ps-10"
              {...register("date")}
            />
          </div>
          {errors.date && <p className="text-sm text-danger">{errors.date.message}</p>}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-ink font-medium">مبلغ السلفة</Label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
              <DollarSign className="h-4 w-4" />
            </div>
            <Input
              id="amount"
              type="number"
              step="any"
              className="ps-10"
              {...register("amount")}
            />
          </div>
          {errors.amount && <p className="text-sm text-danger">{errors.amount.message}</p>}
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label htmlFor="paymentMethod" className="text-ink font-medium">وسيلة الدفع</Label>
          <Select
            id="paymentMethod"
            {...register("paymentMethod")}
            className="w-full"
          >
            <option value="cash">نقدي كاش (الصندوق)</option>
            <option value="instapay">إنستاباي (InstaPay)</option>
            <option value="vodafone_cash">فودافون كاش</option>
            <option value="orange_cash">أورانج كاش</option>
            <option value="bank_transfer">تحويل بنكي</option>
            <option value="other">أخرى</option>
          </Select>
          {errors.paymentMethod && <p className="text-sm text-danger">{errors.paymentMethod.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason" className="text-ink font-medium">سبب السلفة أو ملاحظات (اختياري)</Label>
        <Textarea
          id="reason"
          {...register("reason")}
          rows={2}
          className="resize-none"
        />
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
          type="submit" 
          loading={loading} 
          disabled={!isDirty && !defaultValues}
          className="rounded-full px-8 shadow-sm"
        >
          {defaultValues ? "حفظ التعديلات" : "تسجيل السلفة"}
        </Button>
      </div>
    </form>
  );
}
