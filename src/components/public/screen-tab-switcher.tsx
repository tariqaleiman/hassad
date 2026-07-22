"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";

interface TabItem {
  id: string;
  label: string;
  icon: keyof typeof Icons;
  badge: string;
  title: string;
  description: string;
  stats: { label: string; value: string; color?: string }[];
  bulletPoints: string[];
  screenDetails: {
    tag: string;
    headline: string;
    items: { title: string; subtitle: string; amount?: string; status?: string }[];
  };
}

const tabsData: TabItem[] = [
  {
    id: "operations",
    label: "العملية الزراعية (مجمع التكاليف)",
    icon: "Operations",
    badge: "تجميع التكلفة الفعلية بضغطة زر",
    title: "شاشة واحدة تدمج مصاريف الري، السولار، التقاوي، والعمالة",
    description:
      "بدون الدخول في شجرة حسابات معقدة؛ تختار الزرعة والمحصول وتضيف العملية (رش، تسميد، ري، جني). يحسب النظام تكلفة العملية بالكامل ويخصم المدخلات من المخزن أوتوماتيكياً.",
    stats: [
      { label: "تكلفة العروة الحالية", value: "38,400 ج.م", color: "text-crop-600" },
      { label: "سحب أسمدة ومبيدات", value: "14,200 ج.م" },
      { label: "يوميات ري وعمالة", value: "9,600 ج.م" },
    ],
    bulletPoints: [
      "ربط السحب المباشر من مخزن الأسمدة بجرعة التسميد.",
      "حساب ساعات تشغيل الجرار أو ماكينة الري ولترات السولار.",
      "توليد تقرير تكلفة الفدان الواحد بنقرة واحدة.",
    ],
    screenDetails: {
      tag: "عملية زراعية حديثة #104",
      headline: "رش مبيد فِطري + تسميد ورقي (عروة البطاطس)",
      items: [
        { title: "سحب من المخزن: 2 شكارة يوريا + 1 لتر ريدوميل", subtitle: "خصم أوتوماتيكي من رصيد المخزن", amount: "2,400 ج.م" },
        { title: "يومية عمالة الرش (3 عمال)", subtitle: "دفعت نقداً من خزينة المزرعة", amount: "600 ج.م" },
        { title: "تشغيل ماكينة الري (5 ساعات سولار)", subtitle: "حساب التكلفة الساعية المباشرة", amount: "450 ج.م" },
      ],
    },
  },
  {
    id: "contractors",
    label: "يومية مقاول الأنفار والعمالة",
    icon: "Contractors",
    badge: "حساب آلي دقيق لعمالة الغيط",
    title: "سجل يوميات العمال وأجرة المقاولين دون خطأ واحد",
    description:
      "اكتب عدد العمال واليومية؛ يحسب النظام تلقائياً الإجمالي (عدد العمال × اليومية + عمولة المقاول). اختر الدفع نقداً من الخزينة أو ترحيل المتبقي آجل في النوتة.",
    stats: [
      { label: "إجمالي يومية اليوم", value: "4,500 ج.م", color: "text-amber-600" },
      { label: "عدد العمال المسجلين", value: "18 عامل" },
      { label: "المتبقي آجل في النوتة", value: "1,500 ج.م" },
    ],
    bulletPoints: [
      "حساب عمولة مقاول الأنفار تلقائياً لكل يومية.",
      "إمكانية تسديد جزء نقداً وتأجيل الباقي في دفتر الديون بنقرة.",
      "كشف حساب تفصيلي وصافي مستحقات لكل مقاول.",
    ],
    screenDetails: {
      tag: "يومية جني وتعبئة #88",
      headline: "كشف يومية: مقاول الأنفار (المعلم أبو العز)",
      items: [
        { title: "عدد العمال: 15 عامل × 200 ج.م يومية", subtitle: "إجمالي يوميات العمالة", amount: "3,000 ج.م" },
        { title: "أجرة ونقل المقاول (عمولة اليومية)", subtitle: "تضاف تلقائياً لحساب المقاول", amount: "500 ج.م" },
        { title: "المدفوع نقداً: 2,000 ج.م | المتبقي للنوتة: 1,500 ج.م", subtitle: "تحديث كشف حساب المقاول آلياً", status: "مرحل للنوتة" },
      ],
    },
  },
  {
    id: "debts",
    label: "دفتر النوتة والديون",
    icon: "Debts",
    badge: "كشف حساب بلغة الفلاح البسيطة",
    title: "متابعة ديون الموردين ومستحقات التجار بدقة متناهية",
    description:
      "تأطير واضح لما عليك لبتوع المبيدات والأسمدة والعمال، وما لك عند تجار الفاكهة والخضار والوكالات. كشف حساب ناصع يمنع اللبس والنسيان.",
    stats: [
      { label: "ديون الموردين (عليك)", value: "22,800 ج.م", color: "text-red-500" },
      { label: "مستحقات التجار (لك)", value: "45,000 ج.م", color: "text-emerald-500" },
      { label: "صافي المركز المالي", value: "+22,200 ج.م", color: "text-crop-600" },
    ],
    bulletPoints: [
      "تنبيهات تلقائية بمواعيد سداد أقساط الأسمدة والشكك.",
      "طباعة أو مشاركة كشف حساب PDF عبر الواتساب بنقرة.",
      "دعم المعاملات التبادلية (توريد محاصيل مقابل مدخلات).",
    ],
    screenDetails: {
      tag: "كشف حساب نوتة آجل",
      headline: "حساب محل الأسمدة والمبيدات (شركة النصر)",
      items: [
        { title: "فاتورة آجل #402: 10 شكاير نترات نشادر", subtitle: "تاريخ الاستحقاق: بعد شهرين", amount: "8,500 ج.م" },
        { title: "دفعة مسددة نقداً: 3,000 ج.م", subtitle: "خصم من إجمالي الدين المسجل", amount: "-3,000 ج.م" },
        { title: "الرصيد المتبقي المستحق بالنوتة", subtitle: "صافي الدين الحالي للمورد", amount: "5,500 ج.م" },
      ],
    },
  },
  {
    id: "inventory",
    label: "المخزن والمدخلات الزراعية",
    icon: "Inventory",
    badge: "جرد زراعي ذكي بدون هدر",
    title: "إدارة رصيد التقاوي، الأسمدة، والمبيدات مع تنبيهات صلاحية",
    description:
      "متابعة دقيقة لكل شكارة سماد ولتر مبيد في مخزنك. يتحدث الرصيد تلقائياً عند التوريد أو عند السحب في أي عملية زراعية بالغيط.",
    stats: [
      { label: "إجمالي قيمة المخزون", value: "84,000 ج.م" },
      { label: "أصناف وشكاير أسمدة", value: "32 صنف" },
      { label: "أصناف قربت تنتهي", value: "2 صنف", color: "text-amber-500" },
    ],
    bulletPoints: [
      "خصم أوتوماتيكي عند تسجيل أي رش أو تسميد بالمزرعة.",
      "تنبيهات فورية عند وصول أي صنف للحد الأدنى للجرد.",
      "تقارير متوسط سعر الشراء وإجمالي استهلاك الموسم.",
    ],
    screenDetails: {
      tag: "رصيد المخزن الحالي",
      headline: "مخزن الأسمدة والمبيدات (المزرعة الرئيسية)",
      items: [
        { title: "سماد نترات نشادر (46.5% نتروجين)", subtitle: "الرصيد: 45 شكارة | متوسط التكلفة: 850 ج.م", amount: "38,250 ج.م" },
        { title: "مبيد فطري (ريدوميل جولد 1 كجم)", subtitle: "الرصيد: 12 عبوة | التنبيه: رصيد آمن", amount: "7,200 ج.م" },
        { title: "تقاوي بطاطس هيرمس (مستورد)", subtitle: "الرصيد: 3 طن | تم التوريد للموسم", amount: "38,550 ج.م" },
      ],
    },
  },
];

