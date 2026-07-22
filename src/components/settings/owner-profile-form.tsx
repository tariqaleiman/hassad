"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { User, Phone, MapPin, Mail, ShieldCheck, Building2, FileText, Image as ImageIcon, Edit2, X } from "lucide-react";
import { toast } from "sonner";
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
  const [isEditing, setIsEditing] = useState(false);

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
      companyName: defaultValues?.companyName ?? "",
      taxId: defaultValues?.taxId ?? "",
      commercialRegister: defaultValues?.commercialRegister ?? "",
      logo: defaultValues?.logo ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      address: defaultValues?.address ?? "",
      companyName: defaultValues?.companyName ?? "",
      taxId: defaultValues?.taxId ?? "",
      commercialRegister: defaultValues?.commercialRegister ?? "",
      logo: defaultValues?.logo ?? "",
    });
  }, [defaultValues, reset]);

  const handleFormSubmit = (values: OwnerProfileSchema) => {
    onSubmit(values);
    if (!loading) {
      setIsEditing(false); // Close edit mode on submit
    }
  };

  const handleCancel = () => {
    reset(); // Revert changes
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Profile Header Avatar Placeholder */}
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-border/40 relative">
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)} 
            variant="outline" 
            size="sm" 
            className="absolute end-0 top-0 gap-2 rounded-xl"
          >
            <Edit2 className="h-4 w-4" />
            تعديل البيانات
          </Button>
        )}
        <div className="relative mt-8 md:mt-0">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-sky-400 to-sky-600 text-white shadow-lg shadow-sky-500/20">
            <span className="text-3xl font-bold">
              {defaultValues?.name?.[0] || <User className="h-10 w-10" />}
            </span>
          </div>
        </div>
        <div className="text-center md:text-start flex-1 mt-4 md:mt-0">
          <h3 className="font-display text-2xl font-bold text-ink">
            {defaultValues?.name || "مدير النظام"}
          </h3>
          <p className="text-ink-muted flex items-center justify-center md:justify-start gap-2 mt-1">
            <Mail className="h-4 w-4" />
            {email || "لا يوجد بريد إلكتروني"}
          </p>
          <span className="inline-block mt-3 bg-crop-100 text-crop-800 dark:bg-crop-900/50 dark:text-crop-300 px-3 py-1 rounded-md text-xs font-bold border border-crop-200 dark:border-crop-800">
            مالك الحساب (صلاحيات كاملة)
          </span>
        </div>
      </div>

      {!isEditing ? (
        /* =======================================
           VIEW MODE (Read-only)
           ======================================= */
        <div className="animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-ink-muted flex items-center gap-2"><User className="h-4 w-4" /> الاسم بالكامل</p>
              <p className="font-bold text-ink text-base">{defaultValues?.name || "—"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-ink-muted flex items-center gap-2"><Mail className="h-4 w-4" /> البريد الإلكتروني</p>
              <p className="font-bold text-ink text-base" dir="ltr">{email || "—"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-ink-muted flex items-center gap-2"><Phone className="h-4 w-4" /> رقم الهاتف</p>
              <p className="font-bold text-ink text-base" dir="ltr">{defaultValues?.phone || "—"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-ink-muted flex items-center gap-2"><MapPin className="h-4 w-4" /> العنوان</p>
              <p className="font-bold text-ink text-base">{defaultValues?.address || "—"}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border/40 mt-6">
            <h4 className="text-ink font-bold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-ink-muted" />
              بيانات الشركة (تستخدم للطباعة والتقارير)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-paper-sunken p-5 rounded-2xl border border-border/60">
              <div className="space-y-1">
                <p className="text-sm font-medium text-ink-muted">الاسم التجاري للشركة / البراند</p>
                <p className="font-bold text-ink text-base">{defaultValues?.companyName || "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-ink-muted">الرقم الضريبي</p>
                <p className="font-bold text-ink text-base" dir="ltr">{defaultValues?.taxId || "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-ink-muted">السجل التجاري</p>
                <p className="font-bold text-ink text-base" dir="ltr">{defaultValues?.commercialRegister || "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-ink-muted">رابط الشعار</p>
                <p className="font-bold text-sky-600 text-sm truncate" dir="ltr">
                  {defaultValues?.logo ? <a href={defaultValues.logo} target="_blank" rel="noreferrer" className="hover:underline">{defaultValues.logo}</a> : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =======================================
           EDIT MODE (Form)
           ======================================= */
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-sky-50 dark:bg-sky-900/10 p-4 rounded-xl border border-sky-100 dark:border-sky-900/30 flex items-center gap-3">
            <Edit2 className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
            <p className="text-sm text-sky-800 dark:text-sky-300 font-medium">أنت الآن في وضع تعديل البيانات. قم بإجراء التغييرات المطلوبة ثم اضغط على حفظ.</p>
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

          {/* Company Details Section */}
          <div className="pt-6 border-t border-border/40 mt-6">
            <h4 className="text-ink font-bold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-ink-muted" />
              بيانات الشركة (تستخدم للطباعة والتقارير)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-paper-sunken p-5 rounded-2xl border border-border/60">
              <div className="space-y-2">
                <Label htmlFor="company-name" className="text-ink font-medium">الاسم التجاري للشركة / البراند</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <Input
                    id="company-name"
                    {...register("companyName")}
                    placeholder="شركة حصاد الزراعية"
                    className="ps-10 bg-paper"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-tax" className="text-ink font-medium">الرقم الضريبي</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
                    <FileText className="h-4 w-4" />
                  </div>
                  <Input
                    id="company-tax"
                    {...register("taxId")}
                    placeholder="123-456-789"
                    dir="ltr"
                    className="ps-10 text-end bg-paper"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-cr" className="text-ink font-medium">السجل التجاري</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
                    <FileText className="h-4 w-4" />
                  </div>
                  <Input
                    id="company-cr"
                    {...register("commercialRegister")}
                    placeholder="123456"
                    dir="ltr"
                    className="ps-10 text-end bg-paper"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-logo" className="text-ink font-medium">رابط الشعار (Logo URL)</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-muted">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <Input
                    id="company-logo"
                    {...register("logo")}
                    placeholder="https://example.com/logo.png"
                    dir="ltr"
                    className="ps-10 bg-paper"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border/40 mt-6">
            <Button 
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="rounded-full px-6 shadow-sm gap-2"
            >
              <X className="h-4 w-4" />
              إلغاء التعديل
            </Button>
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
      )}

      {/* Password Reset Section - Always visible */}
      <div className="pt-6 border-t border-border/40 mt-6">
        <h4 className="text-ink font-bold mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-ink-muted" />
          الأمان وكلمة المرور
        </h4>
        <div className="bg-paper-sunken p-4 rounded-xl border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-ink">تغيير كلمة المرور</p>
            <p className="text-sm text-ink-muted">سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني المسجل ({email}).</p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            className="shrink-0 rounded-xl"
            onClick={async () => {
              if (!email) return;
              try {
                const { auth } = await import("@/lib/firebase/client");
                const { sendPasswordResetEmail } = await import("firebase/auth");
                await sendPasswordResetEmail(auth, email);
                toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");
              } catch (error) {
                console.error(error);
                toast.error("حدث خطأ، تأكد من صحة البريد أو حاول لاحقاً.");
              }
            }}
          >
            إرسال رابط التغيير
          </Button>
        </div>
      </div>

    </div>
  );
}
