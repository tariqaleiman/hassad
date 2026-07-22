"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { salesInvoiceSchema, type SalesInvoiceSchema } from "./sales-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Receipt } from "lucide-react";
import type { Farm } from "@/lib/types/farm";
import type { Season } from "@/lib/types/season";
import type { Customer } from "@/lib/types/customer";
import type { CropCycle } from "@/lib/types/crop-cycle";
import type { Crop } from "@/lib/types/crop";
import { useCurrency } from "@/lib/hooks/use-currency";

interface SalesInvoiceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SalesInvoiceSchema) => Promise<void>;
  farms: Farm[];
  seasons: Season[];
  customers: Customer[];
  inventoryItems: any[]; // Or import type InventoryItem
  defaultValues?: Partial<SalesInvoiceSchema>;
  isSubmitting?: boolean;
}

export function SalesInvoiceForm({
  open,
  onClose,
  onSubmit,
  farms,
  seasons,
  customers,
  inventoryItems,
  defaultValues,
  isSubmitting
}: SalesInvoiceFormProps) {
  const form = useForm<SalesInvoiceSchema>({
    resolver: zodResolver(salesInvoiceSchema),
    defaultValues: {
      farmId: farms[0]?.id || "",
      seasonId: seasons[0]?.id || "",
      invoiceDate: new Date().toISOString().split("T")[0],
      paymentMethod: "cash",
      paidAmount: 0,
      customerId: "",
      customerName: "",
      items: [],
      notes: "",
    }
  });
  const { formatMoney, currency } = useCurrency();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (open && defaultValues) {
      form.reset({
        ...defaultValues,
        invoiceDate: defaultValues.invoiceDate || new Date().toISOString().split("T")[0],
      });
    } else if (open) {
      form.reset({
        farmId: farms[0]?.id || "",
        seasonId: seasons[0]?.id || "",
        invoiceDate: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        paidAmount: 0,
        customerId: "",
        customerName: "",
        items: [{ id: crypto.randomUUID(), inventoryItemId: "", quantity: 0, unit: "طن", unitPrice: 0 }],
        notes: "",
      });
    }
  }, [open, defaultValues, form, farms, seasons]);

  const watchItems = form.watch("items") || [];
  const totalAmount = watchItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);

  const selectedFarmId = form.watch("farmId");
  const filteredSeasons = seasons.filter(s => s.farmId === selectedFarmId);
  const filteredCustomers = customers.filter(c => c.farmId === selectedFarmId);
  const filteredInventory = inventoryItems.filter(i => i.farmId === selectedFarmId && i.quantity > 0);

  const paymentMethod = form.watch("paymentMethod");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-paper rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-paper/95 backdrop-blur z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-ink">
                {defaultValues ? "تعديل فاتورة بيع" : "فاتورة بيع جديدة"}
              </h2>
              <p className="text-sm text-ink-muted">تسجيل فاتورة بيع</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="rounded-full w-10 h-10 p-0">✕</Button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="sales-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>المزرعة</Label>
                <Select {...form.register("farmId")}>
                  {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
                {form.formState.errors.farmId && <p className="text-xs text-danger">{form.formState.errors.farmId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>تاريخ الفاتورة</Label>
                <Input type="date" {...form.register("invoiceDate")} />
                {form.formState.errors.invoiceDate && <p className="text-xs text-danger">{form.formState.errors.invoiceDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>الموسم (اختياري)</Label>
                <Select {...form.register("seasonId")}>
                  <option value="">بدون موسم محدد</option>
                  {filteredSeasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </div>
            </div>

            {/* Customer Section */}
            <div className="bg-paper-sunken/30 p-5 rounded-2xl border border-border space-y-4">
              <h3 className="font-bold text-lg text-ink border-b border-border pb-2">بيانات العميل والدفع</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>اختر عميل مسجل (اختياري)</Label>
                  <Select {...form.register("customerId")}>
                    <option value="">عميل عابر / نقدي</option>
                    {filteredCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </div>

                {!form.watch("customerId") && (
                  <div className="space-y-2">
                    <Label>اسم المشتري</Label>
                    <Input {...form.register("customerName")} placeholder="مثال: تاجر التجزئة س" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>طريقة الدفع</Label>
                  <Select {...form.register("paymentMethod")}>
                    <option value="cash">نقداً (كاش)</option>
                    <option value="instapay">إنستاباي (InstaPay)</option>
                    <option value="vodafone_cash">فودافون كاش</option>
                    <option value="orange_cash">أورانج كاش</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="other">طريقة أخرى</option>
                    <option value="credit">آجل (يضاف لرصيد العميل)</option>
                  </Select>
                </div>

                {paymentMethod === "credit" && (
                  <div className="space-y-2">
                    <Label>المبلغ المدفوع مقدماً ({currency})</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...form.register("paidAmount", { valueAsNumber: true })} 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-emerald-200/50 dark:border-emerald-800/50">
                <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-400">الأصناف المباعة</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="gap-1 border-emerald-200 hover:bg-emerald-100 dark:border-emerald-800 dark:hover:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300"
                  onClick={() => append({ id: crypto.randomUUID(), inventoryItemId: "", quantity: 0, unit: "طن", unitPrice: 0 })}
                >
                  <Plus className="w-4 h-4" />
                  إضافة صنف
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-center text-ink-muted py-4">لا توجد أصناف. أضف صنفاً للبدء.</p>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-paper p-3 rounded-xl border border-border shadow-sm">
                      <div className="md:col-span-4 space-y-1">
                        <Label className="text-xs">الصنف</Label>
                        <Select {...form.register(`items.${index}.inventoryItemId`)}>
                          <option value="">اختر المنتج...</option>
                          {filteredInventory.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name} (المتاح: {item.quantity} {item.unit})
                            </option>
                          ))}
                        </Select>
                        {form.formState.errors.items?.[index]?.inventoryItemId && (
                          <p className="text-xs text-danger">{form.formState.errors.items[index]?.inventoryItemId?.message}</p>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-xs">الكمية</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} 
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-xs">الوحدة</Label>
                        <Input {...form.register(`items.${index}.unit`)} placeholder="طن، كجم..." />
                      </div>

                      <div className="md:col-span-3 space-y-1">
                        <Label className="text-xs">السعر للوحدة</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })} 
                        />
                      </div>

                      <div className="md:col-span-1 pt-6 text-center">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Item Total */}
                      <div className="md:col-span-12 flex justify-end px-2 pt-2 border-t border-border mt-2">
                        <p className="text-sm font-medium text-ink">
                          الإجمالي: <span className="font-bold text-success text-base">
                            {formatMoney((watchItems[index]?.quantity || 0) * (watchItems[index]?.unitPrice || 0))}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>ملاحظات إضافية (اختياري)</Label>
              <Textarea {...form.register("notes")} placeholder="أي تفاصيل أخرى عن الفاتورة..." />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-paper-sunken/30 rounded-b-2xl flex flex-col md:flex-row justify-between items-center gap-4 sticky bottom-0">
          <div className="text-right w-full md:w-auto">
            <p className="text-sm text-ink-muted">إجمالي الفاتورة</p>
            <p className="text-3xl font-bold font-display text-success">
              {formatMoney(totalAmount)}
            </p>
            {paymentMethod === "credit" && (form.watch("paidAmount") || 0) > 0 && (
              <p className="text-xs text-amber-600 mt-1">الباقي آجل: {formatMoney(totalAmount - (form.watch("paidAmount") || 0))}</p>
            )}
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button type="button" variant="outline" onClick={onClose} className="w-full md:w-auto">
              إلغاء
            </Button>
            <Button 
              type="submit" 
              form="sales-form" 
              disabled={isSubmitting} 
              loading={isSubmitting}
              className="w-full md:w-auto min-w-[120px]"
            >
              حفظ الفاتورة
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
