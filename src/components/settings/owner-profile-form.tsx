"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ownerProfileSchema,
  type OwnerProfileSchema,
} from "./owner-profile-schema";
import type { OwnerProfile } from "@/lib/types/owner";

export function OwnerProfileForm({
  defaultValues,
  email,
  onSubmit,
  loading,
}: {
  defaultValues?: OwnerProfile | null;
  email?: string;
  onSubmit: (values: OwnerProfileSchema) => void;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<OwnerProfileSchema>({
    resolver: zodResolver(ownerProfileSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      address: defaultValues?.address ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      address: defaultValues?.address ?? "",
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="owner-name">الاسم *</Label>
          <Input
            id="owner-name"
            {...register("name")}
            placeholder="اسم مالك النظام"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="owner-email">البريد الإلكتروني</Label>
          <Input
            id="owner-email"
            value={email ?? "—"}
            readOnly
            disabled
            className="text-ink-muted"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="owner-phone">رقم الهاتف</Label>
          <Input
            id="owner-phone"
            {...register("phone")}
            dir="ltr"
            className="text-end"
          />
        </div>
        <div>
          <Label htmlFor="owner-address">العنوان</Label>
          <Input
            id="owner-address"
            {...register("address")}
            placeholder="اختياري"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} disabled={!isDirty}>
          حفظ البيانات
        </Button>
      </div>
    </form>
  );
}
