import { Icons } from "@/components/ui/icons";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      
      <div className="border-b border-border/50 pb-6 text-start">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crop-100 dark:bg-crop-900/40 text-crop-800 dark:text-crop-300 text-xs font-bold border border-crop-200">
          <Icons.ShieldCheck className="w-4 h-4 text-crop-600" />
          <span>الخصوصية وأمان البيانات</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink mt-3">
          سياسة الخصوصية والتزام التخزين المحلي
        </h1>
        <p className="text-sm text-ink-muted mt-2">آخر تحديث: 22 يوليو 2026</p>
      </div>

      <div className="space-y-6 text-ink-muted leading-relaxed text-base">
        <h2 className="text-xl font-bold text-ink">1. الالتزام بخصوصية بيانات المزارع</h2>
        <p>
          تلتزم منصة <strong>حصادي (Hassady)</strong> بأعلى معايير حماية البيانات المالية والعمليات الزراعية الخاصة بك. نحن نؤمن بأن بيانات أرباحك ومحاصيلك وديونك هي ملك خالص لك وحدك.
        </p>

        <h2 className="text-xl font-bold text-ink">2. الحفظ المحلي والعمل بدون إنترنت (Local-First)</h2>
        <p>
          يعمل التطبيق على حفظ بياناتك محلياً على جهاز الكمبيوتر أو الهاتف الخاص بك بدون إجبار على رفع البيانات إلى السحابة. يمكنك اختيار مجلد حفظ البيانات التفضيل على جهازك.
        </p>

        <h2 className="text-xl font-bold text-ink">3. عدم مشاركة البيانات مع أي طرف ثالث</h2>
        <p>
          لا تقوم منصة حصادي ببيع، تأجير، أو مشاركة أي من بيانات مزارعك، حساباتك المالية، أسماء تجارك، أو إنتاجية أراضيك مع أي جهة تجارية أو حكومية أو إعلانية نهائياً.
        </p>
      </div>

    </div>
  );
}
