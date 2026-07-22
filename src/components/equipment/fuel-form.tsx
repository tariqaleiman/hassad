"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { fuelLogSchema, type FuelLogSchema } from "./equipment-logs-schema";

export function FuelForm({
  equipmentId,
  farmId,
  onSubmit,
  onCancel,
  loading,
}: {
  equipmentId: string;
  farmId: string;
  onSubmit: (values: FuelLogSchema) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FuelLogSchema>({
    resolver: zodResolver(fuelLogSchema),
    defaultValues: {
      equipmentId,
      farmId,
      date: new Date().toISOString().split("T")[0],
      fuelType: "ديزل (سولار)",
      quantity: 0,
      cost: 0,
      odometerOrHours: undefined,
      notes: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">التاريخ <span className="text-danger">*</span></Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="text-xs text-danger">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuelType">نوع الوقود <span className="text-danger">*</span></Label>
          <Select id="fuelType" {...register("fuelType")}>
            <option value="ديزل (سولار)">ديزل (سولار)</option>
            <option value="بنزين">بنزين</option>
            <option value="كهرباء">كهرباء</option>
            <option value="أخرى">أخرى</option>
          </Select>
          {errors.fuelType && <p className="text-xs text-danger">{errors.fuelType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">الكمية (باللتر أو حسب النوع) <span className="text-danger">*</span></Label>
          <Input id="quantity" type="number" step="0.1" min="0" {...register("quantity", { valueAsNumber: true })} />
          {errors.quantity && <p className="text-xs text-danger">{errors.quantity.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">إجمالي التكلفة</Label>
          <Input id="cost" type="number" step="0.01" min="0" {...register("cost", { valueAsNumber: true })} />
          {errors.cost && <p className="text-xs text-danger">{errors.cost.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="odometerOrHours">قراءة العداد (ساعات تشغيل / كم)</Label>
          <Input id="odometerOrHours" type="number" step="1" min="0" {...register("odometerOrHours", { valueAsNumber: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">ملاحظات إضافية</Label>
          <Input id="notes" {...register("notes")} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button type="submit" loading={loading}>إضافة سجل الوقود</Button>
      </div>
    </form>
  );
}
