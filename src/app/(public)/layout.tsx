import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans selection:bg-crop-500/20 selection:text-crop-800">
      
      {/* =======================================
          PUBLIC NAVBAR / HEADER
          ======================================= */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#080d09]/80 backdrop-blur-xl border-b border-border/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
            <Logo showText={true} />
          </Link>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-700 dark:text-slate-200">
            <Link href="/" className="hover:text-crop-600 dark:hover:text-crop-400 transition-colors">
              الرئيسية
            </Link>
            <Link href="/#features" className="hover:text-crop-600 dark:hover:text-crop-400 transition-colors">
              المميزات
            </Link>
            <Link href="/#modes" className="hover:text-crop-600 dark:hover:text-crop-400 transition-colors">
              الوضع البسيط والاحترافي
            </Link>
            <Link href="/pricing" className="hover:text-crop-600 dark:hover:text-crop-400 transition-colors">
              باقات الأسعار
            </Link>
            <Link href="/blog" className="hover:text-crop-600 dark:hover:text-crop-400 transition-colors">
              المدونة والشروحات
            </Link>
            <Link href="/about" className="hover:text-crop-600 dark:hover:text-crop-400 transition-colors">
              عن حصادي
            </Link>
            <Link href="/contact" className="hover:text-crop-600 dark:hover:text-crop-400 transition-colors">
              تواصل معنا
            </Link>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex rounded-xl font-bold">
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/setup">
              <Button className="rounded-xl px-5 shadow-lg shadow-crop-600/25 bg-crop-600 hover:bg-crop-700 text-white font-bold gap-2">
                <span>ابدأ الآن مجاناً</span>
                <Icons.ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* =======================================
          PAGE CONTENT
          ======================================= */}
      <main className="flex-1">
        {children}
      </main>

      {/* =======================================
          PUBLIC FOOTER
          ======================================= */}
      <footer className="bg-[#05150a] text-white border-t border-crop-900/50 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-crop-900/60">
            
            {/* Column 1: Brand Info */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-crop-500 flex items-center justify-center text-white">
                  <Icons.Sprout className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold font-display tracking-tight text-white">حصادي</span>
              </div>
              <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
                النظام الزراعي الذكي الأسهل للمزارع البسيط والأقوى لشركات الزراعة. دير أرضك، عمالتك، ومصروفاتك في مكان واحد.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4 text-base">روابط سريعة</h4>
              <ul className="space-y-2.5 text-sm text-emerald-100/90 font-medium">
                <li><Link href="/" className="hover:text-crop-400 transition-colors">الرئيسية</Link></li>
                <li><Link href="/pricing" className="hover:text-crop-400 transition-colors">باقات الأسعار</Link></li>
                <li><Link href="/blog" className="hover:text-crop-400 transition-colors">مدونة وشروحات حصادي</Link></li>
                <li><Link href="/setup" className="hover:text-crop-400 transition-colors">تجربة النظام</Link></li>
              </ul>
            </div>

            {/* Column 3: Legal & Support */}
            <div>
              <h4 className="font-bold text-white mb-4 text-base">الدعم والسياسات</h4>
              <ul className="space-y-2.5 text-sm text-emerald-100/90 font-medium">
                <li><Link href="/contact" className="hover:text-crop-400 transition-colors">تواصل معنا والدعم الفني</Link></li>
                <li><Link href="/faq" className="hover:text-crop-400 transition-colors">الأسئلة الشائعة</Link></li>
                <li><Link href="/privacy" className="hover:text-crop-400 transition-colors">سياسة الخصوصية والحفظ المحلي</Link></li>
                <li><Link href="/terms" className="hover:text-crop-400 transition-colors">شروط الخدمة والترخيص</Link></li>
              </ul>
            </div>

            {/* Column 4: Contact & Social */}
            <div className="space-y-4">
              <h4 className="font-bold text-white text-base">تواصل فوري</h4>
              <p className="text-sm text-emerald-100/90 font-medium">فريق الدعم الفني جاهز للرد على جميع استفساراتك.</p>
              <div className="pt-2">
                <a
                  href="https://wa.me/201000000000"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md"
                >
                  <Icons.MessageSquare className="w-4 h-4" />
                  <span>تواصل عبر الواتساب</span>
                </a>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/80 font-medium gap-4 text-center">
            <p>© {new Date().getFullYear()} منصة حصادي (Hassady). جميع الحقوق محفوظة.</p>
            <p>صُمم بأعلى معايير الجودة لتسهيل حياة المزارع العربي.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Support Widget */}
      <a
        href="https://wa.me/201000000000"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 start-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-emerald-600/40 hover:scale-105 transition-all duration-300 border-2 border-white/20"
        title="تواصل مباشر مع فريق الدعم عبر الواتساب"
      >
        <Icons.MessageSquare className="w-5 h-5 shrink-0" />
        <span className="hidden sm:inline">الدعم الفني عبر الواتساب</span>
      </a>

    </div>
  );
}
