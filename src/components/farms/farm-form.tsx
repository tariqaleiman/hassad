"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { farmSchema, type FarmSchema } from "./farm-schema";
import type { Farm } from "@/lib/types/farm";

export function FarmForm({
  defaultValues,
  onSubmit,
  loading,
  onCancel,
}: {
  defaultValues?: Farm | null;
  onSubmit: (values: FarmSchema) => void;
  loading?: boolean;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FarmSchema>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      commercialName: defaultValues?.commercialName || "",
      mainLocation: defaultValues?.mainLocation || "",
      phone: defaultValues?.phone || "",
      notes: defaultValues?.notes || "",
      currency: defaultValues?.currency || "ر.س",
      partners: defaultValues?.partners || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "partners",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* ─── البيانات الأساسية للمزرعة ─── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-ink border-b border-border/50 pb-2">البيانات الأساسية</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* اسم المزرعة (البراند) */}
          <div className="space-y-2">
            <Label htmlFor="name">اسم المزرعة (البراند) *</Label>
            <Input id="name" placeholder="مثال: مزارع الوادي" {...register("name")} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          {/* الاسم التجاري الرسمي */}
          <div className="space-y-2">
            <Label htmlFor="commercialName">الاسم التجاري الرسمي (اختياري)</Label>
            <Input id="commercialName" placeholder="مثال: شركة الوادي للتنمية الزراعية" {...register("commercialName")} />
          </div>

          {/* الموقع الأساسي للإدارة */}
          <div className="space-y-2">
            <Label htmlFor="mainLocation">الموقع الأساسي للإدارة</Label>
            <Input id="mainLocation" placeholder="مثال: محافظة المنيا - مركز بني مزار" {...register("mainLocation")} />
          </div>

          {/* رقم التواصل */}
          <div className="space-y-2">
            <Label htmlFor="phone">رقم التواصل</Label>
            <Input id="phone" placeholder="مثال: 01xxxxxxxxx" {...register("phone")} />
          </div>

          {/* العملة الافتراضية */}
          <div className="space-y-2">
            <Label htmlFor="currency">العملة الافتراضية</Label>
            <Input id="currency" placeholder="مثال: ج.م أو ر.س أو $" {...register("currency")} />
          </div>
        </div>

        {/* ملاحظات */}
        <div className="space-y-2">
          <Label htmlFor="notes">ملاحظات إضافية</Label>
          <Textarea id="notes" placeholder="أي تفاصيل أخرى تخص المزرعة..." {...register("notes")} className="min-h-[80px]" />
        </div>
      </div>

      {/* ─── الشركاء ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <h3 className="text-sm font-bold text-ink">الشركاء (اختياري)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 rounded-full text-xs"
            onClick={() => append({ id: crypto.randomUUID(), name: "", role: "", sharePercent: 0, phone: "" })}
          >
            <Plus className="h-3 w-3" />
            إضافة شريك
          </Button>
        </div>

        {fields.length === 0 ? (
          <p className="text-xs text-ink-muted text-center py-4 bg-paper-sunken/30 rounded-xl border border-dashed border-border/50">
            لا يوجد شركاء مضافين. يمكنك إضافة شركاء إدارة أو ممولين هنا.
          </p>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="relative rounded-xl border border-border/50 bg-paper-sunken/30 p-3 sm:p-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label className="text-[10px]">اسم الشريك</Label>
                    <Input placeholder="الاسم" {...register(`partners.${index}.name`)} className="h-8 text-xs" />
                    {errors.partners?.[index]?.name && (
                      <p className="text-[10px] text-danger">{errors.partners[index]?.name?.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label className="text-[10px]">الدور / المهام</Label>
                    <Input placeholder="مثال: مدير تنفيذي، ممول" {...register(`partners.${index}.role`)} className="h-8 text-xs" />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <Label className="text-[10px]">نسبة الشراكة (%)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      {...register(`partners.${index}.sharePercent`, { valueAsNumber: true })}
                      className="h-8 text-xs text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <Label className="text-[10px]">رقم التواصل</Label>
                    <Input placeholder="رقم الهاتف" {...register(`partners.${index}.phone`)} className="h-8 text-xs text-left" dir="ltr" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute start-3 top-3 sm:start-auto sm:-end-2 sm:-top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white shadow-sm hover:bg-danger/90 transition-colors"
                  aria-label="حذف الشريك"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── الأزرار ─── */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            إلغاء
          </Button>
        )}
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "جاري الحفظ..." : "حفظ بيانات المزرعة"}
        </Button>
      </div>
    </form>
  );
}
