"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { InventoryItem } from "@/lib/types/inventory";

const addStockSchema = z.object({
  quantity: z.number().min(0.01, "الكمية يجب أن تكون أكبر من صفر"),
  unitPrice: z.number().min(0, "السعر لا يمكن أن يكون سالباً"),
  notes: z.string().optional(),
});

type AddStockSchema = z.infer<typeof addStockSchema>;

export function InventoryAddStockForm({
  item,
  onSubmit,
  loading,
  onCancel,
}: {
  item: InventoryItem;
  onSubmit: (values: AddStockSchema) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddStockSchema>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      quantity: 1,
      unitPrice: item.averageCost || 0,
      notes: "شراء / إضافة رصيد",
    },
  });

  const quantity = useWatch({ control, name: "quantity" }) || 0;
  const unitPrice = useWatch({ control, name: "unitPrice" }) || 0;
  const totalValue = quantity * unitPrice;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-paper-sunken p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <p className="text-sm text-ink-muted">الصنف</p>
          <p className="font-bold text-ink">{item.name}</p>
        </div>
        <div className="text-left">
          <p className="text-sm text-ink-muted">الرصيد الحالي</p>
          <p className="font-bold text-sky-600 dark:text-sky-400">{item.quantity} {item.unit}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">الكمية المضافة ({item.unit}) *</Label>
          <Input 
            id="quantity" 
            type="number" 
            step="0.01" 
            {...register("quantity", { valueAsNumber: true })} 
          />
          {errors.quantity && <p className="mt-1 text-xs text-danger">{errors.quantity.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="unitPrice">سعر شراء الوحدة الواحدة *</Label>
          <Input 
            id="unitPrice" 
            type="number" 
            step="0.01" 
            {...register("unitPrice", { valueAsNumber: true })} 
          />
          {errors.unitPrice && <p className="mt-1 text-xs text-danger">{errors.unitPrice.message}</p>}
        </div>
      </div>

      {quantity > 0 && unitPrice > 0 && (
        <div className="bg-crop-500/10 p-3 rounded-md flex justify-between items-center text-crop-700 dark:text-crop-400 border border-crop-500/20">
          <span className="text-sm font-medium">إجمالي التكلفة:</span>
          <span className="font-bold text-lg">{totalValue.toLocaleString()} ج.م</span>
        </div>
      )}

      <div>
        <Label htmlFor="notes">ملاحظات (اختياري)</Label>
        <Textarea 
          id="notes" 
          {...register("notes")} 
          rows={2} 
          placeholder="مثال: مشتريات من المورد فلان، فاتورة رقم..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={loading} className="flex-1">
          إضافة الرصيد
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          إلغاء
        </Button>
      </div>
    </form>
  );
}
