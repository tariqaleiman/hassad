"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { harvestSchema, type HarvestSchema } from "./harvest-schema";
import type { CropCycle } from "@/lib/types/crop-cycle";

export function HarvestForm({
  cycle,
  onSubmit,
  onCancel,
  loading,
}: {
  cycle: CropCycle;
  onSubmit: (values: HarvestSchema) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HarvestSchema>({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      harvestDate: new Date().toISOString().split("T")[0],
      yieldQuantity: cycle.yieldQuantity ?? null,
      yieldUnit: cycle.yieldUnit ?? "طن",
      yieldGrade: cycle.yieldGrade ?? "جيد جداً",
      actualRevenue: cycle.actualRevenue ?? null,
      harvestNotes: cycle.harvestNotes ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="bg-paper-sunken/40 border border-border/50 rounded-xl p-4 text-sm text-ink-muted">
        يرجى إدخال تفاصيل الحصاد بدقة. يمكن ترك حقول الكمية فارغة إذا لم تتوفر الأرقام النهائية بعد، وتحديثها لاحقاً.
      </div>

      <div>
        <Label htmlFor="harvestDate">تاريخ الحصاد الفعلي *</Label>
        <Input id="harvestDate" type="date" {...register("harvestDate")} className="mt-1.5" />
        {errors.harvestDate && (
          <p className="mt-1 text-xs text-danger">{errors.harvestDate.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="yieldQuantity">الكمية المحصودة (تقريبي/فعلي)</Label>
          <Input id="yieldQuantity" type="number" step="0.01" {...register("yieldQuantity", { valueAsNumber: true })} placeholder="مثال: 15.5" className="mt-1.5" />
          {errors.yieldQuantity && (
            <p className="mt-1 text-xs text-danger">{errors.yieldQuantity.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="yieldUnit">وحدة القياس</Label>
          <Select id="yieldUnit" {...register("yieldUnit")} className="mt-1.5">
            <option value="طن">طن</option>
            <option value="كيلو">كيلو</option>
            <option value="أردب">أردب</option>
            <option value="قنطار">قنطار</option>
            <option value="شيكارة">شيكارة</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="yieldGrade">جودة المحصول</Label>
        <Select id="yieldGrade" {...register("yieldGrade")} className="mt-1.5">
          <option value="ممتاز">ممتاز</option>
          <option value="جيد جداً">جيد جداً</option>
          <option value="جيد">جيد</option>
          <option value="مقبول">مقبول</option>
          <option value="ضعيف">ضعيف</option>
          <option value="تالف">تالف</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="actualRevenue">الإيراد الفعلي من بيع المحصول (ج.م) - اختياري</Label>
        <Input id="actualRevenue" type="number" step="0.01" {...register("actualRevenue", { valueAsNumber: true })} placeholder="مثال: 45000" className="mt-1.5" />
        {errors.actualRevenue && (
          <p className="mt-1 text-xs text-danger">{errors.actualRevenue.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="harvestNotes">ملاحظات الحصاد (اختياري)</Label>
        <Textarea id="harvestNotes" {...register("harvestNotes")} rows={3} className="mt-1.5" placeholder="سجل أي ملاحظات عن عملية الحصاد، حالة الطقس، العمالة، إلخ..." />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          تأكيد الحصاد
        </Button>
      </div>
    </form>
  );
}
