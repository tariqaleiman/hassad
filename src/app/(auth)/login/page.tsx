"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sprout, Loader2, Eye, EyeOff, MapPin } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/providers/auth-provider";
import { isFirebaseConfigured } from "@/lib/firebase/client";

import { Suspense } from "react";

function LoginForm() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "signup") {
      setMode("signup");
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        toast.success("تم تسجيل الدخول بنجاح");
      } else {
        if (!name.trim()) {
          toast.error("يرجى إدخال الاسم الكامل");
          setLoading(false);
          return;
        }
        await signUp(name, email, password);
        toast.success("تم إنشاء الحساب بنجاح");
      }
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      const msg = mode === "signin" ? "بيانات الدخول غير صحيحة" : "فشل إنشاء الحساب، تأكد من صحة البيانات";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("تم تسجيل الدخول بنجاح");
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error("حدث خطأ أثناء الدخول عبر Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleOfflineBypass = () => {
    toast.success("تم التوجيه إلى الوضع المحلي المباشر بدون إنترنت");
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-dvh bg-paper text-slate-900 dark:text-white transition-colors duration-300">
      {/* Right Column: Form Card */}
      <div className="flex w-full flex-col justify-center px-6 sm:px-12 md:w-1/2 lg:w-5/12 xl:px-20 py-10">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="mb-8 flex flex-col items-start">
            <Logo showText={true} className="mb-6 scale-110 origin-right" />
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              {mode === "signin" 
                ? "أدخل بياناتك للوصول إلى لوحة تحكم مزرعتك."
                : "قم بإنشاء حسابك الآن للبدء في إدارة زرعتك وعمالتك بذكاء."}
            </p>
          </div>

          {!isFirebaseConfigured && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs font-medium text-amber-900">
              <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="leading-relaxed">
                يعمل النظام حالياً في <b>الوضع المحلي (Offline)</b>. يمكنك استخدام الحفظ المحلي وتجربة كافة الشاشات فوراً.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-200">الاسم الكامل</Label>
                <Input
                  id="name"
                  type="text"
                  required={mode === "signup"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أحمد محمود المزارع"
                  className="h-12 rounded-2xl bg-paper-sunken border-border focus:border-crop-500 text-sm px-4 font-medium"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-200">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@hassady.com"
                className="h-12 rounded-2xl bg-paper-sunken border-border focus:border-crop-500 text-sm px-4 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-200">كلمة المرور</Label>
                {mode === "signin" && (
                  <button 
                    type="button" 
                    onClick={async () => {
                      if (!email.trim()) {
                        toast.error("يرجى إدخال البريد الإلكتروني أولاً لإرسال رابط التعيين");
                        return;
                      }
                      try {
                        const { auth } = await import("@/lib/firebase/client");
                        const { sendPasswordResetEmail } = await import("firebase/auth");
                        await sendPasswordResetEmail(auth, email);
                        toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
                      } catch (error) {
                        toast.error("حدث خطأ، تأكد من صحة البريد الإلكتروني");
                      }
                    }}
                    className="text-xs font-bold text-crop-600 hover:text-crop-700 transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-2xl bg-paper-sunken border-border focus:border-crop-500 text-sm px-4 font-medium pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="mt-2 h-12 w-full rounded-2xl text-base font-extrabold bg-crop-600 hover:bg-crop-700 text-white shadow-lg shadow-crop-600/30 transition-all active:scale-[0.98]" 
              disabled={loading || googleLoading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : mode === "signin" ? (
                "تسجيل الدخول"
              ) : (
                "إنشاء الحساب"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-paper px-4 font-bold text-slate-400">أو</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-2xl border-border bg-white text-sm font-bold transition-all hover:bg-paper-sunken active:scale-[0.98] dark:bg-slate-900 dark:hover:bg-slate-800"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg className="me-3 h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  المتابعة باستخدام حساب Google
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="h-12 w-full rounded-2xl text-xs sm:text-sm font-bold bg-crop-100 text-crop-800 hover:bg-crop-200 dark:bg-crop-950 dark:text-crop-300 border border-crop-200 dark:border-crop-800"
              onClick={handleOfflineBypass}
            >
              <MapPin className="me-2 w-4 h-4 text-crop-600" />
              <span>الدخول الفوري بدون إنترنت (الوضع المحلي)</span>
            </Button>
          </div>

          <p className="mt-6 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
            {mode === "signin" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{" "}
            <button 
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-extrabold text-crop-600 hover:text-crop-700 hover:underline underline-offset-4"
            >
              {mode === "signin" ? "إنشاء حساب مجاني" : "تسجيل الدخول"}
            </button>
          </p>
        </div>
      </div>

      {/* Left Column: Visual Showcase */}
      <div className="hidden w-1/2 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 md:flex lg:w-7/12 relative overflow-hidden flex-col items-center justify-center text-white border-s border-emerald-900/50">
        <div className="relative z-10 p-12 text-center max-w-xl space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/30 text-emerald-400">
            <Sprout className="h-10 w-10" />
          </div>
          <h2 className="font-display text-4xl font-extrabold text-white leading-tight">
            "حصادي لإدارة المزارع والعمالة أونلاين وبدون إنترنت"
          </h2>
          <p className="text-base text-emerald-100/90 leading-relaxed font-medium">
            النظام الرقمي الأول المصمم لحفظ حقوق الفلاح والمزارع، وحساب يوميات عمالة الغيط ومقاول الأنفار بدقة، ومتابعة الديون والنوتة تلقائياً.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-8 h-8 animate-spin text-crop-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
