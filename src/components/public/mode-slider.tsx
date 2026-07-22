"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";

export function ModeSlider() {
  const [activeMode, setActiveMode] = useState<"simple" | "enterprise">("simple");

  return (
    <div className="w-full max-w-5xl mx-auto bg-paper-sunken/60 dark:bg-paper-sunken/20 p-6 sm:p-8 rounded-3xl border border-border/80 shadow-xl backdrop-blur-md">
      
      {/* Selector Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 rounded-2xl bg-paper border border-border shadow-inner gap-2">
          <button
            onClick={() => setActiveMode("simple")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeMode === "simple"
                ? "bg-crop-600 text-white shadow-md shadow-crop-600/30 scale-105"
                : "text-ink-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Icons.Sprout className="w-5 h-5" />
            <span>وضع المزارع البسيط</span>
          </button>

          <button
            onClick={() => setActiveMode("enterprise")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeMode === "enterprise"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105"
                : "text-ink-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Icons.Building className="w-5 h-5" />
            <span>وضع الشركات والشركاء</span>
          </button>
        </div>
      </div>

      {/* Animated Content Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Text Description */}
        <div className="space-y-4 text-start animate-in fade-in duration-300">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-crop-100 text-crop-800 dark:bg-crop-900/40 dark:text-crop-300 border border-crop-200 dark:border-crop-800">
            {activeMode === "simple" ? "سهولة مطلقة بدون تعقيد" : "إدارة مؤسسية شاملاً الفروع"}
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold font-display text-ink">
            {activeMode === "simple"
              ? "واجهة يومية فائقة البساطة للمزارع في الغيط"
              : "نظام ERP زراعي متكامل يدير آلاف الأفدنة والفروع"}
          </h3>

          <p className="text-ink-muted leading-relaxed text-base">
            {activeMode === "simple"
              ? "تخفي كل الشاشات المحاسبية المعقدة. يجيب المزارع فقط على: ماذا أفعل اليوم؟ كم صرفت على الزرعة والمقاول؟ ومن له فلوس عندي في النوتة؟"
              : "يوفر دليل حسابات كامل، شجرة أصول للمعدات، تعدد الفروع والمزارع، إدارة الهيكل الإداري، وسجل مراجعة الصلاحيات (RBAC)."
            }
          </p>

          <ul className="space-y-2.5 text-sm font-medium text-ink">
            {activeMode === "simple" ? (
              <>
                <li className="flex items-center gap-2 text-crop-700 dark:text-crop-400">
                  <Icons.CheckCircle className="w-4 h-4 text-crop-600 shrink-0" />
                  <span>تسجيل يومية مقاول الأنفار بضغطة زر واحدة (عدد العمال + الأجرة).</span>
                </li>
                <li className="flex items-center gap-2 text-crop-700 dark:text-crop-400">
                  <Icons.CheckCircle className="w-4 h-4 text-crop-600 shrink-0" />
                  <span>دفتر "النوتة والديون" التلقائي لكل التجار والعمال.</span>
                </li>
                <li className="flex items-center gap-2 text-crop-700 dark:text-crop-400">
                  <Icons.CheckCircle className="w-4 h-4 text-crop-600 shrink-0" />
                  <span>سحب أوتوماتيكي من المخزن عند تسجيل أي عملية زراعية.</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2 text-sky-700 dark:text-sky-400">
                  <Icons.CheckCircle className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>تعدد المزارع والأقسام الإدارية مع ربط الحسابات البنكية.</span>
                </li>
                <li className="flex items-center gap-2 text-sky-700 dark:text-sky-400">
                  <Icons.CheckCircle className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>تحديد أدوار طاقم العمل (مدير مزرعة، محاسب، ملاحظ غيط).</span>
                </li>
                <li className="flex items-center gap-2 text-sky-700 dark:text-sky-400">
                  <Icons.CheckCircle className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>تصدير ميزانيات عمومية وقوائم دخل وتصدير لـ Excel/Word.</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Visual Mockup Card */}
        <div className="bg-paper rounded-2xl p-5 border border-border shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
            </div>
            <span className="text-xs font-mono text-ink-muted">
              {activeMode === "simple" ? "Hassady - Simple Mode" : "Hassady - Enterprise Mode"}
            </span>
          </div>

          <div className="space-y-3 font-sans">
            <div className="bg-paper-sunken p-4 rounded-xl border border-border/50 flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-muted">الزرعة الحالية</p>
                <p className="font-bold text-ink text-base">طماطم عروة صيفي (أرض البحيرة)</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-crop-100 text-crop-800 dark:bg-crop-900/60 dark:text-crop-300">
                موسم 2026
              </span>
            </div>

            {activeMode === "simple" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-crop-50/50 dark:bg-crop-900/10 p-3 rounded-xl border border-crop-200/50">
                  <p className="text-xs text-crop-800 dark:text-crop-300">إجمالي المصروفات</p>
                  <p className="font-bold text-crop-700 text-lg">14,250 ج.م</p>
                </div>
                <div className="bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-200/50">
                  <p className="text-xs text-amber-800 dark:text-amber-300">النوتة (الديون)</p>
                  <p className="font-bold text-amber-700 text-lg">3,500 ج.م</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-paper-sunken p-2.5 rounded-lg text-center">
                  <p className="text-[10px] text-ink-muted">شجرة الحسابات</p>
                  <p className="font-bold text-xs text-ink">مكتملة</p>
                </div>
                <div className="bg-paper-sunken p-2.5 rounded-lg text-center">
                  <p className="text-[10px] text-ink-muted">المقاولون والعمال</p>
                  <p className="font-bold text-xs text-ink">12 مقاول</p>
                </div>
                <div className="bg-paper-sunken p-2.5 rounded-lg text-center">
                  <p className="text-[10px] text-ink-muted">الأرباح الصافية</p>
                  <p className="font-bold text-xs text-crop-600">+48,500</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
