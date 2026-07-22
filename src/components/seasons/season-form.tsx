"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCurrency } from "@/lib/hooks/use-currency";
import { seasonSchema, type SeasonSchema } from "./season-schema";
import type { Season } from "@/lib/types/season";
import type { Farm } from "@/lib/types/farm";

export function SeasonForm({
  defaultValues,
  farmId,
  onSubmit,
  loading,
  onCancel,
}: {
  defaultValues?: Season | null;
  farmId: string;
  onSubmit: (values: SeasonSchema) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const { currency } = useCurrency();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SeasonSchema>({
    resolver: zodResolver(seasonSchema),
    defaultValues: {
      farmId: defaultValues?.farmId ?? farmId,
      name: defaultValues?.name ?? "",
      type: defaultValues?.type ?? "صيفي",
      expectedBudget: defaultValues?.expectedBudget ?? null,
      expectedRevenue: defaultValues?.expectedRevenue ?? null,
      startDate: defaultValues?.startDate ?? new Date().toISOString().split("T")[0],
      description: defaultValues?.description ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  useEffect(() => {
    reset({
      farmId: defaultValues?.farmId ?? farmId,
      name: defaultValues?.name ?? "",
      type: defaultValues?.type ?? "صيفي",
      expectedBudget: defaultValues?.expectedBudget ?? null,
      expectedRevenue: defaultValues?.expectedRevenue ?? null,
      startDate: defaultValues?.startDate ?? new Date().toISOString().split("T")[0],
      description: defaultValues?.description ?? "",
      notes: defaultValues?.notes ?? "",
    });
  }, [defaultValues, farmId, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register("farmId")} />

      <div>
        <Label htmlFor="name">اسم الموسم *</Label>
        <Input id="name" {...register("name")} placeholder="مثال: موسم صيف 2026" className="mt-1.5" />
        {errors.name && (
          <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="startDate">تاريخ بداية الموسم *</Label>
        <Input id="startDate" type="date" {...register("startDate")} className="mt-1.5" />
        {errors.startDate && (
          <p className="mt-1 text-xs text-danger">{errors.startDate.message}</p>
        )}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expectedBudget">الميزانية التقديرية ({currency}) - المصروفات</Label>
          <Input id="expectedBudget" type="number" step="0.01" {...register("expectedBudget", { valueAsNumber: true })} className="mt-1.5" placeholder="مثال: 50000" />
          {errors.expectedBudget && (
            <p className="mt-1 text-xs text-danger">{errors.expectedBudget.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="expectedRevenue">الإيراد المتوقع ({currency}) - المبيعات</Label>
          <Input id="expectedRevenue" type="number" step="0.01" {...register("expectedRevenue", { valueAsNumber: true })} className="mt-1.5" placeholder="مثال: 80000" />
          {errors.expectedRevenue && (
            <p className="mt-1 text-xs text-danger">{errors.expectedRevenue.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="type">نوع الموسم *</Label>
        <Select id="type" {...register("type")} className="mt-1.5">
          <option value="صيفي">صيفي</option>
          <option value="شتوي">شتوي</option>
          <option value="نيلي">نيلي</option>
          <option value="مستديم">مستديم</option>
          <option value="محيّر">محيّر</option>
          <option value="مخصص">مخصص</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">وصف الموسم وأهدافه</Label>
        <Textarea id="description" {...register("description")} rows={2} className="mt-1.5" placeholder="أهداف الموسم أو أي معلومات هامة..." />
      </div>

      <div>
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={loading}>
          {defaultValues ? "حفظ التعديلات" : "إنشاء الموسم"}
        </Button>
      </div>
    </form>
  );
}
