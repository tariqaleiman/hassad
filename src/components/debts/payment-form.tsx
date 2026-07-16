"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, type PaymentSchema } from "./payment-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HandCoins } from "lucide-react";
import type { Farm } from "@/lib/types/farm";
import type { Season } from "@/lib/types/season";
import type { Supplier } from "@/lib/types/supplier";
import type { Contractor } from "@/lib/types/contractor";
import type { Customer } from "@/lib/types/customer";

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentSchema) => Promise<void>;
  farms: Farm[];
  seasons: Season[];
  suppliers: Supplier[];
  contractors: Contractor[];
  customers: Customer[];
  defaultValues?: Partial<PaymentSchema>;
  isSubmitting?: boolean;
}

export function PaymentForm({
  open,
  onClose,
  onSubmit,
  farms,
  seasons,
  suppliers,
  contractors,
  customers,
  defaultValues,
  isSubmitting
}: PaymentFormProps) {
  const form = useForm<PaymentSchema>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      farmId: farms[0]?.id || "",
      seasonId: "",
      date: new Date().toISOString().split("T")[0],
      type: "pay_supplier",
      supplierId: "",
      contractorId: "",
      customerId: "",
      amount: 0,
      paymentMethod: "cash",
      referenceNumber: "",
      notes: "",
    }
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
        seasonId: "",
        date: new Date().toISOString().split("T")[0],
        type: "pay_supplier",
        supplierId: "",
        contractorId: "",
        customerId: "",
        amount: 0,
        paymentMethod: "cash",
        referenceNumber: "",
        notes: "",
      });
    }
  }, [open, defaultValues, form, farms]);

  const paymentType = form.watch("type");
  const selectedFarmId = form.watch("farmId");
  const method = form.watch("paymentMethod");

  const filteredSeasons = seasons.filter(s => s.farmId === selectedFarmId);
  const filteredSuppliers = suppliers.filter(s => s.farmId === selectedFarmId);
  const filteredContractors = contractors.filter(c => c.farmId === selectedFarmId);
  const filteredCustomers = customers.filter(c => c.farmId === selectedFarmId);

  // For showing current debt context
  const getSelectedEntityDebt = () => {
    if (paymentType === "pay_supplier") {
      const sId = form.watch("supplierId");
      return filteredSuppliers.find(s => s.id === sId)?.balance || 0;
    }
    if (paymentType === "pay_contractor") {
      const cId = form.watch("contractorId");
      return filteredContractors.find(c => c.id === cId)?.balance || 0;
    }
    if (paymentType === "receive_from_customer") {
      const cuId = form.watch("customerId");
      return filteredCustomers.find(c => c.id === cuId)?.balance || 0;
    }
    return 0;
  };

  const currentDebt = getSelectedEntityDebt();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-paper rounded-2xl shadow-xl w-full max-w-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-ink">
                {defaultValues ? "تعديل دفعة مالية" : "تسجيل دفعة مالية (سداد ديون)"}
              </h2>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="rounded-full w-10 h-10 p-0">✕</Button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <form id="payment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع الحركة</Label>
                <Select {...form.register("type")}>
                  <option value="pay_supplier">دفع لمورد (تسديد دين عليك)</option>
                  <option value="pay_contractor">دفع لمقاول (تسديد دين عليك)</option>
                  <option value="receive_from_customer">استلام من عميل (تحصيل دين لك)</option>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>المزرعة</Label>
                <Select {...form.register("farmId")}>
                  {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input type="date" {...form.register("date")} />
                {form.formState.errors.date && <p className="text-xs text-danger">{form.formState.errors.date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>ارتباط بموسم (اختياري)</Label>
                <Select {...form.register("seasonId")}>
                  <option value="">بدون ارتباط</option>
                  {filteredSeasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </div>
            </div>

            <div className="bg-paper-sunken/30 p-5 rounded-xl border border-border space-y-4">
              
              <div className="space-y-2">
                <Label>
                  {paymentType === "pay_supplier" && "المورد المراد السداد له"}
                  {paymentType === "pay_contractor" && "المقاول المراد السداد له"}
                  {paymentType === "receive_from_customer" && "العميل المراد التحصيل منه"}
                </Label>

                {paymentType === "pay_supplier" && (
                  <Select {...form.register("supplierId")}>
                    <option value="">اختر المورد...</option>
                    {filteredSuppliers.map(s => <option key={s.id} value={s.id}>{s.name} {s.balance > 0 ? `(مديونية: ${s.balance})` : ''}</option>)}
                  </Select>
                )}
                
                {paymentType === "pay_contractor" && (
                  <Select {...form.register("contractorId")}>
                    <option value="">اختر المقاول...</option>
                    {filteredContractors.map(c => <option key={c.id} value={c.id}>{c.name} {c.balance > 0 ? `(مديونية: ${c.balance})` : ''}</option>)}
                  </Select>
                )}

                {paymentType === "receive_from_customer" && (
                  <Select {...form.register("customerId")}>
                    <option value="">اختر العميل...</option>
                    {filteredCustomers.map(c => <option key={c.id} value={c.id}>{c.name} {c.balance > 0 ? `(دين مستحق: ${c.balance})` : ''}</option>)}
                  </Select>
                )}
                {form.formState.errors.supplierId && <p className="text-xs text-danger">{form.formState.errors.supplierId.message}</p>}
              </div>

              {currentDebt > 0 && (
                <div className={`p-3 rounded-lg flex justify-between items-center ${paymentType === 'receive_from_customer' ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-600'}`}>
                  <span className="font-bold text-sm">
                    {paymentType === 'receive_from_customer' ? 'إجمالي المستحق عليه:' : 'إجمالي المستحق له:'}
                  </span>
                  <span className="font-bold">{currentDebt.toLocaleString()} ج.م</span>
                </div>
              )}

              <div className="space-y-2">
                <Label>المبلغ (ج.م) *</Label>
                <Input type="number" step="0.01" {...form.register("amount", { valueAsNumber: true })} />
                {form.formState.errors.amount && <p className="text-xs text-danger">{form.formState.errors.amount.message}</p>}
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <Select {...form.register("paymentMethod")}>
                  <option value="cash">نقداً</option>
                  <option value="bank">تحويل بنكي</option>
                  <option value="check">شيك</option>
                </Select>
              </div>

              {(method === "bank" || method === "check") && (
                <div className="space-y-2">
                  <Label>رقم المرجع / الشيك</Label>
                  <Input {...form.register("referenceNumber")} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>ملاحظات البيان</Label>
              <Textarea {...form.register("notes")} placeholder="تفاصيل الدفعة..." />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3 rounded-b-2xl">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button 
            type="submit" 
            form="payment-form" 
            disabled={isSubmitting} 
            loading={isSubmitting}
          >
            تأكيد العملية
          </Button>
        </div>

      </div>
    </div>
  );
}
