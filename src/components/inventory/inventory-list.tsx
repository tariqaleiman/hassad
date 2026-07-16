"use client";

import { useState } from "react";
import { PackageOpen, Plus, Book, ShoppingCart, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { InventoryForm } from "./inventory-form";
import { InventoryTransactions } from "./inventory-transactions";
import { InventoryAddStockForm } from "./inventory-add-stock-form";
import { PurchaseInvoiceForm } from "../purchases/purchase-invoice-form";
import { DictionaryForm } from "./dictionary-form";
import { SupplierForm } from "../purchases/supplier-form";
import { inventoryService } from "@/lib/services/inventory-service";
import { purchaseService } from "@/lib/services/purchase-service";
import { supplierService } from "@/lib/services/supplier-service";
import type { InventorySchema } from "./inventory-schema";
import type { InventoryItem as InventoryItemType } from "@/lib/types/inventory";
import type { SupplierSchema } from "../purchases/supplier-schema";
import type { Farm } from "@/lib/types/farm";
import type { Supplier } from "@/lib/types/supplier";

export function InventoryList({
  farms,
  items,
  dictionaryItems = [],
  suppliers = [],
  userId,
  onUpdate,
}: {
  farms: Farm[];
  items: InventoryItemType[];
  dictionaryItems?: any[];
  suppliers?: Supplier[];
  userId: string;
  onUpdate: () => void;
}) {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isDictionaryAddOpen, setIsDictionaryAddOpen] = useState(false);
  const [isSupplierAddOpen, setIsSupplierAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemType | null>(null);
  const [viewTransactionsItem, setViewTransactionsItem] = useState<InventoryItemType | null>(null);
  const [addStockItem, setAddStockItem] = useState<InventoryItemType | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
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

  const handleAddStock = async (values: any) => {
    if (!addStockItem) return;
    try {
      setLoading(true);
      await inventoryService.addTransaction({
        farmId: addStockItem.farmId,
        itemId: addStockItem.id,
        type: "in",
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        totalPrice: values.quantity * values.unitPrice,
        date: new Date().toISOString(),
        referenceType: "مشتريات",
        notes: values.notes,
      }, userId);
      setAddStockItem(null);
      onUpdate();
    } catch (error) {
      console.error("Error adding stock:", error);
      alert("حدث خطأ أثناء إضافة الرصيد");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSupplierAdd = async (values: SupplierSchema) => {
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

  const [activeCategory, setActiveCategory] = useState("الكل");
  const categories = ["الكل", ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(i => activeCategory === "الكل" || i.category === activeCategory);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-ink">مواد وأصناف المخزن</h2>
          <p className="text-sm text-ink-muted mt-1">تتبع التقاوي، الأسمدة، المبيدات، المحروقات، والمزيد.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/inventory/dictionary")} variant="outline" className="hidden md:flex items-center gap-2">
            <Book className="w-4 h-4" />
            <span>دليل الأصناف</span>
          </Button>
          <Button onClick={() => setIsPurchaseOpen(true)} variant="primary" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">تسجيل فاتورة مشتريات</span>
            <span className="sm:hidden">مشتريات</span>
          </Button>
          <Button onClick={() => setIsAddOpen(true)} variant="secondary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة صنف</span>
            <span className="sm:hidden">صنف</span>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <PackageOpen className="w-12 h-12 text-ink-faint mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-ink mb-2">المخزن فارغ</h3>
            <p className="text-sm text-ink-muted max-w-sm mb-6">
              لم تقم بإضافة أي مواد إلى المخزن بعد. ابدأ بإضافة التقاوي والأسمدة والمحروقات الخاصة بالمزرعة.
            </p>
            <Button onClick={() => setIsAddOpen(true)}>إضافة الصنف الأول</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
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

          <div className="bg-paper rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-paper-sunken border-b border-border text-ink-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">اسم الصنف</th>
                    <th className="px-4 py-3 font-medium">الفئة</th>
                    <th className="px-4 py-3 font-medium">الرصيد المتاح</th>
                    <th className="px-4 py-3 font-medium">متوسط التكلفة</th>
                    <th className="px-4 py-3 font-medium">تاريخ الإضافة</th>
                    <th className="px-4 py-3 font-medium text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-sky-600 cursor-pointer hover:underline" onClick={() => setViewTransactionsItem(item)}>
                        {item.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink">
                        <div className="flex items-baseline gap-1 flex-wrap">
                          {item.subUnitRatio ? (
                            <>
                              <span className="font-bold text-lg">{Math.floor(item.quantity)}</span>
                              <span className="text-ink-muted text-xs">{item.unit}</span>
                              {item.quantity % 1 !== 0 && (
                                <>
                                  <span className="text-ink-muted text-xs mx-1">و</span>
                                  <span className="font-bold text-lg">{Math.round((item.quantity % 1) * item.subUnitRatio)}</span>
                                  <span className="text-ink-muted text-xs">{item.subUnit}</span>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-lg">{item.quantity}</span>
                              <span className="text-ink-muted text-xs">{item.unit}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {item.averageCost.toLocaleString()} ج.م
                      </td>
                      <td className="px-4 py-3 text-ink-muted text-xs">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="إضافة رصيد (شراء)"
                            onClick={() => setAddStockItem(item)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
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
        </div>
      )}

      {/* Delete Confirmation Dialog */}
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
              dictionaryId: "", // Since it's old data, it might not have dictionaryId
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
        open={!!addStockItem}
        onClose={() => setAddStockItem(null)}
        title="إضافة رصيد (شراء)"
      >
        {addStockItem && (
          <InventoryAddStockForm
            item={addStockItem}
            onSubmit={handleAddStock}
            onCancel={() => setAddStockItem(null)}
            loading={loading}
          />
        )}
      </Dialog>

      <Dialog
        open={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        title="تسجيل فاتورة مشتريات 🛒"
        className="max-w-4xl"
      >
        <PurchaseInvoiceForm
          farms={farms}
          inventoryItems={items}
          dictionaryItems={dictionaryItems}
          suppliers={suppliers}
          onSubmit={handlePurchaseSubmit}
          onCancel={() => setIsPurchaseOpen(false)}
          onAddDictionaryItem={() => setIsDictionaryAddOpen(true)}
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
    </div>
  );
}
