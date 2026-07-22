import { Icons } from "@/components/ui/icons";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      <div className="space-y-4 border-b border-border pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200">
          <Icons.ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>سياسة الخصوصية والحفظ المحلي الشاملة</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white">
          خصوصية بياناتك ومزرعتك أمانة مقدسة
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base font-medium">
          آخر تحديث: يوليو 2026 — نلتزم بأعلى معايير الحماية والأمان البياني لكافة مزارعي مستخدمي منصة حصادي.
        </p>
      </div>

      <div className="space-y-8 text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 rounded-full bg-emerald-500 inline-block" />
            1. الحفظ المحلي الملكية الخاصة 100% (Local Storage & IndexedDB)
          </h2>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
            بيانات مزرعتك، سجلات العمالة، دفتر النوتة، والمصروفات تُحفظ بدايةً على ذاكرة متصفحك أو جهازك المحمول بأسلوب تشفير محلي. لا يتم إجبارك على نقل بياناتك لأي خادم خارجي إلا عند اختيارك صراحةً للمزامنة السحابية.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 rounded-full bg-emerald-500 inline-block" />
            2. حماية البيانات المشفرة
          </h2>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
            عند تفعيل المزامنة السحابية للنسخ الاحتياطي، يتم نقل البيانات عبر بروتوكولات مشفرة عالي الضمان (SSL/TLS 256-bit). نحن لا نبيع ولا نشارك أي معلومات مالية أو إنتاجية لأي طرف ثالث نهائياً.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 rounded-full bg-emerald-500 inline-block" />
            3. حقوق المستخرج والتصدير (Full Export Rights)
          </h2>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
            لك كامل الحق في تصدير جميع بياناتك في أي وقت بصيغة ملفات إكسيل (XLSX) أو تقارير PDF أو حذف حسابك وبياناتك كلياً بضغطة زر واحدة من شاشة الإعدادات.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 rounded-full bg-emerald-500 inline-block" />
            4. التواصل والاستفسار
          </h2>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
            لأي استفسار حول سياسة الخصوصية وأمان البيانات، يمكنك التواصل المباشر مع فريق الدعم الفني عبر الواتساب الرسمي أو صفحة تواصل معنا.
          </p>
        </section>
      </div>

    </div>
  );
}
