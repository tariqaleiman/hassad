"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { supplierSchema, type SupplierSchema } from "./supplier-schema";
import type { Farm } from "@/lib/types/farm";

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
    formState: { errors },
  } = useForm<SupplierSchema>({
    resolver: zodResolver(supplierSchema) as any,
    defaultValues: initialData || {
      farmId: farms.length === 1 ? farms[0].id : "",
      supplierType: "individual",
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
          <Label htmlFor="supplierType">نوع المورد</Label>
          <Select id="supplierType" {...register("supplierType")}>
            <option value="individual">فرد / شخص</option>
            <option value="company">شركة / مؤسسة</option>
          </Select>
        </div>

        <div className="space-y-1.5">
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
