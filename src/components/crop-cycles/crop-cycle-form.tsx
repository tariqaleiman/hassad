"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cropCycleSchema, type CropCycleSchema } from "./crop-cycle-schema";
import type { Land } from "@/lib/types/land";
import type { Crop } from "@/lib/types/crop";

export function CropCycleForm({
  farmId,
  seasonId,
  lands,
  crops,
  onSubmit,
  loading,
  onCancel,
}: {
  farmId: string;
  seasonId: string;
  lands: Land[];
  crops: Crop[];
  onSubmit: (values: CropCycleSchema) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CropCycleSchema>({
    resolver: zodResolver(cropCycleSchema),
    defaultValues: {
      farmId,
      seasonId,
      landId: "",
      cropId: "",
      cropVariety: "",
      cropSubVariety: "",
      areaValue: 0,
      areaUnit: "feddan",
      plantDate: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  const selectedCropId = useWatch({ control, name: "cropId" });
  const selectedVarietyName = useWatch({ control, name: "cropVariety" });

  const selectedCrop = useMemo(() => crops.find(c => c.id === selectedCropId), [crops, selectedCropId]);
  const varieties = selectedCrop?.varieties || [];
  
  const selectedVariety = useMemo(() => varieties.find(v => v.name === selectedVarietyName), [varieties, selectedVarietyName]);
  const subVarieties = selectedVariety?.subVarieties || [];

  // مسح الصنف والسلالة عند تغيير المحصول
  useEffect(() => {
    setValue("cropVariety", "");
    setValue("cropSubVariety", "");
  }, [selectedCropId, setValue]);

  // مسح السلالة عند تغيير الصنف
  useEffect(() => {
    setValue("cropSubVariety", "");
  }, [selectedVarietyName, setValue]);

  const handleFormSubmit = (values: CropCycleSchema) => {
    if (values.plantingMethod === "إعداد مشتل داخلي") {
      values.isNursery = true;
    }
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <input type="hidden" {...register("farmId")} />
      <input type="hidden" {...register("seasonId")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="landId">قطعة الأرض *</Label>
          <Select id="landId" {...register("landId")} className="mt-1.5">
            <option value="">اختر الأرض التي سيتم الزراعة فيها</option>
            {lands.map((land) => (
              <option key={land.id} value={land.id}>
                {land.name} - {land.areaValue} {land.areaUnit === "feddan" ? "فدان" : "قيراط"}
              </option>
            ))}
          </Select>
          {errors.landId && <p className="mt-1 text-xs text-danger">{errors.landId.message}</p>}
        </div>

        <div>
          <Label htmlFor="areaValue">المساحة المزروعة *</Label>
          <Input 
            id="areaValue" 
            type="number" 
            step="0.01"
            {...register("areaValue", { valueAsNumber: true })} 
            className="mt-1.5 bg-paper" 
            placeholder="مثال: 2.5"
          />
          {errors.areaValue && <p className="mt-1 text-xs text-danger">{errors.areaValue.message}</p>}
        </div>

        <div>
          <Label htmlFor="areaUnit">وحدة المساحة *</Label>
          <Select id="areaUnit" {...register("areaUnit")} className="mt-1.5">
            <option value="feddan">فدان</option>
            <option value="qirat">قيراط</option>
            <option value="meter">متر مربع</option>
          </Select>
          {errors.areaUnit && <p className="mt-1 text-xs text-danger">{errors.areaUnit.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cropId">المحصول *</Label>
          <Select id="cropId" {...register("cropId")} className="mt-1.5">
            <option value="">اختر المحصول</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
              </option>
            ))}
          </Select>
          {errors.cropId && <p className="mt-1 text-xs text-danger">{errors.cropId.message}</p>}
        </div>

        {varieties.length > 0 && (
          <div>
            <Label htmlFor="cropVariety">الصنف (اختياري)</Label>
            <Select id="cropVariety" {...register("cropVariety")} className="mt-1.5">
              <option value="">اختر الصنف</option>
              {varieties.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {subVarieties.length > 0 && (
          <div>
            <Label htmlFor="cropSubVariety">السلالة (اختياري)</Label>
            <Select id="cropSubVariety" {...register("cropSubVariety")} className="mt-1.5">
              <option value="">اختر السلالة</option>
              {subVarieties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="plantingMethod">طريقة الزراعة *</Label>
        <Select id="plantingMethod" {...register("plantingMethod")} className="mt-1.5">
          <option value="">اختر طريقة الزراعة</option>
          <option value="بدار">بدار (مباشرة في الأرض)</option>
          <option value="زراعة بالجورة">زراعة بالجورة (نقر / خطوط)</option>
          <option value="شتلات خارجية">شتلات خارجية (شراء جاهز)</option>
          <option value="إعداد مشتل داخلي">إعداد مشتل داخلي (مساحة صغيرة)</option>
          <option value="شتلات من مشتل داخلي">شتلات من مشتل داخلي (تم إعداده سابقاً)</option>
          <option value="عقلة">زراعة بالعقلة</option>
        </Select>
        {errors.plantingMethod && <p className="mt-1 text-xs text-danger">{errors.plantingMethod.message}</p>}
        {useWatch({ control, name: "plantingMethod" }) === "إعداد مشتل داخلي" && (
          <p className="mt-2 text-xs font-medium text-crop-600 bg-crop-50 p-2 rounded-md">
            💡 سيتم تسجيل هذه الدورة كـ "مشتل". يرجى اختيار القطعة المخصصة للمشتل (مساحة صغيرة).
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="plantDate">تاريخ الزراعة التقريبي (اختياري)</Label>
        <Input id="plantDate" type="date" {...register("plantDate")} className="mt-1.5" />
      </div>

      <div>
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea id="notes" {...register("notes")} rows={2} className="mt-1.5" placeholder="تفاصيل إضافية..." />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
        <Button type="button" variant="ghost" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={loading} className="shadow-md hover:shadow-lg transition-all">
          إضافة المحصول
        </Button>
      </div>
    </form>
  );
}
