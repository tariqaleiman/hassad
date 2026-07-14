"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { inventoryService } from "@/lib/services/inventory-service";
import type { InventoryTransaction, InventoryItem } from "@/lib/types/inventory";

export function InventoryTransactions({ item }: { item: InventoryItem }) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const data = await inventoryService.listTransactions(item.farmId, item.id);
        // Sort by date descending
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(sorted);
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [item.id, item.farmId]);

  if (loading) {
    return <div className="p-8 text-center text-ink-muted">جاري تحميل الحركات...</div>;
  }

  if (transactions.length === 0) {
    return <div className="p-8 text-center text-ink-muted">لا توجد حركات مسجلة لهذا الصنف حتى الآن.</div>;
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="bg-paper-sunken p-4 rounded-xl border border-border shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-ink">{item.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-600 border border-sky-500/20">
                {item.category}
              </span>
            </div>
            <p className="text-xs text-ink-muted">تاريخ الإضافة: {item.createdAt ? format(new Date(item.createdAt), "dd MMMM yyyy", { locale: ar }) : "غير متوفر"}</p>
          </div>
          <div className="text-left bg-paper p-2 rounded-lg border border-border/50">
            <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-0.5">الرصيد المتاح</p>
            <p className="font-bold text-xl text-ink leading-none">{item.quantity} <span className="text-sm font-normal text-ink-muted">{item.unit}</span></p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
          <div>
            <p className="text-[11px] text-ink-faint uppercase tracking-wider">متوسط التكلفة</p>
            <p className="font-semibold text-ink">{item.averageCost.toLocaleString()} ج.م</p>
          </div>
          <div>
            <p className="text-[11px] text-ink-faint uppercase tracking-wider">إجمالي القيمة</p>
            <p className="font-semibold text-ink">{(item.quantity * item.averageCost).toLocaleString()} ج.م</p>
          </div>
        </div>
      </div>

      <h4 className="font-bold text-ink mt-6 mb-3 text-sm">سجل الحركات</h4>

      <div className="space-y-3">
        {transactions.map((tx) => {
          const isIn = tx.type === "in";
          return (
            <div key={tx.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-paper">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isIn ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                  {isIn ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-sm text-ink">{tx.referenceType}</p>
                  <p className="text-xs text-ink-faint">
                    {format(new Date(tx.date), "dd MMMM yyyy - hh:mm a", { locale: ar })}
                  </p>
                  {tx.notes && <p className="text-xs text-ink-muted mt-1">{tx.notes}</p>}
                </div>
              </div>
              
              <div className="text-left">
                <p className={`font-bold ${isIn ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {isIn ? "+" : "-"}{tx.quantity} {item.unit}
                </p>
                <p className="text-xs text-ink-muted">
                  {tx.unitPrice.toLocaleString()} ج.م / {item.unit}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
