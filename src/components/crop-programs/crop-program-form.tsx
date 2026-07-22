"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, GripVertical, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cropProgramSchema, type CropProgramSchema } from "./crop-program-schema";
import type { CropProgramTemplate, CropProgramPhase } from "@/lib/types/crop-program";
import type { Crop } from "@/lib/types/crop";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PLANTING_METHODS = [
  "بدار", 
  "زراعة بالجورة", 
  "شتلات خارجية", 
  "إعداد مشتل داخلي", 
  "شتلات من مشتل داخلي", 
  "عقلة", 
  "عفير", 
  "تخضير"
];

export const PHASE_TYPES = [
  "تجهيز أرض",
  "زراعة",
  "ري",
  "تسميد",
  "ري وتسميد",
  "رش وقائي",
  "رش علاجي",
  "رش مغذي",
  "عزيق",
  "خف",
  "حصاد",
  "أخرى"
];

export function CropProgramForm({
  crops,
  defaultValues,
  onSubmit,
  loading,
  onCancel,
}: {
  crops: Crop[];
  defaultValues?: CropProgramTemplate | null;
  onSubmit: (values: CropProgramSchema) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CropProgramSchema>({
    resolver: zodResolver(cropProgramSchema) as any,
    defaultValues: {
      name: defaultValues?.name ?? "",
      cropId: defaultValues?.cropId ?? "",
      description: defaultValues?.description ?? "",
      plantingMethods: defaultValues?.plantingMethods ?? [],
      phases: defaultValues?.phases?.length ? defaultValues.phases.sort((a, b) => a.dayNumber - b.dayNumber) : [{ id: crypto.randomUUID(), dayNumber: 0, title: "", type: ["أخرى"], description: "" }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "phases",
  });

  const selectedMethods = watch("plantingMethods") || [];

  const toggleMethod = (method: string) => {
    if (selectedMethods.includes(method)) {
      setValue("plantingMethods", selectedMethods.filter(m => m !== method), { shouldDirty: true });
    } else {
      setValue("plantingMethods", [...selectedMethods, method], { shouldDirty: true });
    }
  };

  const handleFormSubmit = (data: CropProgramSchema) => {
    // Ensure phases are sorted by day
    data.phases.sort((a, b) => a.dayNumber - b.dayNumber);
    onSubmit(data);
  };

  const togglePhaseType = (index: number, type: string) => {
    const currentTypes = watch(`phases.${index}.type`) || [];
    if (currentTypes.includes(type)) {
      setValue(`phases.${index}.type`, currentTypes.filter(t => t !== type), { shouldDirty: true });
    } else {
      setValue(`phases.${index}.type`, [...currentTypes, type], { shouldDirty: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-paper p-5 rounded-xl border border-border space-y-4">
        <h3 className="font-bold text-lg text-ink">المعلومات الأساسية</h3>
        
        <div>
          <Label htmlFor="name">اسم البرنامج *</Label>
          <Input id="name" {...register("name")} placeholder="مثال: برنامج القمح العفير المتكامل" />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cropId">المحصول المرتبط *</Label>
            <Select id="cropId" {...register("cropId")}>
              <option value="">اختر المحصول</option>
              {crops.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            {errors.cropId && <p className="mt-1 text-xs text-danger">{errors.cropId.message}</p>}
          </div>
        </div>

        <div>
          <Label className="block mb-2">طرق الزراعة المدعومة (اختياري)</Label>
          <p className="text-xs text-ink-muted mb-3">إذا لم تحدد طرق زراعة، سيتم اقتراح هذا البرنامج لجميع طرق زراعة هذا المحصول.</p>
          <div className="flex flex-wrap gap-2">
            {PLANTING_METHODS.map(method => {
              const isSelected = selectedMethods.includes(method);
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => toggleMethod(method)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1.5",
                    isSelected 
                      ? "bg-crop-100 border-crop-300 text-crop-800 dark:bg-crop-900/30 dark:border-crop-700 dark:text-crop-300 font-bold" 
                      : "bg-paper-sunken border-border text-ink-muted hover:border-crop-300"
                  )}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {method}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="description">وصف البرنامج (أهداف، مخرجات، ملاحظات)</Label>
          <Textarea id="description" {...register("description")} rows={2} />
        </div>
      </div>

      <div className="bg-paper p-5 rounded-xl border border-border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-ink">مهام البرنامج (العمليات)</h3>
            <p className="text-xs text-ink-muted mt-1">أضف المهام. سيتم ترتيبها تلقائياً عند الحفظ بناءً على اليوم المكتوب (يوم 0 هو يوم الزراعة).</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ id: crypto.randomUUID(), dayNumber: 0, title: "", type: ["تسميد"], description: "" })}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            إضافة مهمة بالنهاية
          </Button>
        </div>

        {errors.phases?.message && (
          <p className="mb-4 text-xs font-bold text-danger bg-danger/10 p-2 rounded-md">{errors.phases.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3 bg-paper-sunken p-3 rounded-xl border border-border group">
              <div className="mt-2 text-ink-muted cursor-move opacity-50 hover:opacity-100 hidden sm:block">
                <GripVertical className="w-5 h-5" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1">
                <div className="md:col-span-2">
                  <Label className="text-xs mb-1">اليوم *</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      {...register(`phases.${index}.dayNumber` as const, { valueAsNumber: true })}
                      className="h-8 pr-12 text-center font-mono"
                    />
                    <span className="absolute right-3 top-1.5 text-xs text-ink-muted font-bold">يوم</span>
                  </div>
                  {errors.phases?.[index]?.dayNumber && <p className="mt-1 text-[10px] text-danger">{errors.phases[index]?.dayNumber?.message}</p>}
                </div>
                
                <div className="md:col-span-10">
                  <Label className="text-xs mb-1">نوع العملية (يمكن اختيار أكثر من نوع) *</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {PHASE_TYPES.map(t => {
                      const isSelected = (watch(`phases.${index}.type`) || []).includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => togglePhaseType(index, t)}
                          className={cn(
                            "px-2 py-1 text-[10px] rounded-md transition-colors border",
                            isSelected 
                              ? "bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300 font-bold" 
                              : "bg-paper border-border text-ink-muted hover:border-amber-300"
                          )}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  {errors.phases?.[index]?.type && <p className="mt-1 text-[10px] text-danger">{errors.phases[index]?.type?.message}</p>}
                </div>

                <div className="md:col-span-12 mt-2">
                  <Label className="text-xs mb-1">العنوان / الوصف *</Label>
                  <div className="space-y-2">
                    <Input
                      {...register(`phases.${index}.title` as const)}
                      placeholder="مثال: رية المحاياة"
                      className="h-8 font-bold"
                    />
                    {errors.phases?.[index]?.title && <p className="mt-1 text-[10px] text-danger">{errors.phases[index]?.title?.message}</p>}
                    <Textarea
                      {...register(`phases.${index}.description` as const)}
                      placeholder="تفاصيل وإرشادات (مثل: إضافة 50 كجم يوريا)..."
                      className="h-12 text-xs resize-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 opacity-50 group-hover:opacity-100">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="w-6 h-6 hover:bg-crop-50"
                  title="إدراج مهمة قبل هذه"
                  onClick={() => {
                    const currentDay = watch(`phases.${index}.dayNumber`);
                    const insertIndex = index;
                    // We use insert from useFieldArray but wait, `insert` isn't imported from useFieldArray.
                    // Oh, I only imported fields, append, remove, move. Let me just append and the user sets the day.
                    // Or I can use `append` and they change the day. Since it sorts automatically, I'll just append and set dayNumber to currentDay - 1 or currentDay.
                    append({ id: crypto.randomUUID(), dayNumber: Math.max(0, currentDay - 1), title: "", type: ["تسميد"], description: "" });
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-danger hover:bg-danger/10 hover:text-danger"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          {fields.length === 0 && <p className="text-center text-sm text-ink-muted py-4">لا توجد مهام مضافة.</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-paper p-4 border-t border-border mt-4 -mx-6 px-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={loading}>
          {defaultValues ? "حفظ التعديلات" : "إنشاء البرنامج"}
        </Button>
      </div>
    </form>
  );
}
