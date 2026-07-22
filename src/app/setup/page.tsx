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

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // 1. Save Owner/Company Profile
      await saveOwner.mutateAsync({
        id: user?.uid || "local_owner",
        email: user?.email || "owner@hassady.local",
        name: user?.displayName || "مدير النظام",
        companyName: companyName || "إدارة المزارع",
      });

      // 2. Create the first Farm
      await createFarm.mutateAsync({
        name: farmName || "مزرعتي",
        currency: currency || "ج.م",
      });

      // 3. Update Settings Store
      storeSetAppMode(appMode);
      storeSetCurrency(currency);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Setup failed", error);
      // Fallback redirect to dashboard
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    handleComplete();
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
          <p className="text-xs sm:text-sm text-ink-muted">{steps[step].subtitle}</p>
        </div>

        {/* Dynamic Step Content */}
        <div className="min-h-[220px] flex flex-col justify-center">
          {step === 0 && (
            <div className="text-center space-y-6">
              <p className="text-ink text-base sm:text-lg leading-relaxed px-2">
                نظام حصادي مصمم ليتكيف مع احتياجاتك، سواء كنت تدير مزرعة صغيرة أو شركة زراعية متكاملة.
              </p>
              
              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full h-14 rounded-2xl text-base font-extrabold bg-crop-600 hover:bg-crop-700 text-white shadow-lg shadow-crop-600/30 active:scale-[0.98] transition-all"
                  size="lg"
                >
                  ابدأ الإعداد الآن
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  className="w-full h-12 rounded-xl text-xs sm:text-sm text-ink-muted hover:text-ink font-medium"
                >
                  تخطي واستخدام الإعدادات الافتراضية
                </Button>
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
                <p className="text-xs text-ink-muted leading-relaxed">مثالي للمزارع الفردية. يركز على المهام، الإيرادات والمصروفات دون تعقيدات محاسبية.</p>
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
                <p className="text-xs text-ink-muted leading-relaxed">مصمم للشركات الزراعية. يتضمن دليل حسابات، شجرة أصول، تعدد فروع وإدارات.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {step > 0 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="h-12 rounded-xl px-6 font-bold text-sm"
            >
              السابق
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="h-12 rounded-xl px-8 font-extrabold text-sm min-w-[130px] bg-crop-600 hover:bg-crop-700 text-white shadow-md shadow-crop-600/30"
            >
              {loading ? <Icons.Spinner className="w-5 h-5 animate-spin" /> : step === steps.length - 1 ? "إنهاء والبدء" : "التالي"}
            </Button>
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
