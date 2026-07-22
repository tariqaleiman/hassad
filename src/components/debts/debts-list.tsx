"use client";

import { useState } from "react";
import { useCurrency } from "@/lib/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaymentForm } from "./payment-form";
import { paymentService } from "@/lib/services/payment-service";
import { useAuth } from "@/lib/providers/auth-provider";
import { HandCoins, Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Store, Tractor, Users, FileText, Search } from "lucide-react";
import type { Payment, PaymentFormValues } from "@/lib/types/payment";
import type { Farm } from "@/lib/types/farm";
import type { Season } from "@/lib/types/season";
import type { Supplier } from "@/lib/types/supplier";
import type { Contractor } from "@/lib/types/contractor";
import type { Customer } from "@/lib/types/customer";

export function DebtsList({
  payments,
  farms,
  seasons,
  suppliers,
  contractors,
  customers,
  onUpdate,
}: {
  payments: Payment[];
  farms: Farm[];
  seasons: Season[];
  suppliers: Supplier[];
  contractors: Contractor[];
  customers: Customer[];
  onUpdate: () => void;
}) {
  const { formatMoney, currency } = useCurrency();
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Payment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: PaymentFormValues) => {
    setLoading(true);
    try {
      if (editingItem) {
        await paymentService.updatePayment(editingItem.id, values, user?.uid);
      } else {
        await paymentService.createPayment(values, user?.uid);
      }
      setIsAddOpen(false);
      setEditingItem(null);
      onUpdate();
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setLoading(true);
    try {
      await paymentService.deletePayment(deleteConfirmId, user?.uid);
      setDeleteConfirmId(null);
      onUpdate();
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  // Calculations for summary
  const totalSupplierDebt = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);
  const totalContractorDebt = contractors.reduce((sum, c) => sum + (c.balance || 0), 0);
  const totalLiabilities = totalSupplierDebt + totalContractorDebt; // ديون علينا
  const totalAssets = customers.reduce((sum, c) => sum + (c.balance || 0), 0); // ديون لنا

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <HandCoins className="h-5 w-5" />
            </div>
            الديون والمدفوعات
          </h1>
          <p className="text-sm text-ink-muted mt-1">إدارة الديون وتسديد الموردين والمقاولين وتحصيل العملاء</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          تسجيل دفعة مالية
        </Button>
      </div>

      {/* Summary */}
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-danger/5 border-danger/10">
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm text-danger font-bold flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 bg-danger/10 rounded-full p-1" />
                إجمالي الديون (عليك)
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold font-display text-danger">{formatMoney(totalLiabilities)}</p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-danger/10">
                <p className="text-xs text-danger/70">موردين: <span className="font-bold">{totalSupplierDebt.toLocaleString()}</span></p>
                <p className="text-xs text-danger/70">مقاولين: <span className="font-bold">{totalContractorDebt.toLocaleString()}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success/5 border-success/10">
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm text-success font-bold flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 bg-success/10 rounded-full p-1" />
                إجمالي الديون (لك)
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold font-display text-success">{formatMoney(totalAssets)}</p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-success/10">
                <p className="text-xs text-success/70">عند العملاء: <span className="font-bold">{totalAssets.toLocaleString()}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      {payments.length > 0 && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
          <Input 
            type="text" 
            placeholder="ابحث بالتاريخ، الملاحظات، أو اسم الجهة..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10 py-6 bg-paper shadow-sm rounded-xl text-lg"
          />
        </div>
      )}

      {/* List */}
      <Card className="bg-paper border-border shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-ink mb-6">سجل الحركات المالية</h2>
          
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="text-center py-16 border border-border border-dashed rounded-xl bg-paper-sunken">
                <FileText className="w-12 h-12 text-ink-muted mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-ink">لا توجد حركات سداد</p>
                <p className="text-ink-muted mt-1">أضف حركة سداد لتسجيل الدفعات.</p>
              </div>
            ) : (
              payments.filter(p => {
                const searchLower = searchQuery.toLowerCase();
                if (p.notes && p.notes.toLowerCase().includes(searchLower)) return true;
                if (p.date.includes(searchLower)) return true;
                
                let entityName = "";
                if (p.type === "pay_supplier") entityName = suppliers.find(s => s.id === p.supplierId)?.name || "";
                else if (p.type === "pay_contractor") entityName = contractors.find(c => c.id === p.contractorId)?.name || "";
                else if (p.type === "receive_from_customer") entityName = customers.find(c => c.id === p.customerId)?.name || "";
                
                return entityName.toLowerCase().includes(searchLower);
              }).map((payment) => {
              const isPaymentOut = payment.type === "pay_supplier" || payment.type === "pay_contractor";
              let entityName = "";
              let EntityIcon = Users;
              
              if (payment.type === "pay_supplier") {
                entityName = suppliers.find(s => s.id === payment.supplierId)?.name || "";
                EntityIcon = Store;
              } else if (payment.type === "pay_contractor") {
                entityName = contractors.find(c => c.id === payment.contractorId)?.name || "";
                EntityIcon = Tractor;
              } else if (payment.type === "receive_from_customer") {
                entityName = customers.find(c => c.id === payment.customerId)?.name || "";
                EntityIcon = Users;
              }

              return (
                <div key={payment.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-xl border border-border bg-paper-sunken/30 hover:bg-paper-sunken transition-colors">
                  
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isPaymentOut ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                      {isPaymentOut ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-ink">
                          {isPaymentOut ? "تسديد دفعة" : "تحصيل دفعة"}
                        </h3>
                        <span className="text-xs bg-paper text-ink-muted px-2 py-0.5 rounded-md border border-border">
                          {new Date(payment.date).toLocaleDateString('ar-EG')}
                        </span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                          {payment.paymentMethod === "cash" ? "نقداً" : payment.paymentMethod === "bank" ? "تحويل" : "شيك"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-sm font-medium text-ink-muted mt-1.5">
                        <EntityIcon className="w-4 h-4" />
                        <span>{entityName}</span>
                      </div>

                      {payment.notes && (
                        <p className="text-xs text-ink-muted mt-1">{payment.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                    <div className="text-right">
                      <p className={`text-xl font-bold font-display ${isPaymentOut ? 'text-danger' : 'text-success'}`}>
                        {isPaymentOut ? '-' : '+'}{formatMoney((payment.amount || 0))}
                      </p>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingItem(payment);
                          setIsAddOpen(true);
                        }}
                        className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(payment.id)}
                        className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
        </CardContent>
      </Card>

      {(isAddOpen || editingItem) && (
        <PaymentForm
          open={isAddOpen || !!editingItem}
          onClose={() => {
            setIsAddOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleSubmit}
          farms={farms}
          seasons={seasons}
          suppliers={suppliers}
          contractors={contractors}
          customers={customers}
          isSubmitting={loading}
          defaultValues={editingItem || undefined}
        />
      )}

      <ConfirmDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف عملية الدفع؟ سيتم عكس المبلغ المخصوم وإعادته لرصيد الديون."
        loading={loading}
      />
    </div>
  );
}
