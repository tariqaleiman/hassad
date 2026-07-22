"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { workerSchema, type WorkerSchema } from "./worker-schema";
import type { Worker } from "@/lib/types/worker";

export function WorkerForm({
  defaultValues,
  farmId,
  onSubmit,
  onCancel,
  loading,
}: {
  defaultValues?: Worker | null;
  farmId: string;
  onSubmit: (values: WorkerSchema) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<WorkerSchema>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      farmId: farmId,
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      type: defaultValues?.type ?? "يومي",
      dailyWage: defaultValues?.dailyWage,
      monthlyWage: defaultValues?.monthlyWage,
      specialty: defaultValues?.specialty ?? "",
      status: defaultValues?.status ?? "نشط",
      notes: defaultValues?.notes ?? "",
    },
  });

  const workerType = watch("type");

  useEffect(() => {
    if (defaultValues) {
      reset({
        farmId: farmId,
        name: defaultValues.name,
        phone: defaultValues.phone ?? "",
        type: defaultValues.type,
        dailyWage: defaultValues.dailyWage,
        monthlyWage: defaultValues.monthlyWage,
        specialty: defaultValues.specialty ?? "",
        status: defaultValues.status,
        notes: defaultValues.notes ?? "",
      });
    }
  }, [defaultValues, farmId, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">اسم العامل <span className="text-danger">*</span></Label>
          <Input id="name" {...register("name")} placeholder="اسم العامل بالكامل" />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input id="phone" {...register("phone")} dir="ltr" className="text-end" placeholder="01xxxxxxxxx" />
          {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">نوع العمالة</Label>
          <Select id="type" {...register("type")}>
            <option value="يومي">يومية</option>
            <option value="شهري">شهري / راتب</option>
            <option value="موسمي">موسمي</option>
          </Select>
          {errors.type && <p className="text-xs text-danger">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">حالة العمل</Label>
          <Select id="status" {...register("status")}>
            <option value="نشط">نشط (يعمل حالياً)</option>
            <option value="متوقف">متوقف</option>
          </Select>
          {errors.status && <p className="text-xs text-danger">{errors.status.message}</p>}
        </div>

        {workerType === "يومي" && (
          <div className="space-y-2">
            <Label htmlFor="dailyWage">الأجر اليومي (المتوقع) ج.م</Label>
            <Input id="dailyWage" type="number" step="1" min="0" {...register("dailyWage", { valueAsNumber: true })} />
            {errors.dailyWage && <p className="text-xs text-danger">{errors.dailyWage.message}</p>}
          </div>
        )}

        {workerType === "شهري" && (
          <div className="space-y-2">
            <Label htmlFor="monthlyWage">الراتب الشهري ج.م</Label>
            <Input id="monthlyWage" type="number" step="1" min="0" {...register("monthlyWage", { valueAsNumber: true })} />
            {errors.monthlyWage && <p className="text-xs text-danger">{errors.monthlyWage.message}</p>}
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="specialty">التخصص / المهارة الرئيسية</Label>
          <Input id="specialty" {...register("specialty")} placeholder="مثال: عامل ري، مشغل جرار، حصاد..." />
          {errors.specialty && <p className="text-xs text-danger">{errors.specialty.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">ملاحظات إضافية</Label>
          <Textarea id="notes" {...register("notes")} placeholder="أي تفاصيل أخرى تخص العامل..." rows={3} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={loading}>
          {defaultValues ? "حفظ التعديلات" : "إضافة العامل"}
        </Button>
      </div>
    </form>
  );
}
