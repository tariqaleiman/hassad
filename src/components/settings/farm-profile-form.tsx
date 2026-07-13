"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  farmProfileSchema,
  type FarmProfileSchema,
} from "./farm-profile-schema";
import type { OwnerProfile } from "@/lib/types/owner";

export function FarmProfileForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: OwnerProfile | null;
  onSubmit: (values: FarmProfileSchema) => void;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FarmProfileSchema>({
    resolver: zodResolver(farmProfileSchema),
    defaultValues: {
      farmName: defaultValues?.farmName ?? "",
      farmLocation: defaultValues?.farmLocation ?? "",
    },
  });

  useEffect(() => {
    reset({
      farmName: defaultValues?.farmName ?? "",
      farmLocation: defaultValues?.farmLocation ?? "",
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="farm-name">اسم المزرعة الرئيسية</Label>
          <Input
            id="farm-name"
            {...register("farmName")}
            placeholder="مثال: مزرعة الأمل"
          />
          {errors.farmName && (
            <p className="mt-1 text-xs text-danger">{errors.farmName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="farm-location">موقع المزرعة</Label>
          <Input
            id="farm-location"
            {...register("farmLocation")}
            placeholder="مثال: محافظة المنيا - طريق كذا"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} disabled={!isDirty}>
          حفظ بيانات المزرعة
        </Button>
      </div>
    </form>
  );
}
