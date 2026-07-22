"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { useAuth } from "@/lib/providers/auth-provider";
import { useSaveOwnerProfile } from "@/lib/hooks/use-owner";
import { useCreateFarm } from "@/lib/hooks/use-farms";
import { useSettingsStore } from "@/lib/store/settings-store";
import { Logo } from "@/components/layout/logo";
import { Select } from "@/components/ui/select";

export default function SetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const saveOwner = useSaveOwnerProfile();
  const createFarm = useCreateFarm();
  const { setAppMode: storeSetAppMode, setCurrency: storeSetCurrency } = useSettingsStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState(user?.displayName || "مزرعتي الرئيسية");
  const [farmName, setFarmName] = useState("المزرعة الأولى");
  const [currency, setCurrency] = useState("ج.م");
  const [appMode, setAppMode] = useState<"simple" | "enterprise">("simple");

  const steps = [
    { title: "أهلاً بك في منصة حصادي", subtitle: "دعنا نقوم بإعداد نظامك في خطوات بسيطة" },
    { title: "بيانات المنشأة", subtitle: "ما هو اسم نشاطك التجاري أو شركتك؟" },
    { title: "المزرعة الرئيسية", subtitle: "أضف بيانات مزرعتك الأولى" },
    { title: "تفضيلات الواجهة", subtitle: "كيف تفضل أن يكون شكل النظام؟" },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      storeSetAppMode(appMode);
      storeSetCurrency(currency);

      const ownerUid = user?.uid || "local_owner";
      await saveOwner.mutateAsync({
        id: ownerUid,
        email: user?.email || "owner@hassady.local",
        name: user?.displayName || "مدير النظام",
        companyName: companyName || "إدارة المزارع",
      }).catch((e) => console.log("Owner profile save error:", e));

      await createFarm.mutateAsync({
        name: farmName || "مزرعتي",
        currency: currency || "ج.م",
      }).catch((e) => console.log("Create farm error:", e));

    } catch (error) {
      console.error("Setup failed", error);
    } finally {
      setLoading(false);
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      } else {
        router.push("/dashboard");
      }
    }
  };

  const handleSkip = () => {
    storeSetAppMode("simple");
    storeSetCurrency("ج.م");
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Card className="w-full max-w-xl bg-paper shadow-2xl border-border rounded-3xl animate-in fade-in zoom-in-95 duration-300">
      <CardContent className="p-5 sm:p-8">
        
        {/* Header with Logo */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="mb-4 pt-2">
            <Logo showText={false} className="scale-125 sm:scale-150" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-ink mb-1.5">{steps[step].title}</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">{steps[step].subtitle}</p>
        </div>

        {/* Dynamic Step Content */}
        <div className="min-h-[220px] flex flex-col justify-center">
          {step === 0 && (
            <div className="text-center space-y-6">
              <p className="text-slate-800 dark:text-slate-200 text-base sm:text-lg leading-relaxed px-2 font-medium">
                نظام حصادي مصمم ليتكيف مع احتياجاتك، سواء كنت تدير مزرعة صغيرة أو شركة زراعية متكاملة.
              </p>
              
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleNext()}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                  className="w-full h-14 rounded-2xl text-base font-extrabold bg-crop-600 hover:bg-crop-700 active:bg-crop-800 text-white shadow-lg shadow-crop-600/30 cursor-pointer flex items-center justify-center touch-manipulation select-none transition-all"
                >
                  ابدأ الإعداد الآن
                </button>

                <button
                  type="button"
                  onClick={() => handleSkip()}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleSkip();
                  }}
                  className="w-full h-12 rounded-xl text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-ink font-bold cursor-pointer flex items-center justify-center touch-manipulation select-none"
                >
                  تخطي واستخدام الإعدادات الافتراضية
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-left-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">اسم النشاط التجاري أو الشركة</label>
                <Input
                  placeholder="مثال: مزارع الرواد، أو اسمك الشخصي"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="text-base sm:text-lg h-14 rounded-2xl px-4"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-left-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">اسم المزرعة الرئيسية</label>
                <Input
                  placeholder="مثال: مزرعة النخيل"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="text-base sm:text-lg h-14 rounded-2xl px-4"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">العملة الافتراضية</label>
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-14 rounded-2xl text-base"
                >
                  <option value="ج.م">الجنيه المصري (ج.م)</option>
                  <option value="ر.س">الريال السعودي (ر.س)</option>
                  <option value="USD">الدولار الأمريكي ($)</option>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-left-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => setAppMode("simple")}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${appMode === "simple" ? "border-crop-500 bg-crop-50/50 dark:bg-crop-900/30" : "border-border hover:border-crop-300"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2.5 rounded-xl ${appMode === "simple" ? "bg-crop-500 text-white" : "bg-paper-sunken text-ink-muted"}`}>
                    <Icons.Sprout className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-ink text-base">الوضع البسيط</h3>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">مثالي للمزارع الفردية. يركز على المهام، الإيرادات والمصروفات دون تعقيدات محاسبية.</p>
              </div>

              <div 
                onClick={() => setAppMode("enterprise")}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${appMode === "enterprise" ? "border-sky-500 bg-sky-50/50 dark:bg-sky-900/30" : "border-border hover:border-sky-300"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2.5 rounded-xl ${appMode === "enterprise" ? "bg-sky-500 text-white" : "bg-paper-sunken text-ink-muted"}`}>
                    <Icons.Building className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-ink text-base">الوضع المؤسسي (ERP)</h3>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">مصمم للشركات الزراعية. يتضمن دليل حسابات، شجرة أصول، تعدد فروع وإدارات.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {step > 0 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50 gap-4">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              onTouchEnd={(e) => {
                e.preventDefault();
                setStep(step - 1);
              }}
              disabled={loading}
              className="h-12 rounded-xl px-6 font-bold text-sm border border-border text-ink bg-transparent hover:bg-black/5 dark:hover:bg-white/10 touch-manipulation cursor-pointer"
            >
              السابق
            </button>

            <button
              type="button"
              onClick={() => handleNext()}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleNext();
              }}
              disabled={loading}
              className="h-12 rounded-xl px-8 font-extrabold text-sm min-w-[130px] bg-crop-600 hover:bg-crop-700 active:bg-crop-800 text-white shadow-md shadow-crop-600/30 touch-manipulation cursor-pointer flex items-center justify-center"
            >
              {loading ? <Icons.Spinner className="w-5 h-5 animate-spin" /> : step === steps.length - 1 ? "إنهاء والبدء" : "التالي"}
            </button>
          </div>
        )}

        {/* Progress Dots Indicator */}
        {step > 0 && (
          <div className="flex justify-center gap-2 mt-6">
            {steps.slice(1).map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all ${idx + 1 === step ? "w-6 bg-crop-500" : idx + 1 < step ? "w-2 bg-crop-500/50" : "w-2 bg-border"}`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
