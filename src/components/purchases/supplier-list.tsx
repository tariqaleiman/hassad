"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Users, Edit2, Trash2, Search, Building2, User, Phone, Mail, MapPin, ReceiptText, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCurrency } from "@/lib/hooks/use-currency";
import { useAuth } from "@/lib/providers/auth-provider";
import { SupplierForm } from "./supplier-form";
import { supplierService } from "@/lib/services/supplier-service";
import { purchaseService } from "@/lib/services/purchase-service";
import { inventoryService } from "@/lib/services/inventory-service";
import type { Supplier } from "@/lib/types/supplier";
import type { PurchaseInvoice } from "@/lib/types/purchase";
import type { SupplierSchema } from "./supplier-schema";
import type { Farm } from "@/lib/types/farm";

export function SupplierList({
  farms,
  suppliers,
  userId,
  onUpdate,
}: {
  farms: Farm[];
  suppliers: Supplier[];
  userId: string;
  onUpdate: () => void;
}) {
  const { formatMoney, currency } = useCurrency();
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [supplierInvoices, setSupplierInvoices] = useState<PurchaseInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [farmItems, setFarmItems] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);

  useEffect(() => {
    const loadInvoices = async () => {
      if (!viewingSupplier) {
        setSupplierInvoices([]);
        setFarmItems([]);
        return;
      }
      setLoadingInvoices(true);
      try {
        const [farmInvoices, items] = await Promise.all([
          purchaseService.getInvoicesByFarm(viewingSupplier.farmId),
          inventoryService.listItems(viewingSupplier.farmId)
        ]);
        const filteredInvoices = farmInvoices.filter(inv => inv.supplierId === viewingSupplier.id);
        
        filteredInvoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
        
        setSupplierInvoices(filteredInvoices);
        setFarmItems(items);
      } catch (error) {
        console.error("Error loading supplier invoices:", error);
      } finally {
        setLoadingInvoices(false);
      }
    };
    
    loadInvoices();
  }, [viewingSupplier]);

  const handleAdd = async (values: SupplierSchema) => {
    try {
      setLoading(true);
      await supplierService.createSupplier(values as any, userId);
      setIsAddOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (values: SupplierSchema) => {
    if (!editingSupplier) return;
    try {
      setLoading(true);
      await supplierService.updateSupplier(editingSupplier.id, values as any, userId);
      setEditingSupplier(null);
      onUpdate();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    try {
      setLoading(true);
      await supplierService.deleteSupplier(deleteConfirmId, userId);
      setDeleteConfirmId(null);
      onUpdate();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!deleteInvoiceId) return;
    try {
      setLoadingInvoices(true);
      await purchaseService.deleteInvoice(deleteInvoiceId, userId);
      setSupplierInvoices(prev => prev.filter(inv => inv.id !== deleteInvoiceId));
      setDeleteInvoiceId(null);
    } catch (error: any) {
      console.error(error);
      alert("حدث خطأ أثناء الحذف");
    } finally {
      setLoadingInvoices(false);
    }
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.includes(searchQuery) || 
      (s.companyName && s.companyName.includes(searchQuery)) ||
      (s.phone && s.phone.includes(searchQuery))
    );
  }, [suppliers, searchQuery]);

  const totalBalance = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);
  }, [suppliers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
              <Building2 className="h-5 w-5" />
            </div>
            الموردين
          </h1>
          <p className="text-ink-muted mt-1">إدارة الموردين وأرصدتهم</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-5 w-5" />
          <span>إضافة مورد</span>
        </Button>
      </div>

      {/* Statistics */}
      {suppliers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-sky-100 dark:bg-sky-500/20 p-3 rounded-full text-sky-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-sky-600/80">إجمالي الموردين</p>
                <p className="text-2xl font-bold text-sky-700 dark:text-sky-400">{suppliers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-danger/5 border-danger/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-danger/10 p-3 rounded-full text-danger">
                <ReceiptText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-danger/80">إجمالي الديون المستحقة</p>
                <p className="text-2xl font-bold text-danger">{formatMoney(totalBalance)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Bar */}
      {suppliers.length > 0 && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
          <Input 
            type="text" 
            placeholder="ابحث بالاسم، الشركة، أو رقم الهاتف..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10 py-6 bg-paper shadow-sm rounded-xl text-lg"
          />
        </div>
      )}

      {suppliers.length === 0 ? (
        <div className="text-center py-20 bg-paper-raised rounded-2xl border border-border">
          <Building2 className="w-16 h-16 text-sky-300 dark:text-sky-500/50 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink">لا يوجد موردين</h2>
          <p className="text-ink-muted mt-2 mb-6 max-w-sm mx-auto">
            قم بإضافة الموردين والشركات التي تتعامل معها لتتمكن من تتبع الفواتير والديون.
          </p>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة أول مورد
          </Button>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-12 text-ink-muted">
          لا توجد نتائج مطابقة لبحثك.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className={`bg-paper border-border transition-all hover:shadow-md ${supplier.status === 'inactive' ? 'opacity-70' : ''}`}>
              <CardContent className="p-0">
                {/* Card Header */}
                <div className="p-5 border-b border-border/50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <div className={`p-2 rounded-lg ${supplier.supplierType === 'company' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {supplier.supplierType === 'company' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-ink leading-tight">{supplier.name}</h3>
                        {supplier.companyName && (
                          <p className="text-sm font-medium text-ink-muted mt-0.5">{supplier.companyName}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {supplier.supplierCategories && supplier.supplierCategories.length > 0 ? (
                            supplier.supplierCategories.map(cat => (
                              <span key={cat} className="inline-flex text-xs font-medium px-2 py-0.5 rounded-md border bg-paper-sunken text-ink-muted border-border">
                                {cat === "أخرى" && supplier.customCategory ? supplier.customCategory : cat}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex text-xs font-medium px-2 py-0.5 rounded-md border bg-paper-sunken text-ink-muted border-border">
                              عام
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {supplier.status === 'active' ? (
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
                  <div className={`mt-4 p-3 rounded-xl border flex justify-between items-center ${supplier.balance > 0 ? 'bg-danger/5 border-danger/20 text-danger' : 'bg-crop-50 border-crop-200 text-crop-600'}`}>
                    <span className="text-xs font-bold opacity-80">إجمالي الدين المستحق</span>
                    <span className="font-bold text-lg">{formatMoney(supplier.balance || 0)}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-2 text-sm text-ink-muted">
                  {supplier.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 opacity-70" />
                      <span dir="ltr">{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 opacity-70" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 opacity-70" />
                      <span className="truncate">{supplier.address}</span>
                    </div>
                  )}
                  {supplier.taxId && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 text-xs">
                      <span className="font-bold opacity-70">الرقم الضريبي:</span>
                      <span dir="ltr">{supplier.taxId}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="px-3 py-2 bg-paper-sunken border-t border-border flex justify-between items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setViewingSupplier(supplier)}
                    className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 font-bold"
                  >
                    <ReceiptText className="w-4 h-4 mr-2" />
                    كشف الحساب
                  </Button>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setEditingSupplier(supplier)}
                      className="h-8 w-8 text-ink-muted hover:text-crop-600 hover:bg-crop-50"
                      title="تعديل"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteClick(supplier.id)}
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

      {/* Add Supplier Dialog */}
      <Dialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="إضافة مورد جديد"
      >
        <SupplierForm
          farms={farms}
          onSubmit={handleAdd}
          onCancel={() => setIsAddOpen(false)}
          loading={loading}
        />
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog
        open={!!editingSupplier}
        onClose={() => setEditingSupplier(null)}
        title="تعديل بيانات المورد"
      >
        {editingSupplier && (
          <SupplierForm
            farms={farms}
            initialData={editingSupplier}
            onSubmit={handleEdit}
            onCancel={() => setEditingSupplier(null)}
            loading={loading}
            key={editingSupplier.id}
          />
        )}
      </Dialog>

      {/* View Supplier Details/Ledger Dialog */}
      <Dialog
        open={!!viewingSupplier}
        onClose={() => setViewingSupplier(null)}
        title={`كشف حساب المورد: ${viewingSupplier?.name}`}
      >
        {viewingSupplier && (
          <div className="space-y-6">
            <div className="bg-paper-sunken p-4 rounded-xl border border-border text-center">
              <p className="text-ink-muted mb-2">إجمالي الدين المستحق الحالي</p>
              <p className="text-3xl font-bold text-danger">{formatMoney(viewingSupplier.balance || 0)}</p>
            </div>
            
            <div className="font-bold text-ink mb-2 px-1">سجل الفواتير والمشتريات</div>
            {loadingInvoices ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : supplierInvoices.length === 0 ? (
              <div className="text-center py-12 text-ink-muted bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-border">
                <ReceiptText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <h3 className="font-bold text-ink mb-1">لا توجد حركات</h3>
                <p className="text-sm px-8">لم يتم تسجيل أي فواتير مشتريات لهذا المورد حتى الآن.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {supplierInvoices.map(invoice => (
                  <div key={invoice.id} className="p-4 bg-paper border border-border rounded-xl flex justify-between items-center hover:bg-paper-sunken transition-colors cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                    <div className="flex items-center gap-3">
                      <div className="bg-sky-100 text-sky-600 p-2 rounded-lg">
                        <ReceiptText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-ink">{invoice.notes || `فاتورة #${invoice.id.slice(0, 6).toUpperCase()}`}</p>
                        <p className="text-xs text-ink-muted mt-1">
                          {new Date(invoice.invoiceDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                          {invoice.items && invoice.items.length > 0 && ` • ${invoice.items.length} أصناف`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-left">
                      <div>
                        <p className="font-bold text-ink text-sm">{formatMoney((invoice.totalAmount || 0))}</p>
                        <p className="text-xs text-ink-muted mt-1">
                          المدفوع: {formatMoney((invoice.paidAmount || 0))}
                        </p>
                        {(invoice.totalAmount || 0) > (invoice.paidAmount || 0) && (
                          <p className="text-xs font-bold text-danger mt-1">
                                  الباقي آجل: {formatMoney((invoice.totalAmount || 0) - (invoice.paidAmount || 0))}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-danger hover:bg-danger/10 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteInvoiceId(invoice.id);
                        }}
                        title="حذف الفاتورة الوهمية"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button onClick={() => setViewingSupplier(null)}>إغلاق</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title="تأكيد حذف المورد"
        description="هل أنت متأكد من حذف هذا المورد؟ لن يمكنك التراجع عن هذا الإجراء وسيتم حذف جميع البيانات المتعلقة به."
        loading={loading}
      />

      {/* Delete Invoice Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteInvoiceId}
        onClose={() => setDeleteInvoiceId(null)}
        onConfirm={handleDeleteInvoice}
        title="تأكيد حذف الفاتورة"
        description="هل أنت متأكد من مسح هذه الفاتورة من كشف الحساب؟"
        loading={loadingInvoices}
      />

      {/* Invoice Details Dialog */}
      <Dialog
        open={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice?.notes || `تفاصيل فاتورة #${selectedInvoice?.id.slice(0, 6).toUpperCase()}`}
        className="max-w-2xl"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-paper-sunken p-4 rounded-xl border border-border">
              <div>
                <p className="text-ink-muted text-sm">تاريخ الفاتورة</p>
                <p className="font-bold">{new Date(selectedInvoice.invoiceDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="text-left">
                <p className="text-ink-muted text-sm">طريقة الدفع</p>
                <p className="font-bold">{selectedInvoice.paymentMethod === 'cash' ? 'نقداً' : 'آجل'}</p>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-paper-sunken text-ink-muted">
                  <tr>
                    <th className="px-4 py-3 text-right font-medium">الصنف</th>
                    <th className="px-4 py-3 text-right font-medium">الكمية</th>
                    <th className="px-4 py-3 text-right font-medium">سعر الوحدة</th>
                    <th className="px-4 py-3 text-right font-medium">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, idx) => {
                      const itemName = item.itemId 
                        ? farmItems.find(i => i.id === item.itemId)?.name || 'صنف غير معروف'
                        : 'صنف جديد';
                      return (
                        <tr key={idx} className="bg-paper">
                          <td className="px-4 py-3 font-medium text-ink">{itemName}</td>
                          <td className="px-4 py-3 text-ink-muted">{item.quantity}</td>
                          <td className="px-4 py-3 text-ink-muted">{item.unitPrice} ${currency}</td>
                          <td className="px-4 py-3 font-bold text-ink">{item.totalPrice} ${currency}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="bg-paper">
                      <td colSpan={4} className="px-4 py-6 text-center text-ink-muted">لا توجد أصناف في هذه الفاتورة</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-paper p-4 rounded-xl border border-border space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">إجمالي الفاتورة:</span>
                <span className="font-bold text-lg">{selectedInvoice.totalAmount} ${currency}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">المدفوع:</span>
                <span className="font-bold text-crop-600">{selectedInvoice.paidAmount} ${currency}</span>
              </div>
              {selectedInvoice.totalAmount > selectedInvoice.paidAmount && (
                <div className="flex justify-between items-center text-sm pt-2 border-t border-border mt-2">
                  <span className="text-danger font-bold">المتبقي (دين):</span>
                  <span className="font-bold text-danger text-lg">{selectedInvoice.totalAmount - selectedInvoice.paidAmount} ${currency}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedInvoice(null)}>إغلاق</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
