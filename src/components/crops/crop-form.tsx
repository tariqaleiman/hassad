"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cropSchema, type CropSchema } from "./crop-schema";
import type { Crop, CropFormValues } from "@/lib/types/crop";

export function CropForm({
  defaultValues,
  onSubmit,
  loading,
  onCancel,
}: {
  defaultValues?: Crop | null;
  onSubmit: (values: CropFormValues) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CropSchema>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      category: defaultValues?.category ?? "",
      imageUrl: defaultValues?.imageUrl ?? "",
      harvestType: defaultValues?.harvestType ?? "حصاد واحد",
      harvestBatchName: defaultValues?.harvestBatchName ?? "",
      productUnit: defaultValues?.productUnit ?? "كيلوجرام",
      seedUnit: defaultValues?.seedUnit ?? "",
      varieties: defaultValues?.varieties?.map(v => ({
        name: v.name,
        subVarietiesText: v.subVarieties ? v.subVarieties.join("، ") : ""
      })) ?? [],
      notes: defaultValues?.notes ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "varieties",
  });

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
      category: defaultValues?.category ?? "",
      imageUrl: defaultValues?.imageUrl ?? "",
      harvestType: defaultValues?.harvestType ?? "حصاد واحد",
      harvestBatchName: defaultValues?.harvestBatchName ?? "",
      productUnit: defaultValues?.productUnit ?? "كيلوجرام",
      seedUnit: defaultValues?.seedUnit ?? "",
      varieties: defaultValues?.varieties?.map(v => ({
        name: v.name,
        subVarietiesText: v.subVarieties ? v.subVarieties.join("، ") : ""
      })) ?? [],
      notes: defaultValues?.notes ?? "",
    });
  }, [defaultValues, reset]);

  const handleFormSubmit = (data: CropSchema) => {
    const mappedVarieties = data.varieties?.map(v => ({
      name: v.name,
      subVarieties: v.subVarietiesText
        ? v.subVarietiesText.split("،").map(s => s.trim()).filter(s => s.length > 0)
        : undefined
    }));
    
    onSubmit({
      ...data,
      varieties: mappedVarieties && mappedVarieties.length > 0 ? mappedVarieties : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">اسم المحصول *</Label>
          <Input id="name" {...register("name")} placeholder="مثال: ذرة شامية" />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">التصنيف</Label>
            <Input id="category" {...register("category")} placeholder="مثال: حبوب" />
          </div>
          <div>
            <Label htmlFor="imageUrl">رابط صورة المحصول (اختياري)</Label>
            <Input id="imageUrl" {...register("imageUrl")} placeholder="https://example.com/image.jpg" dir="ltr" className="text-end" />
            {errors.imageUrl && <p className="mt-1 text-xs text-danger">{errors.imageUrl.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="harvestType">نوع الحصاد *</Label>
            <Select id="harvestType" {...register("harvestType")}>
              <option value="حصاد واحد">حصاد واحد</option>
              <option value="متعدد الحصاد">متعدد الحصاد</option>
              <option value="مستمر">مستمر</option>
            </Select>
          </div>
        </div>

        {useWatch({ control, name: "harvestType" }) !== "حصاد واحد" && (
          <div>
            <Label htmlFor="harvestBatchName">مسمى دفعة الحصاد (اختياري)</Label>
            <Input id="harvestBatchName" {...register("harvestBatchName")} placeholder="مثال: حشة، بطن، جنية، قطفة" />
            <p className="mt-1 text-xs text-ink-muted">تُستخدم لتسمية دفعات الحصاد (مثلاً: الحشة الأولى، الجنية الثانية).</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="productUnit">وحدة الإنتاج *</Label>
            <Input id="productUnit" {...register("productUnit")} placeholder="مثال: كيلوجرام أو إردب" />
            {errors.productUnit && (
              <p className="mt-1 text-xs text-danger">{errors.productUnit.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="seedUnit">وحدة التقاوي</Label>
            <Input id="seedUnit" {...register("seedUnit")} placeholder="كيلوجرام" />
          </div>
        </div>
      </div>

      {/* الأصناف */}
      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Label className="text-base font-bold">الأصناف (Varieties)</Label>
            <p className="text-xs text-ink-muted mt-1">أضف أصناف المحصول (مثل: أرز عريض، أرز رفيع) وسلالاتها إن وجدت.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", subVarietiesText: "" })}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            إضافة صنف
          </Button>
        </div>

        {fields.length === 0 ? (
          <p className="text-sm text-ink-muted text-center py-4">لا توجد أصناف مضافة.</p>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3 bg-background p-3 rounded-md border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                  <div>
                    <Label className="text-xs mb-1">اسم الصنف *</Label>
                    <Input
                      {...register(`varieties.${index}.name` as const)}
                      placeholder="مثال: أبيض، أصفر، رفيع..."
                      className="h-8"
                    />
                    {errors.varieties?.[index]?.name && (
                      <p className="mt-1 text-xs text-danger">{errors.varieties[index]?.name?.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs mb-1">سلالات الصنف (افصل بينها بفاصلة ،)</Label>
                    <Input
                      {...register(`varieties.${index}.subVarietiesText` as const)}
                      placeholder="مثال: سخا 178، جيزة 177"
                      className="h-8"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-danger hover:bg-danger/10 hover:text-danger mt-6"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
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
