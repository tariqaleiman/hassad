"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { operationSchema, type OperationSchema } from "./operation-schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import type { Farm } from "@/lib/types/farm";
import type { Season } from "@/lib/types/season";
import type { CropCycle } from "@/lib/types/crop-cycle";
import type { Crop } from "@/lib/types/crop";
import type { InventoryItem } from "@/lib/types/inventory";
import type { Contractor } from "@/lib/types/contractor";

interface OperationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OperationSchema) => Promise<void>;
  farms: Farm[];
  seasons: Season[];
  cropCycles: CropCycle[];
  crops: Crop[];
  inventoryItems: InventoryItem[];
  contractors: Contractor[];
  defaultValues?: Partial<OperationSchema>;
  isSubmitting?: boolean;
}

const OPERATION_TYPES = [
  "إعداد أرض", 
  "زراعة", 
  "ري", 
  "تسميد", 
  "رش مبيدات", 
  "حصاد", 
  "تكاليف سابقة",
  "أخرى"
];

export function OperationForm({
  open,
  onClose,
  onSubmit,
  farms,
  seasons,
  cropCycles,
  crops,
  inventoryItems,
  contractors,
  defaultValues,
  isSubmitting
}: OperationFormProps) {
  const form = useForm<OperationSchema>({
    resolver: zodResolver(operationSchema) as any,
    defaultValues: {
      farmId: defaultValues?.farmId || "",
      seasonId: defaultValues?.seasonId || "",
      cropCycleId: defaultValues?.cropCycleId || "",
      operationType: defaultValues?.operationType || "تسميد",
      date: defaultValues?.date || new Date().toISOString().split("T")[0],
      notes: defaultValues?.notes || "",
      inventoryItems: defaultValues?.inventoryItems || [],
      laborCost: defaultValues?.laborCost || 0,
      laborContractorId: defaultValues?.laborContractorId || "",
      laborPaymentMethod: defaultValues?.laborPaymentMethod || "cash",
      equipmentCost: defaultValues?.equipmentCost || 0,
      equipmentContractorId: defaultValues?.equipmentContractorId || "",
      equipmentPaymentMethod: defaultValues?.equipmentPaymentMethod || "cash",
      otherCost: defaultValues?.otherCost || 0,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "inventoryItems",
  });

  // Reset form when open changes
  useEffect(() => {
    if (open && defaultValues) {
      form.reset({
        ...defaultValues,
        date: defaultValues.date || new Date().toISOString().split("T")[0],
      });
    } else if (open) {
      form.reset({
        farmId: farms[0]?.id || "",
        seasonId: seasons[0]?.id || "",
        cropCycleId: "",
        operationType: "تسميد",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        inventoryItems: [],
        laborCost: 0,
        laborContractorId: "",
        laborPaymentMethod: "cash",
        equipmentCost: 0,
        equipmentContractorId: "",
        equipmentPaymentMethod: "cash",
        otherCost: 0,
      });
    }
  }, [open, defaultValues, form, farms, seasons]);

  const handleSubmit = async (data: OperationSchema) => {
    // calculate total price for items
    const processedData = {
      ...data,
      inventoryItems: data.inventoryItems?.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      })) || []
    };
    await onSubmit(processedData);
    // Modal closing is handled in the parent component on successful submit
  };

  const selectedFarmId = form.watch("farmId");
  const selectedSeasonId = form.watch("seasonId");
  
  const filteredSeasons = seasons.filter(s => s.farmId === selectedFarmId);
  const filteredCrops = cropCycles.filter(c => c.farmId === selectedFarmId && c.seasonId === selectedSeasonId && c.status === "نشطة");
  const filteredInventory = inventoryItems.filter(i => i.farmId === selectedFarmId);

  return (
    <Dialog open={open} onClose={onClose} title="تسجيل عملية زراعية جديدة" className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        
        {/* Basic Info */}
        <div className="bg-paper p-6 rounded-2xl border border-border space-y-4">
          <h3 className="font-bold text-lg text-ink border-b border-border pb-2">المعلومات الأساسية</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المزرعة</Label>
              <Select
                value={form.watch("farmId")}
                onChange={(e) => form.setValue("farmId", e.target.value)}
              >
                <option value="">اختر المزرعة</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </Select>
              {form.formState.errors.farmId && (
                <p className="text-sm text-danger">{form.formState.errors.farmId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>الموسم</Label>
              <Select
                value={form.watch("seasonId")}
                onChange={(e) => form.setValue("seasonId", e.target.value)}
                disabled={!selectedFarmId}
              >
                <option value="">اختر الموسم</option>
                {filteredSeasons.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
              {form.formState.errors.seasonId && (
                <p className="text-sm text-danger">{form.formState.errors.seasonId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>الدورة الزراعية (المحصول)</Label>
              <Select
                value={form.watch("cropCycleId")}
                onChange={(e) => form.setValue("cropCycleId", e.target.value)}
                disabled={!selectedSeasonId}
              >
                <option value="">اختر المحصول</option>
                {filteredCrops.map((c) => {
                  const baseCrop = crops.find(crop => crop.id === c.cropId);
                  const cropName = baseCrop?.name || c.cropId;
                  return (
                    <option key={c.id} value={c.id}>{cropName} {c.cropVariety ? `(${c.cropVariety})` : ''} - مساحة {c.areaValue} {c.areaUnit}</option>
                  );
                })}
              </Select>
              {form.formState.errors.cropCycleId && (
                <p className="text-sm text-danger">{form.formState.errors.cropCycleId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>نوع العملية</Label>
              <Select
                value={form.watch("operationType")}
                onChange={(e) => form.setValue("operationType", e.target.value as any)}
              >
                {OPERATION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
              {form.formState.errors.operationType && (
                <p className="text-sm text-danger">{form.formState.errors.operationType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>تاريخ العملية</Label>
              <Input
                type="date"
                {...form.register("date")}
                error={form.formState.errors.date?.message}
              />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات (اختياري)</Label>
              <Textarea
                {...form.register("notes")}
                placeholder="تفاصيل إضافية عن العملية..."
                className={form.formState.errors.notes ? "border-danger focus:border-danger focus:ring-danger" : ""}
              />
              {form.formState.errors.notes && <p className="mt-1 text-xs text-danger">{form.formState.errors.notes.message}</p>}
            </div>
          </div>
        </div>

        {/* Inventory Items */}
        {form.watch("operationType") !== "تكاليف سابقة" && (
          <div className="bg-paper p-6 rounded-2xl border border-border space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="font-bold text-lg text-ink">سحب من المخزون (اختياري)</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ id: crypto.randomUUID(), itemId: "", quantity: 0, unitPrice: 0 })}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة صنف
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => {
              const selectedItemId = form.watch(`inventoryItems.${index}.itemId`);
              const selectedItem = filteredInventory.find(i => i.id === selectedItemId);

              return (
                <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start bg-paper-sunken p-4 rounded-xl border border-border">
                  <div className="flex-1 space-y-2 w-full">
                    <Label>الصنف من المخزن</Label>
                    <Select
                      value={form.watch(`inventoryItems.${index}.itemId`)}
                      onChange={(e) => {
                        form.setValue(`inventoryItems.${index}.itemId`, e.target.value);
                        const item = filteredInventory.find(i => i.id === e.target.value);
                        if (item) {
                          form.setValue(`inventoryItems.${index}.unitPrice`, item.averageCost || 0);
                        } else {
                          form.setValue(`inventoryItems.${index}.unitPrice`, 0);
                        }
                      }}
                    >
                      <option value="">اختر الصنف</option>
                      {filteredInventory.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.quantity} {item.unit} متاح)
                        </option>
                      ))}
                    </Select>
                    {form.formState.errors.inventoryItems?.[index]?.itemId && (
                      <p className="text-xs text-danger">{form.formState.errors.inventoryItems[index]?.itemId?.message}</p>
                    )}
                  </div>

                  {selectedItem?.subUnitRatio ? (
                    <div className="flex gap-2 items-start">
                      <div className="w-full md:w-24 space-y-2">
                        <Label>الكمية ({selectedItem.unit})</Label>
                        <Input
                          type="number"
                          step="1"
                          {...form.register(`inventoryItems.${index}.mainQuantity`, { valueAsNumber: true })}
                          onChange={(e) => {
                            form.setValue(`inventoryItems.${index}.mainQuantity`, parseFloat(e.target.value) || 0);
                            const main = parseFloat(e.target.value) || 0;
                            const sub = form.watch(`inventoryItems.${index}.subQuantity`) || 0;
                            const totalQuantity = main + (sub / selectedItem.subUnitRatio!);
                            form.setValue(`inventoryItems.${index}.quantity`, totalQuantity);
                          }}
                        />
                      </div>
                      <div className="w-full md:w-24 space-y-2">
                        <Label>الكمية ({selectedItem.subUnit})</Label>
                        <Input
                          type="number"
                          step="1"
                          {...form.register(`inventoryItems.${index}.subQuantity`, { valueAsNumber: true })}
                          onChange={(e) => {
                            form.setValue(`inventoryItems.${index}.subQuantity`, parseFloat(e.target.value) || 0);
                            const sub = parseFloat(e.target.value) || 0;
                            const main = form.watch(`inventoryItems.${index}.mainQuantity`) || 0;
                            const totalQuantity = main + (sub / selectedItem.subUnitRatio!);
                            form.setValue(`inventoryItems.${index}.quantity`, totalQuantity);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full md:w-32 space-y-2">
                      <Label>الكمية المستهلكة</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`inventoryItems.${index}.quantity`, { valueAsNumber: true })}
                        />
                        <span className="absolute left-3 top-3 text-sm text-ink-muted">{selectedItem?.unit || ""}</span>
                      </div>
                    </div>
                  )}

                  <div className="w-full md:w-32 space-y-2">
                    <Label>متوسط التكلفة</Label>
                    <Input
                      type="number"
                      step="0.01"
                      readOnly
                      className="bg-paper-sunken opacity-70"
                      {...form.register(`inventoryItems.${index}.unitPrice`, { valueAsNumber: true })}
                    />
                  </div>

                  <div className="w-full md:w-32 space-y-2">
                    <Label>الإجمالي</Label>
                    <div className="h-11 flex items-center px-4 bg-paper rounded-xl border border-border font-bold text-crop-600 dark:text-crop-400">
                      {((form.watch(`inventoryItems.${index}.quantity`) || 0) * (form.watch(`inventoryItems.${index}.unitPrice`) || 0)).toLocaleString()} ج.م
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-danger hover:bg-danger/10"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {fields.length === 0 && (
              <p className="text-sm text-ink-muted text-center py-4">لم يتم إضافة أصناف من المخزن لهذه العملية.</p>
            )}
          </div>
        </div>
        )}

        {/* Other Costs */}
        <div className="bg-paper p-6 rounded-2xl border border-border space-y-4">
          <h3 className="font-bold text-lg text-ink border-b border-border pb-2">
            {form.watch("operationType") === "تكاليف سابقة" ? "تفاصيل التكاليف السابقة المجمعة" : "تكاليف إضافية للعملية"}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* العمالة */}
            <div className="space-y-4 bg-paper-sunken/30 p-4 rounded-xl border border-border">
              <div className="space-y-2">
                <Label>{form.watch("operationType") === "تكاليف سابقة" ? "إجمالي العمالة (ج.م)" : "تكلفة العمالة (ج.م)"}</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("laborCost", { valueAsNumber: true })}
                  error={form.formState.errors.laborCost?.message}
                />
              </div>
              <div className="space-y-2">
                <Label>مقاول العمالة (اختياري)</Label>
                <Select {...form.register("laborContractorId")}>
                  <option value="">بدون مقاول</option>
                  {contractors.filter(c => c.type === "عمالة" || c.type === "أخرى").map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
              {form.watch("laborContractorId") && (
                <div className="space-y-2">
                  <Label>طريقة الدفع</Label>
                  <Select {...form.register("laborPaymentMethod")}>
                    <option value="cash">نقداً</option>
                    <option value="credit">آجل (يضاف لرصيد المقاول)</option>
                  </Select>
                </div>
              )}
            </div>
            
            {/* المعدات */}
            <div className="space-y-4 bg-paper-sunken/30 p-4 rounded-xl border border-border">
              <div className="space-y-2">
                <Label>{form.watch("operationType") === "تكاليف سابقة" ? "إجمالي الآلات والمعدات (ج.م)" : "تكلفة تأجير المعدات (ج.م)"}</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("equipmentCost", { valueAsNumber: true })}
                  error={form.formState.errors.equipmentCost?.message}
                />
              </div>
              <div className="space-y-2">
                <Label>مقاول المعدات (اختياري)</Label>
                <Select {...form.register("equipmentContractorId")}>
                  <option value="">بدون مقاول</option>
                  {contractors.filter(c => c.type === "جرار زراعي" || c.type === "آلات حصاد" || c.type === "أخرى").map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
              {form.watch("equipmentContractorId") && (
                <div className="space-y-2">
                  <Label>طريقة الدفع</Label>
                  <Select {...form.register("equipmentPaymentMethod")}>
                    <option value="cash">نقداً</option>
                    <option value="credit">آجل (يضاف لرصيد المقاول)</option>
                  </Select>
                </div>
              )}
            </div>
            
            {/* مصاريف أخرى */}
            <div className="space-y-4 bg-paper-sunken/30 p-4 rounded-xl border border-border">
              <div className="space-y-2">
                <Label>{form.watch("operationType") === "تكاليف سابقة" ? "مصروفات أخرى (أسمدة، مبيدات.. الخ)" : "مصروفات أخرى (ج.م)"}</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("otherCost", { valueAsNumber: true })}
                  error={form.formState.errors.otherCost?.message}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Total Cost Summary */}
        <div className="bg-crop-50 dark:bg-crop-900/30 border border-crop-200 dark:border-crop-800/50 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm text-ink-muted">إجمالي تكلفة العملية شاملة المخزون والعمالة والمعدات</p>
            <p className="text-2xl font-bold text-crop-600 dark:text-crop-400 mt-1">
              {(() => {
                const inventoryCost = form.watch("inventoryItems")?.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0) || 0;
                const labor = Number(form.watch("laborCost")) || 0;
                const equip = Number(form.watch("equipmentCost")) || 0;
                const other = Number(form.watch("otherCost")) || 0;
                return (inventoryCost + labor + equip + other).toLocaleString();
              })()} ج.م
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 md:flex-none">
              إلغاء
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1 md:flex-none">
              حفظ العملية الزراعية
            </Button>
          </div>
        </div>

      </form>
    </Dialog>
  );
}
