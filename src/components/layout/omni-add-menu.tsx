"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Sprout, 
  Wallet, 
  ShoppingCart, 
  Users, 
  Tractor, 
  FileText, 
  Search,
  Droplets,
  PackagePlus,
  LandPlot
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function OmniAddMenu({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [search, setSearch] = useState("");

  const actions = [
    { id: "op", label: "عملية زراعية جديدة", icon: Sprout, color: "text-crop-600 bg-crop-500/10", href: "/operations/new", keywords: "زراعة تسميد ري حصاد عملية" },
    { id: "task", label: "مهمة سريعة", icon: Droplets, color: "text-sky-600 bg-sky-500/10", href: "#", keywords: "مهمة تاسك ري" },
    { id: "sale", label: "فاتورة مبيعات", icon: ShoppingCart, color: "text-amber-600 bg-amber-500/10", href: "/sales", keywords: "بيع مبيعات فاتورة دخل إيراد" },
    { id: "purchase", label: "فاتورة مشتريات (مخزون)", icon: PackagePlus, color: "text-purple-600 bg-purple-500/10", href: "/inventory", keywords: "شراء مشتريات مخزون أسمدة مبيدات صادر" },
    { id: "receipt", label: "سند قبض / صرف", icon: Wallet, color: "text-emerald-600 bg-emerald-500/10", href: "/finance", keywords: "سند قبض صرف مالية فلوس نقدية خزينة" },
    { id: "worker", label: "تسجيل عامل", icon: Users, color: "text-blue-600 bg-blue-500/10", href: "/workers", keywords: "عامل عمالة موظف يومية" },
    { id: "land", label: "إضافة أرض", icon: LandPlot, color: "text-soil-600 bg-soil-500/10", href: "/lands", keywords: "أرض حقل قطعة" },
    { id: "equip", label: "معدة جديدة", icon: Tractor, color: "text-orange-600 bg-orange-500/10", href: "/equipment", keywords: "معدة آلة جرار سيارة" },
  ];

  const filteredActions = actions.filter(a => 
    a.label.includes(search) || a.keywords.includes(search)
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  return (
    <Dialog 
      open={open} 
      onClose={() => onOpenChange(false)}
      title="الإضافة السريعة"
      className="sm:max-w-xl overflow-hidden bg-paper/95 backdrop-blur-3xl border-border rounded-3xl"
    >
      <div className="flex items-center px-4 py-3 border border-border/50 bg-paper-sunken/50 rounded-2xl mb-4">
        <Search className="h-5 w-5 text-ink-muted shrink-0" />
        <Input 
          className="border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 px-3 placeholder:text-ink-faint"
          placeholder="ابحث عما تريد إضافته..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-medium text-ink-muted border border-border/50">
          <span>ESC</span> لإلغاء
        </kbd>
      </div>

      <div className="max-h-[50vh] overflow-y-auto px-1">
        {filteredActions.length === 0 ? (
          <div className="py-14 text-center">
            <FileText className="h-10 w-10 text-ink-faint mx-auto mb-3" />
            <p className="text-ink-muted">لا توجد نتائج مطابقة لبحثك.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link 
                  key={action.id} 
                  href={action.href}
                  onClick={() => onOpenChange(false)}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-border/50 transition-all text-center group"
                >
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", action.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-ink">{action.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Dialog>
  );
}
