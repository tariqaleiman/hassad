"use client";

import { useState } from "react";
import { User, Moon, Sun, Globe, LogOut, MapPin, Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OwnerProfileForm } from "@/components/settings/owner-profile-form";
import { FarmProfileForm } from "@/components/settings/farm-profile-form";
import { useOwnerProfile, useSaveOwnerProfile } from "@/lib/hooks/use-owner";
import { useAuth } from "@/lib/providers/auth-provider";
import { useTheme } from "@/lib/providers/theme-provider";
import { useLocale } from "@/lib/providers/locale-provider";
import { Spinner } from "@/components/ui/spinner";
import type { OwnerProfileSchema } from "@/components/settings/owner-profile-schema";
import type { FarmProfileSchema } from "@/components/settings/farm-profile-schema";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "farm" | "appearance";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const { data: profile, isLoading } = useOwnerProfile();
  const saveProfile = useSaveOwnerProfile();

  const handleProfileSave = (values: OwnerProfileSchema) => {
    saveProfile.mutate({
      ...profile,
      ...values,
      email: user?.email ?? "",
    });
  };

  const handleFarmSave = (values: FarmProfileSchema) => {
    saveProfile.mutate({
      ...profile,
      name: profile?.name ?? user?.displayName ?? "", 
      farmName: values.farmName,
      farmLocation: values.farmLocation,
    });
  };

  const tabs = [
    { id: "profile", label: "الحساب الشخصي", icon: User },
    { id: "farm", label: "بيانات المزرعة", icon: MapPin },
    { id: "appearance", label: "المظهر واللغة", icon: SettingsIcon },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors text-start whitespace-nowrap",
                    active
                      ? "bg-black/5 dark:bg-white/10 text-ink font-bold"
                      : "text-ink-muted hover:bg-black/5 dark:hover:bg-white/10 hover:text-ink"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6 min-w-0">
          {activeTab === "profile" && (
            <Card>
              <CardHeader className="border-b border-border mb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-ink-muted" />
                  الملف الشخصي
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-6 w-6" />
                  </div>
                ) : (
                  <OwnerProfileForm
                    defaultValues={profile}
                    email={user?.email ?? undefined}
                    onSubmit={handleProfileSave}
                    loading={saveProfile.isPending}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "farm" && (
            <Card>
              <CardHeader className="border-b border-border mb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-ink-muted" />
                  بيانات المزرعة الرئيسية
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-6 w-6" />
                  </div>
                ) : (
                  <FarmProfileForm
                    defaultValues={profile}
                    onSubmit={handleFarmSave}
                    loading={saveProfile.isPending}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="border-b border-border mb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sun className="h-5 w-5 text-ink-muted" />
                    المظهر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-ink">سمة النظام</p>
                      <p className="text-sm text-ink-muted">
                        {theme === "light" ? "الوضع الفاتح مفعل" : "الوضع الداكن مفعل"}
                      </p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ink/20 ${
                        theme === "dark" ? "bg-sky-500" : "bg-black/20 dark:bg-white/20"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                          theme === "dark" ? "-translate-x-7" : "-translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border mb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="h-5 w-5 text-ink-muted" />
                    اللغة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-ink">لغة الواجهة</p>
                      <p className="text-sm text-ink-muted">
                        {locale === "ar" ? "العربية" : "English"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLocale("ar")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          locale === "ar"
                            ? "bg-black/5 dark:bg-white/10 text-ink"
                            : "text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"
                        }`}
                      >
                        العربية
                      </button>
                      <button
                        onClick={() => setLocale("en")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          locale === "en"
                            ? "bg-black/5 dark:bg-white/10 text-ink"
                            : "text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border mb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-danger">
                    <LogOut className="h-5 w-5" />
                    تسجيل الخروج
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-ink">الخروج من النظام</p>
                      <p className="text-sm text-ink-muted">
                        {user?.email ?? ""}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => signOut()}
                    >
                      تسجيل الخروج
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
