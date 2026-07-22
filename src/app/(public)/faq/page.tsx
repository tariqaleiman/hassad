import { Icons } from "@/components/ui/icons";
import { FAQAccordion } from "@/components/public/faq-accordion";

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-center">
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200">
          <Icons.Info className="w-4 h-4 text-emerald-600" />
          <span>مركز الدعم والإجابات</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white">
          الأسئلة الأكثر شيوعاً حول حصادي
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base font-medium">
          إليك إجابات شافية لجميع الاستفسارات المتعلقة بالنظام البسيط، الديون والنوتة، والعمل بدون إنترنت.
        </p>
      </div>

      <FAQAccordion />
    </div>
  );
}
