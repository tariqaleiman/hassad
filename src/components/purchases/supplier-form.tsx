"use client";

import { useForm } from "react-hook-form";
import { Check } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { supplierSchema, type SupplierSchema } from "./supplier-schema";
import type { Farm } from "@/lib/types/farm";

const SUPPLIER_CATEGORIES = ["أسمدة", "مبيدات", "بذور", "معدات", "أعلاف", "عام", "أخرى"] as const;

export function SupplierForm({
  farms,
  initialData,
  onSubmit,
  onCancel,
  loading,
}: {
  farms: Farm[];
  initialData?: Partial<SupplierSchema>;
  onSubmit: (values: SupplierSchema) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SupplierSchema>({
    resolver: zodResolver(supplierSchema) as any,
    defaultValues: initialData || {
      farmId: farms.length === 1 ? farms[0].id : "",
      supplierType: "individual",
      supplierCategories: [],
      customCategory: "",
      name: "",
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

  const supplierType = watch("supplierType");
  const supplierCategories = watch("supplierCategories") || [];

  const toggleCategory = (cat: string) => {
    if (supplierCategories.includes(cat)) {
      setValue("supplierCategories", supplierCategories.filter(c => c !== cat), { shouldDirty: true });
    } else {
      setValue("supplierCategories", [...supplierCategories, cat], { shouldDirty: true });
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
          <Label htmlFor="supplierType">الكيان القانوني</Label>
          <Select id="supplierType" {...register("supplierType")}>
            <option value="individual">فرد / شخص</option>
            <option value="company">شركة / مؤسسة</option>
          </Select>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label>مجالات التوريد (يمكنك اختيار أكثر من مجال)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {SUPPLIER_CATEGORIES.map(cat => {
              const isSelected = supplierCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${isSelected ? 'bg-sky-100 border-sky-200 text-sky-800' : 'bg-paper border-border text-ink-muted hover:bg-black/5'}`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {supplierCategories.includes("أخرى") && (
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="customCategory">حدد المجالات الأخرى</Label>
            <Input id="customCategory" {...register("customCategory")} placeholder="مثال: توريد بلاستيك صوب" />
          </div>
        )}

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="status">حالة المورد</Label>
          <Select id="status" {...register("status")}>
            <option value="active">نشط (يتعامل معنا)</option>
            <option value="inactive">غير نشط (موقوف)</option>
          </Select>
        </div>

        {/* Row 2: Names */}
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="name">اسم المورد (المسؤول) *</Label>
          <Input id="name" {...register("name")} placeholder="مثال: محمد أحمد" />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

        {supplierType === "company" && (
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="companyName">اسم الشركة / المؤسسة</Label>
            <Input id="companyName" {...register("companyName")} placeholder="مثال: شركة الأمل للأسمدة" />
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
        {supplierType === "company" && (
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
        <div className="space-y-1.5 md:col-span-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-border">
          <Label htmlFor="initialBalance" className="text-crop-600 font-bold">رصيد افتتاحي (مديونية سابقة علينا ج.م)</Label>
          <Input 
            id="initialBalance" 
            type="number" 
            step="0.01" 
            className="bg-paper mt-2 font-bold"
            {...register("initialBalance", { valueAsNumber: true })} 
          />
          <p className="text-xs text-ink-muted mt-1">اكتب المبلغ المتبقي للمورد في ذمتكم قبل استخدام النظام.</p>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="notes">ملاحظات إضافية</Label>
          <Textarea id="notes" {...register("notes")} rows={2} />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="submit" loading={loading} className="px-8">
          حفظ بيانات المورد
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="px-8">
          إلغاء
        </Button>
      </div>
    </form>
  );
}
