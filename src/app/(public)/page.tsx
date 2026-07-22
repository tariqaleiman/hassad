import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { ModeSlider } from "@/components/public/mode-slider";

export default function LandingPage() {
  return (
    <div className="space-y-24 pb-20">
      
      {/* =======================================
          HERO SECTION
          ======================================= */}
      <section className="relative pt-12 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crop-100 dark:bg-crop-900/40 text-crop-800 dark:text-crop-300 border border-crop-200 dark:border-crop-800 text-xs font-bold mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <Icons.Sprout className="w-4 h-4 text-crop-600" />
          <span>نظام حصادي الزراعي المتكامل</span>
          <span className="w-1.5 h-1.5 rounded-full bg-crop-500" />
          <span>يعمل بدون إنترنت 100%</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-ink max-w-4xl mx-auto leading-[1.15] mb-6">
          النظام الزراعي الأذكى المصمم <span className="text-transparent bg-clip-text bg-gradient-to-r from-crop-600 to-emerald-500">لراحة الفلاح وتوسع الشركات</span>
        </h1>

        <p className="text-lg sm:text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          أدِر زرعتك، أرضك، مشترياتك، عمالتك، ومعداتك بسهولة متناهية. يعمل على الموبايل في الغيط وعلى جهاز الكمبيوتر مع دعم الحفظ المحلي والنوتة.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <Link href="/setup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-2xl px-8 py-7 text-lg shadow-xl shadow-crop-600/30 bg-crop-600 hover:bg-crop-700 text-white font-bold gap-3">
              <span>ابدأ تجربة النظام مجاناً</span>
              <Icons.ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </Button>
          </Link>

          <Link href="/contact" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl px-8 py-7 text-lg border-2 font-bold gap-2">
              <Icons.Phone className="w-5 h-5" />
              <span>طلب عرض توضيحي</span>
            </Button>
          </Link>
        </div>

        {/* Highlight Stats Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-border/40 text-start">
          <div className="p-4 rounded-2xl bg-paper-sunken/40 border border-border/50">
            <p className="text-2xl font-extrabold text-crop-600 font-display">100%</p>
            <p className="text-xs font-bold text-ink-muted">عمل محلي بدون إنترنت</p>
          </div>
          <div className="p-4 rounded-2xl bg-paper-sunken/40 border border-border/50">
            <p className="text-2xl font-extrabold text-crop-600 font-display">15 ثانية</p>
            <p className="text-xs font-bold text-ink-muted">تسجيل أي عملية أو يومية</p>
          </div>
          <div className="p-4 rounded-2xl bg-paper-sunken/40 border border-border/50">
            <p className="text-2xl font-extrabold text-crop-600 font-display">PDF / XLSX</p>
            <p className="text-xs font-bold text-ink-muted">تصدير التقارير والفواتير</p>
          </div>
          <div className="p-4 rounded-2xl bg-paper-sunken/40 border border-border/50">
            <p className="text-2xl font-extrabold text-crop-600 font-display">مرن ومجاني</p>
            <p className="text-xs font-bold text-ink-muted">للمزارع البسيط</p>
          </div>
        </div>
      </section>

      {/* =======================================
          INTERACTIVE MODE SLIDER SECTION
          ======================================= */}
      <section id="modes" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-ink mb-3">
            يتكيف مع حجم عملك بنقرة واحدة
          </h2>
          <p className="text-ink-muted text-base">
            سواء كنت مزارعاً فردياً تبحث عن البساطة، أو شركة زراعية تدير عدة فروع ومزارع، حصادي يفتح الوضع المناسب لك.
          </p>
        </div>

        <ModeSlider />
      </section>

      {/* =======================================
          CORE FEATURES GRID
          ======================================= */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-ink mb-3">
            كل ما يحتاجه الفلاح والمزرعة في مكان واحد
          </h2>
          <p className="text-ink-muted text-base">
            تصميم مستوحى من واقع السوق الزراعي العربي بعيداً عن الجمود المحاسبي والمصطلحات المعقدة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl bg-paper border border-border/80 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-crop-100 text-crop-700 dark:bg-crop-900/40 dark:text-crop-300 flex items-center justify-center">
              <Icons.Contractors className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-ink">إدارة العمالة ومقاول الأنفار</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              تسجيل يومية العمالة بضغطة زر. يحسب النظام تلقائياً (عدد العمال × اليومية + يومية المقاول) مع إمكانية الدفع نقداً أو التسجيل آجل في النوتة.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-3xl bg-paper border border-border/80 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 flex items-center justify-center">
              <Icons.Debts className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-ink">دفتر النوتة والديون</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              كشف حساب وافي يوضح ما عليك لبتوع المبيدات والعمال والمقاولين، وما لك عند التجار والوكالات، بلغة بسيطة وسهلة الفهم.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-3xl bg-paper border border-border/80 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 flex items-center justify-center">
              <Icons.Operations className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-ink">العملية الزراعية (مجمع التكاليف)</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              شاشة واحدة تدمج سحب الأسمدة والتقاوي من المخزن، تكلفة العمالة، ومصاريف جاز ماكينة الري وصيانة الجرار لتسجيل التكلفة بدقة.
            </p>
          </div>

        </div>
      </section>

      {/* =======================================
          CALL TO ACTION BANNER
          ======================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-crop-800 to-crop-950 text-white rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight">
              جاهز لتسهيل إدارة أرضك وزرعتك اليوم؟
            </h2>
            <p className="text-crop-100/80 text-base">
              انضم إلى آلاف المزارعين الذين يستخدمون حصادي لتوفير التكاليف وزيادة أرباح المحاصيل.
            </p>
            <div className="pt-4">
              <Link href="/setup">
                <Button size="lg" className="rounded-2xl px-10 py-7 text-lg bg-white text-crop-900 hover:bg-crop-50 font-extrabold shadow-xl">
                  ابدأ استخدام حصادي مجاناً
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
