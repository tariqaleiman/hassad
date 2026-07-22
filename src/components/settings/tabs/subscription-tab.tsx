"use client";

import { Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SubscriptionTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-xl font-bold text-ink mb-1">الباقة والاشتراك</h2>
        <p className="text-ink-muted mb-6 text-sm">تفاصيل الاستهلاك والباقة الحالية.</p>
        
        <Card className="border-border/60 shadow-sm rounded-2xl bg-paper">
          <CardContent className="p-8 text-center">
            <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-ink font-display mb-2">الباقة المفتوحة (Beta)</h3>
            <p className="text-ink-muted text-sm max-w-md mx-auto mb-6">
              أنت تستمتع بكافة مزايا النظام المؤسسي (ERP) بلا أي قيود أو تكاليف خلال فترة الإطلاق التجريبي.
            </p>
            <div className="inline-flex items-center justify-center bg-paper-raised px-4 py-2 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                حالة الحساب: نشط
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
