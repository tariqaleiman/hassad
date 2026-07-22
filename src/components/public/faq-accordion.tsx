"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "هل يمكنني استخدام نظام حصادي بدون الاتصال بالإنترنت في الغيط؟",
    answer:
      "نعم 100%! نظام حصادي يدعم العمل المحلي الكامل (Offline-First). يمكنك تسجيل جميع عمليات الرش، التسميد، يوميات العمالة، وفواتير المشتريات والمبيعات من المزرعة بدون أي اتصال بالإنترنت، وعند الاتصال بإنترنت يتم المزامنة أوتوماتيكياً.",
  },
  {
    question: "كيف يتم حساب يومية مقاول الأنفار والعمالة؟",
    answer:
      "ببساطة شديدة تجعل العملية يستحيل فيها الخطأ: تدخل عدد العمال واليومية المتفق عليها، فيقوم حصادي تلقائياً بحساب (عدد العمال × اليومية + عمولة المقاول). يمكنك الدفع نقداً من الخزينة أو ترحيل المتبقي آجل في دفتر الديون بضغطة زر.",
  },
  {
    question: "ما الفرق بين الوضع البسيط للمزارع ووضع المؤسسات والشركات (ERP)؟",
    answer:
      "الوضع البسيط يُركز على المهمات اليومية والتكاليف المباشرة دون الدخول في مصطلحات محاسبية معقدة، بينما وضع المؤسسات يُوفر دليل حسابات كامل، إدارة شجرة الأصول للمعدات والآلات، إدارة الفروع المتعددة، ومصفوفة الصلاحيات (RBAC).",
  },
  {
    question: "هل يمكنني تصدير الفواتير والتقارير لمشاركتها مع المالك أو المحاسب؟",
    answer:
      "بالتأكيد! يمكنك تصدير كشوفات الحساب، تقارير المصروفات، وفواتير التوريد والبيع بصيغ PDF أو ملفات Excel (XLSX) شارحة ومعدّة للطباعة أو الإرسال المباشر عبر الواتساب.",
  },
  {
    question: "هل يمكنني تجربة النظام مجاناً قبل الاشتراك؟",
    answer:
      "نعم، يمكنك البدء في استخدام حصادي فوراً مجاناً دون الحاجة لإدخال أي بطاقة ائتمان أو بيانات سداد. يمكنك تجربة كافة المميزات وإعداد مزرعتك الأولى في أقل من دقيقة.",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {faqData.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-2xl bg-paper border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full p-5 sm:p-6 text-start flex items-center justify-between gap-4 cursor-pointer select-none touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-crop-100 text-crop-700 dark:bg-crop-900/50 dark:text-crop-300 flex items-center justify-center shrink-0">
                  <Icons.CheckCircle className="w-5 h-5 text-crop-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                  {item.question}
                </h3>
              </div>
              <div className={`p-2 rounded-full bg-paper-sunken text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180 bg-crop-500 text-white" : ""}`}>
                <Icons.ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {isOpen && (
              <div className="px-6 pb-6 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-4 sm:p-5 rounded-2xl bg-crop-50/70 dark:bg-crop-950/40 border border-crop-200/50 dark:border-crop-900/50 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
                  {item.answer}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
