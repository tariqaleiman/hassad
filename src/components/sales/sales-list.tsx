"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SalesInvoiceForm } from "./sales-invoice-form";
import { salesService } from "@/lib/services/sales-service";
import { useAuth } from "@/lib/providers/auth-provider";
import { Receipt, Plus, Edit2, Trash2, Users } from "lucide-react";
import type { SalesInvoice, SalesInvoiceSchema } from "@/lib/types/sales";
import type { Customer } from "@/lib/types/customer";
import type { Farm } from "@/lib/types/farm";
import type { Season } from "@/lib/types/season";
import type { CropCycle } from "@/lib/types/crop-cycle";
import type { Crop } from "@/lib/types/crop";

export function SalesList({
  salesInvoices,
  farms,
  seasons,
  customers,
  cropCycles,
  crops,
  onUpdate,
}: {
  salesInvoices: SalesInvoice[];
  farms: Farm[];
  seasons: Season[];
  customers: Customer[];
  cropCycles: CropCycle[];
  crops: Crop[];
  onUpdate: () => void;
}) {
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SalesInvoice | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: SalesInvoiceSchema) => {
    setLoading(true);
    try {
      if (editingItem) {
        await salesService.updateInvoice(editingItem.id, values, user?.uid);
      } else {
        await salesService.createInvoice(values, user?.uid);
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
      await salesService.deleteInvoice(deleteConfirmId, user?.uid);
      setDeleteConfirmId(null);
      onUpdate();
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const totalSales = salesInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-paper p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <Receipt className="h-5 w-5" />
            </div>
            المبيعات
          </h1>
          <p className="text-sm text-ink-muted mt-1">تسجيل مبيعات المحاصيل وإدارة الفواتير</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          فاتورة بيع جديدة
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-paper border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-ink-muted font-bold">عدد الفواتير</p>
          <p className="text-3xl font-bold font-display text-ink mt-2">{salesInvoices.length}</p>
        </div>
        <div className="bg-paper border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-ink-muted font-bold">إجمالي المبيعات</p>
          <p className="text-3xl font-bold font-display text-success mt-2">{totalSales.toLocaleString()} <span className="text-sm font-normal text-ink-muted">ج.م</span></p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {salesInvoices.length === 0 ? (
          <div className="text-center py-16 bg-paper rounded-2xl border border-border border-dashed">
            <Receipt className="w-12 h-12 text-ink-muted mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-ink">لا توجد فواتير بيع</p>
            <p className="text-ink-muted mt-1">أضف فاتورة بيع لتسجيل الإيرادات.</p>
            <Button className="mt-6" onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              أول فاتورة بيع
            </Button>
          </div>
        ) : (
          salesInvoices.map((invoice) => {
            const customerName = invoice.customerId 
              ? customers.find(c => c.id === invoice.customerId)?.name 
              : invoice.customerName || "عميل نقدي عابر";

            return (
              <div key={invoice.id} className="bg-paper border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-success/10 text-success p-3 rounded-xl mt-1">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-ink">
                          فاتورة مبيعات
                        </h3>
                        <span className="text-xs bg-paper-sunken text-ink-muted px-2 py-1 rounded-md border border-border">
                          {new Date(invoice.invoiceDate).toLocaleDateString('ar-EG')}
                        </span>
                        {invoice.paymentMethod === "credit" && (
                          <span className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-md border border-amber-500/20 font-medium">
                            آجل
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-ink-muted mt-2">
                        <Users className="w-4 h-4" />
                        <span>العميل: <span className="font-bold text-ink">{customerName}</span></span>
                      </div>

                      {/* Items */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {invoice.items.map(item => {
                          const cycle = cropCycles.find(c => c.id === item.cropCycleId);
                          const cropName = crops.find(cr => cr.id === cycle?.cropId)?.name || cycle?.cropId;
                          return (
                            <span key={item.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-800/50">
                              {cropName} ({item.quantity} {item.unit})
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 md:border-r border-border pt-4 md:pt-0 md:pr-6 mt-4 md:mt-0">
                    <div className="text-right">
                      <p className="text-xs text-ink-muted mb-1">إجمالي الفاتورة</p>
                      <p className="text-2xl font-bold font-display text-success">
                        {(invoice.totalAmount || 0).toLocaleString()} <span className="text-sm font-normal">ج.م</span>
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2 w-full md:w-auto justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl"
                        onClick={() => {
                          setEditingItem(invoice);
                          setIsAddOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-danger hover:bg-danger/10 hover:text-danger rounded-xl"
                        onClick={() => setDeleteConfirmId(invoice.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {(isAddOpen || editingItem) && (
        <SalesInvoiceForm
          open={isAddOpen || !!editingItem}
          onClose={() => {
            setIsAddOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleSubmit}
          farms={farms}
          seasons={seasons}
          customers={customers}
          cropCycles={cropCycles}
          crops={crops}
          isSubmitting={loading}
          defaultValues={editingItem || undefined}
        />
      )}

      <ConfirmDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف فاتورة المبيعات؟ (سيتم خصمها من الإيرادات ورصيد العميل إن وجد)"
        loading={loading}
      />
    </div>
  );
}
