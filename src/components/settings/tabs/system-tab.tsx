"use client";

import { CheckCircle2, Globe, Settings as SettingsIcon, Languages } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useSettingsStore } from "@/lib/store/settings-store";
import { useTheme } from "@/lib/providers/theme-provider";
import { cn } from "@/lib/utils";

export function SystemTab() {
  const { theme, toggleTheme } = useTheme();
  const { appMode, setAppMode, currency, setCurrency } = useSettingsStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-xl font-bold text-ink mb-1">تخصيص الواجهة (Adaptive UI)</h2>
        <p className="text-ink-muted mb-6 text-sm">اختر طبيعة عملك ليقوم النظام بإخفاء أو إظهار الشاشات بناءً على احتياجك.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Simple Mode */}
          <div 
            onClick={() => setAppMode("simple")}
            className={cn(
              "cursor-pointer rounded-2xl border-2 p-5 transition-all relative overflow-hidden",
              appMode === "simple" 
                ? "border-crop-500 bg-crop-50 dark:bg-crop-900/20 shadow-sm" 
                : "border-border hover:border-crop-300 bg-paper-raised"
            )}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-ink">مزارع بسيط</h3>
                {appMode === "simple" ? (
                  <CheckCircle2 className="h-6 w-6 text-crop-600" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-border" />
                )}
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">
                إخفاء التعقيدات المحاسبية وقيود اليومية والديون. يركز فقط على دورة المحصول والمصروفات.
              </p>
            </div>
          </div>

          {/* Enterprise Mode */}
          <div 
            onClick={() => setAppMode("enterprise")}
            className={cn(
              "cursor-pointer rounded-2xl border-2 p-5 transition-all relative overflow-hidden",
              appMode === "enterprise" 
                ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20 shadow-sm" 
                : "border-border hover:border-sky-300 bg-paper-raised"
            )}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-ink">مؤسسة زراعية (ERP)</h3>
                {appMode === "enterprise" ? (
                  <CheckCircle2 className="h-6 w-6 text-sky-600" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-border" />
                )}
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">
                تفعيل النظام المحاسبي المتكامل، الديون، القوائم المالية، وتعدد الإدارات.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border/60 w-full my-6"></div>

      <div>
        <h2 className="text-xl font-bold text-ink mb-1">تفضيلات العرض (Display Preferences)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="shadow-sm border-border/60 bg-paper rounded-2xl">
            <CardHeader className="border-b border-border/50 bg-paper-sunken/30 pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Languages className="h-4 w-4 text-ink-muted" />
                لغة واجهة النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <Select defaultValue="ar">
                <option value="ar">العربية (Arabic)</option>
                <option value="en">English (الإنجليزية)</option>
              </Select>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60 bg-paper rounded-2xl">
            <CardHeader className="border-b border-border/50 bg-paper-sunken/30 pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-ink-muted" />
                العملة العالمية الافتراضية
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <Select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="ج.م">الجنيه المصري ({currency})</option>
                <option value="ر.س">الريال السعودي (ر.س)</option>
                <option value="USD">الدولار الأمريكي ($)</option>
              </Select>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60 bg-paper rounded-2xl">
            <CardHeader className="border-b border-border/50 bg-paper-sunken/30 pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <SettingsIcon className="h-4 w-4 text-ink-muted" />
                تفعيل المظهر الداكن
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 flex items-center h-[76px]">
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-crop-500/20 ${
                    theme === "dark" ? "bg-crop-500" : "bg-black/20 dark:bg-white/20"
                  }`}
                >
                  <span
                    className={cn(
                      "inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out",
                      theme === "dark" ? "-translate-x-1" : "-translate-x-7"
                    )}
                  />
                </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
