"use client";

import { useForm } from "react-hook-form";
import { Check } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ContractorFormValues, ContractorType } from "@/lib/types/contractor";
import type { Farm } from "@/lib/types/farm";

const CONTRACTOR_TYPES: ContractorType[] = [
  "عمالة",
  "جرار زراعي",
  "آلات حصاد",
  "نقل",
  "أخرى",
];

const contractorSchema = z.object({
  farmId: z.string().min(1, "اختر المزرعة"),
  name: z.string().min(2, "اسم المقاول مطلوب"),
  legalType: z.enum(["شركة", "فرد"]).default("فرد"),
  types: z.array(z.enum(["عمالة", "جرار زراعي", "آلات حصاد", "نقل", "أخرى"] as const)).min(1, "اختر نوعاً واحداً على الأقل"),
  customType: z.string().optional(),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  commercialRegister: z.string().optional(),
  email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  initialBalance: z.number().min(0).optional().default(0),
  status: z.enum(["active", "inactive"]).default("active"),
  notes: z.string().optional(),
});

export function ContractorForm({
  farms,
  onSubmit,
  loading,
  onCancel,
  defaultValues,
  isEdit,
}: {
  farms: Farm[];
  onSubmit: (values: ContractorFormValues) => void;
  loading?: boolean;
  onCancel: () => void;
  defaultValues?: Partial<ContractorFormValues>;
  isEdit?: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContractorFormValues>({
    resolver: zodResolver(contractorSchema) as any,
    defaultValues: defaultValues || {
      farmId: farms.length === 1 ? farms[0].id : "",
      name: "",
      legalType: "فرد",
      types: ["عمالة"],
      customType: "",
      companyName: "",
      taxId: "",
      commercialRegister: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
      initialBalance: 0,
      notes: "",
    },
  });

  const legalType = watch("legalType");
  const types = watch("types") || [];

  const toggleType = (t: ContractorType) => {
    if (types.includes(t)) {
      setValue("types", types.filter(type => type !== t), { shouldDirty: true });
    } else {
      setValue("types", [...types, t], { shouldDirty: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Row 1: Farm and Type */}
        {farms.length > 1 && (
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="farmId">المزرعة *</Label>
            <Select id="farmId" {...register("farmId")}>
              <option value="">اختر المزرعة</option>
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </Select>
            {errors.farmId && <p className="text-xs text-danger">{errors.farmId.message}</p>}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="legalType">الكيان القانوني</Label>
          <Select id="legalType" {...register("legalType")}>
            <option value="فرد">فرد / شخص</option>
            <option value="شركة">شركة / مؤسسة</option>
          </Select>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label>تخصص المقاول (يمكنك اختيار أكثر من تخصص) *</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {CONTRACTOR_TYPES.map(t => {
              const isSelected = types.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${isSelected ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-paper border-border text-ink-muted hover:bg-black/5'}`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {t}
                </button>
              );
            })}
          </div>
          {errors.types && <p className="text-xs text-danger">{errors.types.message}</p>}
        </div>

        {types.includes("أخرى") && (
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="customType">حدد التخصصات الأخرى</Label>
            <Input id="customType" {...register("customType")} placeholder="مثال: مقاول حفر آبار" />
          </div>
        )}

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="status">حالة المقاول</Label>
          <Select id="status" {...register("status")}>
            <option value="active">نشط (يتعامل معنا)</option>
            <option value="inactive">غير نشط (موقوف)</option>
          </Select>
        </div>

        {/* Row 2: Names */}
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="name">اسم المقاول (المسؤول) *</Label>
          <Input id="name" {...register("name")} placeholder="مثال: محمد زين" />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

        {legalType === "شركة" && (
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="companyName">اسم الشركة / المؤسسة</Label>
            <Input id="companyName" {...register("companyName")} placeholder="مثال: شركة المعدات الحديثة" />
          </div>
        )}

        {/* Row 3: Contact */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input id="phone" {...register("phone")} dir="ltr" className="text-right" placeholder="01xxxxxxxxx" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" type="email" {...register("email")} dir="ltr" className="text-right" placeholder="example@domain.com" />
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="address">العنوان</Label>
          <Input id="address" {...register("address")} placeholder="المحافظة، المدينة، الشارع..." />
        </div>

        {/* Row 4: Legal (Only for companies) */}
        {legalType === "شركة" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="taxId">الرقم الضريبي</Label>
              <Input id="taxId" {...register("taxId")} dir="ltr" className="text-right" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commercialRegister">رقم السجل التجاري</Label>
              <Input id="commercialRegister" {...register("commercialRegister")} dir="ltr" className="text-right" />
            </div>
          </>
        )}

        {/* Row 5: Balance */}
        {!isEdit && (
          <div className="space-y-1.5 md:col-span-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-border">
            <Label htmlFor="initialBalance" className="text-danger font-bold">الرصيد الافتتاحي (مديونية سابقة للمقاول ج.م)</Label>
            <Input 
              id="initialBalance" 
              type="number" 
              step="0.01" 
              className="bg-paper mt-2 font-bold"
              {...register("initialBalance", { valueAsNumber: true })} 
            />
            <p className="text-xs text-ink-muted mt-1">إذا كان للمقاول دين سابق عليكم قبل النظام، أدخله هنا.</p>
          </div>
        )}

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="notes">ملاحظات إضافية</Label>
          <Textarea id="notes" {...register("notes")} rows={2} />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="submit" loading={loading} className="px-8">
          {isEdit ? "حفظ التعديلات" : "إضافة المقاول"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="px-8">
          إلغاء
        </Button>
      </div>
    </form>
  );
}
