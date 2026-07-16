"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomerForm } from "./customer-form";
import { customerService } from "@/lib/services/customer-service";
import { useAuth } from "@/lib/providers/auth-provider";
import { Users, Plus, Edit2, Trash2, Phone, Wallet, Building2, MapPin } from "lucide-react";
import type { Customer, CustomerFormValues } from "@/lib/types/customer";
import type { Farm } from "@/lib/types/farm";

export function CustomerList({
  customers,
  farms,
  onUpdate,
}: {
  customers: Customer[];
  farms: Farm[];
  onUpdate: () => void;
}) {
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Customer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (values: CustomerFormValues) => {
    setLoading(true);
    try {
      await customerService.createCustomer(values, user?.uid);
      setIsAddOpen(false);
      onUpdate();
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (values: CustomerFormValues) => {
    if (!editingItem) return;
    setLoading(true);
    try {
      await customerService.updateCustomer(editingItem.id, values, user?.uid);
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
      await customerService.deleteCustomer(deleteConfirmId, user?.uid);
      setDeleteConfirmId(null);
      onUpdate();
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const totalDebtOwedToUs = customers.reduce((sum, c) => sum + (c.balance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            العملاء
          </h1>
          <p className="text-sm text-ink-muted mt-1">إدارة بيانات العملاء والتجار وديونهم</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة عميل
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-paper border border-border rounded-2xl p-4">
          <p className="text-sm text-ink-muted">إجمالي العملاء</p>
          <p className="text-2xl font-bold text-ink mt-1">{customers.length}</p>
        </div>
        <div className="bg-paper border border-border rounded-2xl p-4">
          <p className="text-sm text-ink-muted">إجمالي ديون العملاء (لك)</p>
          <p className="text-2xl font-bold text-success mt-1">{totalDebtOwedToUs.toLocaleString()} <span className="text-sm font-normal">ج.م</span></p>
        </div>
        <div className="bg-paper border border-border rounded-2xl p-4">
          <p className="text-sm text-ink-muted">عملاء مديونون</p>
          <p className="text-2xl font-bold text-ink mt-1">{customers.filter(c => (c.balance || 0) > 0).length}</p>
        </div>
      </div>

      {/* Grid */}
      {customers.length === 0 ? (
        <div className="text-center py-16 bg-paper rounded-2xl border border-border border-dashed">
          <Users className="w-12 h-12 text-ink-muted mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium text-ink">لا يوجد عملاء مسجلون</p>
          <p className="text-ink-muted mt-1">أضف عملائك لتتبع المبيعات والديون المستحقة عليهم.</p>
          <Button className="mt-6" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة أول عميل
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="bg-paper border border-border rounded-2xl p-5 hover:shadow-lg transition-all duration-200 group flex flex-col"
            >
              {/* Top: Name & Type */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-base line-clamp-1">{customer.name}</h3>
                    <span className="inline-flex text-xs font-medium px-2 py-0.5 rounded-md border mt-1 bg-paper-sunken text-ink-muted border-border">
                      {customer.customerType || "فرد"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingItem(customer)}
                    className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(customer.id)}
                    className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                {customer.companyName && (
                  <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{customer.companyName}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <Phone className="w-3.5 h-3.5" />
                    <span dir="ltr">{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-clamp-1">{customer.address}</span>
                  </div>
                )}
              </div>

              {/* Balance */}
              <div className="mt-auto pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <Wallet className="w-4 h-4" />
                    <span>الدين (لك)</span>
                  </div>
                  <span className={`text-lg font-bold ${(customer.balance || 0) > 0 ? "text-success" : "text-ink-muted"}`}>
                    {(customer.balance || 0).toLocaleString()} <span className="text-xs font-normal">ج.م</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} title="إضافة عميل جديد" className="max-w-2xl">
        <CustomerForm
          farms={farms}
          onSubmit={handleAdd}
          onCancel={() => setIsAddOpen(false)}
          loading={loading}
        />
      </Dialog>

      <Dialog open={!!editingItem} onClose={() => setEditingItem(null)} title="تعديل بيانات العميل" className="max-w-2xl">
        {editingItem && (
          <CustomerForm
            farms={farms}
            defaultValues={{
              farmId: editingItem.farmId,
              name: editingItem.name,
              customerType: editingItem.customerType,
              companyName: editingItem.companyName,
              phone: editingItem.phone,
              address: editingItem.address,
              initialBalance: editingItem.initialBalance,
              notes: editingItem.notes,
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditingItem(null)}
            loading={loading}
            isEdit
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف العميل"
        description="هل أنت متأكد من حذف هذا العميل؟"
        loading={loading}
      />
    </div>
  );
}
