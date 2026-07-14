"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { User, Phone, MapPin, Mail, ShieldCheck } from "lucide-react";
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Profile Header Avatar Placeholder */}
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-border/40">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-sky-400 to-sky-600 text-white shadow-lg shadow-sky-500/20">
            <span className="text-3xl font-bold">
              {defaultValues?.name?.[0] || <User className="h-10 w-10" />}
            </span>
          </div>
          <div className="absolute -bottom-2 -end-2 bg-paper rounded-full p-1 shadow-sm">
            <div className="bg-emerald-500 text-white rounded-full p-1.5" title="حساب موثق">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div className="text-center md:text-start flex-1">
          <h3 className="font-display text-2xl font-bold text-ink">
            {defaultValues?.name || "مدير النظام"}
          </h3>
          <p className="text-ink-muted flex items-center justify-center md:justify-start gap-2 mt-1">
            <Mail className="h-4 w-4" />
            {email || "لا يوجد بريد إلكتروني"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <Label htmlFor="owner-name" className="text-ink font-medium">
            الاسم بالكامل <span className="text-danger">*</span>
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
              <User className="h-4 w-4" />
            </div>
            <Input
              id="owner-name"
              {...register("name")}
              placeholder="اسم مالك النظام"
              className="ps-10"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-danger">{errors.name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="owner-email" className="text-ink font-medium">البريد الإلكتروني</Label>
          <div className="relative">
             <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="owner-email"
              value={email ?? "—"}
              readOnly
              disabled
              className="text-ink-muted bg-paper-sunken ps-10"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner-phone" className="text-ink font-medium">رقم الهاتف</Label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
              <Phone className="h-4 w-4" />
            </div>
            <Input
              id="owner-phone"
              {...register("phone")}
              dir="ltr"
              className="ps-10 text-end"
              placeholder="+20 1xxxxxxxxx"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner-address" className="text-ink font-medium">العنوان</Label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
              <MapPin className="h-4 w-4" />
            </div>
            <Input
              id="owner-address"
              {...register("address")}
              placeholder="المحافظة، المدينة، المركز..."
              className="ps-10"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-border/40 mt-6">
        <Button 
          type="submit" 
          loading={loading} 
          disabled={!isDirty}
          className="rounded-full px-8 shadow-sm"
        >
          حفظ التعديلات
        </Button>
      </div>
    </form>
  );
}
