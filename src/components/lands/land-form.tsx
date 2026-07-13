"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { landSchema, type LandSchema } from "./land-schema";
import type { Land } from "@/lib/types/land";
import type { Farm } from "@/lib/types/farm";

export function LandForm({
  defaultValues,
  farms,
  defaultFarmId,
  onSubmit,
  loading,
  onCancel,
}: {
  defaultValues?: Land | null;
  farms: Farm[];
  defaultFarmId?: string;
  onSubmit: (values: LandSchema) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LandSchema>({
    resolver: zodResolver(landSchema),
    defaultValues: {
      farmId: defaultValues?.farmId ?? defaultFarmId ?? "",
      name: defaultValues?.name ?? "",
      areaInFeddan: defaultValues?.areaInFeddan,
      soilType: defaultValues?.soilType ?? "",
      irrigationType: defaultValues?.irrigationType,
      notes: defaultValues?.notes ?? "",
    },
  });

  useEffect(() => {
    reset({
      farmId: defaultValues?.farmId ?? defaultFarmId ?? "",
      name: defaultValues?.name ?? "",
      areaInFeddan: defaultValues?.areaInFeddan,
      soilType: defaultValues?.soilType ?? "",
      irrigationType: defaultValues?.irrigationType,
      notes: defaultValues?.notes ?? "",
    });
  }, [defaultValues, defaultFarmId, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="farmId">المزرعة *</Label>
        <Select id="farmId" {...register("farmId")}>
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
        <Label htmlFor="name">اسم قطعة الأرض *</Label>
        <Input id="name" {...register("name")} placeholder="مثال: القطعة الشمالية" />
        {errors.name && (
          <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="areaInFeddan">المساحة (فدان) *</Label>
          <Input
            id="areaInFeddan"
            type="number"
            step="0.1"
            {...register("areaInFeddan", { valueAsNumber: true })}
          />
          {errors.areaInFeddan && (
            <p className="mt-1 text-xs text-danger">{errors.areaInFeddan.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="irrigationType">نوع الري</Label>
          <Select id="irrigationType" {...register("irrigationType")}>
            <option value="">غير محدد</option>
            <option value="غمر">غمر</option>
            <option value="رش">رش</option>
            <option value="تنقيط">تنقيط</option>
            <option value="أخرى">أخرى</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="soilType">نوع التربة</Label>
        <Input id="soilType" {...register("soilType")} placeholder="مثال: طينية" />
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
          {defaultValues ? "حفظ التعديلات" : "إضافة قطعة الأرض"}
        </Button>
      </div>
    </form>
  );
}
