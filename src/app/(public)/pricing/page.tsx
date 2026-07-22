import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-crop-100 dark:bg-crop-900/40 text-crop-800 dark:text-crop-300 text-xs font-bold border border-crop-200">
          <Icons.Finance className="w-4 h-4 text-crop-600" />
          <span>باقات الأسعار والتراخيص</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-ink">
          باقات مرنة تناسب المزارع الفردي والشركات
        </h1>
        <p className="text-ink-muted text-base">
          اختر الباقة المناسبة لحجم أرضك وعملك. يمكنك البدء مجاناً بالوضع البسيط محلياً 100%.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        
        {/* Tier 1: Free Simple Farmer */}
        <div className="bg-paper p-8 rounded-3xl border border-border/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-paper-sunken text-ink-muted border border-border">
              المزارع البسيط
            </span>
            <h3 className="text-2xl font-bold text-ink">الباقة المجانية</h3>
            <div className="text-3xl font-extrabold text-ink font-display">
              مجاناً <span className="text-xs font-normal text-ink-muted">مدى الحياة</span>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              مثالية للمزارع البسيط صاحب الأرض الفردية. تعمل محلياً 100% بدون إجبار على إنترنت.
            </p>

            <ul className="space-y-3 text-sm font-medium text-ink pt-4 border-t border-border/40">
              <li className="flex items-center gap-2"><Icons.CheckCircle className="w-4 h-4 text-crop-600 shrink-0" /> وضع المزارع البسيط الكامل</li>
              <li className="flex items-center gap-2"><Icons.CheckCircle className="w-4 h-4 text-crop-600 shrink-0" /> إدخال يوميات العمالة والمقاولين</li>
              <li className="flex items-center gap-2"><Icons.CheckCircle className="w-4 h-4 text-crop-600 shrink-0" /> دفتر النوتة والديون والعملات</li>
              <li className="flex items-center gap-2"><Icons.CheckCircle className="w-4 h-4 text-crop-600 shrink-0" /> حفظ محلي على الجهاز بدون إنترنت</li>
            </ul>
          </div>

          <Link href="/setup">
            <Button variant="outline" className="w-full rounded-2xl py-6 font-bold">
              ابدأ الباقة المجانية
            </Button>
          </Link>
        </div>

        {/* Tier 2: Professional Cloud Sync (Featured) */}
        <div className="bg-gradient-to-b from-crop-900 to-crop-950 text-white p-8 rounded-3xl border-2 border-crop-500 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-4 end-4 bg-crop-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            الأكثر شعبية
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-crop-200 border border-white/10">
              المستثمر الزراعي
            </span>
            <h3 className="text-2xl font-bold text-white">الباقة الاحترافية</h3>
            <div className="text-3xl font-extrabold text-white font-display">
              رمزي <span className="text-xs font-normal text-crop-200">سنوياً / للمزرعة</span>
            </div>
            <p className="text-sm text-crop-100/80 leading-relaxed">
              تتضمن النسخ الاحتياطي والمزامنة السحابية وتصدير التقارير بصيغ Word وExcel وPDF.
            </p>

            <ul className="space-y-3 text-sm font-medium text-white pt-4 border-t border-white/10">
              <li className="flex items-center gap-2"><Icons.CheckCircle className="w-4 h-4 text-crop-400 shrink-0" /> كل ميزات الباقة المجانية</li>
              <li className="flex items-center gap-2"><Icons.CheckCircle className="w-4 h-4 text-crop-400 shrink-0" /> المزامنة بين الموبايل والكمبيوتر</li>
              <li className="flex items-center gap-2"><Icons.CheckCircle className="w-4 h-4 text-crop-400 shrink-0" /> تصدير التقارير (PDF, XLSX, DOCX)</li>
              <li className="flex items-center gap-2"><Icons.CheckCircle className="w-4 h-4 text-crop-400 shrink-0" /> النسخ الاحتياطي السحابي التلقائي</li>
            </ul>
          </div>

          <Link href="/contact">
            <Button className="w-full rounded-2xl py-6 font-bold bg-crop-500 hover:bg-crop-400 text-white shadow-lg">
              اشترك في الباقة الاحترافية
            </Button>
          </Link>
        </div>

        {/* Tier 3: Enterprise */}
        <div className="bg-paper p-8 rounded-3xl border border-border/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200">
              الشركات والمزارع الكبرى
            </span>
            <h3 className="text-2xl font-bold text-ink">باقة الشركات</h3>
            <div className="text-3xl font-extrabold text-ink font-display">
              مخصص <span className="text-xs font-normal text-ink-muted">حسب عدد الفروع</span>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              مصممة للشركات الزراعية الكبرى التي تحتاج تعدد الفروع، الأدوار والتفويض، ودعم فني مخصص.
            </p>

            <ul className="space-y-3 text-sm font-medium text-ink pt-4 border-t border-border/40">
              <li className="flex items-center gap-2"><Icons.CheckCircle className="w-4 h-4 text-sky-600 shrink-0" /> تعدد المزارع والفروع غير المحدود</li>
              <li className="flex items-center gap-2"><Icons.CheckCircle className="w-4 h-4 text-sky-600 shrink-0" /> نظام الصلاحيات والتفويض الكامل (RBAC)</li>
              <li className="flex items-center gap-2"><Icons.CheckCircle className="w-4 h-4 text-sky-600 shrink-0" /> لوحة تحكم إدارية خاصة وتراخيص</li>
              <li className="flex items-center gap-2"><Icons.CheckCircle className="w-4 h-4 text-sky-600 shrink-0" /> مدير حساب ودعم فني مخصص 24/7</li>
            </ul>
          </div>

          <Link href="/contact">
            <Button variant="outline" className="w-full rounded-2xl py-6 font-bold border-sky-300 text-sky-700 hover:bg-sky-50">
              طلب عرض للشركات
            </Button>
          </Link>
        </div>

      </div>

    </div>
  );
}
