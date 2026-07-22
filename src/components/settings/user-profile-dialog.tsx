"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { User, Phone, MapPin, Calendar, Users } from "lucide-react";
import { ownerProfileSchema, type OwnerProfileSchema } from "./owner-profile-schema";
import type { OwnerProfile } from "@/lib/types/owner";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: OwnerProfile | null;
  email?: string;
  onSave: (values: OwnerProfileSchema) => void;
  isSaving: boolean;
}

export function UserProfileDialog({ open, onOpenChange, profile, email, onSave, isSaving }: UserProfileDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
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
      title="تعديل بيانات الحساب الشخصي" 
      description="البيانات الخاصة بصاحب الحساب لضمان دقة التواصل والخصوصية."
      className="sm:max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
        
        {/* Avatar Upload */}
        <div className="flex justify-center mb-6">
          <Controller
            name="avatar"
            control={control}
            render={({ field }) => (
              <ImageUpload
                type="avatar"
                value={field.value}
                onChange={field.onChange}
                className="w-28 h-28"
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <User className="h-4 w-4 text-ink-muted" /> الاسم بالكامل <span className="text-danger">*</span>
            </label>
            <Input 
              {...register("name")}
              placeholder="اسم صاحب الحساب" 
              required
            />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-ink-muted" /> رقم الهاتف
            </label>
            <Input 
              {...register("phone")}
              placeholder="+20 1xxxxxxxxx"
              dir="ltr"
              className="text-end" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <Users className="h-4 w-4 text-ink-muted" /> الجنس
            </label>
            <Select {...register("gender")}>
              <option value="">غير محدد</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-ink-muted" /> تاريخ الميلاد
            </label>
            <Input 
              type="date"
              {...register("dateOfBirth")}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-ink-muted" /> الموقع (أو رابط خرائط جوجل)
            </label>
            <Input 
              {...register("userLocation")}
              placeholder="مثال: الرياض، حي الياسمين أو رابط الخريطة..." 
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