export function ScreenTabSwitcher() {
  const [activeTabId, setActiveTabId] = useState("operations");
  const activeTab = tabsData.find((t) => t.id === activeTabId) || tabsData[0];
  const IconComponent = Icons[activeTab.icon];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10">
      
      {/* Interactive Pill Tabs Bar */}
      <div className="flex items-center justify-center">
        <div className="inline-flex flex-wrap items-center justify-center p-2 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner gap-2 max-w-full">
          {tabsData.map((tab) => {
            const Icon = Icons[tab.icon];
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                type="button"
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer select-none touch-manipulation ${
                  isActive
                    ? "bg-crop-600 text-white shadow-lg shadow-crop-600/30 scale-105"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content Grid Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Feature Details */}
        <div className="lg:col-span-5 space-y-6 text-start flex flex-col justify-center animate-in fade-in duration-300">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-crop-100 text-crop-800 dark:bg-crop-900/50 dark:text-crop-300 border border-crop-200 dark:border-crop-800 w-fit">
            <IconComponent className="w-4 h-4 text-crop-600" />
            <span>{activeTab.badge}</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white leading-snug">
            {activeTab.title}
          </h3>

          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base font-medium">
            {activeTab.description}
          </p>

          {/* Quick Bullet Points */}
          <ul className="space-y-3 pt-2 text-sm font-medium">
            {activeTab.bulletPoints.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200">
                <Icons.CheckCircle className="w-5 h-5 text-crop-500 shrink-0 mt-0.5" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
            {activeTab.stats.map((st, idx) => (
              <div key={idx} className="bg-paper-sunken/60 dark:bg-slate-900/60 p-3 rounded-2xl border border-border/50 text-start">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">{st.label}</p>
                <p className={`text-base font-extrabold font-display ${st.color || "text-slate-900 dark:text-white"}`}>
                  {st.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Live Interactive 3D Card Mockup */}
        <div className="lg:col-span-7 bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between group animate-in zoom-in-95 duration-300">
          
          {/* Top Browser Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Hassady System — Live Demo</span>
            </div>
          </div>

          {/* Mockup Header */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-400 font-bold tracking-wider uppercase block mb-1">
                {activeTab.screenDetails.tag}
              </span>
              <h4 className="font-extrabold text-white text-base sm:text-lg">
                {activeTab.screenDetails.headline}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-crop-600/30 border border-crop-500/40 flex items-center justify-center text-crop-400">
              <IconComponent className="w-5 h-5" />
            </div>
          </div>

          {/* Mockup Dynamic Items List */}
          <div className="space-y-3 flex-1 mb-6">
            {activeTab.screenDetails.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 hover:bg-slate-900 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <p className="font-bold text-slate-100 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.subtitle}</p>
                </div>
                {item.amount && (
                  <span className="font-extrabold text-emerald-400 text-sm whitespace-nowrap bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-800/30">
                    {item.amount}
                  </span>
                )}
                {item.status && (
                  <span className="font-bold text-amber-400 text-xs whitespace-nowrap bg-amber-950/50 px-3 py-1.5 rounded-xl border border-amber-800/30">
                    {item.status}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Mockup Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>محفوظ تلقائياً في السجل المحلي</span>
            <span className="font-bold text-emerald-400">جاهز للتصدير PDF / Excel</span>
          </div>

        </div>

      </div>

    </div>
  );
}
