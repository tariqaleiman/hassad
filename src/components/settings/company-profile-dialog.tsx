"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Building2, MapPin, Calendar, FileText, Phone, Mail, AlertTriangle } from "lucide-react";
import { ownerProfileSchema, type OwnerProfileSchema } from "./owner-profile-schema";
import type { OwnerProfile } from "@/lib/types/owner";

interface CompanyProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: OwnerProfile | null;
  onSave: (values: OwnerProfileSchema) => void;
  isSaving: boolean;
}

export function CompanyProfileDialog({ open, onOpenChange, profile, onSave, isSaving }: CompanyProfileDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isDirty },
  } = useForm<OwnerProfileSchema>({
    resolver: zodResolver(ownerProfileSchema),
    defaultValues: {
      name: profile?.name || "",
      phone: profile?.phone || "",
      gender: profile?.gender,
      dateOfBirth: profile?.dateOfBirth || "",
      userLocation: profile?.userLocation || "",
      avatar: profile?.avatar || "",
      companyName: profile?.companyName || "",
      taxId: profile?.taxId || "",
      commercialRegister: profile?.commercialRegister || "",
      establishmentDate: profile?.establishmentDate || "",
      companyLocation: profile?.companyLocation || "",
      companyPhone: profile?.companyPhone || "",
      companyEmail: profile?.companyEmail || "",
      logo: profile?.logo || "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: profile?.name || "",
        phone: profile?.phone || "",
        gender: profile?.gender,
        dateOfBirth: profile?.dateOfBirth || "",
        userLocation: profile?.userLocation || "",
        avatar: profile?.avatar || "",
        companyName: profile?.companyName || "",
        taxId: profile?.taxId || "",
        commercialRegister: profile?.commercialRegister || "",
        establishmentDate: profile?.establishmentDate || "",
        companyLocation: profile?.companyLocation || "",
        companyPhone: profile?.companyPhone || "",
        companyEmail: profile?.companyEmail || "",
        logo: profile?.logo || "",
      });
    }
  }, [open, profile, reset]);

  const onSubmit = (values: OwnerProfileSchema) => {
    onSave(values);
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onOpenChange(false)} 
      title="تعديل بيانات النشاط التجاري" 
      description="تفاصيل المؤسسة أو الشركة وتُستخدم في طباعة الفواتير والتقارير."
      className="sm:max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
        
        {/* Logo Upload */}
        <div className="flex flex-col items-center mb-6">
          <Controller
            name="logo"
            control={control}
            render={({ field }) => (
              <ImageUpload
                type="avatar" // Using avatar type for circular shape
                value={field.value}
                onChange={field.onChange}
                className="w-32 h-32"
              />
            )}
          />
          <p className="flex items-center gap-1.5 mt-3 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
            <AlertTriangle className="h-3.5 w-3.5" />
            يُفضل رفع شعار بخلفية شفافة (PNG) ليتناسب مع السمة الليلية والنهارية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-ink-muted" /> الاسم التجاري / البراند
            </label>
            <Input 
              {...register("companyName")}
              placeholder="مثال: شركة حصاد الزراعية" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-ink-muted" /> تاريخ التأسيس
            </label>
            <Input 
              type="date"
              {...register("establishmentDate")}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-ink-muted" /> السجل التجاري
            </label>
            <Input 
              {...register("commercialRegister")}
              placeholder="رقم السجل التجاري"
              dir="ltr"
              className="text-end" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-ink-muted" /> الرقم الضريبي (VAT)
            </label>
            <Input 
              {...register("taxId")}
              placeholder="الرقم الضريبي"
              dir="ltr"
              className="text-end" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-ink-muted" /> رقم هاتف الشركة
            </label>
            <Input 
              {...register("companyPhone")}
              placeholder="مثال: +20 1xxxxxxxxx"
              dir="ltr"
              className="text-end" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-ink-muted" /> البريد الإلكتروني للشركة
            </label>
            <Input 
              type="email"
              {...register("companyEmail")}
              placeholder="info@company.com"
              dir="ltr"
              className="text-end" 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-ink-muted" /> موقع المزرعة / الشركة (المقر الرئيسي)
            </label>
            <Input 
              {...register("companyLocation")}
              placeholder="تفاصيل العنوان الكاملة..." 
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
            إلغاء
          </Button>
          <Button type="submit" loading={isSaving} disabled={!isDirty} className="rounded-xl px-8 shadow-sm">
            حفظ التعديلات
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
