"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sprout, Loader2 } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/providers/auth-provider";
import { isFirebaseConfigured } from "@/lib/firebase/client";

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        toast.success("تم تسجيل الدخول بنجاح");
      } else {
        if (!name.trim()) {
          toast.error("يرجى إدخال الاسم");
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

  return (
    <div className="flex min-h-dvh bg-paper text-ink transition-colors duration-300">
      {/* الجانب الأيمن (النموذج) */}
      <div className="flex w-full flex-col justify-center px-8 sm:px-12 md:w-1/2 lg:w-5/12 xl:px-24">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-10 flex flex-col items-start">
            <Logo className="mb-8 scale-110 origin-right" />
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
              {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              {mode === "signin" 
                ? "أدخل بياناتك للوصول إلى لوحة التحكم الخاصة بك."
                : "قم بإنشاء حسابك الآن للبدء في إدارة مزرعتك بذكاء."}
            </p>
          </div>

          {!isFirebaseConfigured && (
            <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-200/50 bg-amber-50 p-4 text-xs text-amber-900">
              <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="leading-relaxed">
                لم يتم ربط Firebase بعد. أضف الإعدادات في 
                <code className="mx-1 rounded-md bg-white/60 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-800">.env.local</code> 
                لتفعيل الدخول.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-ink">الاسم الكامل</Label>
                <Input
                  id="name"
                  type="text"
                  required={mode === "signup"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم"
                  className="h-12 rounded-xl bg-paper-sunken border-transparent focus:bg-white focus:border-crop-500/50 transition-all text-sm px-4"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-ink">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-xl bg-paper-sunken border-transparent focus:bg-white focus:border-crop-500/50 transition-all text-sm px-4"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-ink">كلمة المرور</Label>
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
                    className="text-xs font-medium text-crop-600 hover:text-crop-700 transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 rounded-xl bg-paper-sunken border-transparent focus:bg-white focus:border-crop-500/50 transition-all text-sm px-4"
              />
            </div>

            <Button 
              type="submit" 
              className="mt-4 h-12 w-full rounded-xl text-base font-bold transition-all active:scale-[0.98]" 
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

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-ink-faint dark:bg-black">أو</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-border bg-white text-sm font-medium transition-all hover:bg-paper-sunken active:scale-[0.98] dark:bg-black dark:hover:bg-white/5"
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

          <p className="mt-8 text-center text-sm text-ink-muted">
            {mode === "signin" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{" "}
            <button 
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-bold text-crop-600 hover:text-crop-700 hover:underline underline-offset-4"
            >
              {mode === "signin" ? "إنشاء حساب مجاني" : "تسجيل الدخول"}
            </button>
          </p>
        </div>
      </div>

      {/* الجانب الأيسر (صورة وتصميم) */}
      <div className="hidden w-1/2 bg-paper-sunken md:flex lg:w-7/12 relative overflow-hidden flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-crop-500/20 to-sky-500/20 mix-blend-multiply dark:mix-blend-overlay" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay dark:opacity-10 grayscale-[30%]" />
        
        <div className="relative z-10 p-12 text-center max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl shadow-2xl border border-white/20">
            <Sprout className="h-12 w-12 text-crop-600 dark:text-crop-400" />
          </div>
          <h2 className="font-display text-4xl font-bold text-crop-900 dark:text-white leading-tight mb-6">
            الإدارة الذكية لمزرعتك تبدأ من هنا
          </h2>
          <p className="text-lg text-crop-800/80 dark:text-white/70 leading-relaxed">
            نظام متكامل يتيح لك متابعة المحاصيل، إدارة المخزون، والسيطرة على الحسابات بكل سهولة وفي مكان واحد، مصمم خصيصاً للمزارع الحديث.
          </p>
        </div>
      </div>
    </div>
  );
}
