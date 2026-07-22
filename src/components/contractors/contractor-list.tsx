"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCurrency } from "@/lib/hooks/use-currency";
import { Spinner } from "@/components/ui/spinner";
import { ContractorForm } from "./contractor-form";
import { contractorService } from "@/lib/services/contractor-service";
import { farmingOperationService } from "@/lib/services/farming-operation-service";
import { useAuth } from "@/lib/providers/auth-provider";
import { HardHat, Plus, Edit2, Trash2, Phone, Wallet, Search, Users, ReceiptText, ShieldCheck, ShieldAlert, Mail, MapPin, Building2 } from "lucide-react";
import type { Contractor, ContractorFormValues } from "@/lib/types/contractor";
import type { Farm } from "@/lib/types/farm";
import type { FarmingOperation } from "@/lib/types/farming-operation";

const TYPE_COLORS: Record<string, string> = {
  "عمالة": "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/20",
  "جرار زراعي": "bg-crop-50 dark:bg-crop-500/10 text-crop-600 dark:text-crop-400 border-crop-200 dark:border-crop-800/50",
  "آلات حصاد": "bg-wheat-100/50 dark:bg-wheat-500/10 text-wheat-700 dark:text-wheat-400 border-wheat-200 dark:border-wheat-800/50",
  "نقل": "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20",
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
  const { formatMoney } = useCurrency();
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Contractor | null>(null);
  const [viewingContractor, setViewingContractor] = useState<Contractor | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [contractorOperations, setContractorOperations] = useState<FarmingOperation[]>([]);
  const [loadingOperations, setLoadingOperations] = useState(false);

  useEffect(() => {
    const loadOperations = async () => {
      if (!viewingContractor) {
        setContractorOperations([]);
        return;
      }
      setLoadingOperations(true);
      try {
        const farmOps = await farmingOperationService.listOperationsByFarm(viewingContractor.farmId);
        const filteredOps = farmOps.filter(
          op => op.laborContractorId === viewingContractor.id || op.equipmentContractorId === viewingContractor.id
        );
        
        filteredOps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setContractorOperations(filteredOps);
      } catch (error) {
        console.error("Error loading contractor operations:", error);
      } finally {
        setLoadingOperations(false);
      }
    };
    
    loadOperations();
  }, [viewingContractor]);

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

  const filteredContractors = useMemo(() => {
    return contractors.filter(c => 
      c.name.includes(searchQuery) || 
      (c.phone && c.phone.includes(searchQuery)) ||
      c.types.join(" ").includes(searchQuery)
    );
  }, [contractors, searchQuery]);

  const totalDebt = useMemo(() => {
    return contractors.reduce((sum, c) => sum + (c.balance || 0), 0);
  }, [contractors]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <HardHat className="h-5 w-5" />
            </div>
            المقاولين
          </h1>
          <p className="text-ink-muted mt-1">إدارة مقاولي العمالة والمعدات والنقل</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-5 w-5" />
          <span>إضافة مقاول</span>
        </Button>
      </div>

      {/* Statistics */}
      {contractors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-amber-100 dark:bg-amber-500/20 p-3 rounded-full text-amber-600">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-600/80">إجمالي المقاولين</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{contractors.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-danger/5 border-danger/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-danger/10 p-3 rounded-full text-danger">
                <ReceiptText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-danger/80">إجمالي الديون (عليك)</p>
                <p className="text-2xl font-bold text-danger">{formatMoney(totalDebt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Bar */}
      {contractors.length > 0 && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
          <Input 
            type="text" 
            placeholder="ابحث بالاسم، رقم الهاتف، أو التخصص..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10 py-6 bg-paper shadow-sm rounded-xl text-lg"
          />
        </div>
      )}

      {/* Grid */}
      {contractors.length === 0 ? (
        <Card className="bg-paper-sunken border-border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-black/5 dark:bg-white/5 p-4 mb-4">
              <HardHat className="h-12 w-12 text-ink-muted" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">لا يوجد مقاولين</h3>
            <p className="text-ink-muted max-w-sm">
              أضف المقاولين الذين تتعامل معهم لتتبع حساباتهم والعمليات المرتبطة بهم بدقة.
            </p>
            <Button onClick={() => setIsAddOpen(true)} className="mt-6 gap-2">
              <Plus className="h-5 w-5" />
              <span>إضافة أول مقاول</span>
            </Button>
          </CardContent>
        </Card>
      ) : filteredContractors.length === 0 ? (
        <div className="text-center py-12 text-ink-muted">
          لا توجد نتائج مطابقة لبحثك.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContractors.map((contractor) => (
            <Card key={contractor.id} className="bg-paper border-border transition-all hover:shadow-md">
              <CardContent className="p-0">
                {/* Card Header */}
                <div className="p-5 border-b border-border/50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <div className={`p-2 rounded-lg shrink-0 ${contractor.legalType === 'شركة' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                        {contractor.legalType === 'شركة' ? <Building2 className="w-5 h-5" /> : <HardHat className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-ink leading-tight">{contractor.name}</h3>
                        {contractor.companyName && (
                          <p className="text-sm font-medium text-ink-muted mt-0.5">{contractor.companyName}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {contractor.types && contractor.types.length > 0 ? (
                            contractor.types.map(type => (
                              <span key={type} className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-md border ${TYPE_COLORS[type] || TYPE_COLORS["أخرى"]}`}>
                                {type === "أخرى" && contractor.customType ? contractor.customType : type}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex text-xs font-medium px-2 py-0.5 rounded-md border bg-paper-sunken text-ink-muted border-border">
                              بدون تخصص
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {contractor.status === 'active' || !contractor.status ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> نشط
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                          <ShieldAlert className="w-3 h-3" /> موقوف
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className={`mt-4 p-3 rounded-xl border flex justify-between items-center ${(contractor.balance || 0) > 0 ? 'bg-danger/5 border-danger/20 text-danger' : 'bg-crop-50 border-crop-200 text-crop-600'}`}>
                    <span className="text-xs font-bold opacity-80">الدين المستحق (للمقاول)</span>
                    <span className="font-bold text-lg">{formatMoney((contractor.balance || 0))}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-2 text-sm text-ink-muted">
                  {contractor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 opacity-70" />
                      <span dir="ltr">{contractor.phone}</span>
                    </div>
                  )}
                  {contractor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 opacity-70" />
                      <span>{contractor.email}</span>
                    </div>
                  )}
                  {contractor.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 opacity-70" />
                      <span className="truncate">{contractor.address}</span>
                    </div>
                  )}
                  {contractor.taxId && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 text-xs">
                      <span className="font-bold opacity-70">الرقم الضريبي:</span>
                      <span dir="ltr">{contractor.taxId}</span>
                    </div>
                  )}
                  {contractor.notes && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs line-clamp-2">{contractor.notes}</p>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="px-3 py-2 bg-paper-sunken border-t border-border flex justify-between items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setViewingContractor(contractor)}
                    className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 font-bold"
                  >
                    <ReceiptText className="w-4 h-4 mr-2" />
                    كشف الحساب
                  </Button>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setEditingItem(contractor)}
                      className="h-8 w-8 text-ink-muted hover:text-crop-600 hover:bg-crop-50"
                      title="تعديل"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setDeleteConfirmId(contractor.id)}
                      className="h-8 w-8 text-ink-muted hover:text-danger hover:bg-danger/10"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Contractor Details/Ledger Dialog */}
      <Dialog
        open={!!viewingContractor}
        onClose={() => setViewingContractor(null)}
        title={`كشف حساب المقاول: ${viewingContractor?.name}`}
      >
        {viewingContractor && (
          <div className="space-y-6">
            <div className="bg-paper-sunken p-4 rounded-xl border border-border text-center">
              <p className="text-ink-muted mb-2">إجمالي الدين المستحق (للمقاول) الحالي</p>
              <p className="text-3xl font-bold text-danger">{formatMoney(viewingContractor.balance || 0)}</p>
            </div>
            
            <div className="font-bold text-ink mb-2 px-1">سجل العمليات التي نفذها</div>
            {loadingOperations ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : contractorOperations.length === 0 ? (
              <div className="text-center py-12 text-ink-muted bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-border">
                <ReceiptText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <h3 className="font-bold text-ink mb-1">لا توجد حركات</h3>
                <p className="text-sm px-8">لم يتم تسجيل أي عمليات زراعية لهذا المقاول حتى الآن.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {contractorOperations.map(op => {
                  const contractorCost = 
                    (op.laborContractorId === viewingContractor.id ? (op.laborCost || 0) : 0) + 
                    (op.equipmentContractorId === viewingContractor.id ? (op.equipmentCost || 0) : 0);
                  
                  // If payment method is cash, then it's paid. If credit, then it's unpaid (debt).
                  const isCredit = 
                    (op.laborContractorId === viewingContractor.id && op.laborPaymentMethod === "credit") ||
                    (op.equipmentContractorId === viewingContractor.id && op.equipmentPaymentMethod === "credit");

                  return (
                    <div key={op.id} className="p-4 bg-paper border border-border rounded-xl flex justify-between items-center hover:bg-paper-sunken transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-50 text-amber-600 p-2 rounded-lg">
                          <HardHat className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-ink">{op.operationType} {op.notes ? `- ${op.notes}` : ''}</p>
                          <p className="text-xs text-ink-muted mt-1">
                            {new Date(op.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-left">
                        <div>
                          <p className="font-bold text-ink text-sm">{formatMoney(contractorCost)}</p>
                          <p className={`text-xs font-bold mt-1 ${isCredit ? 'text-danger' : 'text-success'}`}>
                            {isCredit ? 'آجل (دين)' : 'نقدي (مدفوع)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button onClick={() => setViewingContractor(null)}>إغلاق</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Add Contractor Dialog */}
      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} title="إضافة مقاول جديد" className="max-w-2xl">
        <ContractorForm
          farms={farms}
          onSubmit={handleAdd}
          onCancel={() => setIsAddOpen(false)}
          loading={loading}
        />
      </Dialog>

      {/* Edit Contractor Dialog */}
      <Dialog open={!!editingItem} onClose={() => setEditingItem(null)} title="تعديل بيانات المقاول" className="max-w-2xl">
        {editingItem && (
          <ContractorForm
            farms={farms}
            defaultValues={{
              farmId: editingItem.farmId,
              legalType: editingItem.legalType,
              name: editingItem.name,
              phone: editingItem.phone,
              email: editingItem.email,
              address: editingItem.address,
              companyName: editingItem.companyName,
              taxId: editingItem.taxId,
              commercialRegister: editingItem.commercialRegister,
              types: editingItem.types || [],
              customType: editingItem.customType,
              status: editingItem.status || "active",
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
