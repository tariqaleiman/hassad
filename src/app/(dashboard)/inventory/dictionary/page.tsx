"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useAuth } from "@/lib/providers/auth-provider";
import { dictionaryService } from "@/lib/services/dictionary-service";
import { DictionaryForm } from "@/components/inventory/dictionary-form";
import type { ItemDictionaryEntry } from "@/lib/types/dictionary";
import Link from "next/link";

export default function DictionaryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ItemDictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ItemDictionaryEntry | null>(null);

  const loadEntries = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await dictionaryService.listEntries(user.uid);
      setEntries(data);
    } catch (error) {
      console.error("Error loading dictionary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [user]);

  const handleAdd = async (values: any) => {
    try {
      setLoading(true);
      await dictionaryService.createEntry(values, user!.uid);
      setIsAddOpen(false);
      loadEntries();
    } catch (error) {
      console.error("Error creating entry:", error);
      alert("حدث خطأ أثناء إضافة الصنف للدليل");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (values: any) => {
    if (!editingEntry) return;
    try {
      setLoading(true);
      await dictionaryService.updateEntry(editingEntry.id, values, user!.uid);
      setEditingEntry(null);
      loadEntries();
    } catch (error) {
      console.error("Error updating entry:", error);
      alert("حدث خطأ أثناء تحديث الصنف");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الصنف من الدليل؟")) return;
    try {
      setLoading(true);
      await dictionaryService.deleteEntry(id, user!.uid);
      loadEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("حدث خطأ أثناء الحذف");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/inventory" className="inline-flex items-center justify-center h-10 w-10 text-ink hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink">دليل الأصناف</h1>
            <p className="text-sm text-ink-muted">قاعدة بيانات الأصناف الموحدة لاستخدامها في المخازن والمشتريات</p>
          </div>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة صنف للدليل</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-paper-sunken border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-right font-medium text-ink-muted">الفئة</th>
                  <th className="px-4 py-3 text-right font-medium text-ink-muted">النوع الرئيسي</th>
                  <th className="px-4 py-3 text-right font-medium text-ink-muted">النوع الفرعي</th>
                  <th className="px-4 py-3 text-right font-medium text-ink-muted">السلالة / الصنف</th>
                  <th className="px-4 py-3 text-right font-medium text-ink-muted">الوحدة الافتراضية</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-muted w-24">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">جاري التحميل...</td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <p className="text-ink-muted mb-4">لا توجد أصناف في الدليل حالياً</p>
                      <Button variant="outline" onClick={() => setIsAddOpen(true)}>
                        أضف أول صنف
                      </Button>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-paper-sunken/50 transition-colors">
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(entry.category)}`}>
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-ink">{entry.mainType}</td>
                      <td className="px-4 py-3 text-right text-ink-muted">{entry.subType || "-"}</td>
                      <td className="px-4 py-3 text-right text-ink-muted">{entry.variety || "-"}</td>
                      <td className="px-4 py-3 text-right text-ink-muted">{entry.unit}</td>
                      <td className="px-4 py-3 text-left">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditingEntry(entry)}>
                            <Edit2 className="w-4 h-4 text-ink-muted" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                            <Trash2 className="w-4 h-4 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} title="إضافة صنف لدليل الأصناف">
        <DictionaryForm
          onSubmit={handleAdd}
          onCancel={() => setIsAddOpen(false)}
          loading={loading}
        />
      </Dialog>

      <Dialog open={!!editingEntry} onClose={() => setEditingEntry(null)} title="تعديل بيانات الصنف">
        {editingEntry && (
          <DictionaryForm
            defaultValues={editingEntry}
            onSubmit={handleEdit}
            onCancel={() => setEditingEntry(null)}
            loading={loading}
          />
        )}
      </Dialog>
    </div>
  );
}
