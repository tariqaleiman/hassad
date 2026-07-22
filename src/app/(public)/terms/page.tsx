import { Icons } from "@/components/ui/icons";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      <div className="space-y-4 border-b border-border pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200">
          <Icons.FileText className="w-4 h-4 text-emerald-600" />
          <span>شروط الخدمة والاستخدام العادل</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white">
          شروط استخدام منظومة حصادي
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base font-medium">
          يرجى قراءة هذه الشروط بعناية قبل البدء في استخدام الخدمات والتطبيقات الخاصة بـ حصادي.
        </p>
      </div>

      <div className="space-y-8 text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 rounded-full bg-emerald-500 inline-block" />
            1. ترخيص الاستخدام المجاني والمستثمر
          </h2>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
            يُمنح المزارع ترخيصاً فردياً شاملاً لاستخدام الوضع البسيط مجاناً مدى الحياة دون قيود على عدد العمليات المحلية أو عدد الديون المسجلة بالنوتة.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 rounded-full bg-emerald-500 inline-block" />
            2. مسؤولية إدخال البيانات ودقتها
          </h2>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
            المستخدم هو المسئول الوحيد عن صحة الأرقام المدخلة في يوميات العمالة وأجرة المقاولين وأسعار التقاوي والأسمدة. النظام يقدم حسابات آليّة دقيقة بناءً على المدخلات.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 rounded-full bg-emerald-500 inline-block" />
            3. التحديثات والتسليم المتواصل
          </h2>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
            تلتزم منصة حصادي بالتحديث والتطوير المستمر للنظام وإضافة المحاصيل والبرامج السمادية الجديدة، مع الحفاظ الكامل على سلامة البيانات السابقة.
          </p>
        </section>
      </div>

    </div>
  );
}
