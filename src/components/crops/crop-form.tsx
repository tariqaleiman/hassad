"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cropSchema, type CropSchema } from "./crop-schema";
import type { Crop } from "@/lib/types/crop";

export function CropForm({
  defaultValues,
  onSubmit,
  loading,
  onCancel,
}: {
  defaultValues?: Crop | null;
  onSubmit: (values: CropSchema) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CropSchema>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      category: defaultValues?.category ?? "",
      harvestType: defaultValues?.harvestType ?? "حصاد واحد",
      productUnit: defaultValues?.productUnit ?? "كيلوجرام",
      seedUnit: defaultValues?.seedUnit ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
      category: defaultValues?.category ?? "",
      harvestType: defaultValues?.harvestType ?? "حصاد واحد",
      productUnit: defaultValues?.productUnit ?? "كيلوجرام",
      seedUnit: defaultValues?.seedUnit ?? "",
      notes: defaultValues?.notes ?? "",
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">اسم المحصول *</Label>
        <Input id="name" {...register("name")} placeholder="مثال: طماطم" />
        {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">التصنيف</Label>
          <Input id="category" {...register("category")} placeholder="مثال: خضروات" />
        </div>
        <div>
          <Label htmlFor="harvestType">نوع الحصاد *</Label>
          <Select id="harvestType" {...register("harvestType")}>
            <option value="حصاد واحد">حصاد واحد</option>
            <option value="متعدد الحصاد">متعدد الحصاد</option>
            <option value="مستمر">مستمر</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="productUnit">وحدة الإنتاج *</Label>
          <Input id="productUnit" {...register("productUnit")} placeholder="كيلوجرام" />
          {errors.productUnit && (
            <p className="mt-1 text-xs text-danger">{errors.productUnit.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="seedUnit">وحدة التقاوي</Label>
          <Input id="seedUnit" {...register("seedUnit")} placeholder="كيلوجرام" />
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
          {defaultValues ? "حفظ التعديلات" : "إضافة المحصول"}
        </Button>
      </div>
    </form>
  );
}
