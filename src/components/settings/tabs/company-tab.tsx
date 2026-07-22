"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOwnerProfile, useSaveOwnerProfile } from "@/lib/hooks/use-owner";
import { useAuth } from "@/lib/providers/auth-provider";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, Building2, Calendar, FileText, Edit2, Users } from "lucide-react";
import type { OwnerProfileSchema } from "@/components/settings/owner-profile-schema";
import { UserProfileDialog } from "@/components/settings/user-profile-dialog";
import { CompanyProfileDialog } from "@/components/settings/company-profile-dialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function CompanyTab() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useOwnerProfile();
  const saveProfile = useSaveOwnerProfile();

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);

  const handleSave = (values: OwnerProfileSchema) => {
    saveProfile.mutate(
      {
        ...profile,
        ...values,
        id: user?.uid ?? profile?.id ?? "local_owner",
        name: values.name || profile?.name || user?.displayName || "مدير النظام",
        email: user?.email ?? profile?.email ?? "owner@hassady.local",
      },
      {
        onSuccess: () => {
          setUserDialogOpen(false);
          setCompanyDialogOpen(false);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8 text-crop-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* =======================================
            USER PROFILE CARD
            ======================================= */}
        <Card className="flex-1 shadow-sm border-border/60 bg-paper rounded-2xl overflow-hidden group">
          <CardHeader className="border-b border-border/50 bg-paper-sunken/30 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-crop-600" />
              البيانات الشخصية للحساب
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setUserDialogOpen(true)}
            >
              <Edit2 className="h-4 w-4" />
              تعديل
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 mb-6">
              <div className="h-20 w-20 rounded-full bg-crop-100 text-crop-600 flex items-center justify-center shrink-0 border border-crop-200 overflow-hidden shadow-sm">
                {profile?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold">{profile?.name?.[0] || <User className="h-8 w-8" />}</span>
                )}
              </div>
              <div className="text-center sm:text-start">
                <h3 className="font-bold text-lg text-ink">{profile?.name || "مدير النظام"}</h3>
                <p className="text-sm text-ink-muted">{user?.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-ink-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-ink-muted">رقم الهاتف</p>
                  <p className="text-sm font-medium text-ink" dir="ltr">{profile?.phone || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-ink-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-ink-muted">الجنس</p>
                  <p className="text-sm font-medium text-ink">{profile?.gender === 'male' ? 'ذكر' : profile?.gender === 'female' ? 'أنثى' : "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-ink-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-ink-muted">تاريخ الميلاد</p>
                  <p className="text-sm font-medium text-ink">
                    {profile?.dateOfBirth ? format(new Date(profile.dateOfBirth), "d MMMM yyyy", { locale: ar }) : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-ink-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-ink-muted">الموقع / العنوان</p>
                  <p className="text-sm font-medium text-ink">
                    {profile?.userLocation ? (
                      profile.userLocation.startsWith('http') ? (
                        <a href={profile.userLocation} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline line-clamp-1">رابط الخريطة</a>
                      ) : profile.userLocation
                    ) : "—"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Always visible edit button on mobile */}
            <Button 
              variant="outline" 
              className="w-full mt-6 sm:hidden gap-2 rounded-xl"
              onClick={() => setUserDialogOpen(true)}
            >
              <Edit2 className="h-4 w-4" />
              تعديل البيانات الشخصية
            </Button>
          </CardContent>
        </Card>

        {/* =======================================
            COMPANY PROFILE CARD
            ======================================= */}
        <Card className="flex-1 shadow-sm border-border/60 bg-paper rounded-2xl overflow-hidden group">
          <CardHeader className="border-b border-border/50 bg-paper-sunken/30 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-sky-600" />
              بيانات النشاط التجاري
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setCompanyDialogOpen(true)}
            >
              <Edit2 className="h-4 w-4" />
              تعديل
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 mb-6">
              <div className="h-20 w-20 rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800 overflow-hidden shadow-sm">
                {profile?.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="h-8 w-8 opacity-50" />
                )}
              </div>
              <div className="text-center sm:text-start">
                <h3 className="font-bold text-lg text-ink">{profile?.companyName || "اسم الشركة"}</h3>
                <span className="inline-block mt-1 bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 px-2.5 py-0.5 rounded-md text-[10px] font-bold border border-sky-200 dark:border-sky-800 uppercase tracking-wider">
                  حساب أعمال
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-ink-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-ink-muted">تاريخ التأسيس</p>
                  <p className="text-sm font-medium text-ink">
                    {profile?.establishmentDate ? format(new Date(profile.establishmentDate), "d MMMM yyyy", { locale: ar }) : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-ink-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-ink-muted">السجل التجاري</p>
                  <p className="text-sm font-medium text-ink" dir="ltr">{profile?.commercialRegister || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-ink-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-ink-muted">الرقم الضريبي</p>
                  <p className="text-sm font-medium text-ink" dir="ltr">{profile?.taxId || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-ink-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-ink-muted">رقم الهاتف</p>
                  <p className="text-sm font-medium text-ink" dir="ltr">{profile?.companyPhone || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-ink-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-ink-muted">البريد الإلكتروني</p>
                  <p className="text-sm font-medium text-ink" dir="ltr">{profile?.companyEmail || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-ink-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-ink-muted">المقر الرئيسي</p>
                  <p className="text-sm font-medium text-ink line-clamp-2">{profile?.companyLocation || "—"}</p>
                </div>
              </div>
            </div>

            {/* Always visible edit button on mobile */}
            <Button 
              variant="outline" 
              className="w-full mt-6 sm:hidden gap-2 rounded-xl"
              onClick={() => setCompanyDialogOpen(true)}
            >
              <Edit2 className="h-4 w-4" />
              تعديل بيانات الشركة
            </Button>
          </CardContent>
        </Card>
      </div>

      <UserProfileDialog 
        open={userDialogOpen} 
        onOpenChange={setUserDialogOpen} 
        profile={profile}
        email={user?.email || undefined}
        onSave={handleSave}
        isSaving={saveProfile.isPending}
      />
      
      <CompanyProfileDialog 
        open={companyDialogOpen} 
        onOpenChange={setCompanyDialogOpen} 
        profile={profile}
        onSave={handleSave}
        isSaving={saveProfile.isPending}
      />

    </div>
  );
}
