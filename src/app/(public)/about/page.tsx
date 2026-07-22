import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-crop-100 dark:bg-crop-900/40 text-crop-800 dark:text-crop-300 text-xs font-bold border border-crop-200">
          <Icons.Sprout className="w-4 h-4 text-crop-600" />
          <span>عن منصة حصادي الرقمية</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold font-display text-slate-900 dark:text-white leading-tight">
          صُمم بوعي من واقع الغيط العربي <span className="text-crop-600">ولراحة المزارع</span>
        </h1>
        <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed font-medium">
          منظومة حصادي هي المنصة الرقمية الأولى التي تدمج السهولة المطلقة لعمال المزارع مع القوة المحاسبية المتكاملة لإدارة كبرى الشركات والمستثمرين الزراعيين.
        </p>
      </div>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-paper p-8 rounded-3xl border border-border shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-crop-100 dark:bg-crop-900/50 text-crop-600 flex items-center justify-center">
            <Icons.Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">العمل محلياً 100% (Offline-First)</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
            نحن نعلم أن الغيط قد يفتقر للإنترنت. حصادي يحفظ جميع بياناتك ويحسب اليوميات والمصروفات على جهازك محلياً دون الحاجة لاتصال بالإنترنت.
          </p>
        </div>

        <div className="bg-paper p-8 rounded-3xl border border-border shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center">
            <Icons.Debts className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">لغة الفلاح البسيطة</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
            بدلاً من شجرة الحسابات المعقدة والقيود الصعبة، النظام يطرح أسئلة بسيطة: كم عاطيت للمقاول؟ ما السحب من الأسمدة؟ وما الدين المتبقي في النوتة؟
          </p>
        </div>

        <div className="bg-paper p-8 rounded-3xl border border-border shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 flex items-center justify-center">
            <Icons.Building className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">التكيف مع التوسع والشركات</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
            عندما تتوسع مزرعتك، ينفتح وضع المؤسسات (ERP) بضغطة زر واحدة لتوفير دليل حسابات، شجرة أصول، تعدد فروع، وتفويض الصلاحيات.
          </p>
        </div>
      </div>

      {/* Story Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white p-10 sm:p-16 rounded-3xl space-y-6 shadow-2xl border border-emerald-800/50">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-3xl font-extrabold font-display text-white">رؤيتنا: تمكين كل مزارع عربي بتقنية فاخرة ومجانية</h2>
          <p className="text-emerald-100 text-base sm:text-lg leading-relaxed font-medium">
            نهدف لإلغاء الدفاتر الورقية المعرضة للتلف والضياع، وتزويد كل صاحب مزرعة بأداة ذكية تحسب له صافي تكلفة الفدان وتوفر له آلاف الجنيهات في موسم الزراعة.
          </p>
          <div className="pt-4">
            <Link href="/setup">
              <Button size="lg" className="rounded-2xl px-8 py-6 text-base bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold shadow-xl">
                تجربة النظام الآن مجاناً
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
