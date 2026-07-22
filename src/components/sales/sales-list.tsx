"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SalesInvoiceForm } from "./sales-invoice-form";
import { salesService } from "@/lib/services/sales-service";
import { useAuth } from "@/lib/providers/auth-provider";
import { exportToExcel } from "@/lib/utils/export-to-excel";
import { ReportViewer } from "@/components/ui/report-viewer";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt, Plus, Edit2, Trash2, Users, Search, Download, Printer } from "lucide-react";
import type { SalesInvoice, SalesInvoiceFormValues } from "@/lib/types/sales";
import type { Customer } from "@/lib/types/customer";
import type { Farm } from "@/lib/types/farm";
import type { Season } from "@/lib/types/season";
import type { InventoryItem } from "@/lib/types/inventory";
import { useCurrency } from "@/lib/hooks/use-currency";

export function SalesList({
  salesInvoices,
  farms,
  seasons,
  customers,
  inventoryItems,
  onUpdate,
}: {
  salesInvoices: SalesInvoice[];
  farms: Farm[];
  seasons: Season[];
  customers: Customer[];
  inventoryItems: InventoryItem[];
  onUpdate: () => void;
}) {
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingSalesInvoice, setViewingSalesInvoice] = useState<SalesInvoice | null>(null);
  const { formatMoney } = useCurrency();
  const [editingItem, setEditingItem] = useState<SalesInvoice | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);

  const handleSubmit = async (values: SalesInvoiceFormValues) => {
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

  const handleExport = () => {
    setIsReportViewerOpen(true);
  };

  const reportData = salesInvoices.map(invoice => {
    const customerName = invoice.customerId 
      ? customers.find(c => c.id === invoice.customerId)?.name 
      : invoice.customerName || "عميل نقدي عابر";
      
    const itemsText = invoice.items.map(item => {
      const inventoryItem = inventoryItems.find(i => i.id === item.inventoryItemId);
      const itemName = inventoryItem?.name || item.itemName || "صنف غير معروف";
      return `${itemName} (${item.quantity} ${item.unit})`;
    }).join(" + ");

    return {
      "التاريخ": new Date(invoice.invoiceDate).toLocaleDateString('ar-EG'),
      "العميل": customerName,
      "إجمالي الفاتورة": invoice.totalAmount || 0,
      "المدفوع": invoice.paidAmount || 0,
      "المتبقي": (invoice.totalAmount || 0) - (invoice.paidAmount || 0),
      "طريقة الدفع": invoice.paymentMethod === "credit" ? "آجل" : "نقدي",
      "الأصناف المباعة": itemsText,
      "ملاحظات": invoice.notes || "-"
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <Receipt className="h-5 w-5" />
            </div>
            المبيعات
          </h1>
          <p className="text-sm text-ink-muted mt-1">تسجيل مبيعات المحاصيل وإدارة الفواتير</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            <span className="hidden sm:inline">فاتورة بيع جديدة</span>
            <span className="sm:hidden">فاتورة</span>
          </Button>
          <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
            <Printer className="w-4 h-4 hidden sm:inline" />
            <Download className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">تقارير المبيعات</span>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-sky-100 dark:bg-sky-500/20 p-3 rounded-full text-sky-600">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-sky-600/80">عدد فواتير البيع</p>
              <p className="text-2xl font-bold text-sky-700 dark:text-sky-400">{salesInvoices.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-success/10 p-3 rounded-full text-success">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-success/80">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-success">{formatMoney(totalSales)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      {salesInvoices.length > 0 && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
          <Input 
            type="text" 
            placeholder="ابحث برقم الفاتورة أو اسم العميل..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10 py-6 bg-paper shadow-sm rounded-xl text-lg"
          />
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {salesInvoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="لا توجد فواتير بيع"
            description="لم تقم بتسجيل أي فواتير مبيعات حتى الآن. أضف فاتورة بيع لتسجيل الإيرادات."
            action={
              <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                <span>أول فاتورة بيع</span>
              </Button>
            }
          />
        ) : (
          salesInvoices.filter(inv => {
            const cName = inv.customerId ? customers.find(c => c.id === inv.customerId)?.name : inv.customerName;
            const searchLower = searchQuery.toLowerCase();
            return (cName && cName.toLowerCase().includes(searchLower)) || inv.id.toLowerCase().includes(searchLower);
          }).map((invoice) => {
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
                          const inventoryItem = inventoryItems.find(i => i.id === item.inventoryItemId);
                          const itemName = inventoryItem?.name || item.itemName || "صنف غير معروف";
                          return (
                            <span key={item.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-800/50">
                              {itemName} ({item.quantity} {item.unit})
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
                        <p className="font-bold text-ink text-sm">{formatMoney(invoice.totalAmount || 0)}</p>
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
          inventoryItems={inventoryItems}
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

      <ReportViewer
        open={isReportViewerOpen}
        onClose={() => setIsReportViewerOpen(false)}
        title="تقرير المبيعات"
        exportFileName={`المبيعات_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}`}
        data={reportData}
        columns={[
          { header: "التاريخ", accessorKey: "التاريخ" },
          { header: "العميل", accessorKey: "العميل" },
          { header: "إجمالي الفاتورة", cell: (row) => <div className="font-bold text-success">{formatMoney(row["إجمالي الفاتورة"] || 0)}</div> },
          { header: "المدفوع", cell: (row) => formatMoney(row["المدفوع"] || 0) },
          { header: "المتبقي", cell: (row) => <div className={row["المتبقي"] > 0 ? "text-danger font-bold" : ""}>{formatMoney(row["المتبقي"] || 0)}</div> },
          { header: "الدفع", accessorKey: "طريقة الدفع" },
          { header: "الأصناف المباعة", accessorKey: "الأصناف المباعة" },
        ]}
      />
    </div>
  );
}
