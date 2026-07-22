"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { operationSchema, type OperationSchema } from "./operation-schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Plus, Trash2, Sprout, Droplets, Fuel, Wrench, Tractor } from "lucide-react";
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
import type { Equipment } from "@/lib/types/equipment";
import { useCycleProgram } from "@/lib/hooks/use-crop-programs";
import { useCurrency } from "@/lib/hooks/use-currency";

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
  equipment?: Equipment[];
  defaultValues?: Partial<OperationSchema>;
  isSubmitting?: boolean;
  /** When true, farm/season/crop fields are locked (pre-filled from task) */
  lockContext?: boolean;
}

const OPERATION_TYPES = [
  "حرث",
  "تخطيط",
  "تسوية",
  "زراعة", 
  "ري", 
  "تسميد",
  "ري وتسميد",
  "رش مبيدات",
  "رش مغذي",
  "عزيق",
  "خف",
  "حصاد",
  "عمالة يدوية",
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
  equipment = [],
  defaultValues,
  isSubmitting,
  lockContext = false,
}: OperationFormProps) {
  const { formatMoney, currency } = useCurrency();
  const form = useForm<OperationSchema>({
    resolver: zodResolver(operationSchema) as any,
    defaultValues: {
      farmId: defaultValues?.farmId || farms[0]?.id || "",
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
      equipmentId: defaultValues?.equipmentId || "",
      equipmentContractorId: defaultValues?.equipmentContractorId || "",
      equipmentPaymentMethod: defaultValues?.equipmentPaymentMethod || "cash",
      fuelCost: defaultValues?.fuelCost || 0,
      depreciationCost: defaultValues?.depreciationCost || 0,
      otherCost: defaultValues?.otherCost || 0,
      linkedPhaseId: defaultValues?.linkedPhaseId || "",
      programId: defaultValues?.programId || "",
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "inventoryItems",
  });

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
        equipmentId: "",
        equipmentContractorId: "",
        equipmentPaymentMethod: "cash",
        fuelCost: 0,
        depreciationCost: 0,
        otherCost: 0,
        linkedPhaseId: "",
        programId: "",
      });
    }
  }, [open, defaultValues, form, farms, seasons]);

  const handleSubmit = async (data: OperationSchema) => {
    const processedData = {
      ...data,
      inventoryItems: data.inventoryItems?.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      })) || []
    };
    
    // Clean up irrelevant fields before submit
    if (!needsLabor && !isPreviousCosts) {
      processedData.laborCost = 0;
      processedData.laborContractorId = "";
    }
    if (!needsEquipment && !isPreviousCosts) {
      processedData.equipmentCost = 0;
      processedData.equipmentContractorId = "";
      processedData.equipmentId = "";
    }
    if (!needsInventory && !isPreviousCosts) {
      processedData.inventoryItems = [];
    }
    if (!isIrrigation) {
      processedData.fuelCost = 0;
      processedData.depreciationCost = 0;
    }

    await onSubmit(processedData);
  };

  const selectedFarmId = form.watch("farmId");
  const selectedSeasonId = form.watch("seasonId");
  const selectedCropCycleId = form.watch("cropCycleId");
  const operationType = form.watch("operationType");
  
  const filteredSeasons = seasons.filter(s => s.farmId === selectedFarmId);
  const filteredCrops = cropCycles.filter(c => c.farmId === selectedFarmId && c.seasonId === selectedSeasonId && c.status === "نشطة");
  const filteredInventory = inventoryItems.filter(i => i.farmId === selectedFarmId);

  // Fetch Program to link phases (only when not locked - i.e. from operations page)
  const { data: currentProgram } = useCycleProgram(lockContext ? "" : selectedCropCycleId);

  // Set programId if a program is found
  useEffect(() => {
    if (currentProgram && form.getValues("programId") !== currentProgram.id) {
      form.setValue("programId", currentProgram.id);
    }
  }, [currentProgram, form]);

  // Smart Visibility Logic
  const isIrrigation = operationType.includes("ري");
  const needsInventory = ["زراعة", "تسميد", "ري وتسميد", "رش مبيدات", "رش مغذي", "أخرى"].includes(operationType);
  const needsEquipment = ["حرث", "تخطيط", "تسوية", "حصاد", "زراعة", "تسميد", "رش مبيدات", "ري", "ري وتسميد", "أخرى"].includes(operationType);
  const needsLabor = ["عمالة يدوية", "عزيق", "ري", "ري وتسميد", "زراعة", "تسميد", "رش مبيدات", "رش مغذي", "حصاد", "أخرى"].includes(operationType);

  const isPreviousCosts = operationType === "تكاليف سابقة";

  // Filter equipment for irrigation
  const irrigationEquipment = equipment.filter(e => e.type === "مضخة ري");
  const otherEquipment = equipment.filter(e => e.type !== "مضخة ري");

  return (
    <Dialog open={open} onClose={onClose} title="تسجيل عملية زراعية" className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        
        {/* Basic Info */}
        <div className="bg-paper p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Sprout className="w-5 h-5 text-crop-600" />
            <h3 className="font-bold text-lg text-ink">المعلومات الأساسية</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label>نوع العملية (حدد بدقة)</Label>
              <Select
                value={form.watch("operationType")}
                onChange={(e) => {
                  form.setValue("operationType", e.target.value as any);
                  if (e.target.value !== "تكاليف سابقة" && !["زراعة", "تسميد", "رش مبيدات", "أخرى"].includes(e.target.value)) {
                    form.setValue("inventoryItems", []);
                  }
                }}
                disabled={lockContext}
              >
                {OPERATION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>تاريخ العملية</Label>
              <Input type="date" {...form.register("date")} />
            </div>

            {!lockContext && (
              <>
                <div className="space-y-2">
                  <Label>المزرعة</Label>
                  <Select value={form.watch("farmId")} onChange={(e) => form.setValue("farmId", e.target.value)}>
                    {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>الموسم</Label>
                  <Select value={form.watch("seasonId")} onChange={(e) => form.setValue("seasonId", e.target.value)}>
                    <option value="">اختر الموسم</option>
                    {filteredSeasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label>المحصول المرتبط</Label>
                  <Select value={form.watch("cropCycleId")} onChange={(e) => {
                    form.setValue("cropCycleId", e.target.value);
                    form.setValue("linkedPhaseId", "");
                  }}>
                    <option value="">اختر المحصول</option>
                    {filteredCrops.map((c) => {
                      const cropName = crops.find(crop => crop.id === c.cropId)?.name || c.cropId;
                      return (
                        <option key={c.id} value={c.id}>{cropName} {c.cropVariety ? `(${c.cropVariety})` : ''} - مساحة {c.areaValue} {c.areaUnit}</option>
                      );
                    })}
                  </Select>
                </div>

                {/* Link to Phase (only when NOT from monitoring) */}
                {currentProgram && (
                  <div className="space-y-2 lg:col-span-3 bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                    <Label className="text-indigo-800 dark:text-indigo-400 font-bold flex items-center gap-2">
                      <Sprout className="w-4 h-4" /> ربط بمهمة من برنامج المتابعة (اختياري)
                    </Label>
                    <Select value={form.watch("linkedPhaseId")} onChange={(e) => form.setValue("linkedPhaseId", e.target.value)}>
                      <option value="">-- بدون ربط بمهمة محددة --</option>
                      {currentProgram.phases.filter(p => !currentProgram.executions[p.id]?.isCompleted).map(p => (
                        <option key={p.id} value={p.id}>{p.title} (النوع: {p.type}) - مستحقة اليوم {p.dayNumber}</option>
                      ))}
                    </Select>
                    <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 px-1 mt-1">
                      سيتم ربط التكلفة بالمهمة المحددة لتتمكن من مراجعتها لاحقاً.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* === IRRIGATION-SPECIFIC SECTION === */}
        {isIrrigation && (
          <div className="bg-sky-50/50 dark:bg-sky-900/10 p-5 rounded-2xl border border-sky-100 dark:border-sky-900/30 space-y-4">
            <div className="flex items-center gap-2 border-b border-sky-200/50 dark:border-sky-800/50 pb-2">
              <Droplets className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-lg text-sky-800 dark:text-sky-400">تكاليف الري</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Select irrigation machine */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1"><Wrench className="w-3 h-3" /> ماكينة الري المستخدمة</Label>
                <Select value={form.watch("equipmentId") || ""} onChange={(e) => form.setValue("equipmentId", e.target.value)}>
                  <option value="">-- لا توجد ماكينة مسجلة --</option>
                  {irrigationEquipment.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.status})</option>
                  ))}
                </Select>
              </div>
              {/* Fuel cost */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1"><Fuel className="w-3 h-3" /> تكلفة الوقود / الكهرباء ({currency})</Label>
                <Input type="number" step="0.01" {...form.register("fuelCost", { valueAsNumber: true })} />
              </div>
              {/* Depreciation */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1"><Tractor className="w-3 h-3" /> إهلاك الماكينة ({currency})</Label>
                <Input type="number" step="0.01" {...form.register("depreciationCost", { valueAsNumber: true })} />
                <p className="text-[10px] text-sky-600/60">قيمة تقديرية لإهلاك الماكينة عن هذه الرية</p>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Items */}
        {needsInventory && !isPreviousCosts && (
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-emerald-200/50 dark:border-emerald-800/50">
              <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-400">سحب من المخزون (أسمدة، مبيدات، بذور)</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ id: crypto.randomUUID(), itemId: "", quantity: 0, unitPrice: 0 })}>
                <Plus className="w-4 h-4 ml-2" /> إضافة صنف
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => {
                const selectedItemId = form.watch(`inventoryItems.${index}.itemId`);
                const selectedItem = filteredInventory.find(i => i.id === selectedItemId);

                return (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-paper p-3 rounded-xl border border-border shadow-sm">
                    <div className="md:col-span-4 space-y-1">
                      <Label className="text-xs">الصنف</Label>
                      <Select
                        value={form.watch(`inventoryItems.${index}.itemId`)}
                        onChange={(e) => {
                          form.setValue(`inventoryItems.${index}.itemId`, e.target.value);
                          const item = filteredInventory.find(i => i.id === e.target.value);
                          form.setValue(`inventoryItems.${index}.unitPrice`, item?.averageCost || 0);
                        }}
                      >
                        <option value="">اختر الصنف</option>
                        {filteredInventory.map(item => (
                          <option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit} متاح)</option>
                        ))}
                      </Select>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <Label className="text-xs">الكمية المستهلكة</Label>
                      <div className="relative">
                        <Input
                          type="number" step="0.01"
                          {...form.register(`inventoryItems.${index}.quantity`, { valueAsNumber: true })}
                        />
                        <span className="absolute left-3 top-3 text-xs text-ink-muted">{selectedItem?.unit || ""}</span>
                      </div>
                    </div>

                    <div className="md:col-span-4 space-y-1">
                      <Label className="text-xs">التكلفة ({currency})</Label>
                      <div className="h-10 flex items-center px-3 bg-paper-sunken rounded-lg text-sm text-ink font-medium">
                        {((form.watch(`inventoryItems.${index}.quantity`) || 0) * (form.watch(`inventoryItems.${index}.unitPrice`) || 0)).toLocaleString()} ${currency}
                      </div>
                    </div>

                    <div className="md:col-span-1 pt-6 text-center">
                      <button type="button" onClick={() => remove(index)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {fields.length === 0 && <p className="text-center text-sm text-ink-muted py-2">لم يتم تحديد مواد من المخزن.</p>}
            </div>
          </div>
        )}

        {/* Operational Costs (Labor & Equipment) */}
        <div className="bg-paper p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-ink border-b border-border pb-2">
            {isPreviousCosts ? "تسجيل تكاليف سابقة (مجمعة)" : "تكلفة تشغيل العملية"}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Equipment Cost (non-irrigation) */}
            {(needsEquipment || isPreviousCosts) && !isIrrigation && (
              <div className="space-y-4 bg-sky-50/50 dark:bg-sky-900/10 p-4 rounded-xl border border-sky-100 dark:border-sky-900/30">
                <h4 className="font-bold text-sky-800 dark:text-sky-400 text-sm">تكلفة الآلات والمعدات (جرار / حصادة)</h4>
                
                {otherEquipment.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">المعدة المستخدمة (اختياري)</Label>
                    <Select value={form.watch("equipmentId") || ""} onChange={(e) => form.setValue("equipmentId", e.target.value)}>
                      <option value="">-- بدون تحديد معدة --</option>
                      {otherEquipment.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name} - {eq.type} ({eq.status})</option>
                      ))}
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs">قيمة الإيجار / التكلفة ({currency})</Label>
                  <Input type="number" step="0.01" {...form.register("equipmentCost", { valueAsNumber: true })} />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">المقاول (في حالة الدفع الآجل)</Label>
                  <Select {...form.register("equipmentContractorId")}>
                    <option value="">نقداً (بدون مقاول)</option>
                    {contractors.filter(c => c.types.includes("جرار زراعي") || c.types.includes("آلات حصاد") || c.types.includes("أخرى")).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </div>
                
                {form.watch("equipmentContractorId") && (
                  <div className="space-y-2">
                    <Label className="text-xs">طريقة الدفع</Label>
                    <Select {...form.register("equipmentPaymentMethod")}>
                      <option value="cash">دُفعت نقداً للمقاول</option>
                      <option value="credit">آجل (سُجلت كدين لصالح المقاول)</option>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Labor Cost */}
            {(needsLabor || isPreviousCosts) && (
              <div className="space-y-4 bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">تكلفة العمالة</h4>
                
                <div className="space-y-2">
                  <Label className="text-xs">أجرة العمال ({currency})</Label>
                  <Input type="number" step="0.01" {...form.register("laborCost", { valueAsNumber: true })} />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">مقاول العمالة (في حالة الدفع الآجل)</Label>
                  <Select {...form.register("laborContractorId")}>
                    <option value="">نقداً (بدون مقاول)</option>
                    {contractors.filter(c => c.types.includes("عمالة") || c.types.includes("أخرى")).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </div>

                {form.watch("laborContractorId") && (
                  <div className="space-y-2">
                    <Label className="text-xs">طريقة الدفع</Label>
                    <Select {...form.register("laborPaymentMethod")}>
                      <option value="cash">دُفعت نقداً لمقاول الأنفار</option>
                      <option value="credit">آجل (سُجلت كدين لصالح المقاول)</option>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Other Cost - Always shown */}
            <div className={`space-y-2 ${needsEquipment && needsLabor ? 'lg:col-span-2' : ''}`}>
              <Label className="text-xs text-ink-muted">أي مصاريف نثرية أخرى تخص هذه العملية ({currency})</Label>
              <Input type="number" step="0.01" {...form.register("otherCost", { valueAsNumber: true })} />
            </div>

            <div className={`space-y-2 lg:col-span-2`}>
              <Label className="text-xs">ملاحظات / وصف مختصر</Label>
              <Textarea {...form.register("notes")} placeholder="تفاصيل... (عدد ساعات الجرار، عدد العمال...)" className="h-16" />
            </div>

          </div>
        </div>

        {/* Total Cost Summary */}
        <div className="bg-paper-sunken border border-border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 sticky bottom-0">
          <div>
            <p className="text-sm text-ink-muted">إجمالي التكلفة</p>
            <p className="text-3xl font-bold font-display text-ink mt-1">
              {(() => {
                const inventoryCost = form.watch("inventoryItems")?.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0) || 0;
                const labor = Number(form.watch("laborCost")) || 0;
                const equip = Number(form.watch("equipmentCost")) || 0;
                const fuel = Number(form.watch("fuelCost")) || 0;
                const depreciation = Number(form.watch("depreciationCost")) || 0;
                const other = Number(form.watch("otherCost")) || 0;
                return (needsInventory ? inventoryCost : 0) + ((needsLabor || isPreviousCosts) ? labor : 0) + ((needsEquipment || isPreviousCosts) ? equip : 0) + (isIrrigation ? fuel + depreciation : 0) + other;
              })().toLocaleString()} <span className="text-sm font-normal">ج.م</span>
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 md:flex-none w-24">إلغاء</Button>
            <Button type="submit" loading={isSubmitting} className="flex-1 md:flex-none">اعتماد العملية</Button>
          </div>
        </div>

      </form>
    </Dialog>
  );
}
