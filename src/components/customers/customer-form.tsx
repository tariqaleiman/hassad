"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CustomerFormValues } from "@/lib/types/customer";
import type { Farm } from "@/lib/types/farm";

const CUSTOMER_TYPES = ["شركة", "فرد", "تاجر تجزئة"] as const;

const customerSchema = z.object({
  farmId: z.string().min(1, "اختر المزرعة"),
  name: z.string().min(2, "اسم العميل مطلوب"),
  customerType: z.enum(CUSTOMER_TYPES).optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  initialBalance: z.number().default(0), // Use default 0, negatives could mean we owe them but typically positive means they owe us
  notes: z.string().optional(),
});

export function CustomerForm({
  farms,
  onSubmit,
  loading,
  onCancel,
  defaultValues,
  isEdit,
}: {
  farms: Farm[];
  onSubmit: (values: CustomerFormValues) => void;
  loading?: boolean;
  onCancel: () => void;
  defaultValues?: Partial<CustomerFormValues>;
  isEdit?: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues || {
      farmId: farms.length === 1 ? farms[0].id : "",
      name: "",
      customerType: "فرد",
      companyName: "",
      phone: "",
      address: "",
      initialBalance: 0,
      notes: "",
    },
  });

  const selectedType = watch("customerType");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* المزرعة */}
      <div className={farms.length === 1 ? "hidden" : "block"}>
        <Label htmlFor="farmId">المزرعة *</Label>
        <Select id="farmId" {...register("farmId")}>
          <option value="">اختر المزرعة</option>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </Select>
        {errors.farmId && <p className="mt-1 text-xs text-danger">{errors.farmId.message}</p>}
      </div>

      <div className="bg-paper-sunken/30 p-5 rounded-2xl border border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">اسم العميل *</Label>
            <Input id="name" {...register("name")} placeholder="مثال: أحمد محمد" />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="customerType">نوع العميل</Label>
            <Select id="customerType" {...register("customerType")}>
              {CUSTOMER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>

          {(selectedType === "شركة" || selectedType === "تاجر تجزئة") && (
            <div className="md:col-span-2">
              <Label htmlFor="companyName">اسم الشركة / المحل</Label>
              <Input id="companyName" {...register("companyName")} placeholder="مثال: شركة النور" />
            </div>
          )}
          
          <div>
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input id="phone" {...register("phone")} placeholder="01xxxxxxxxx" dir="ltr" className="text-left" />
          </div>

          <div>
            <Label htmlFor="address">العنوان</Label>
            <Input id="address" {...register("address")} placeholder="المحافظة، المركز، القرية..." />
          </div>
        </div>
      </div>

      {/* الرصيد الافتتاحي */}
      {!isEdit && (
        <div className="bg-paper-sunken/30 p-5 rounded-2xl border border-border space-y-3">
          <h3 className="font-bold text-base text-ink border-b border-border pb-2">رصيد افتتاحي (ديون سابقة)</h3>
          <p className="text-xs text-ink-muted">
            إذا كان هذا العميل مديوناً لك بأموال سابقة قبل استخدام النظام، أدخلها هنا.
          </p>
          <div className="max-w-xs">
            <Label htmlFor="initialBalance">المبلغ المستحق لك (ج.م)</Label>
            <Input
              id="initialBalance"
              type="number"
              step="0.01"
              {...register("initialBalance", { valueAsNumber: true })}
            />
          </div>
        </div>
      )}

      {/* ملاحظات */}
      <div>
        <Label htmlFor="notes">ملاحظات (اختياري)</Label>
        <Textarea id="notes" {...register("notes")} placeholder="أي ملاحظات إضافية عن العميل..." />
      </div>

      {/* الأزرار */}
      <div className="flex gap-3 justify-end pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? "حفظ التعديلات" : "إضافة العميل"}
        </Button>
      </div>
    </form>
  );
}
