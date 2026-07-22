"use client";

import { useState } from "react";
import { exportToExcel } from "@/lib/utils/export-to-excel";
import { PackageOpen, Plus, Search, Edit2, History, AlertTriangle, Book, ShoppingCart, Trash2, Download, Printer } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useCurrency } from "@/lib/hooks/use-currency";
import { useAuth } from "@/lib/providers/auth-provider";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { InventoryForm } from "./inventory-form";
import { InventoryTransactions } from "./inventory-transactions";
import { EmptyState } from "@/components/ui/empty-state";
import { DictionaryForm } from "./dictionary-form";
import { ReportViewer } from "@/components/ui/report-viewer";
import { inventoryService } from "@/lib/services/inventory-service";
import type { InventorySchema } from "./inventory-schema";
import type { InventoryItem as InventoryItemType } from "@/lib/types/inventory";
import type { Farm } from "@/lib/types/farm";

export function InventoryList({
  farms,
  items,
  dictionaryItems = [],
  userId,
  onUpdate,
}: {
  farms: Farm[];
  items: InventoryItemType[];
  dictionaryItems?: any[];
  userId: string;
  onUpdate: () => void;
}) {
  const { formatMoney, currency } = useCurrency();
  const { user } = useAuth();
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDictionaryAddOpen, setIsDictionaryAddOpen] = useState(false);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemType | null>(null);
  const [viewTransactionsItem, setViewTransactionsItem] = useState<InventoryItemType | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (values: InventorySchema) => {
    try {
      setLoading(true);
      const dictItem = dictionaryItems?.find(d => d.id === values.dictionaryId);
      if (!dictItem) throw new Error("الصنف غير موجود في الدليل");

      const generatedName = [dictItem.mainType, dictItem.subType, dictItem.variety].filter(Boolean).join(" - ");

      const submitValues = {
        farmId: values.farmId,
        name: generatedName,
        category: dictItem.category,
        unit: dictItem.unit,
        initialQuantity: values.initialQuantity,
        initialUnitPrice: values.initialUnitPrice,
        notes: values.notes,
      };

      await inventoryService.createItem(submitValues, userId);
      setIsAddOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error creating item:", error);
      alert("حدث خطأ أثناء إضافة المادة");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (values: InventorySchema) => {
    if (!editingItem) return;
    try {
      setLoading(true);
      const dictItem = dictionaryItems?.find(d => d.id === values.dictionaryId);
      if (!dictItem) throw new Error("الصنف غير موجود في الدليل");

      const generatedName = [dictItem.mainType, dictItem.subType, dictItem.variety].filter(Boolean).join(" - ");

      const submitValues = {
        name: generatedName,
        category: dictItem.category,
        unit: dictItem.unit,
        notes: values.notes,
      };

      await inventoryService.updateItem(editingItem.id, submitValues as any, userId);
      setEditingItem(null);
      onUpdate();
    } catch (error) {
      console.error("Error updating item:", error);
      alert("حدث خطأ أثناء حفظ التعديلات");
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
      await inventoryService.removeItem(deleteConfirmId, userId);
      setDeleteConfirmId(null);
      onUpdate();
    } catch (error: any) {
      console.error("Error deleting item:", error);
      alert(error.message || "حدث خطأ أثناء حذف الصنف");
    } finally {
      setLoading(false);
    }
  };





  const handleDictionaryAdd = async (values: any) => {
    try {
      setLoading(true);
      const { dictionaryService } = await import("@/lib/services/dictionary-service");
      await dictionaryService.createEntry(values, userId);
      setIsDictionaryAddOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };



  const [activeCategory, setActiveCategory] = useState("الكل");
  const categories = ["الكل", ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(i => {
    const matchesFarm = i.farmId === selectedFarmId;
    const matchesCategory = activeCategory === "الكل" || i.category === activeCategory;
    const matchesSearch = i.name.includes(searchQuery);
    return matchesFarm && matchesCategory && matchesSearch;
  });

  const totalInventoryValue = filteredItems.reduce((sum, item) => sum + (item.quantity * item.averageCost), 0);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "تقاوي": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "أسمدة حرة": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "أسمدة مدعمة": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "مغذيات": return "bg-lime-500/10 text-lime-600 dark:text-lime-400";
      case "مبيدات": return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "محاصيل تامة": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "نواتج ثانوية": return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "محروقات وزيوت": return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
      default: return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير متوفر";
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleExport = () => {
    setIsReportViewerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <PackageOpen className="h-5 w-5" />
            </div>
            مواد وأصناف المخزن
          </h1>
          <p className="text-ink-muted mt-1">تتبع التقاوي، الأسمدة، المبيدات، المحروقات، والمزيد.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/inventory/dictionary")} variant="outline" className="hidden md:flex items-center gap-2">
            <Book className="w-4 h-4" />
            <span>دليل الأصناف</span>
          </Button>

          <Button onClick={() => setIsAddOpen(true)} variant="secondary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة صنف</span>
            <span className="sm:hidden">صنف</span>
          </Button>
          <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
            <Printer className="w-4 h-4 hidden sm:inline" />
            <Download className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">تقارير المخزن</span>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="المخزن فارغ"
          description="لم تقم بإضافة أي مواد إلى المخزن بعد. ابدأ بإضافة التقاوي والأسمدة والمحروقات."
          action={
            <Button onClick={() => setIsAddOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة الصنف الأول
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-500/20 p-3 rounded-full text-emerald-600">
                  <PackageOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-600/80">إجمالي الأصناف بالمخزن</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{filteredItems.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-sky-100 dark:bg-sky-500/20 p-3 rounded-full text-sky-600">
                  <Book className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-sky-600/80">القيمة التقديرية للمخزون</p>
                  <p className="text-2xl font-bold text-sky-700 dark:text-sky-400">{formatMoney(totalInventoryValue)}</p>
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
                {farms.map(f => <option key={f.id} value={f.id}>مخزن: {f.name}</option>)}
              </Select>
            </div>
            
            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 hide-scrollbar flex-1 items-center">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat
                      ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                      : "bg-paper border border-border text-ink-muted hover:text-ink hover:bg-paper-sunken"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex bg-paper-sunken rounded-lg p-1 border border-border">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-paper text-sky-600 shadow-sm" : "text-ink-muted hover:text-ink"}`}
                  title="عرض كجدول"
                >
                  <Search className="w-4 h-4" /> {/* Or a table icon */}
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-paper text-sky-600 shadow-sm" : "text-ink-muted hover:text-ink"}`}
                  title="عرض كبطاقات"
                >
                  <PackageOpen className="w-4 h-4" /> {/* Or a grid icon */}
                </button>
              </div>
              <div className="relative w-full md:w-64 shrink-0">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                <Input 
                  type="text" 
                  placeholder="ابحث عن صنف..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-9 bg-paper shadow-sm rounded-lg"
                />
              </div>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState
              icon={Search}
              title="لا يوجد نتائج"
              description="لم نجد أي أصناف تطابق بحثك أو الفئة المحددة."
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <Card key={item.id} className="bg-paper border-border/60 shadow-sm overflow-hidden group">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sky-600 truncate group-hover:text-sky-700 cursor-pointer" onClick={() => setViewTransactionsItem(item)}>{item.name}</h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-medium border border-border/50 ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-sky-600" onClick={() => setViewTransactionsItem(item)}>
                          <PackageOpen className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500" onClick={() => setEditingItem(item)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeleteClick(item.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-paper-sunken/50 rounded-lg p-3 border border-border/50 mb-3">
                      <p className="text-xs text-ink-muted mb-1">الرصيد المتاح</p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-xl text-ink">{item.quantity}</span>
                        <span className="text-ink-muted text-sm">{item.unit}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm border-t border-border/40 pt-3">
                      <span className="text-ink-muted">متوسط التكلفة:</span>
                      <span className="font-bold">{formatMoney(item.averageCost)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
          <div className="bg-paper rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-paper-sunken border-b border-border text-ink-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">اسم الصنف</th>
                    <th className="px-3 py-2 font-medium">الفئة</th>
                    <th className="px-3 py-2 font-medium">الرصيد المتاح</th>
                    <th className="px-3 py-2 font-medium">متوسط التكلفة</th>
                    <th className="px-3 py-2 font-medium">تاريخ الإضافة</th>
                    <th className="px-3 py-2 font-medium text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-3 py-2 font-medium text-sky-600 cursor-pointer hover:underline" onClick={() => setViewTransactionsItem(item)}>
                        {item.name}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border border-border/50 ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-ink">
                        <div className="flex items-baseline gap-1 flex-wrap">
                          {item.subUnitRatio ? (
                            <>
                              <span className="font-bold text-base">{Math.floor(item.quantity)}</span>
                              <span className="text-ink-muted text-xs">{item.unit}</span>
                              {item.quantity % 1 !== 0 && (
                                <>
                                  <span className="text-ink-muted text-xs mx-1">و</span>
                                  <span className="font-bold text-base">{Math.round((item.quantity % 1) * item.subUnitRatio)}</span>
                                  <span className="text-ink-muted text-xs">{item.subUnit}</span>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-base">{item.quantity}</span>
                              <span className="text-ink-muted text-xs">{item.unit}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-ink">
                        {formatMoney(item.averageCost)}
                      </td>
                      <td className="px-3 py-2 text-ink-muted text-xs">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-3 py-2 text-left">
                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">

                          <Button
                            variant="ghost"
                            size="sm"
                            title="حركات المخزون"
                            onClick={() => setViewTransactionsItem(item)}
                            className="text-sky-600 hover:text-sky-800 hover:bg-sky-50"
                          >
                            <PackageOpen className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="تعديل المادة"
                            onClick={() => setEditingItem(item)}
                            className="text-slate-500 hover:text-slate-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="حذف الصنف"
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-danger hover:text-danger hover:bg-danger/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title="تأكيد حذف الصنف"
        description="هل أنت متأكد من حذف هذا الصنف من المخزن؟ لن يمكنك التراجع عن هذا الإجراء."
        loading={loading}
      />

      <Dialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="إضافة صنف جديد للمخزن"
        className="max-w-3xl"
      >
        <InventoryForm
          farms={farms}
          dictionaryItems={dictionaryItems}
          onAddDictionaryItem={() => setIsDictionaryAddOpen(true)}
          onSubmit={handleAdd}
          onCancel={() => setIsAddOpen(false)}
          loading={loading}
        />
      </Dialog>

      <Dialog
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="تعديل بيانات الصنف"
        className="max-w-3xl"
      >
        {editingItem && (
          <InventoryForm
            farms={farms}
            defaultValues={editingItem ? {
              farmId: editingItem.farmId,
              dictionaryId: "", 
              notes: editingItem.notes,
            } : undefined}
            dictionaryItems={dictionaryItems}
            onAddDictionaryItem={() => setIsDictionaryAddOpen(true)}
            onSubmit={editingItem ? handleEdit : handleAdd}
            onCancel={() => {
              setIsAddOpen(false);
              setEditingItem(null);
            }}
            loading={loading}
            isEdit={!!editingItem}
          />
        )}
      </Dialog>

      <Dialog
        open={!!viewTransactionsItem}
        onClose={() => setViewTransactionsItem(null)}
        title={`حركات المخزون: ${viewTransactionsItem?.name}`}
      >
        {viewTransactionsItem && (
          <InventoryTransactions item={viewTransactionsItem} />
        )}
      </Dialog>





      <Dialog
        open={isDictionaryAddOpen}
        onClose={() => setIsDictionaryAddOpen(false)}
        title="إضافة صنف جديد للدليل"
      >
        <DictionaryForm
          onSubmit={handleDictionaryAdd}
          onCancel={() => setIsDictionaryAddOpen(false)}
          loading={loading}
        />
      </Dialog>

      <ReportViewer
        open={isReportViewerOpen}
        onClose={() => setIsReportViewerOpen(false)}
        title="تقرير جرد المخزن"
        exportFileName={`جرد_المخزن_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}`}
        data={filteredItems}
        columns={[
          { header: "الاسم", accessorKey: "name" },
          { header: "القسم", accessorKey: "category" },
          { header: "الكمية المتاحة", cell: (row) => <div className="font-bold">{row.quantity} {row.unit}</div> },
          { header: "متوسط التكلفة", cell: (row) => formatMoney(row.averageCost || 0) },
          { header: "الإجمالي", cell: (row) => <div className="text-emerald-700 font-bold">{formatMoney((row.quantity || 0) * (row.averageCost || 0))}</div> },
          { header: "ملاحظات", cell: (row) => row.notes || "-" },
        ]}
        excelData={filteredItems.map(item => ({
          "الاسم": item.name,
          "القسم": item.category,
          "الكمية المتاحة": item.quantity,
          "الوحدة الأساسية": item.unit,
          "الوحدة الفرعية": item.subUnit || "-",
          "متوسط التكلفة": item.averageCost,
          "ملاحظات": item.notes || "-"
        }))}
      />
    </div>
  );
}
