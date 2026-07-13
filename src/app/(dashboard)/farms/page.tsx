"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { FarmForm } from "@/components/farms/farm-form";
import { useFarms, useCreateFarm, useUpdateFarm } from "@/lib/hooks/use-farms";
import type { Farm } from "@/lib/types/farm";

export default function FarmProfilePage() {
  const { data: farms, isLoading } = useFarms();
  const createFarm = useCreateFarm();
  const updateFarm = useUpdateFarm();

  const [isFormOpen, setIsFormOpen] = useState(false);

  // بما أن المستخدم لديه مزرعة واحدة (كيان واحد)، سنأخذ أول مزرعة دائماً
  const myFarm = farms && farms.length > 0 ? farms[0] : null;

  const onSubmit = async (values: any) => {
    if (myFarm?.id) {
      await updateFarm.mutateAsync({ id: myFarm.id, values });
    } else {
      await createFarm.mutateAsync(values);
    }
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-crop-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 md:px-0">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">بيانات المزرعة</h2>
          <p className="text-ink-muted mt-1 text-sm">إدارة معلومات الكيان التجاري أو المزرعة الخاصة بك والشركاء</p>
        </div>
        {myFarm && (
          <Button onClick={() => setIsFormOpen(true)} className="gap-2 rounded-full font-medium px-6 shadow-sm">
            <Icons.Settings className="h-4 w-4" />
            تعديل البيانات
          </Button>
        )}
      </div>

      {!myFarm ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-paper-sunken/20 p-12 text-center mt-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-crop-50 text-crop-500 mb-4 shadow-sm">
            <Icons.Farms className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-2">إعداد المزرعة</h3>
          <p className="text-sm text-ink-muted max-w-md mb-8">
            يبدو أنك لم تقم بإعداد بيانات المزرعة الخاصة بك بعد. قم بإدخال بيانات المزرعة الأساسية لتبدأ في إدارة أراضيك وعملياتك بشكل احترافي.
          </p>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2 rounded-full px-8 py-6 text-base shadow-md shadow-crop-500/20">
            <Icons.Plus className="h-5 w-5" />
            إعداد بيانات المزرعة الآن
          </Button>
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          {/* Farm Main Info */}
          <div className="bg-paper-raised border border-border/50 shadow-sm rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 end-0 w-32 h-32 bg-crop-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            
            <div className="flex flex-col md:flex-row gap-6 md:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-crop-400 to-crop-600 text-white shadow-lg shadow-crop-500/30">
                <Icons.Farms className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display text-2xl font-bold text-ink">{myFarm.name}</h3>
                  {myFarm.commercialName && (
                    <span className="bg-paper-sunken text-ink px-3 py-1 rounded-full text-xs font-medium border border-border/50">
                      {myFarm.commercialName}
                    </span>
                  )}
                </div>
                <p className="text-ink-muted text-sm flex items-center gap-2 mt-2">
                  <Icons.MapPin className="h-4 w-4 text-crop-500" />
                  {myFarm.mainLocation || "لم يتم تحديد الموقع"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-border/30">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-paper-sunken/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink-muted">
                  <Icons.Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-ink-faint font-medium">رقم التواصل</p>
                  <p className="text-sm font-bold text-ink mt-0.5" dir="ltr">{myFarm.phone || "---"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-paper-sunken/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink-muted">
                  <Icons.User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-ink-faint font-medium">المالك</p>
                  <p className="text-sm font-bold text-ink mt-0.5">{myFarm.ownerName || "المالك الأساسي"}</p>
                </div>
              </div>
            </div>

            {myFarm.notes && (
              <div className="mt-6 p-4 rounded-2xl bg-wheat-50/50 border border-wheat-100 text-sm text-ink-muted leading-relaxed">
                <strong className="text-wheat-700 block mb-1">ملاحظات:</strong>
                {myFarm.notes}
              </div>
            )}
          </div>

          {/* Partners Section */}
          <div className="bg-paper-raised border border-border/50 shadow-sm rounded-3xl p-6 md:p-8">
            <h3 className="font-display text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <Icons.Users className="h-5 w-5 text-sky-500" />
              شركاء الإدارة والمزرعة
            </h3>

            {!myFarm.partners || myFarm.partners.length === 0 ? (
              <div className="text-center py-8 rounded-2xl bg-paper-sunken/20 border border-dashed border-border/60">
                <p className="text-sm text-ink-muted">لا يوجد شركاء مسجلين. هذه المزرعة تدار بواسطة فرد واحد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myFarm.partners.map((partner) => (
                  <div key={partner.id} className="p-4 rounded-2xl bg-paper-sunken/30 border border-border/40 flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600 font-bold shrink-0">
                      {partner.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-ink text-sm truncate">{partner.name}</h4>
                      {partner.role && <p className="text-xs text-ink-muted mt-0.5 truncate">{partner.role}</p>}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
                        {partner.sharePercent ? (
                          <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                            {partner.sharePercent}%
                          </span>
                        ) : null}
                        {partner.phone && (
                          <span className="text-xs text-ink-muted flex items-center gap-1" dir="ltr">
                            <Icons.Phone className="h-3 w-3" /> {partner.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={myFarm ? "تعديل بيانات المزرعة" : "إعداد المزرعة"}
        className="max-w-2xl"
      >
        <FarmForm
          defaultValues={myFarm}
          onSubmit={onSubmit}
          onCancel={() => setIsFormOpen(false)}
          loading={createFarm.isPending || updateFarm.isPending}
        />
      </Dialog>
    </div>
  );
}
