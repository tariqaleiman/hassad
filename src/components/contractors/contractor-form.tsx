"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ContractorFormValues, ContractorType } from "@/lib/types/contractor";
import type { Farm } from "@/lib/types/farm";

const CONTRACTOR_TYPES: ContractorType[] = [
  "عمالة",
  "جرار زراعي",
  "آلات حصاد",
  "نقل",
  "أخرى",
];

const contractorSchema = z.object({
  farmId: z.string().min(1, "اختر المزرعة"),
  name: z.string().min(2, "اسم المقاول مطلوب"),
  phone: z.string().optional(),
  type: z.enum(["عمالة", "جرار زراعي", "آلات حصاد", "نقل", "أخرى"] as const, {
    error: "اختر نوع المقاول",
  }),
  customType: z.string().optional(),
  initialBalance: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export function ContractorForm({
  farms,
  onSubmit,
  loading,
  onCancel,
  defaultValues,
  isEdit,
}: {
  farms: Farm[];
  onSubmit: (values: ContractorFormValues) => void;
  loading?: boolean;
  onCancel: () => void;
  defaultValues?: Partial<ContractorFormValues>;
  isEdit?: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ContractorFormValues>({
    resolver: zodResolver(contractorSchema),
    defaultValues: defaultValues || {
      farmId: farms.length === 1 ? farms[0].id : "",
      name: "",
      phone: "",
      type: "عمالة",
      customType: "",
      initialBalance: 0,
      notes: "",
    },
  });

  const selectedType = watch("type");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* المزرعة */}
      <div className={farms.length === 1 ? "hidden" : "block"}>
        <Label htmlFor="farmId">المزرعة *</Label>
        <Select id="farmId" {...register("farmId")}>
          <option value="">اختر المزرعة</option>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </Select>
        {errors.farmId && <p className="mt-1 text-xs text-danger">{errors.farmId.message}</p>}
      </div>

      {/* المعلومات الأساسية */}
      <div className="bg-paper-sunken/30 p-5 rounded-2xl border border-border space-y-4">
        <h3 className="font-bold text-base text-ink border-b border-border pb-2">بيانات المقاول</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">اسم المقاول *</Label>
            <Input id="name" {...register("name")} placeholder="مثال: محمد زين" />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input id="phone" {...register("phone")} placeholder="01xxxxxxxxx" dir="ltr" className="text-left" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">نوع المقاول *</Label>
            <Select id="type" {...register("type")}>
              {CONTRACTOR_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            {errors.type && <p className="mt-1 text-xs text-danger">{errors.type.message}</p>}
          </div>

          {selectedType === "أخرى" && (
            <div>
              <Label htmlFor="customType">حدد النوع</Label>
              <Input id="customType" {...register("customType")} placeholder="مثال: مقاول حفر آبار" />
            </div>
          )}
        </div>
      </div>

      {/* الرصيد الافتتاحي */}
      {!isEdit && (
        <div className="bg-paper-sunken/30 p-5 rounded-2xl border border-border space-y-3">
          <h3 className="font-bold text-base text-ink border-b border-border pb-2">الرصيد الافتتاحي (اختياري)</h3>
          <p className="text-xs text-ink-muted">
            إذا كان لديك دين سابق لهذا المقاول قبل استخدام النظام، أدخل المبلغ المستحق له.
          </p>
          <div className="max-w-xs">
            <Label htmlFor="initialBalance">المبلغ المستحق (ج.م)</Label>
            <Input
              id="initialBalance"
              type="number"
              step="0.01"
              {...register("initialBalance", { valueAsNumber: true })}
            />
          </div>
        </div>
      )}

      {/* ملاحظات */}
      <div>
        <Label htmlFor="notes">ملاحظات (اختياري)</Label>
        <Textarea id="notes" {...register("notes")} placeholder="أي ملاحظات إضافية عن المقاول..." />
      </div>

      {/* الأزرار */}
      <div className="flex gap-3 justify-end pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? "حفظ التعديلات" : "إضافة المقاول"}
        </Button>
      </div>
    </form>
  );
}
