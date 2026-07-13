"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { seasonSchema, type SeasonSchema } from "./season-schema";
import type { Season } from "@/lib/types/season";
import type { Farm } from "@/lib/types/farm";

export function SeasonForm({
  defaultValues,
  farms,
  defaultFarmId,
  onSubmit,
  loading,
  onCancel,
}: {
  defaultValues?: Season | null;
  farms: Farm[];
  defaultFarmId?: string;
  onSubmit: (values: SeasonSchema) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SeasonSchema>({
    resolver: zodResolver(seasonSchema),
    defaultValues: {
      farmId: defaultValues?.farmId ?? defaultFarmId ?? "",
      name: defaultValues?.name ?? "",
      type: defaultValues?.type ?? "صيفي",
      startDate: defaultValues?.startDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      notes: defaultValues?.notes ?? "",
    },
  });

  useEffect(() => {
    reset({
      farmId: defaultValues?.farmId ?? defaultFarmId ?? "",
      name: defaultValues?.name ?? "",
      type: defaultValues?.type ?? "صيفي",
      startDate: defaultValues?.startDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      notes: defaultValues?.notes ?? "",
    });
  }, [defaultValues, defaultFarmId, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="farmId">المزرعة *</Label>
        <Select id="farmId" {...register("farmId")} disabled={!!defaultValues}>
          <option value="">اختر المزرعة</option>
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </Select>
        {errors.farmId && (
          <p className="mt-1 text-xs text-danger">{errors.farmId.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="name">اسم الموسم *</Label>
        <Input id="name" {...register("name")} placeholder="مثال: موسم صيف 2026" />
        {errors.name && (
          <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">نوع الموسم *</Label>
          <Select id="type" {...register("type")}>
            <option value="صيفي">صيفي</option>
            <option value="شتوي">شتوي</option>
            <option value="نيلي">نيلي</option>
            <option value="مخصص">مخصص</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="startDate">تاريخ البداية *</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
          {errors.startDate && (
            <p className="mt-1 text-xs text-danger">{errors.startDate.message}</p>
          )}
        </div>
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
