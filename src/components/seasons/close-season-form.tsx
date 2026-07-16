"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { closeSeasonSchema, type CloseSeasonSchema } from "./close-season-schema";
import type { Season } from "@/lib/types/season";

export function CloseSeasonForm({
  season,
  activeCyclesCount,
  onSubmit,
  onCancel,
  loading,
}: {
  season: Season;
  activeCyclesCount: number;
  onSubmit: (values: CloseSeasonSchema) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CloseSeasonSchema>({
    resolver: zodResolver(closeSeasonSchema),
    defaultValues: {
      endDate: new Date().toISOString().split("T")[0],
      notes: season.notes || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
      {activeCyclesCount > 0 && (
        <div className="bg-danger-bg border border-danger/30 text-danger rounded-xl p-4 mb-4 flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold mb-1">تنبيه: محاصيل نشطة!</h4>
            <p className="text-xs leading-relaxed">
              يوجد {activeCyclesCount} دورة محصول نشطة في هذا الموسم. إغلاق الموسم لا يؤدي لحذفها، لكن يفضل تسجيل حصادها أو إلغائها أولاً لضمان دقة التقارير.
            </p>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="endDate">تاريخ إغلاق الموسم *</Label>
        <Input id="endDate" type="date" {...register("endDate")} className="mt-1.5" />
        {errors.endDate && (
          <p className="mt-1 text-xs text-danger">{errors.endDate.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="notes">التقييم النهائي للموسم (اختياري)</Label>
        <Textarea id="notes" {...register("notes")} rows={4} className="mt-1.5" placeholder="اكتب تقييمك للموسم، أبرز التحديات، أو أي ملاحظات عامة للرجوع إليها مستقبلاً..." />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
          تأكيد الإغلاق
        </Button>
      </div>
    </form>
  );
}
