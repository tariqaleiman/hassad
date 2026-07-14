"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { inventorySchema, type InventorySchema } from "./inventory-schema";
import type { Farm } from "@/lib/types/farm";

export function InventoryForm({
  farms,
  onSubmit,
  loading,
  onCancel,
  defaultValues,
  isEdit = false,
  dictionaryItems = [],
  onAddDictionaryItem,
}: {
  farms: Farm[];
  onSubmit: (values: InventorySchema) => void;
  loading?: boolean;
  onCancel: () => void;
  defaultValues?: Partial<InventorySchema>;
  isEdit?: boolean;
  dictionaryItems?: any[];
  onAddDictionaryItem?: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InventorySchema>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      farmId: defaultValues?.farmId ?? (farms.length === 1 ? farms[0].id : ""),
      dictionaryId: defaultValues?.dictionaryId ?? "",
      initialQuantity: defaultValues?.initialQuantity ?? 0,
      initialUnitPrice: defaultValues?.initialUnitPrice ?? 0,
      notes: defaultValues?.notes ?? "",
    },
  });

  const initialQuantity = useWatch({ control, name: "initialQuantity" }) || 0;
  const initialUnitPrice = useWatch({ control, name: "initialUnitPrice" }) || 0;
  const totalValue = initialQuantity * initialUnitPrice;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={farms.length === 1 ? "hidden" : "block"}>
          <Label htmlFor="farmId">المزرعة *</Label>
          <Select id="farmId" {...register("farmId")}>
            <option value="">اختر المزرعة</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
          {errors.farmId && <p className="mt-1 text-xs text-danger">{errors.farmId.message}</p>}
        </div>

        <div className={farms.length === 1 ? "md:col-span-2" : "md:col-span-3"}>
          <Label htmlFor="dictionaryId">الصنف (من دليل الأصناف) *</Label>
          <Select id="dictionaryId" {...register("dictionaryId")} className="bg-paper">
            <option value="">اختر من دليل الأصناف...</option>
            {dictionaryItems?.map(item => (
              <option key={item.id} value={item.id}>
                {item.category} - {item.mainType} {item.subType ? `- ${item.subType}` : ""} {item.variety ? `- ${item.variety}` : ""} ({item.unit})
              </option>
            ))}
          </Select>
          {errors.dictionaryId && <p className="mt-1 text-xs text-danger">{errors.dictionaryId.message}</p>}
          <div className="pt-1">
            <Button type="button" variant="link" size="sm" onClick={onAddDictionaryItem} className="h-auto p-0 text-sky-600">
              + إضافة صنف جديد كلياً لدليل الأصناف
            </Button>
          </div>
        </div>
      </div>

      {!isEdit && (
        <div className="border border-border rounded-lg p-4 bg-paper-sunken space-y-4">
          <div>
            <Label className="text-base font-bold text-ink">الرصيد الافتتاحي (اختياري)</Label>
            <p className="text-xs text-ink-muted mt-1">
              إذا كانت المادة موجودة بالفعل في المخزن، أدخل الكمية المتاحة حالياً وسعر شراء الوحدة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="initialQuantity">الكمية المتاحة</Label>
              <Input 
                id="initialQuantity" 
                type="number" 
                step="0.01" 
                {...register("initialQuantity", { valueAsNumber: true })} 
              />
              {errors.initialQuantity && <p className="mt-1 text-xs text-danger">{errors.initialQuantity.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="initialUnitPrice">سعر الوحدة التقريبي</Label>
              <Input 
                id="initialUnitPrice" 
                type="number" 
                step="0.01" 
                {...register("initialUnitPrice", { valueAsNumber: true })} 
              />
              {errors.initialUnitPrice && <p className="mt-1 text-xs text-danger">{errors.initialUnitPrice.message}</p>}
            </div>
          </div>

          {initialQuantity > 0 && initialUnitPrice > 0 && (
            <div className="bg-crop-500/10 p-3 rounded-md flex justify-between items-center text-crop-700 dark:text-crop-400 border border-crop-500/20">
              <span className="text-sm font-medium">إجمالي قيمة الرصيد الافتتاحي:</span>
              <span className="font-bold">{totalValue.toLocaleString()} جنيه</span>
            </div>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={loading} className="flex-1">
          {isEdit ? "حفظ التعديلات" : "إضافة إلى المخزن"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          إلغاء
        </Button>
      </div>
    </form>
  );
}
