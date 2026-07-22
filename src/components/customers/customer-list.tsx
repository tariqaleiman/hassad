"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCurrency } from "@/lib/hooks/use-currency";
import { Spinner } from "@/components/ui/spinner";
import { CustomerForm } from "./customer-form";
import { CustomerPaymentForm } from "./customer-payment-form";
import { EmptyState } from "@/components/ui/empty-state";
import { customerService } from "@/lib/services/customer-service";
import { salesService } from "@/lib/services/sales-service";
import { useAuth } from "@/lib/providers/auth-provider";
import { Users, Plus, Edit2, Trash2, Phone, Wallet, Building2, MapPin, Search, ShieldCheck, ShieldAlert, ReceiptText, Mail, Banknote } from "lucide-react";
import type { Customer, CustomerFormValues, CustomerPaymentFormValues } from "@/lib/types/customer";
import type { Farm } from "@/lib/types/farm";
import type { SalesInvoice } from "@/lib/types/sales";

export function CustomerList({
  customers,
  farms,
  onUpdate,
}: {
  customers: Customer[];
  farms: Farm[];
  onUpdate: () => void;
}) {
  const { formatMoney, currency } = useCurrency();
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [customerInvoices, setCustomerInvoices] = useState<SalesInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);

  useEffect(() => {
    const loadInvoices = async () => {
      if (!viewingCustomer) {
        setCustomerInvoices([]);
        return;
      }
      setLoadingInvoices(true);
      try {
        const farmInvoices = await salesService.getInvoicesByFarm(viewingCustomer.farmId);
        const filteredInvoices = farmInvoices.filter(inv => inv.customerId === viewingCustomer.id);
        
        filteredInvoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
        
        setCustomerInvoices(filteredInvoices);
      } catch (error) {
        console.error("Error loading customer invoices:", error);
      } finally {
        setLoadingInvoices(false);
      }
    };
    
    loadInvoices();
  }, [viewingCustomer]);

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

  const handlePaymentSubmit = async (values: CustomerPaymentFormValues) => {
    setLoading(true);
    try {
      await customerService.createPayment(values, user?.uid);
      setPaymentCustomer(null);
      onUpdate();
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.includes(searchQuery) || 
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.companyName && c.companyName.includes(searchQuery))
    );
  }, [customers, searchQuery]);

  const totalDebtOwedToUs = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            العملاء والتجار
          </h1>
          <p className="text-ink-muted mt-1">إدارة بيانات العملاء والتجار ومتابعة مستحقاتك</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-5 w-5" />
          <span>إضافة عميل</span>
        </Button>
      </div>

      {/* Statistics */}
      {customers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-indigo-100 dark:bg-indigo-500/20 p-3 rounded-full text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-600/80">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{customers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-success/5 border-success/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-success/10 p-3 rounded-full text-success">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-success/80">إجمالي الديون (لك)</p>
                <p className="text-2xl font-bold text-success">{formatMoney(totalDebtOwedToUs)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Bar */}
      {customers.length > 0 && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
          <Input 
            type="text" 
            placeholder="ابحث بالاسم، رقم الهاتف، أو الشركة..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10 py-6 bg-paper shadow-sm rounded-xl text-lg"
          />
        </div>
      )}

      {/* Grid */}
      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="لا يوجد عملاء"
          description="أضف عملائك والتجار لتتبع المبيعات والديون المستحقة عليهم."
          action={
            <Button onClick={() => setIsAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>إضافة أول عميل</span>
            </Button>
          }
        />
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 text-ink-muted">
          لا توجد نتائج مطابقة لبحثك.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="bg-paper border-border transition-all hover:shadow-md">
              <CardContent className="p-0">
                {/* Card Header */}
                <div className="p-5 border-b border-border/50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <div className={`p-2 rounded-lg ${customer.legalType === 'شركة' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {customer.legalType === 'شركة' ? <Building2 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-ink leading-tight">{customer.name}</h3>
                        {customer.companyName && (
                          <p className="text-sm font-medium text-ink-muted mt-0.5">{customer.companyName}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {customer.customerCategories && customer.customerCategories.length > 0 ? (
                            customer.customerCategories.map(cat => (
                              <span key={cat} className="inline-flex text-xs font-medium px-2 py-0.5 rounded-md border bg-paper-sunken text-ink-muted border-border">
                                {cat === "أخرى" && customer.customCategory ? customer.customCategory : cat}
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
                      {customer.status === 'active' || !customer.status ? (
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
                  <div className={`mt-4 p-3 rounded-xl border flex justify-between items-center ${(customer.balance || 0) > 0 ? 'bg-success/5 border-success/20 text-success' : 'bg-crop-50 border-crop-200 text-crop-600'}`}>
                    <span className="text-xs font-bold opacity-80">الدين المستحق (لك)</span>
                    <span className="font-bold text-lg">{formatMoney((customer.balance || 0))}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-2 text-sm text-ink-muted">
                  {customer.phone && (
                     <div className="flex items-center gap-2">
                       <Phone className="w-4 h-4 opacity-70" />
                       <span dir="ltr">{customer.phone}</span>
                     </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 opacity-70" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                     <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4 opacity-70" />
                       <span className="truncate">{customer.address}</span>
                     </div>
                  )}
                  {customer.taxId && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 text-xs">
                      <span className="font-bold opacity-70">الرقم الضريبي:</span>
                      <span dir="ltr">{customer.taxId}</span>
                    </div>
                  )}
                  {customer.notes && (
                     <div className="mt-2 pt-2 border-t border-border/50">
                       <p className="text-xs line-clamp-2">{customer.notes}</p>
                     </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="px-3 py-2 bg-paper-sunken border-t border-border flex justify-between items-center gap-1">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setViewingCustomer(customer)}
                      className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 font-bold px-2"
                    >
                      <ReceiptText className="w-4 h-4 mr-1" />
                      كشف حساب
                    </Button>
                    {(customer.balance || 0) > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setPaymentCustomer(customer)}
                        className="text-success hover:text-success hover:bg-success/10 font-bold px-2"
                      >
                        <Banknote className="w-4 h-4 mr-1" />
                        سداد دفعة
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setEditingItem(customer)}
                      className="h-8 w-8 text-ink-muted hover:text-crop-600 hover:bg-crop-50"
                      title="تعديل"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setDeleteConfirmId(customer.id)}
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

      {/* View Customer Details/Ledger Dialog */}
      <Dialog
        open={!!viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        title={`كشف حساب العميل: ${viewingCustomer?.name}`}
      >
        {viewingCustomer && (
          <div className="space-y-6">
            <div className="bg-paper-sunken p-4 rounded-xl border border-border text-center">
              <p className="text-ink-muted mb-2">إجمالي الدين المستحق (لك) الحالي</p>
              <p className="text-3xl font-bold text-success">{formatMoney(viewingCustomer.balance || 0)}</p>
            </div>
            
            <div className="font-bold text-ink mb-2 px-1">سجل المبيعات</div>
            {loadingInvoices ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : customerInvoices.length === 0 ? (
              <div className="text-center py-12 text-ink-muted bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-border">
                <ReceiptText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <h3 className="font-bold text-ink mb-1">لا توجد حركات</h3>
                <p className="text-sm px-8">لم يتم تسجيل أي مبيعات لهذا العميل حتى الآن.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {customerInvoices.map(invoice => (
                  <div key={invoice.id} className="p-4 bg-paper border border-border rounded-xl flex justify-between items-center hover:bg-paper-sunken transition-colors cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                    <div className="flex items-center gap-3">
                      <div className="bg-success/10 text-success p-2 rounded-lg">
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
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button onClick={() => setViewingCustomer(null)}>إغلاق</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog
        open={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice?.notes || `تفاصيل فاتورة مبيعات #${selectedInvoice?.id.slice(0, 6).toUpperCase()}`}
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
                    <th className="px-4 py-3 text-right font-medium">الكمية</th>
                    <th className="px-4 py-3 text-right font-medium">سعر الوحدة</th>
                    <th className="px-4 py-3 text-right font-medium">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="bg-paper">
                        <td className="px-4 py-3 text-ink-muted">{item.quantity}</td>
                        <td className="px-4 py-3 text-ink-muted">{item.unitPrice} ${currency}</td>
                        <td className="px-4 py-3 font-bold text-ink">{(item.totalPrice || (item.quantity * item.unitPrice))} ${currency}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-paper">
                      <td colSpan={3} className="px-4 py-6 text-center text-ink-muted">لا توجد أصناف في هذه الفاتورة</td>
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
                <span className="font-bold text-success">{selectedInvoice.paidAmount} ${currency}</span>
              </div>
              {selectedInvoice.totalAmount > (selectedInvoice.paidAmount || 0) && (
                <div className="flex justify-between items-center text-sm pt-2 border-t border-border mt-2">
                  <span className="text-danger font-bold">المتبقي (دين لك):</span>
                  <span className="font-bold text-danger text-lg">{selectedInvoice.totalAmount - (selectedInvoice.paidAmount || 0)} ${currency}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedInvoice(null)}>إغلاق</Button>
            </div>
          </div>
        )}
      </Dialog>

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
              legalType: editingItem.legalType,
              customerCategories: editingItem.customerCategories || [],
              customCategory: editingItem.customCategory,
              companyName: editingItem.companyName,
              taxId: editingItem.taxId,
              commercialRegister: editingItem.commercialRegister,
              email: editingItem.email,
              phone: editingItem.phone,
              address: editingItem.address,
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
        title="تأكيد حذف العميل"
        description="هل أنت متأكد من حذف هذا العميل؟"
        loading={loading}
      />
      <Dialog
        open={!!paymentCustomer}
        onClose={() => setPaymentCustomer(null)}
        title="سداد دفعة / سند قبض"
        className="max-w-2xl"
      >
        {paymentCustomer && (
          <CustomerPaymentForm
            customerId={paymentCustomer.id}
            farmId={paymentCustomer.farmId}
            customerName={paymentCustomer.name}
            currentBalance={paymentCustomer.balance || 0}
            onSubmit={handlePaymentSubmit}
            onCancel={() => setPaymentCustomer(null)}
            loading={loading}
          />
        )}
      </Dialog>
    </div>
  );
}
