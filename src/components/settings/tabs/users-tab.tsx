"use client";

import { ShieldCheck, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOwnerProfile } from "@/lib/hooks/use-owner";
import { useAuth } from "@/lib/providers/auth-provider";

export function UsersTab() {
  const { user } = useAuth();
  const { data: profile } = useOwnerProfile();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-ink mb-1">المستخدمين والصلاحيات</h2>
            <p className="text-ink-muted text-sm">إدارة فريق العمل ودعوة مستخدمين جدد.</p>
          </div>
          <Button className="gap-2 rounded-xl shadow-sm">
            <Plus className="h-4 w-4" /> دعوة مستخدم
          </Button>
        </div>

        <Card className="shadow-sm border-border/60 bg-paper rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 flex gap-4 mb-6">
              <ShieldCheck className="h-6 w-6 shrink-0" />
              <p className="text-sm leading-relaxed opacity-90">
                نظام إدارة الصلاحيات (RBAC) المتقدم قيد التطوير. قريباً ستتمكن من تخصيص أدوار دقيقة وتقييد وصول كل مستخدم لفروع محددة.
              </p>
            </div>
            
            <h3 className="font-bold text-base text-ink mb-4">المستخدمين الحاليين</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-paper-raised rounded-xl border border-border/60">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-crop-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {profile?.name?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <h4 className="font-bold text-ink">{profile?.name || "المالك (المدير)"}</h4>
                    <p className="text-sm text-ink-muted">{user?.email}</p>
                  </div>
                </div>
                <span className="bg-crop-100 text-crop-800 dark:bg-crop-900/50 dark:text-crop-300 px-3 py-1 rounded-md text-xs font-bold border border-crop-200 dark:border-crop-800">
                  مالك (صلاحيات كاملة)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
