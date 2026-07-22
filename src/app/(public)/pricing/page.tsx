"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Container Card Header */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-emerald-800/50 space-y-8 relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-emerald-800/60">
          <div className="space-y-3 text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 text-emerald-300 text-xs font-bold border border-emerald-700/50">
              <Icons.Finance className="w-4 h-4 text-emerald-400" />
              <span>خطط وأسعار حصادي البسيطة</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white">
              باقات مرنة ومناسبة لطبيعة مجالك
            </h1>
            <p className="text-emerald-200/80 text-sm sm:text-base font-medium max-w-xl">
              اختر خطة الأسعار التي تناسب حجم أرضك ومزرعتك، وابدأ مجاناً مع التجربة الفورية.
            </p>
          </div>

          <Link href="/setup" className="shrink-0">
            <Button size="lg" className="rounded-2xl px-8 py-6 text-base bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold shadow-xl">
              ابدأ التجربة المجانية الآن
            </Button>
          </Link>
        </div>

        {/* Billing Cycle Toggle Switch */}
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900/80 border border-emerald-800/60 shadow-inner gap-2">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/40"
                  : "text-emerald-200/80 hover:text-white"
              }`}
            >
              الخطط الشهرية
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
                billingCycle === "annual"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/40"
                  : "text-emerald-200/80 hover:text-white"
              }`}
            >
              <span>الخطط السنوية</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                توفير 20%
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          
          {/* Card 1: Free Starter */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden group">
            
            <div className="absolute top-0 start-0 bg-emerald-600 text-white text-[10px] font-extrabold px-4 py-1 rounded-br-2xl shadow-sm">
              تجربة 14 يوماً مجاناً
            </div>

            <div className="space-y-5 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Icons.Sprout className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">المزارع البسيط</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">الأرض الفردية والغيط</p>
              </div>

              <div className="space-y-1">
                <div className="text-4xl font-extrabold font-display text-slate-900 dark:text-white">
                  0 <span className="text-base font-bold text-slate-500">ج.م</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">مجاناً بالكامل للتجربة المحلية</p>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 pt-4 border-t border-slate-200 dark:border-slate-800">
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>وضع المزارع البسيط الكامل</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>تسجيل يومية العمالة والمقاولين</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>دفتر النوتة والديون المباشر</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>عمل محلي بدون إنترنت 100%</span>
                </li>
              </ul>
            </div>

            <Link href="/setup">
              <Button variant="outline" className="w-full rounded-2xl py-6 font-bold text-sm border-slate-300">
                ابدأ الباقة المجانية
              </Button>
            </Link>
          </div>

          {/* Card 2: Professional (Featured) */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-3xl border-2 border-emerald-500 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden group scale-105">
            
            <div className="absolute top-0 end-0 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-4 py-1.5 rounded-bl-2xl shadow-sm">
              الأكثر طلباً للمزارع
            </div>

            <div className="space-y-5 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <Icons.Finance className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">المستثمر والمزارع</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">المزارع المتوسطة والتجارية</p>
              </div>

              <div className="space-y-1">
                <div className="text-4xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">
                  {billingCycle === "annual" ? "99" : "125"} <span className="text-base font-bold text-slate-500">ج.م</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {billingCycle === "annual" ? "تُدفع سنوياً (توفير 20%)" : "شهرياً لكل مزرعة"}
                </p>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 pt-4 border-t border-slate-200 dark:border-slate-800">
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>جميع مميزات الباقة البسيطة</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>المزامنة السحابية بين الموبايل والكمبيوتر</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>تصدير التقارير (PDF, XLSX, Word)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>تنبيهات الأسمدة ومواعيد النوتة</span>
                </li>
              </ul>
            </div>

            <Link href="/setup">
              <Button className="w-full rounded-2xl py-6 font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30">
                ابدأ تجربتك المجانية الآن
              </Button>
            </Link>
          </div>

          {/* Card 3: Enterprise */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden group">
            
            <div className="space-y-5 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
                <Icons.Building className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">باقة الشركات (ERP)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">الشركات الزراعية وتعدد الفروع</p>
              </div>

              <div className="space-y-1">
                <div className="text-4xl font-extrabold font-display text-sky-600 dark:text-sky-400">
                  {billingCycle === "annual" ? "249" : "299"} <span className="text-base font-bold text-slate-500">ج.م</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {billingCycle === "annual" ? "تُدفع سنوياً لكل فرع" : "شهرياً لكل فرع"}
                </p>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 pt-4 border-t border-slate-200 dark:border-slate-800">
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>تعدد المزارع والفروع والأقسام</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>دليل حسابات وشجرة أصول للمعدات</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>مصفوفة الصلاحيات والتفويض (RBAC)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>دعم فني خاص ومدير حساب 24/7</span>
                </li>
              </ul>
            </div>

            <Link href="/contact">
              <Button variant="outline" className="w-full rounded-2xl py-6 font-bold text-sm border-sky-300 text-sky-700 dark:text-sky-400 hover:bg-sky-50">
                طلب عرض أسعار للشركات
              </Button>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
