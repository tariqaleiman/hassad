"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { equipmentSchema, type EquipmentSchema } from "./equipment-schema";
import type { Equipment } from "@/lib/types/equipment";

export function EquipmentForm({
  defaultValues,
  farmId,
  onSubmit,
  onCancel,
  loading,
}: {
  defaultValues?: Equipment | null;
  farmId: string;
  onSubmit: (values: EquipmentSchema) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EquipmentSchema>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      farmId: farmId,
      name: defaultValues?.name ?? "",
      type: defaultValues?.type ?? "جرار",
      status: defaultValues?.status ?? "يعمل",
      purchaseDate: defaultValues?.purchaseDate ?? "",
      purchaseValue: defaultValues?.purchaseValue,
      usefulLifeYears: defaultValues?.usefulLifeYears,
      salvageValue: defaultValues?.salvageValue,
      lastMaintenanceDate: defaultValues?.lastMaintenanceDate ?? "",
      nextMaintenanceDate: defaultValues?.nextMaintenanceDate ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        farmId: farmId,
        name: defaultValues.name,
        type: defaultValues.type,
        status: defaultValues.status,
        purchaseDate: defaultValues.purchaseDate ?? "",
        purchaseValue: defaultValues.purchaseValue,
        usefulLifeYears: defaultValues.usefulLifeYears,
        salvageValue: defaultValues.salvageValue,
        lastMaintenanceDate: defaultValues.lastMaintenanceDate ?? "",
        nextMaintenanceDate: defaultValues.nextMaintenanceDate ?? "",
        notes: defaultValues.notes ?? "",
      });
    }
  }, [defaultValues, farmId, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">اسم المعدة / الآلة <span className="text-danger">*</span></Label>
          <Input id="name" {...register("name")} placeholder="مثال: جرار كوبوتا 50 حصان" />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">النوع</Label>
          <Select id="type" {...register("type")}>
            <option value="جرار">جرار</option>
            <option value="محراث">محراث</option>
            <option value="رشاش">رشاش</option>
            <option value="حصادة">حصادة</option>
            <option value="مضخة ري">مضخة ري</option>
            <option value="أخرى">أخرى</option>
          </Select>
          {errors.type && <p className="text-xs text-danger">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">الحالة التشغيلية</Label>
          <Select id="status" {...register("status")}>
            <option value="يعمل">يعمل بكفاءة</option>
            <option value="معطل">معطل</option>
            <option value="في الصيانة">في الصيانة</option>
          </Select>
          {errors.status && <p className="text-xs text-danger">{errors.status.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchaseValue">قيمة الشراء</Label>
          <Input id="purchaseValue" type="number" step="1" min="0" {...register("purchaseValue", { valueAsNumber: true })} />
          {errors.purchaseValue && <p className="text-xs text-danger">{errors.purchaseValue.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="usefulLifeYears">العمر الافتراضي (سنوات)</Label>
          <Input id="usefulLifeYears" type="number" step="1" min="1" {...register("usefulLifeYears", { valueAsNumber: true })} />
          {errors.usefulLifeYears && <p className="text-xs text-danger">{errors.usefulLifeYears.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="salvageValue">القيمة التخريدية (الخردة)</Label>
          <Input id="salvageValue" type="number" step="1" min="0" {...register("salvageValue", { valueAsNumber: true })} />
          {errors.salvageValue && <p className="text-xs text-danger">{errors.salvageValue.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchaseDate">تاريخ الشراء / الانضمام</Label>
          <Input id="purchaseDate" type="date" {...register("purchaseDate")} />
          {errors.purchaseDate && <p className="text-xs text-danger">{errors.purchaseDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastMaintenanceDate">تاريخ آخر صيانة</Label>
          <Input id="lastMaintenanceDate" type="date" {...register("lastMaintenanceDate")} />
          {errors.lastMaintenanceDate && <p className="text-xs text-danger">{errors.lastMaintenanceDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextMaintenanceDate">موعد الصيانة القادمة</Label>
          <Input id="nextMaintenanceDate" type="date" {...register("nextMaintenanceDate")} />
          {errors.nextMaintenanceDate && <p className="text-xs text-danger">{errors.nextMaintenanceDate.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">ملاحظات المواصفات</Label>
          <Textarea id="notes" {...register("notes")} placeholder="مواصفات، رقم الشاسيه، أعطال متكررة..." rows={3} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={loading}>
          {defaultValues ? "حفظ التعديلات" : "إضافة المعدة"}
        </Button>
      </div>
    </form>
  );
}
