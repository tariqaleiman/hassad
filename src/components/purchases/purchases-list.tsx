"use client";

import { useState } from "react";
import { Plus, ShoppingCart, Search, ReceiptText, Building2, PackageOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/lib/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { PurchaseInvoiceForm } from "./purchase-invoice-form";
import { SupplierForm } from "./supplier-form";
import { purchaseService } from "@/lib/services/purchase-service";
import { supplierService } from "@/lib/services/supplier-service";
import type { PurchaseInvoice } from "@/lib/types/purchase";
import type { Supplier } from "@/lib/types/supplier";
import type { InventoryItem } from "@/lib/types/inventory";
import type { Farm } from "@/lib/types/farm";

export function PurchasesList({
  farms,
  invoices,
  suppliers,
  inventoryItems,
  dictionaryItems,
  userId,
  onUpdate,
}: {
  farms: Farm[];
  invoices: PurchaseInvoice[];
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
  dictionaryItems: any[];
  userId: string;
  onUpdate: () => void;
}) {
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const { formatMoney } = useCurrency();
  const [isSupplierAddOpen, setIsSupplierAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || "");
  const [loading, setLoading] = useState(false);

  const handlePurchaseSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const itemsWithTotals = values.items.map((item: any) => ({
        ...item,
        totalPrice: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
      }));
      
      const totalAmount = itemsWithTotals.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
      
      const invoiceData = {
        ...values,
        items: itemsWithTotals,
        totalAmount
      };

      await purchaseService.createInvoice(invoiceData, userId);
      setIsPurchaseOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error("Error creating purchase invoice:", error);
      alert(error.message || "حدث خطأ أثناء حفظ فاتورة المشتريات");
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierAdd = async (values: any) => {
    try {
      setLoading(true);
      await supplierService.createSupplier(values, userId);
      setIsSupplierAddOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesFarm = inv.farmId === selectedFarmId;
    const supplier = suppliers.find(s => s.id === inv.supplierId);
    const matchesSearch = inv.id.includes(searchQuery) || supplier?.name.includes(searchQuery) || inv.supplierName?.includes(searchQuery) || false;
    return matchesFarm && matchesSearch;
  }).sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());

  const totalPurchases = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير متوفر";
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <ShoppingCart className="h-5 w-5" />
            </div>
            المشتريات الفواتير
          </h1>
          <p className="text-ink-muted mt-1">تسجيل فواتير الشراء، التقاوي، الأسمدة وإضافتها للمخزن تلقائياً</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsPurchaseOpen(true)} variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>فاتورة جديدة</span>
          </Button>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-20 bg-paper-raised rounded-2xl border border-border">
          <ShoppingCart className="w-16 h-16 text-purple-300 dark:text-purple-500/50 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink">لا توجد فواتير مشتريات</h2>
          <p className="text-ink-muted mt-2 mb-6 max-w-sm mx-auto">
            قم بتسجيل فواتير المشتريات لإضافة الأصناف إلى المخزن ومتابعة حسابات الموردين.
          </p>
          <Button onClick={() => setIsPurchaseOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة أول فاتورة
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-purple-100 dark:bg-purple-500/20 p-3 rounded-full text-purple-600">
                  <ReceiptText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600/80">إجمالي عدد الفواتير</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{filteredInvoices.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-500/20 p-3 rounded-full text-emerald-600">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-600/80">إجمالي المشتريات</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatMoney(totalPurchases)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 bg-paper p-4 rounded-xl border border-border/80 shadow-sm">
        <div className="w-full md:w-[250px] shrink-0">
          <Select 
            value={selectedFarmId} 
            onChange={(e) => setSelectedFarmId(e.target.value)}
          >
            {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </Select>
        </div>
        
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <Input 
            type="text" 
            placeholder="ابحث برقم الفاتورة أو المورد..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-9 bg-paper shadow-sm rounded-lg"
          />
        </div>
      </div>

      <div className="bg-paper rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-paper-sunken border-b border-border text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">رقم الفاتورة</th>
                <th className="px-4 py-3 font-medium">المورد</th>
                <th className="px-4 py-3 font-medium">التاريخ</th>
                <th className="px-4 py-3 font-medium">الإجمالي</th>
                <th className="px-4 py-3 font-medium">طريقة الدفع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-ink-muted">
                    <PackageOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    لا توجد فواتير مشتريات
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const supplier = suppliers.find(s => s.id === inv.supplierId);
                  return (
                    <tr key={inv.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-bold text-ink">
                        {inv.id ? inv.id.substring(0, 8) : "بدون رقم"}
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {supplier ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-sky-500" />
                            <span>{supplier.name}</span>
                          </div>
                        ) : (
                          <span className="text-ink-muted">{inv.supplierName || "مورد نقدي"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {formatDate(inv.invoiceDate)}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">
                        {formatMoney(inv.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inv.paymentMethod === 'cash' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {inv.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}

      <Dialog
        open={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        title="تسجيل فاتورة مشتريات 🛒"
        className="max-w-4xl"
      >
        <PurchaseInvoiceForm
          farms={farms}
          inventoryItems={inventoryItems}
          dictionaryItems={dictionaryItems}
          suppliers={suppliers}
          onSubmit={handlePurchaseSubmit}
          onCancel={() => setIsPurchaseOpen(false)}
          onAddDictionaryItem={() => {}} 
          onAddSupplier={() => setIsSupplierAddOpen(true)}
          loading={loading}
        />
      </Dialog>

      <Dialog
        open={isSupplierAddOpen}
        onClose={() => setIsSupplierAddOpen(false)}
        title="إضافة مورد جديد"
      >
        <SupplierForm
          farms={farms}
          onSubmit={handleSupplierAdd}
          onCancel={() => setIsSupplierAddOpen(false)}
          loading={loading}
        />
      </Dialog>
    </div>
  );
}
