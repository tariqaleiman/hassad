"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { maintenanceLogSchema, type MaintenanceLogSchema } from "./equipment-logs-schema";

export function MaintenanceForm({
  equipmentId,
  farmId,
  onSubmit,
  onCancel,
  loading,
}: {
  equipmentId: string;
  farmId: string;
  onSubmit: (values: MaintenanceLogSchema) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaintenanceLogSchema>({
    resolver: zodResolver(maintenanceLogSchema),
    defaultValues: {
      equipmentId,
      farmId,
      date: new Date().toISOString().split("T")[0],
      type: "دورية",
      cost: 0,
      performedBy: "",
      description: "",
      nextMaintenanceDate: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">تاريخ الصيانة <span className="text-danger">*</span></Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="text-xs text-danger">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">نوع الصيانة <span className="text-danger">*</span></Label>
          <Select id="type" {...register("type")}>
            <option value="دورية">دورية</option>
            <option value="طارئة">طارئة / أعطال</option>
            <option value="استبدال قطع غيار">استبدال قطع غيار</option>
          </Select>
          {errors.type && <p className="text-xs text-danger">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">التكلفة</Label>
          <Input id="cost" type="number" step="0.01" min="0" {...register("cost", { valueAsNumber: true })} />
          {errors.cost && <p className="text-xs text-danger">{errors.cost.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="performedBy">الجهة المنفذة (مركز الصيانة / الفني)</Label>
          <Input id="performedBy" {...register("performedBy")} placeholder="مثال: مركز العلي للصيانة" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextMaintenanceDate">تاريخ الصيانة القادمة الموصى به</Label>
          <Input id="nextMaintenanceDate" type="date" {...register("nextMaintenanceDate")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف ما تم عمله / ملاحظات</Label>
        <Textarea id="description" {...register("description")} rows={2} />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button type="submit" loading={loading}>إضافة سجل الصيانة</Button>
      </div>
    </form>
  );
}
