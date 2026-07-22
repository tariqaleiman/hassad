"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

import { useCurrency } from "@/lib/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calculator } from "lucide-react";
import { landSchema, type LandSchema } from "./land-schema";
import type { Land } from "@/lib/types/land";
import { AreaCalculatorDialog } from "./area-calculator";

export function LandForm({
  defaultValues,
  farmId,
  onSubmit,
  loading,
  onCancel,
}: {
  defaultValues?: Land | null;
  farmId: string;
  onSubmit: (values: LandSchema) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const { currency } = useCurrency();
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<LandSchema>({
    resolver: zodResolver(landSchema),
    defaultValues: {
      farmId: defaultValues?.farmId ?? farmId,
      name: defaultValues?.name ?? "",
      areaValue: defaultValues?.areaValue ?? 0,
      areaUnit: defaultValues?.areaUnit ?? "qirat",
      areaCalculatorData: defaultValues?.areaCalculatorData,
      soilType: defaultValues?.soilType ?? "",
      irrigationType: defaultValues?.irrigationType,
      notes: defaultValues?.notes ?? "",
      tenure: defaultValues?.tenure ?? {
        category: "owned_full",
      },
    },
  });

  const tenureCategory = useWatch({ control, name: "tenure.category" });
  const areaUnit = useWatch({ control, name: "areaUnit" });
  const areaValue = useWatch({ control, name: "areaValue" });
  const rentCropShareRatio = useWatch({ control, name: "tenure.rentCropShare.ratio" });

  const showPartnerInfo = tenureCategory === "owned_partner" || tenureCategory === "rented_partner";
  const showLandlordInfo = tenureCategory.startsWith("rented_");
  const showRentCashInfo = tenureCategory === "rented_cash";
  const showRentCropShareInfo = tenureCategory === "rented_crop_share";

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        farmId: defaultValues.farmId || farmId,
      } as any);
    }
  }, [defaultValues, farmId, reset]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* 1. Basic Info */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg border-b border-border/50 pb-2">البيانات الأساسية</h3>
          
          <div>
            <Label htmlFor="name">اسم قطعة الأرض *</Label>
            <Input id="name" {...register("name")} placeholder="مثال: القطعة الشمالية، أرض الحاج..." />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <Label>المساحة *</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  type="number"
                  step="any"
                  {...register("areaValue", { valueAsNumber: true })}
                  className="flex-1"
                  placeholder="0"
                />
                <Select {...register("areaUnit")} className="w-24">
                  <option value="qirat">قيراط</option>
                  <option value="feddan">فدان</option>
                </Select>
              </div>
              {errors.areaValue && <p className="mt-1 text-xs text-danger">{errors.areaValue.message}</p>}
            </div>
            <div>
              <Button type="button" variant="outline" className="w-full gap-2 border-crop-300 text-crop-700 bg-crop-50/50 hover:bg-crop-100" onClick={() => setCalculatorOpen(true)}>
                <Calculator className="h-4 w-4" />
                حاسبة المساحة الفلاحي
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="irrigationType">نوع الري</Label>
              <Select id="irrigationType" {...register("irrigationType")} className="mt-1.5">
                <option value="">غير محدد</option>
                <option value="غمر">غمر</option>
                <option value="رش">رش</option>
                <option value="تنقيط">تنقيط</option>
                <option value="أخرى">أخرى</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="soilType">نوع التربة</Label>
              <Select id="soilType" {...register("soilType")} className="mt-1.5">
                <option value="">غير محدد</option>
                <option value="طينية">طينية (سوداء)</option>
                <option value="رملية">رملية</option>
                <option value="صفراء">صفراء (طميية)</option>
                <option value="جيرية">جيرية</option>
                <option value="مختلطة">مختلطة</option>
              </Select>
            </div>
          </div>
        </div>

        {/* 2. Tenure Info */}
        <div className="space-y-4 bg-paper-sunken/40 p-5 rounded-2xl border border-border/60">
          <h3 className="font-bold text-lg border-b border-border/50 pb-2">نوع الملكية والحيازة</h3>
          
          <div>
            <Label>حالة الأرض</Label>
            <Select {...register("tenure.category")} className="mt-1.5 font-medium">
              <option value="owned_full">مملوكة للمالك بالكامل</option>
              <option value="owned_partner">مملوكة بنسبة مع شريك</option>
              <option value="rented_cash">مستأجرة إيجار نقدي</option>
              <option value="rented_crop_share">مستأجرة بالمشاركة في المحصول (مزارعة)</option>
              <option value="rented_partner">مستأجرة ويوجد شريك في الإدارة/الزراعة</option>
            </Select>
          </div>

          {showLandlordInfo && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label>اسم المالك الأصلي (المؤجر) *</Label>
                <Input {...register("tenure.landlord.name")} placeholder="اسم صاحب الأرض" className="mt-1.5" />
                {errors.tenure?.landlord?.name && <p className="mt-1 text-xs text-danger">{errors.tenure.landlord.name.message}</p>}
              </div>
              <div>
                <Label>رقم هاتف المؤجر</Label>
                <Input {...register("tenure.landlord.phone")} placeholder="رقم الموبايل" className="mt-1.5" dir="ltr" />
              </div>
            </div>
          )}

          {showRentCashInfo && (
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <Label>طريقة حساب الإيجار</Label>
                <Select {...register("tenure.rentCash.type")} className="mt-1.5">
                  <option value="per_qirat">للقيراط</option>
                  <option value="per_feddan">للفدان</option>
                  <option value="total">إجمالي المبلغ</option>
                </Select>
              </div>
              <div>
                <Label>القيمة ({currency}) *</Label>
                <Input type="number" {...register("tenure.rentCash.amount", { valueAsNumber: true })} className="mt-1.5" />
                {errors.tenure?.rentCash?.amount && <p className="mt-1 text-xs text-danger">{errors.tenure.rentCash.amount.message}</p>}
              </div>
              <div>
                <Label>مدة الإيجار</Label>
                <Select {...register("tenure.rentCash.duration")} className="mt-1.5">
                  <option value="yearly">سنوي</option>
                  <option value="seasonal">موسمي (عروة)</option>
                </Select>
              </div>
            </div>
          )}

          {showRentCropShareInfo && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label>نسبة صاحب الأرض من المحصول</Label>
                <Select {...register("tenure.rentCropShare.ratio")} className="mt-1.5">
                  <option value="half">النصف (1/2)</option>
                  <option value="third">الثلث (1/3)</option>
                  <option value="quarter">الربع (1/4)</option>
                  <option value="custom">نسبة مخصصة</option>
                </Select>
              </div>
              {rentCropShareRatio === "custom" && (
                <div>
                  <Label>النسبة المئوية (%) للمالك *</Label>
                  <Input type="number" {...register("tenure.rentCropShare.customRatioPercent", { valueAsNumber: true })} className="mt-1.5" />
                  {errors.tenure?.rentCropShare?.customRatioPercent && <p className="mt-1 text-xs text-danger">{errors.tenure.rentCropShare.customRatioPercent.message}</p>}
                </div>
              )}
              <div className={rentCropShareRatio !== "custom" ? "col-span-2" : "col-span-2"}>
                <Label>من يتحمل تكاليف الزراعة؟</Label>
                <Select {...register("tenure.rentCropShare.costBearing")} className="mt-1.5">
                  <option value="tenant_full">أنا (المستأجر) أتحمل كامل التكاليف</option>
                  <option value="owner_full">صاحب الأرض يتحمل كامل التكاليف</option>
                  <option value="shared">مناصفة بين المالك والمستأجر</option>
                  <option value="custom">حسب الاتفاق (سجل في الملاحظات)</option>
                </Select>
              </div>
            </div>
          )}

          {showPartnerInfo && (
            <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-xl space-y-4 mt-4">
              <h4 className="text-sm font-bold text-sky-800">بيانات الشريك في هذه الأرض</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>اسم الشريك *</Label>
                  <Input {...register("tenure.partner.name")} placeholder="اسم الشريك" className="mt-1.5" />
                  {errors.tenure?.partner?.name && <p className="mt-1 text-xs text-danger">{errors.tenure.partner.name.message}</p>}
                </div>
                <div>
                  <Label>نسبتي (المالك/الإدارة) % *</Label>
                  <Input type="number" {...register("tenure.partner.ownerSharePercent", { valueAsNumber: true })} className="mt-1.5" />
                  {errors.tenure?.partner?.ownerSharePercent && <p className="mt-1 text-xs text-danger">{errors.tenure.partner.ownerSharePercent.message}</p>}
                </div>
                <div>
                  <Label>نسبة الشريك % *</Label>
                  <Input type="number" {...register("tenure.partner.partnerSharePercent", { valueAsNumber: true })} className="mt-1.5" />
                  {errors.tenure?.partner?.partnerSharePercent && <p className="mt-1 text-xs text-danger">{errors.tenure.partner.partnerSharePercent.message}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Additional */}
        <div>
          <Label htmlFor="notes">ملاحظات إضافية</Label>
          <Textarea id="notes" {...register("notes")} rows={3} placeholder="أي شروط أو تفاصيل أخرى..." className="mt-1.5" />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit" loading={loading} className="px-8 shadow-sm">
            {defaultValues ? "حفظ التعديلات" : "تسجيل الأرض"}
          </Button>
        </div>
      </form>

      <AreaCalculatorDialog
        open={calculatorOpen}
        onOpenChange={setCalculatorOpen}
        defaultData={defaultValues?.areaCalculatorData}
        onCalculate={(res) => {
          setValue("areaValue", res.areaQirat, { shouldValidate: true });
          setValue("areaUnit", "qirat", { shouldValidate: true });
          setValue("areaCalculatorData", res.data);
        }}
      />
    </>
  );
}
