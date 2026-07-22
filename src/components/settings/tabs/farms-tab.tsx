"use client";

import { useState } from "react";
import { Building2, MapPin, Plus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFarms } from "@/lib/hooks/use-farms";
import { FarmDialog } from "@/components/settings/farm-dialog";
import type { Farm } from "@/lib/types/farm";

export function FarmsTab() {
  const { data: farms, isLoading: farmsLoading } = useFarms();
  const [farmDialogOpen, setFarmDialogOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

  const openNewFarm = () => {
    setEditingFarm(null);
    setFarmDialogOpen(true);
  };

  const openEditFarm = (farm: Farm) => {
    setEditingFarm(farm);
    setFarmDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-ink mb-1">الفروع والمزارع</h2>
          <p className="text-ink-muted text-sm">إدارة فروع المؤسسة وتفاصيل المواقع.</p>
        </div>
        <Button onClick={openNewFarm} className="gap-2 rounded-xl shadow-sm">
          <Plus className="h-4 w-4" /> إضافة مزرعة
        </Button>
      </div>

      {farmsLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8 text-crop-600" /></div>
      ) : farms?.length === 0 ? (
        <Card className="border-dashed border-2 border-border/60 bg-transparent rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="h-12 w-12 text-ink-faint mb-4" />
            <h3 className="text-lg font-bold text-ink mb-1">لا توجد فروع مضافة</h3>
            <p className="text-ink-muted mb-6">قم بإضافة فروع لإدارة الحسابات والمستودعات لكل موقع.</p>
            <Button onClick={openNewFarm} variant="outline" className="rounded-xl">إضافة مزرعة</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {farms?.map(f => (
            <div key={f.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-paper-raised rounded-2xl border border-border/60 shadow-sm transition-all hover:border-crop-300 gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-crop-100 dark:bg-crop-900/30 text-crop-600 flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-ink text-lg">{f.name}</h4>
                    <span className="text-xs font-bold bg-black/5 dark:bg-white/10 text-ink-muted px-2 py-0.5 rounded-md">
                      {f.currency || "ج.م"}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted line-clamp-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {f.mainLocation || "موقع غير محدد"}
                    {f.commercialName && ` • ${f.commercialName}`}
                  </p>
                </div>
              </div>
              <div className="flex justify-end shrink-0">
                <Button variant="outline" size="sm" onClick={() => openEditFarm(f)} className="gap-2 h-9 rounded-lg">
                  <Pencil className="h-3.5 w-3.5" /> إعدادات الفرع
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FarmDialog 
        open={farmDialogOpen} 
        onOpenChange={setFarmDialogOpen} 
        farm={editingFarm} 
      />
    </div>
  );
}
