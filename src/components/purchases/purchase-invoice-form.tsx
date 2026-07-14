"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { purchaseInvoiceSchema, type PurchaseInvoiceSchema } from "./purchase-invoice-schema";
import type { Farm } from "@/lib/types/farm";
import type { InventoryItem } from "@/lib/types/inventory";
import type { Supplier } from "@/lib/types/supplier";
import { useEffect } from "react";

export function PurchaseInvoiceForm({
  farms,
  inventoryItems,
  suppliers = [],
  dictionaryItems = [],
  onSubmit,
  loading,
  onCancel,
  onAddDictionaryItem,
  onAddSupplier,
}: {
  farms: Farm[];
  inventoryItems: InventoryItem[];
  suppliers?: Supplier[];
  dictionaryItems?: any[];
  onSubmit: (values: PurchaseInvoiceSchema) => void;
  loading?: boolean;
  onCancel: () => void;
  onAddDictionaryItem?: () => void;
  onAddSupplier?: () => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PurchaseInvoiceSchema>({
    resolver: zodResolver(purchaseInvoiceSchema),
    defaultValues: {
      farmId: farms.length === 1 ? farms[0].id : "",
      invoiceDate: new Date().toISOString(),
      paymentMethod: "cash",
      paidAmount: 0,
      items: [
        {
          id: Math.random().toString(),
          isNewItem: false,
          quantity: 1,
          unitPrice: 0,
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const invoiceDate = useWatch({ control, name: "invoiceDate" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const paidAmount = useWatch({ control, name: "paidAmount" });
  const items = useWatch({ control, name: "items" });
  
  const totalAmount = items?.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0) || 0;

  useEffect(() => {
    if (paymentMethod === "cash") {
      setValue("paidAmount", totalAmount);
    }
  }, [paymentMethod, totalAmount, setValue]);

  const handleItemSelect = (index: number, itemId: string) => {
    if (itemId === "new") {
      setValue(`items.${index}.isNewItem`, true);
      setValue(`items.${index}.itemId`, "");
      setValue(`items.${index}.dictionaryId`, "");
    } else {
      const selected = inventoryItems.find(i => i.id === itemId);
      if (selected) {
        setValue(`items.${index}.isNewItem`, false);
        setValue(`items.${index}.itemId`, selected.id);
        setValue(`items.${index}.unitPrice`, selected.averageCost);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-paper-sunken p-4 rounded-xl border border-border">
        {farms.length > 1 && (
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="farmId">المزرعة *</Label>
            <Select id="farmId" {...register("farmId")}>
              <option value="">اختر المزرعة</option>
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </Select>
            {errors.farmId && <p className="mt-1 text-xs text-danger">{errors.farmId.message}</p>}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="invoiceDate">تاريخ الفاتورة *</Label>
          <Input 
            id="invoiceDate"
            type="datetime-local" 
            {...register("invoiceDate")} 
            className="bg-paper"
          />
          {errors.invoiceDate && <p className="mt-1 text-xs text-danger">{errors.invoiceDate.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="supplierId">المورد</Label>
            {onAddSupplier && (
              <Button type="button" variant="link" size="sm" onClick={onAddSupplier} className="h-auto p-0 text-sky-600">
                + إضافة مورد جديد
              </Button>
            )}
          </div>
          <Select id="supplierId" {...register("supplierId")} className="bg-paper">
            <option value="">اختر المورد (أو اتركه فارغاً)</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </Select>
          {errors.supplierId && <p className="mt-1 text-xs text-danger">{errors.supplierId.message}</p>}
          {!suppliers.length && (
            <div className="mt-2">
              <Input id="supplierName" {...register("supplierName")} placeholder="اسم المورد (اختياري - لمرة واحدة)" />
            </div>
          )}
        </div>

        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border mt-2">
          <div className="space-y-3">
            <Label>طريقة الدفع *</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  value="cash" 
                  {...register("paymentMethod")}
                  className="w-4 h-4 text-crop-600"
                />
                <span>نقداً</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  value="credit" 
                  {...register("paymentMethod")}
                  className="w-4 h-4 text-crop-600"
                />
                <span>آجل / دفع جزئي</span>
              </label>
            </div>
          </div>

          <div className={cn("space-y-1.5 transition-opacity", paymentMethod === "cash" && "opacity-50 pointer-events-none")}>
            <Label htmlFor="paidAmount">المبلغ المدفوع (ج.م) *</Label>
            <Input 
              id="paidAmount" 
              type="number" 
              step="0.01" 
              {...register("paidAmount", { valueAsNumber: true })} 
              className="bg-paper"
              readOnly={paymentMethod === "cash"}
            />
            {errors.paidAmount && <p className="mt-1 text-xs text-danger">{errors.paidAmount.message}</p>}
            {paymentMethod === "credit" && totalAmount - (paidAmount || 0) > 0 && (
              <p className="text-xs text-ink-muted mt-1">
                المتبقي (الآجل): {(totalAmount - (paidAmount || 0)).toLocaleString()} ج.م
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">أصناف الفاتورة</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => append({
              id: Math.random().toString(),
              isNewItem: false,
              quantity: 1,
              unitPrice: 0,
            })}
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة صنف
          </Button>
        </div>

        {fields.map((field, index) => {
          const isNew = items?.[index]?.isNewItem;
          const itemTotal = (Number(items?.[index]?.quantity) || 0) * (Number(items?.[index]?.unitPrice) || 0);
          const selectedInventoryItem = !isNew ? inventoryItems.find(i => i.id === items?.[index]?.itemId) : undefined;
          
          return (
            <Card key={field.id} className="border-border shadow-sm">
              <CardContent className="p-4 flex flex-col gap-4">
                
                {/* Row 1: Item and Delete */}
                <div className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1.5">
                    <Label>الصنف</Label>
                    <Select 
                      value={items?.[index]?.itemId || (isNew ? "new" : "")} 
                      onChange={(e) => handleItemSelect(index, e.target.value)}
                    >
                      <option value="">اختر من المخزن...</option>
                      <option value="new" className="font-bold text-sky-600">+ صنف جديد غير موجود</option>
                      <optgroup label="أصناف المخزن">
                        {inventoryItems.map(item => (
                          <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                        ))}
                      </optgroup>
                    </Select>
                    
                    {isNew && (
                      <div className="mt-2 space-y-2 p-3 bg-sky-50 dark:bg-sky-500/10 rounded-xl border border-sky-100 dark:border-sky-500/20">
                        <Label className="text-xs">اختر الصنف من دليل الأصناف *</Label>
                        <Select {...register(`items.${index}.dictionaryId`)} className="bg-paper">
                          <option value="">اختر من الدليل...</option>
                          {dictionaryItems?.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.category} - {item.mainType} {item.subType ? `- ${item.subType}` : ""} {item.variety ? `- ${item.variety}` : ""} ({item.unit})
                            </option>
                          ))}
                        </Select>
                        {errors.items?.[index]?.dictionaryId && <p className="text-xs text-danger">{errors.items[index]?.dictionaryId?.message}</p>}
                        <div className="pt-1">
                          <Button type="button" variant="link" size="sm" onClick={onAddDictionaryItem} className="h-auto p-0 text-sky-600 font-bold">
                            + إضافة صنف جديد كلياً لدليل الأصناف
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-7">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="text-danger hover:text-danger hover:bg-danger/10 px-2"
                      title="حذف السطر"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Row 2: Quantity, Price, Total */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-border">
                  {/* الكمية */}
                  <div className="space-y-1.5">
                    <Label>الكمية</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        step="0.01" 
                        className="bg-paper"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })} 
                      />
                      {!isNew && selectedInventoryItem?.unit && (
                        <span className="text-sm text-ink-muted whitespace-nowrap">{selectedInventoryItem.unit}</span>
                      )}
                    </div>
                    {errors.items?.[index]?.quantity && <p className="text-xs text-danger">{errors.items[index]?.quantity?.message}</p>}
                  </div>

                  {/* السعر */}
                  <div className="space-y-1.5">
                    <Label>سعر الوحدة (ج.م)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      className="bg-paper"
                      {...register(`items.${index}.unitPrice`, { valueAsNumber: true })} 
                    />
                    {errors.items?.[index]?.unitPrice && <p className="text-xs text-danger">{errors.items[index]?.unitPrice?.message}</p>}
                  </div>

                  {/* الإجمالي */}
                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                    <Label>إجمالي السطر</Label>
                    <div className="h-10 flex items-center px-3 bg-paper border border-border rounded-xl font-bold text-ink">
                      {itemTotal.toLocaleString()} ج.م
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="notes">ملاحظات الفاتورة</Label>
          <Textarea 
            id="notes" 
            {...register("notes")} 
            rows={3} 
            className="resize-none"
            placeholder="مثال: فاتورة مسددة نقداً / آجل..."
          />
        </div>
        <div className="w-full md:w-1/3 flex flex-col justify-end">
          <div className="bg-crop-500/10 p-4 rounded-xl flex flex-col items-center justify-center gap-1 text-crop-700 dark:text-crop-400 border border-crop-500/20 h-full min-h-[100px]">
            <span className="text-sm font-bold opacity-80">إجمالي الفاتورة</span>
            <span className="font-bold text-3xl">{totalAmount.toLocaleString()} ج.م</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="submit" loading={loading} className="px-8">
          حفظ الفاتورة
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="px-8">
          إلغاء
        </Button>
      </div>

      <datalist id="common-units">
        <option value="كيلوجرام" />
        <option value="جرام" />
        <option value="طن" />
        <option value="لتر" />
        <option value="مللي" />
        <option value="شيكارة 50 كجم" />
        <option value="شيكارة 25 كجم" />
        <option value="عبوة 1 لتر" />
        <option value="عبوة 500 مل" />
        <option value="عبوة 250 مل" />
        <option value="عبوة 100 مل" />
        <option value="ملوة ماتور رش 20 لتر" />
        <option value="ملوة ماتور رش 600 لتر" />
      </datalist>
    </form>
  );
}
