"use client";

import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { useFarms } from "@/lib/hooks/use-farms";
import { useLands } from "@/lib/hooks/use-lands";
import { useSeasons } from "@/lib/hooks/use-seasons";
import { useAuth } from "@/lib/providers/auth-provider";
import { useOwnerProfile } from "@/lib/hooks/use-owner";
import type { IconType } from "@/components/ui/icons";

export default function DashboardPage() {
  const { data: farms, isLoading } = useFarms();
  const { data: lands, isLoading: loadingLands } = useLands();
  const { data: seasons, isLoading: loadingSeasons } = useSeasons();
  const { user } = useAuth();
  const { data: owner } = useOwnerProfile();

  const openSeasons = seasons?.filter((s) => s.status === "مفتوح").length ?? 0;
  const userName = owner?.name || user?.displayName || user?.email?.split('@')[0] || "صديقنا";
  const currentDate = new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1 md:px-0">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
            مرحباً {userName} <span className="text-2xl animate-wave">👋</span>
          </h2>
          <p className="text-ink-muted mt-1 text-sm">إليك نظرة عامة على مزرعتك اليوم</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-paper-sunken/30 px-3 py-2 text-sm text-ink-muted">
          <Icons.CalendarRange className="h-4 w-4" />
          <span>اليوم، {currentDate}</span>
          <Icons.ChevronDown className="h-4 w-4 ms-2" />
        </div>
      </div>

      {/* Row 1: 6 Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-3 md:p-4 transition-transform hover:scale-[1.02] flex flex-col justify-between">
          <p className="text-sm font-medium text-ink-muted mb-2">إجمالي الإيرادات</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="tabular font-display text-xl lg:text-2xl font-bold text-ink">178,450</p>
              <p className="text-[10px] text-ink-faint">ج.م</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-bg text-success">
              <Icons.ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[10px] text-success mt-2 font-medium flex items-center gap-0.5">
            <Icons.TrendingUp className="h-3 w-3" />
            +12% عن الشهر الماضي
          </p>
        </div>

        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-3 md:p-4 transition-transform hover:scale-[1.02] flex flex-col justify-between">
          <p className="text-sm font-medium text-ink-muted mb-2">إجمالي الإنفاق</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="tabular font-display text-xl lg:text-2xl font-bold text-ink">125,750</p>
              <p className="text-[10px] text-ink-faint">ج.م</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-danger-bg text-danger">
              <Icons.ArrowUpRight className="h-4 w-4 rotate-90" />
            </div>
          </div>
          <p className="text-[10px] text-danger mt-2 font-medium flex items-center gap-0.5">
            <Icons.TrendingUp className="h-3 w-3 rotate-90" />
            +8% عن الشهر الماضي
          </p>
        </div>

        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-3 md:p-4 transition-transform hover:scale-[1.02] flex flex-col justify-between">
          <p className="text-sm font-medium text-ink-muted mb-2">المواسم النشطة</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="tabular font-display text-xl lg:text-2xl font-bold text-ink">{loadingSeasons ? "-" : openSeasons}</p>
              <p className="text-[10px] text-ink-faint">موسم</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-wheat-100/50 text-wheat-600">
              <Icons.CalendarRange className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-3 md:p-4 transition-transform hover:scale-[1.02] flex flex-col justify-between">
          <p className="text-sm font-medium text-ink-muted mb-2">المحاصيل الحالية</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="tabular font-display text-xl lg:text-2xl font-bold text-ink">12</p>
              <p className="text-[10px] text-ink-faint">محصول</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-crop-50/50 text-crop-600">
              <Icons.Crops className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-3 md:p-4 transition-transform hover:scale-[1.02] flex flex-col justify-between">
          <p className="text-sm font-medium text-ink-muted mb-2">إجمالي الأراضي</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="tabular font-display text-xl lg:text-2xl font-bold text-ink">{loadingLands ? "-" : (lands?.length ?? 0)}</p>
              <p className="text-[10px] text-ink-faint">قطعة أرض</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
              <Icons.Lands className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-3 md:p-4 transition-transform hover:scale-[1.02] flex flex-col justify-between">
          <p className="text-sm font-medium text-ink-muted mb-2">إجمالي المزارع</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="tabular font-display text-xl lg:text-2xl font-bold text-ink">{isLoading ? "-" : (farms?.length ?? 0)}</p>
              <p className="text-[10px] text-ink-faint">مزرعة</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-crop-50/50 text-crop-600">
              <Icons.Farms className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts and Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:p-4">
        {/* Crop Distribution */}
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-4 md:p-5 flex flex-col">
          <h3 className="text-base font-bold text-ink mb-4 text-center font-display">توزيع المحاصيل</h3>
          <div className="flex-1 flex items-center justify-center relative my-4">
            {/* Dummy Donut Chart */}
            <div className="w-32 h-32 rounded-full border-[12px] border-border"
                 style={{ 
                   background: "conic-gradient(var(--color-crop-500) 0% 30%, var(--color-wheat-500) 30% 55%, var(--color-soil-500) 55% 75%, var(--color-danger) 75% 90%, var(--color-sky-500) 90% 100%)",
                   WebkitMask: "radial-gradient(transparent 55%, black 56%)",
                   mask: "radial-gradient(transparent 55%, black 56%)"
                 }}
            ></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-ink">12</span>
              <span className="text-[10px] text-ink-muted">محصول</span>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            {[
              { label: "القمح", value: "30%", color: "bg-crop-500" },
              { label: "الذرة", value: "25%", color: "bg-wheat-500" },
              { label: "البطاطس", value: "20%", color: "bg-soil-500" },
              { label: "الطماطم", value: "15%", color: "bg-danger" },
              { label: "محاصيل أخرى", value: "10%", color: "bg-sky-500" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.color}`}></span>
                  <span className="text-ink-muted">{item.label}</span>
                </div>
                <span className="tabular font-medium text-ink">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Overview */}
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-4 md:p-5 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-ink font-display">نظرة عامة على الأنشطة</h3>
            <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-paper-sunken/30 px-2 py-1 text-xs text-ink-muted cursor-pointer hover:bg-paper-sunken transition-colors">
              هذا الأسبوع
              <Icons.ChevronDown className="h-3 w-3 ms-1" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-end relative mt-6 min-h-[160px]">
            {/* Dummy Line Chart SVG */}
            <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0 overflow-visible">
              <path d="M0,80 L50,40 L100,50 L150,20 L200,30 L250,15 L300,45 L350,10 L400,35" fill="none" stroke="var(--color-crop-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M0,90 L50,75 L100,80 L150,60 L200,70 L250,55 L300,75 L350,45 L400,65" fill="none" stroke="var(--color-ink-muted)" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              {/* Dots */}
              {[
                { x: 0, y: 80 }, { x: 50, y: 40 }, { x: 100, y: 50 }, { x: 150, y: 20 }, 
                { x: 200, y: 30 }, { x: 250, y: 15 }, { x: 300, y: 45 }, { x: 350, y: 10 }, { x: 400, y: 35 }
              ].map((dot, i) => (
                <circle key={i} cx={dot.x} cy={dot.y} r="4" fill="var(--color-crop-500)" stroke="var(--color-paper)" strokeWidth="2" />
              ))}
            </svg>
            
            {/* X-axis labels */}
            <div className="flex justify-between text-[10px] text-ink-faint mt-4 border-t border-border/30 pt-2 z-10">
              <span>السبت</span>
              <span>الأحد</span>
              <span>الاثنين</span>
              <span>الثلاثاء</span>
              <span>الأربعاء</span>
              <span>الخميس</span>
              <span>الجمعة</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/30 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-crop-500"></span>
              <span className="text-ink-muted">العمليات المكتملة</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-ink-muted"></span>
              <span className="text-ink-muted">العمليات المخططة</span>
            </div>
          </div>
        </div>

        {/* Weather */}
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-4 md:p-5 flex flex-col justify-between">
          <h3 className="text-base font-bold text-ink mb-2 text-center font-display">حالة الطقس</h3>
          <div className="flex items-center justify-center gap-3 md:p-4 py-4">
            <Icons.Sun className="h-16 w-16 text-wheat-500 drop-shadow-md" />
            <div className="text-center">
              <p className="tabular font-display text-4xl font-bold text-ink">28°</p>
              <p className="text-sm text-ink-muted">مشمس</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:p-4 mt-4">
            <div className="text-center bg-paper-sunken/40 rounded-xl p-2">
              <p className="text-[10px] text-ink-faint">الرياح</p>
              <p className="text-xs font-bold text-ink mt-0.5">18 كم/س</p>
            </div>
            <div className="text-center bg-paper-sunken/40 rounded-xl p-2">
              <p className="text-[10px] text-ink-faint">الرطوبة</p>
              <p className="text-xs font-bold text-ink mt-0.5">45%</p>
            </div>
          </div>
          
          <p className="text-xs text-ink-muted text-center mt-4 flex items-center justify-center gap-1">
            <Icons.MapPin className="h-3 w-3" />
            المنطقة: محافظة المنيا
          </p>
        </div>
      </div>

      {/* Row 3: Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:p-4">
        
        {/* Upcoming Tasks */}
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
            <h3 className="font-display text-base font-bold text-ink">المهام القادمة</h3>
            <button className="text-xs font-medium text-sky-500 hover:text-sky-600 transition-colors">عرض الكل</button>
          </div>
          <div className="space-y-3">
            {[
              { crop: "القمح", label: "ري محصول القمح", date: "2 مايو 2024", color: "bg-crop-50/50 text-crop-700 border-crop-200" },
              { crop: "الذرة", label: "تسميد الذرة", date: "3 مايو 2024", color: "bg-wheat-100/50 text-wheat-700 border-wheat-200" },
              { crop: "الطماطم", label: "مكافحة الآفات", date: "5 مايو 2024", color: "bg-danger-bg/50 text-danger border-danger/20" },
              { crop: "البطاطس", label: "حصاد البطاطس", date: "3 مايو 2024", color: "bg-soil-100/50 text-soil-700 border-soil-200" },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between bg-paper-sunken/20 hover:bg-paper-sunken/50 transition-colors p-3 rounded-xl border border-border/30">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${task.color}`}>{task.crop}</span>
                  <span className="text-sm font-medium text-ink">{task.label}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-ink-muted">
                  <Icons.CalendarRange className="h-3 w-3" />
                  {task.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Operations */}
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
            <h3 className="font-display text-base font-bold text-ink">آخر العمليات الزراعية</h3>
            <button className="text-xs font-medium text-sky-500 hover:text-sky-600 transition-colors">عرض الكل</button>
          </div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm text-right min-w-[300px]">
              <thead>
                <tr className="text-xs text-ink-muted border-b border-border/30">
                  <th className="pb-2 font-medium">العملية</th>
                  <th className="pb-2 font-medium">المزرعة</th>
                  <th className="pb-2 font-medium">المحصول</th>
                  <th className="pb-2 font-medium">التاريخ</th>
                  <th className="pb-2 font-medium text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {[
                  { op: "ري", farm: "مزرعة النخيل", crop: "القمح", date: "18 مايو", status: "مكتملة" },
                  { op: "تسميد", farm: "مزرعة السلام", crop: "الذرة", date: "17 مايو", status: "مكتملة" },
                  { op: "مبيدات", farm: "مزرعة الأمل", crop: "الطماطم", date: "16 مايو", status: "مكتملة" },
                  { op: "حرث", farm: "مزرعة الود", crop: "البطاطس", date: "15 مايو", status: "مكتملة" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-paper-sunken/30 transition-colors">
                    <td className="py-2.5 font-medium text-ink">{row.op}</td>
                    <td className="py-2.5 text-ink-muted">{row.farm}</td>
                    <td className="py-2.5 text-ink-muted">{row.crop}</td>
                    <td className="py-2.5 text-ink-muted">{row.date}</td>
                    <td className="py-2.5 text-center">
                      <span className="inline-flex text-[10px] font-bold bg-success-bg/50 text-success border border-success/20 px-2 py-0.5 rounded-full">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
            <h3 className="font-display text-base font-bold text-ink">تنبيهات</h3>
            <button className="text-xs font-medium text-sky-500 hover:text-sky-600 transition-colors">عرض الكل</button>
          </div>
          <div className="space-y-3">
            {[
              { label: "موعد ري محصول القمح في مزرعة النخيل", time: "بعد يوم واحد", color: "bg-sky-500 text-white", border: "border-s-sky-500" },
              { label: "انخفاض مخزون السماد في مزرعة السلام", time: "بعد يومين", color: "bg-wheat-500 text-white", border: "border-s-wheat-500" },
              { label: "موعد حصاد البطاطس قريباً", time: "بعد 5 أيام", color: "bg-crop-500 text-white", border: "border-s-crop-500" },
            ].map((alert, i) => (
              <div key={i} className={`flex items-center gap-3 bg-paper-sunken/20 hover:bg-paper-sunken/50 transition-colors p-3 rounded-xl border border-border/30 border-s-4 ${alert.border}`}>
                <div className={`flex-1`}>
                  <p className="text-sm font-medium text-ink">{alert.label}</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">{alert.time}</p>
                </div>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${alert.color}`}>
                  <Icons.Bell className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
