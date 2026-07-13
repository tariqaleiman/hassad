"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cropCycleSchema, type CropCycleSchema } from "./crop-cycle-schema";
import type { Farm } from "@/lib/types/farm";
import type { Land } from "@/lib/types/land";
import type { Season } from "@/lib/types/season";
import type { Crop } from "@/lib/types/crop";

export function CropCycleForm({
  farms,
  lands,
  seasons,
  crops,
  onSubmit,
  loading,
  onCancel,
}: {
  farms: Farm[];
  lands: Land[];
  seasons: Season[];
  crops: Crop[];
  onSubmit: (values: CropCycleSchema) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CropCycleSchema>({
    resolver: zodResolver(cropCycleSchema),
    defaultValues: { farmId: "", landId: "", seasonId: "", cropId: "", plantDate: "" },
  });

  const selectedFarmId = watch("farmId");

  const farmLands = useMemo(
    () => lands.filter((l) => l.farmId === selectedFarmId),
    [lands, selectedFarmId]
  );
  const farmSeasons = useMemo(
    () => seasons.filter((s) => s.farmId === selectedFarmId && s.status === "مفتوح"),
    [seasons, selectedFarmId]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="farmId">المزرعة *</Label>
        <Select id="farmId" {...register("farmId")}>
          <option value="">اختر المزرعة</option>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </Select>
        {errors.farmId && <p className="mt-1 text-xs text-danger">{errors.farmId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="landId">قطعة الأرض *</Label>
          <Select id="landId" {...register("landId")} disabled={!selectedFarmId}>
            <option value="">اختر الأرض</option>
            {farmLands.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
          {errors.landId && <p className="mt-1 text-xs text-danger">{errors.landId.message}</p>}
          {selectedFarmId && farmLands.length === 0 && (
            <p className="mt-1 text-xs text-ink-faint">لا توجد أراضٍ لهذه المزرعة بعد.</p>
          )}
        </div>
        <div>
          <Label htmlFor="seasonId">الموسم المفتوح *</Label>
          <Select id="seasonId" {...register("seasonId")} disabled={!selectedFarmId}>
            <option value="">اختر الموسم</option>
            {farmSeasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          {errors.seasonId && (
            <p className="mt-1 text-xs text-danger">{errors.seasonId.message}</p>
          )}
          {selectedFarmId && farmSeasons.length === 0 && (
            <p className="mt-1 text-xs text-ink-faint">لا يوجد موسم مفتوح لهذه المزرعة.</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="cropId">المحصول *</Label>
        <Select id="cropId" {...register("cropId")}>
          <option value="">اختر المحصول</option>
          {crops.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        {errors.cropId && <p className="mt-1 text-xs text-danger">{errors.cropId.message}</p>}
        {crops.length === 0 && (
          <p className="mt-1 text-xs text-ink-faint">
            قاعدة بيانات المحاصيل فارغة — أضف محصولًا أولًا من تبويب &quot;قاعدة المحاصيل&quot;.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="plantDate">تاريخ الزراعة (اختياري)</Label>
        <Input id="plantDate" type="date" {...register("plantDate")} />
        <p className="mt-1 text-xs text-ink-faint">
          لا يشترط تسجيله الآن — يمكن إضافته لاحقًا عند تسجيل عملية الزراعة.
        </p>
      </div>

      <div>
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={loading}>
          إنشاء دورة المحصول
        </Button>
      </div>
    </form>
  );
}
