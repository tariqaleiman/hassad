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
import { Select } from "@/components/ui/select";

export default function SetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const saveOwner = useSaveOwnerProfile();
  const createFarm = useCreateFarm();
  const { setAppMode: storeSetAppMode, setCurrency: storeSetCurrency } = useSettingsStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState(user?.displayName || "");
  const [farmName, setFarmName] = useState("");
  const [currency, setCurrency] = useState("ج.م");
  const [appMode, setAppMode] = useState<"simple" | "enterprise">("simple");

  const steps = [
    { title: "أهلاً بك في حصاد", subtitle: "دعنا نقوم بإعداد نظامك في خطوات بسيطة" },
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
        companyName: companyName,
      });

      // 2. Create the first Farm
      await createFarm.mutateAsync({
        name: farmName || "مزرعتي",
        currency: currency,
      });

      // 3. Update Settings Store
      storeSetAppMode(appMode);
      storeSetCurrency(currency);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Setup failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setCompanyName(user?.displayName || "إدارة المزارع");
    setFarmName("مزرعتي الأساسية");
    setCurrency("ج.م");
    setAppMode("simple");
    handleComplete();
  };

  return (
    <Card className="w-full max-w-xl bg-paper shadow-lg border-border animate-in fade-in zoom-in-95 duration-300">
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-crop-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <Icons.Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-display text-ink mb-2">{steps[step].title}</h1>
          <p className="text-ink-muted">{steps[step].subtitle}</p>
        </div>

        <div className="min-h-[200px] flex flex-col justify-center">
          {step === 0 && (
            <div className="text-center space-y-6">
              <p className="text-ink text-lg">
                نظام حصاد مصمم ليتكيف مع احتياجاتك، سواء كنت تدير مزرعة صغيرة أو شركة زراعية متكاملة.
              </p>
              <div className="flex justify-center">
                <Button onClick={handleNext} className="w-full sm:w-auto px-8" size="lg">ابدأ الإعداد</Button>
              </div>
              <div>
                <button onClick={handleSkip} className="text-sm text-ink-faint hover:text-ink-muted underline">
                  تخطي واستخدام الإعدادات الافتراضية
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-left-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">اسم النشاط أو الشركة</label>
                <Input
                  placeholder="مثال: مزارع الرواد، أو اسمك الشخصي"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="text-lg py-6"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-left-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">اسم المزرعة</label>
                <Input
                  placeholder="مثال: مزرعة النخيل"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="text-lg py-6"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">العملة الافتراضية</label>
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="ج.م">الجنيه المصري (ج.م)</option>
                  <option value="ر.س">الريال السعودي (ر.س)</option>
                  <option value="USD">الدولار الأمريكي ($)</option>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-left-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setAppMode("simple")}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${appMode === "simple" ? "border-crop-500 bg-crop-50/50" : "border-border hover:border-crop-300"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${appMode === "simple" ? "bg-crop-500 text-white" : "bg-paper-sunken text-ink-muted"}`}>
                    <Icons.Sprout className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-ink">الوضع البسيط</h3>
                </div>
                <p className="text-sm text-ink-muted">مثالي للمزارع الفردية. يركز على المهام، الإيرادات والمصروفات دون تعقيدات محاسبية.</p>
              </div>

              <div 
                onClick={() => setAppMode("enterprise")}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${appMode === "enterprise" ? "border-sky-500 bg-sky-50/50" : "border-border hover:border-sky-300"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${appMode === "enterprise" ? "bg-sky-500 text-white" : "bg-paper-sunken text-ink-muted"}`}>
                    <Icons.Building className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-ink">الوضع المؤسسي (ERP)</h3>
                </div>
                <p className="text-sm text-ink-muted">مصمم للشركات الزراعية. يتضمن دليل حسابات، شجرة أصول، تعدد فروع وإدارات.</p>
              </div>
            </div>
          )}
        </div>

        {step > 0 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
            <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={loading}>
              السابق
            </Button>
            <Button onClick={handleNext} disabled={loading || (step === 1 && !companyName) || (step === 2 && !farmName)} className="min-w-[120px]">
              {loading ? <Icons.Spinner className="w-5 h-5 animate-spin" /> : step === steps.length - 1 ? "إنهاء والبدء" : "التالي"}
            </Button>
          </div>
        )}
        
        {/* Progress Dots */}
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
