"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ContractorForm } from "./contractor-form";
import { contractorService } from "@/lib/services/contractor-service";
import { useAuth } from "@/lib/providers/auth-provider";
import { HardHat, Plus, Edit2, Trash2, Phone, Wallet } from "lucide-react";
import type { Contractor, ContractorFormValues } from "@/lib/types/contractor";
import type { Farm } from "@/lib/types/farm";

const TYPE_COLORS: Record<string, string> = {
  "عمالة": "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  "جرار زراعي": "bg-crop-50 text-crop-600 dark:text-crop-400 border-crop-200 dark:border-crop-800/50",
  "آلات حصاد": "bg-wheat-100/50 text-wheat-700 dark:text-wheat-400 border-wheat-200 dark:border-wheat-800/50",
  "نقل": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  "أخرى": "bg-paper-sunken text-ink-muted border-border",
};

export function ContractorList({
  contractors,
  farms,
  onUpdate,
}: {
  contractors: Contractor[];
  farms: Farm[];
  onUpdate: () => void;
}) {
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Contractor | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (values: ContractorFormValues) => {
    setLoading(true);
    try {
      await contractorService.createContractor(values, user?.uid);
      setIsAddOpen(false);
      onUpdate();
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (values: ContractorFormValues) => {
    if (!editingItem) return;
    setLoading(true);
    try {
      await contractorService.updateContractor(editingItem.id, values, user?.uid);
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
      await contractorService.deleteContractor(deleteConfirmId, user?.uid);
      setDeleteConfirmId(null);
      onUpdate();
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const totalDebt = contractors.reduce((sum, c) => sum + (c.balance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <HardHat className="h-5 w-5" />
            </div>
            المقاولين
          </h1>
          <p className="text-sm text-ink-muted mt-1">إدارة مقاولي العمالة والمعدات والنقل</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة مقاول
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-paper border border-border rounded-2xl p-4">
          <p className="text-sm text-ink-muted">إجمالي المقاولين</p>
          <p className="text-2xl font-bold text-ink mt-1">{contractors.length}</p>
        </div>
        <div className="bg-paper border border-border rounded-2xl p-4">
          <p className="text-sm text-ink-muted">إجمالي الديون المستحقة</p>
          <p className="text-2xl font-bold text-danger mt-1">{totalDebt.toLocaleString()} <span className="text-sm font-normal">ج.م</span></p>
        </div>
        <div className="bg-paper border border-border rounded-2xl p-4">
          <p className="text-sm text-ink-muted">مقاولين بديون</p>
          <p className="text-2xl font-bold text-ink mt-1">{contractors.filter(c => (c.balance || 0) > 0).length}</p>
        </div>
      </div>

      {/* Contractors Grid */}
      {contractors.length === 0 ? (
        <div className="text-center py-16 bg-paper rounded-2xl border border-border border-dashed">
          <HardHat className="w-12 h-12 text-ink-muted mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium text-ink">لا يوجد مقاولون مسجلون</p>
          <p className="text-ink-muted mt-1">أضف المقاولين الذين تتعامل معهم لتتبع حساباتهم بدقة.</p>
          <Button className="mt-6" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة أول مقاول
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contractors.map((contractor) => (
            <div
              key={contractor.id}
              className="bg-paper border border-border rounded-2xl p-5 hover:shadow-lg transition-all duration-200 group"
            >
              {/* Top: Name & Type */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <HardHat className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-base">{contractor.name}</h3>
                    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-md border mt-1 ${TYPE_COLORS[contractor.type] || TYPE_COLORS["أخرى"]}`}>
                      {contractor.type === "أخرى" && contractor.customType ? contractor.customType : contractor.type}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingItem(contractor)}
                    className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                    title="تعديل"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(contractor.id)}
                    className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Phone */}
              {contractor.phone && (
                <div className="flex items-center gap-2 text-sm text-ink-muted mb-3">
                  <Phone className="w-3.5 h-3.5" />
                  <span dir="ltr">{contractor.phone}</span>
                </div>
              )}

              {/* Balance */}
              <div className="mt-auto pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <Wallet className="w-4 h-4" />
                    <span>الرصيد المستحق</span>
                  </div>
                  <span className={`text-lg font-bold ${(contractor.balance || 0) > 0 ? "text-danger" : "text-success"}`}>
                    {(contractor.balance || 0).toLocaleString()} <span className="text-xs font-normal">ج.م</span>
                  </span>
                </div>
              </div>

              {/* Notes */}
              {contractor.notes && (
                <p className="text-xs text-ink-muted mt-3 line-clamp-2 bg-paper-sunken/30 p-2 rounded-lg">{contractor.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} title="إضافة مقاول جديد" className="max-w-2xl">
        <ContractorForm
          farms={farms}
          onSubmit={handleAdd}
          onCancel={() => setIsAddOpen(false)}
          loading={loading}
        />
      </Dialog>

      <Dialog open={!!editingItem} onClose={() => setEditingItem(null)} title="تعديل بيانات المقاول" className="max-w-2xl">
        {editingItem && (
          <ContractorForm
            farms={farms}
            defaultValues={{
              farmId: editingItem.farmId,
              name: editingItem.name,
              phone: editingItem.phone,
              type: editingItem.type,
              customType: editingItem.customType,
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
        title="تأكيد حذف المقاول"
        description="هل أنت متأكد من حذف هذا المقاول؟ سيتم حذف بياناته ولكن سجلات العمليات المرتبطة به ستبقى."
        loading={loading}
      />
    </div>
  );
}
