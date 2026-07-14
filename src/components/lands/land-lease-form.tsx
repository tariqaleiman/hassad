"use client";

import { useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { landLeaseSchema, type LandLeaseSchema } from "./land-lease-schema";
import type { Land } from "@/lib/types/land";

import type { LandLeaseOut } from "@/lib/types/land-lease";

export function LandLeaseForm({
  farmId,
  lands,
  defaultValues,
  onSubmit,
  loading,
  onCancel,
}: {
  farmId: string;
  lands: Land[];
  defaultValues?: LandLeaseOut | null;
  onSubmit: (values: LandLeaseSchema) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LandLeaseSchema>({
    resolver: zodResolver(landLeaseSchema),
    defaultValues: defaultValues ? {
      farmId: defaultValues.farmId,
      landId: defaultValues.landId,
      seasonId: defaultValues.seasonId,
      tenantName: defaultValues.tenantName,
      tenantPhone: defaultValues.tenantPhone || "",
      areaValue: defaultValues.areaValue,
      areaUnit: defaultValues.areaUnit,
      duration: defaultValues.duration,
      startDate: defaultValues.startDate || "",
      endDate: defaultValues.endDate || "",
      rentAmount: defaultValues.rentAmount,
      notes: defaultValues.notes || "",
      status: defaultValues.status,
    } : {
      farmId,
      landId: "",
      tenantName: "",
      tenantPhone: "",
      areaValue: 0,
      areaUnit: "feddan",
      duration: "season",
      rentAmount: 0,
      status: "نشط",
      notes: "",
      startDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        farmId: defaultValues.farmId,
        landId: defaultValues.landId,
        seasonId: defaultValues.seasonId,
        tenantName: defaultValues.tenantName,
        tenantPhone: defaultValues.tenantPhone || "",
        areaValue: defaultValues.areaValue,
        areaUnit: defaultValues.areaUnit,
        duration: defaultValues.duration,
        startDate: defaultValues.startDate || "",
        endDate: defaultValues.endDate || "",
        rentAmount: defaultValues.rentAmount,
        notes: defaultValues.notes || "",
        status: defaultValues.status,
      });
    } else {
      reset({
        farmId,
        landId: "",
        tenantName: "",
        tenantPhone: "",
        areaValue: 0,
        areaUnit: "feddan",
        duration: "season",
        rentAmount: 0,
        status: "نشط",
        notes: "",
        startDate: new Date().toISOString().slice(0, 10),
      });
    }
  }, [defaultValues, farmId, reset]);

  const formValues = watch();
  const duration = formValues.duration;

  const [rentInputMode, setRentInputMode] = useState<"total" | "per_unit">("total");
  const [unitPrice, setUnitPrice] = useState<number | "">("");

  const currentArea = watch("areaValue");
  
  useEffect(() => {
    if (rentInputMode === "per_unit" && typeof unitPrice === "number" && currentArea) {
      setValue("rentAmount", parseFloat((unitPrice * currentArea).toFixed(2)));
    }
  }, [rentInputMode, unitPrice, currentArea, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("farmId")} />
      <input type="hidden" {...register("status")} />

      <div>
        <Label htmlFor="landId">قطعة الأرض المستأجرة *</Label>
        <Select id="landId" {...register("landId")} value={formValues.landId} className="mt-1.5">
          <option value="">اختر الأرض</option>
          {lands.map((land) => (
            <option key={land.id} value={land.id}>
              {land.name} - المتاح: {land.areaValue} {land.areaUnit === "feddan" ? "فدان" : "قيراط"}
            </option>
          ))}
        </Select>
        {errors.landId && <p className="mt-1 text-xs text-danger">{errors.landId.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tenantName">اسم المستأجر *</Label>
          <Input id="tenantName" {...register("tenantName")} className="mt-1.5 bg-paper" />
          {errors.tenantName && <p className="mt-1 text-xs text-danger">{errors.tenantName.message}</p>}
        </div>
        <div>
          <Label htmlFor="tenantPhone">رقم هاتف المستأجر (اختياري)</Label>
          <Input id="tenantPhone" {...register("tenantPhone")} className="mt-1.5 bg-paper" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="areaValue">المساحة المؤجرة *</Label>
          <Input 
            id="areaValue" 
            type="number" 
            step="0.01"
            {...register("areaValue", { valueAsNumber: true })} 
            className="mt-1.5 bg-paper" 
          />
          {errors.areaValue && <p className="mt-1 text-xs text-danger">{errors.areaValue.message}</p>}
        </div>

        <div>
          <Label htmlFor="areaUnit">وحدة المساحة *</Label>
          <Select id="areaUnit" {...register("areaUnit")} value={formValues.areaUnit} className="mt-1.5">
            <option value="feddan">فدان</option>
            <option value="qirat">قيراط</option>
            <option value="meter">متر مربع</option>
          </Select>
          {errors.areaUnit && <p className="mt-1 text-xs text-danger">{errors.areaUnit.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">مدة الإيجار *</Label>
          <Select id="duration" {...register("duration")} value={formValues.duration} className="mt-1.5">
            <option value="season">لموسم واحد</option>
            <option value="year">لمدة سنة فأكثر</option>
          </Select>
          {errors.duration && <p className="mt-1 text-xs text-danger">{errors.duration.message}</p>}
        </div>
        <div className="md:col-span-2 space-y-4 bg-paper-sunken p-4 rounded-xl border border-border/40">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-bold">قيمة الإيجار (إيراد) *</Label>
            <div className="flex bg-paper border border-border/50 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setRentInputMode("total")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${rentInputMode === "total" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-500" : "text-ink-muted hover:text-ink"}`}
              >
                إجمالي
              </button>
              <button
                type="button"
                onClick={() => setRentInputMode("per_unit")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${rentInputMode === "per_unit" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-500" : "text-ink-muted hover:text-ink"}`}
              >
                للوحدة (للفدان/القيراط)
              </button>
            </div>
          </div>

          {rentInputMode === "per_unit" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unitPrice" className="text-xs text-ink-muted">القيمة للوحدة الواحدة</Label>
                <Input 
                  id="unitPrice" 
                  type="number" 
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="مثال: 15000"
                  className="mt-1.5 bg-paper" 
                />
              </div>
              <div>
                <Label htmlFor="calculatedTotal" className="text-xs text-ink-muted">الإجمالي التلقائي</Label>
                <Input 
                  id="calculatedTotal" 
                  type="number" 
                  disabled
                  value={watch("rentAmount")}
                  className="mt-1.5 bg-paper-raised font-bold text-amber-600 disabled:opacity-100" 
                />
                <input type="hidden" {...register("rentAmount", { valueAsNumber: true })} />
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="rentAmount" className="text-xs text-ink-muted">المبلغ الإجمالي</Label>
              <Input 
                id="rentAmount" 
                type="number" 
                {...register("rentAmount", { valueAsNumber: true })} 
                className="mt-1.5 bg-paper max-w-sm" 
              />
            </div>
          )}
          {errors.rentAmount && <p className="mt-1 text-xs text-danger">{errors.rentAmount.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">تاريخ البدء</Label>
          <Input id="startDate" type="date" {...register("startDate")} className="mt-1.5 bg-paper" />
        </div>
        <div>
          <Label htmlFor="endDate">تاريخ الانتهاء</Label>
          <Input id="endDate" type="date" {...register("endDate")} className="mt-1.5 bg-paper" />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">ملاحظات وشروط الإيجار</Label>
        <Textarea id="notes" {...register("notes")} rows={2} className="mt-1.5" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
        <Button type="button" variant="ghost" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={loading} className="shadow-md hover:shadow-lg transition-all">
          {defaultValues ? "حفظ التعديلات" : "حفظ عقد الإيجار"}
        </Button>
      </div>
    </form>
  );
}
