"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cropCycleSchema, type CropCycleSchema } from "./crop-cycle-schema";
import type { Farm } from "@/lib/types/farm";
import type { Land } from "@/lib/types/land";
import type { Season } from "@/lib/types/season";
import type { Crop } from "@/lib/types/crop";

import type { CropCycle } from "@/lib/types/crop-cycle";

export function CropCycleForm({
  farms,
  lands,
  seasons,
  crops,
  defaultValues,
  onSubmit,
  loading,
  onCancel,
}: {
  farms: Farm[];
  lands: Land[];
  seasons: Season[];
  crops: Crop[];
  defaultValues?: CropCycle | null;
  onSubmit: (values: CropCycleSchema) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<CropCycleSchema>({
    resolver: zodResolver(cropCycleSchema) as any,
    defaultValues: defaultValues ? {
      farmId: defaultValues.farmId,
      landId: defaultValues.landId,
      seasonId: defaultValues.seasonId,
      cropId: defaultValues.cropId,
      cropVariety: defaultValues.cropVariety || "",
      cropSubVariety: defaultValues.cropSubVariety || "",
      plantDate: defaultValues.plantDate || "",
      areaValue: defaultValues.areaValue,
      areaUnit: defaultValues.areaUnit,
      plantingMethod: defaultValues.plantingMethod,
      isNursery: defaultValues.isNursery,
      sourceNurseryId: defaultValues.sourceNurseryId,
      notes: defaultValues.notes || "",
    } : { farmId: "", landId: "", seasonId: "", cropId: "", cropVariety: "", cropSubVariety: "", plantDate: "", areaValue: 0, areaUnit: "feddan" },
  });

  // تحديث القيم عند فتح النافذة ببيانات جديدة
  useEffect(() => {
    if (defaultValues) {
      reset({
        farmId: defaultValues.farmId,
        landId: defaultValues.landId,
        seasonId: defaultValues.seasonId,
        cropId: defaultValues.cropId,
        cropVariety: defaultValues.cropVariety || "",
        cropSubVariety: defaultValues.cropSubVariety || "",
        plantDate: defaultValues.plantDate || "",
        areaValue: defaultValues.areaValue,
        areaUnit: defaultValues.areaUnit,
        plantingMethod: defaultValues.plantingMethod,
        isNursery: defaultValues.isNursery,
        sourceNurseryId: defaultValues.sourceNurseryId,
        notes: defaultValues.notes || "",
      });
    } else {
      reset({ farmId: "", landId: "", seasonId: "", cropId: "", cropVariety: "", cropSubVariety: "", plantDate: "", areaValue: 0, areaUnit: "feddan" });
    }
  }, [defaultValues, reset]);

  const selectedFarmId = watch("farmId");
  const selectedCropId = useWatch({ control, name: "cropId" });
  const selectedVarietyName = useWatch({ control, name: "cropVariety" });
  
  // نراقب كل الحقول التي تستخدم مكون Select المخصص لتحديث قيمته الداخلية عند استدعاء reset
  const formValues = watch();

  const selectedCrop = useMemo(() => crops.find(c => c.id === selectedCropId), [crops, selectedCropId]);
  const varieties = selectedCrop?.varieties || [];
  
  const selectedVariety = useMemo(() => varieties.find(v => v.name === selectedVarietyName), [varieties, selectedVarietyName]);
  const subVarieties = selectedVariety?.subVarieties || [];

  // مسح الصنف والسلالة عند تغيير المحصول
  useEffect(() => {
    if (selectedCropId && selectedCropId !== defaultValues?.cropId) {
      setValue("cropVariety", "");
      setValue("cropSubVariety", "");
    }
  }, [selectedCropId, defaultValues?.cropId, setValue]);

  // مسح السلالة عند تغيير الصنف
  useEffect(() => {
    if (selectedVarietyName && selectedVarietyName !== defaultValues?.cropVariety) {
      setValue("cropSubVariety", "");
    }
  }, [selectedVarietyName, defaultValues?.cropVariety, setValue]);

  const farmLands = useMemo(
    () => lands.filter((l) => l.farmId === selectedFarmId),
    [lands, selectedFarmId]
  );
  const farmSeasons = useMemo(
    () => seasons.filter((s) => s.farmId === selectedFarmId && s.status === "مفتوح"),
    [seasons, selectedFarmId]
  );

  const handleFormSubmit = (values: CropCycleSchema) => {
    if (values.plantingMethod === "إعداد مشتل داخلي") {
      values.isNursery = true;
    }
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="farmId">المزرعة *</Label>
          <Select id="farmId" {...register("farmId")} value={formValues.farmId} className="mt-1.5" disabled={!!defaultValues}>
            <option value="">اختر المزرعة</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
          {errors.farmId && <p className="mt-1 text-xs text-danger">{errors.farmId.message}</p>}
        </div>

        <div>
          <Label htmlFor="landId">قطعة الأرض *</Label>
          <Select id="landId" {...register("landId")} value={formValues.landId} className="mt-1.5" disabled={!!defaultValues || !selectedFarmId}>
            <option value="">اختر الأرض</option>
            {farmLands.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} - {l.areaValue} {l.areaUnit === "feddan" ? "فدان" : "قيراط"}
              </option>
            ))}
          </Select>
          {errors.landId && <p className="mt-1 text-xs text-danger">{errors.landId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="seasonId">الموسم المفتوح *</Label>
          <Select id="seasonId" {...register("seasonId")} value={formValues.seasonId} className="mt-1.5" disabled={!!defaultValues || !selectedFarmId}>
            <option value="">اختر الموسم</option>
            {farmSeasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          {errors.seasonId && (
            <p className="mt-1 text-xs text-danger">{errors.seasonId.message}</p>
          )}
          {selectedFarmId && farmSeasons.length === 0 && (
            <p className="mt-1 text-xs text-ink-faint">لا يوجد موسم مفتوح لهذه المزرعة.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="areaValue">المساحة *</Label>
          <Input 
            id="areaValue" 
            type="number" 
            step="0.01" 
            {...register("areaValue")} 
            disabled={!selectedFarmId} 
          />
          {errors.areaValue && <p className="mt-1 text-xs text-danger">{errors.areaValue.message}</p>}
        </div>
        <div>
          <Label htmlFor="areaUnit">الوحدة *</Label>
          <Select id="areaUnit" {...register("areaUnit")} value={formValues.areaUnit} className="mt-1.5" disabled={!selectedFarmId}>
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
        <Select id="cropId" {...register("cropId")} value={formValues.cropId} className="mt-1.5 bg-paper" disabled={!!defaultValues}>
          <option value="">اختر المحصول</option>
          {crops.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        {errors.cropId && <p className="mt-1 text-xs text-danger">{errors.cropId.message}</p>}
        {crops.length === 0 && (
            <p className="mt-1 text-xs text-ink-faint">
              قاعدة بيانات المحاصيل فارغة — أضف محصولًا أولًا.
            </p>
          )}
      </div> 

        {varieties.length > 0 && (
          <div>
            <Label htmlFor="cropVariety">الصنف (اختياري)</Label>
            <Select id="cropVariety" {...register("cropVariety")} value={formValues.cropVariety}>
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
          <div className="md:col-span-2">
            <Label htmlFor="cropSubVariety">السلالة (اختياري)</Label>
            <Select id="cropSubVariety" {...register("cropSubVariety")} value={formValues.cropSubVariety}>
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
        <Select id="plantingMethod" {...register("plantingMethod")} value={formValues.plantingMethod}>
          <option value="">اختر طريقة الزراعة</option>
          <option value="بدار">بدار (مباشرة في الأرض)</option>
          <option value="زراعة بالجورة">زراعة بالجورة (نقر / خطوط)</option>
          <option value="شتلات خارجية">شتلات خارجية (شراء جاهز)</option>
          <option value="إعداد مشتل داخلي">إعداد مشتل داخلي (مساحة صغيرة)</option>
          <option value="شتلات من مشتل داخلي">شتلات من مشتل داخلي (تم إعداده سابقاً)</option>
          <option value="عقلة">زراعة بالعقلة</option>
        </Select>
        {errors.plantingMethod && <p className="mt-1 text-xs text-danger">{errors.plantingMethod.message}</p>}
        {watch("plantingMethod") === "إعداد مشتل داخلي" && (
          <p className="mt-2 text-xs font-medium text-crop-600 bg-crop-50 p-2 rounded-md">
            💡 سيتم تسجيل هذه الدورة كـ "مشتل". يرجى اختيار القطعة المخصصة للمشتل (مساحة صغيرة).
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="plantDate">تاريخ الزراعة (اختياري)</Label>
        <Input id="plantDate" type="date" {...register("plantDate")} />
        <p className="mt-1 text-xs text-ink-faint">
          لا يشترط تسجيله الآن — يمكن إضافته لاحقًا عند تسجيل عملية الزراعة.
        </p>
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
          إنشاء دورة المحصول
        </Button>
      </div>
    </form>
  );
}
