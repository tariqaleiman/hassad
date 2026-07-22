import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, DollarSign, Leaf } from "lucide-react";
import { laborLogSchema, type LaborLogSchema } from "./labor-schemas";
import type { Worker } from "@/lib/types/worker";
import type { FarmingOperation } from "@/lib/types/farming-operation";
import type { CropCycle } from "@/lib/types/crop-cycle";
import { useCurrency } from "@/lib/hooks/use-currency";

interface LaborLogFormProps {
  workers: Worker[];
  operations?: FarmingOperation[];
  crops?: CropCycle[];
  defaultValues?: Partial<LaborLogSchema>;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function LaborLogForm({
  workers,
  operations = [],
  crops = [],
  defaultValues,
  onSubmit,
  onCancel,
  loading,
}: LaborLogFormProps) {
  const { formatMoney, currency } = useCurrency();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<LaborLogSchema>({
    resolver: zodResolver(laborLogSchema) as any,
    defaultValues: {
      date: defaultValues?.date || new Date().toISOString().split("T")[0],
      status: defaultValues?.status || "حاضر",
      wage: defaultValues?.wage || 0,
      ...defaultValues,
    },
  });

  const selectedWorkerId = watch("workerId");
  const selectedStatus = watch("status");

  // Auto-fill wage when worker or status changes
  const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const workerId = e.target.value;
    setValue("workerId", workerId, { shouldDirty: true });
    
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      const defaultWage = worker.dailyWage || 0;
      let calculatedWage = defaultWage;
      
      if (selectedStatus === "غائب") calculatedWage = 0;
      else if (selectedStatus === "نصف يوم") calculatedWage = defaultWage / 2;
      else if (selectedStatus === "إضافي") calculatedWage = defaultWage * 1.5;

      setValue("wage", calculatedWage, { shouldDirty: true });
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as any;
    setValue("status", status, { shouldDirty: true });
    
    const worker = workers.find(w => w.id === selectedWorkerId);
    if (worker) {
      const defaultWage = worker.dailyWage || 0;
      let calculatedWage = defaultWage;
      
      if (status === "غائب") calculatedWage = 0;
      else if (status === "نصف يوم") calculatedWage = defaultWage / 2;
      else if (status === "إضافي") calculatedWage = defaultWage * 1.5;

      setValue("wage", calculatedWage, { shouldDirty: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Worker */}
        <div className="space-y-2">
          <Label htmlFor="workerId" className="text-ink font-medium">العامل</Label>
          <Select 
            id="workerId"
            {...register("workerId")}
            onChange={handleWorkerChange}
            className="w-full"
          >
            <option value="">-- اختر العامل --</option>
            {workers.filter(w => w.status === "نشط").map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} {w.dailyWage ? `(${w.dailyWage} ${currency}/يوم)` : ""}
              </option>
            ))}
          </Select>
          {errors.workerId && <p className="text-sm text-danger">{errors.workerId.message}</p>}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-ink font-medium">تاريخ اليومية</Label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <Input
              id="date"
              type="date"
              className="ps-10"
              {...register("date")}
            />
          </div>
          {errors.date && <p className="text-sm text-danger">{errors.date.message}</p>}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-ink font-medium">الحالة</Label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
              <Clock className="h-4 w-4" />
            </div>
            <Select 
              id="status"
              className="w-full ps-10"
              {...register("status")}
              onChange={handleStatusChange}
            >
              <option value="حاضر">حاضر (يوم كامل)</option>
              <option value="نصف يوم">نصف يوم</option>
              <option value="إضافي">عمل إضافي</option>
              <option value="غائب">غائب</option>
            </Select>
          </div>
          {errors.status && <p className="text-sm text-danger">{errors.status.message}</p>}
        </div>

        {/* Wage */}
        <div className="space-y-2">
          <Label htmlFor="wage" className="text-ink font-medium">الأجر المستحق عن هذا اليوم</Label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
              <DollarSign className="h-4 w-4" />
            </div>
            <Input
              id="wage"
              type="number"
              step="any"
              className="ps-10"
              {...register("wage")}
            />
          </div>
          <p className="text-xs text-ink-muted">يمكنك تعديل الأجر المحسوب يدوياً إذا أردت.</p>
          {errors.wage && <p className="text-sm text-danger">{errors.wage.message}</p>}
        </div>

        {/* Crop Cycle (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="cropCycleId" className="text-ink font-medium">المحصول (اختياري)</Label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
              <Leaf className="h-4 w-4" />
            </div>
            <Select 
              id="cropCycleId"
              {...register("cropCycleId")}
              className="w-full ps-10"
            >
              <option value="">-- تحميل التكلفة على محصول معين --</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  محصول: {(c as any).cropName || c.id.substring(0,6)}

                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Operation (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="operationId" className="text-ink font-medium">العملية الزراعية (اختياري)</Label>
          <Select 
            id="operationId"
            {...register("operationId")}
            className="w-full"
          >
            <option value="">-- تحميل التكلفة على عملية معينة --</option>
            {operations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.operationType} - {o.date}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-ink font-medium">ملاحظات (اختياري)</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="rounded-full px-6"
        >
          إلغاء
        </Button>
        <Button 
          type="submit" 
          loading={loading} 
          disabled={!isDirty && !defaultValues}
          className="rounded-full px-8 shadow-sm"
        >
          {defaultValues ? "حفظ التعديلات" : "تسجيل اليومية"}
        </Button>
      </div>
    </form>
  );
}
