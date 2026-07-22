"use client";

import { useState } from "react";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { useFarms } from "@/lib/hooks/use-farms";
import { useLands } from "@/lib/hooks/use-lands";
import { useSeasons } from "@/lib/hooks/use-seasons";
import { useAuth } from "@/lib/providers/auth-provider";
import { useOwnerProfile } from "@/lib/hooks/use-owner";
import { useDashboardData, type DashboardDateRange } from "@/lib/hooks/use-dashboard-data";
import { useCrops } from "@/lib/hooks/use-crops";
import { useCropCycles } from "@/lib/hooks/use-crop-cycles";
import { useWorkers } from "@/lib/hooks/use-workers";
import { useEquipment } from "@/lib/hooks/use-equipment";
import { useNotificationEngine, useNotifications, useNotificationsActions } from "@/lib/hooks/use-notifications";
import type { IconType } from "@/components/ui/icons";
import { useCurrency } from "@/lib/hooks/use-currency";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { CashflowChart, CropDistributionChart, ExpenseCategoriesChart } from "@/components/dashboard/dashboard-charts";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DashboardDateRange>("all");
  const [customDateRange, setCustomDateRange] = useState<{ start?: string, end?: string }>({});
  const [isAllAlertsOpen, setIsAllAlertsOpen] = useState(false);
  
  const { data: farms, isLoading } = useFarms();
  const { data: lands, isLoading: loadingLands } = useLands();
  const { data: seasons, isLoading: loadingSeasons } = useSeasons();
  const { user } = useAuth();
  const { data: owner } = useOwnerProfile();
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboardData(dateRange, customDateRange);
  const { data: allCrops } = useCrops();
  const { data: cropCycles } = useCropCycles();
  const { data: workers } = useWorkers();
  const { data: equipmentList } = useEquipment();
  const { formatMoney } = useCurrency();

  const farm = farms?.[0];
  useNotificationEngine(farm?.id || "");
  const { data: notifications } = useNotifications(farm?.id || "");
  const { markAsRead } = useNotificationsActions();

  const openSeasons = seasons?.filter((s) => s.status === "مفتوح").length ?? 0;
  const userName = owner?.name || user?.displayName || user?.email?.split('@')[0] || "صديقنا";
  const currentDate = new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  const totalRevenues = dashboardData?.totalRevenues || 0;
  const totalExpenses = dashboardData?.totalExpenses || 0;
  const cropsCount = dashboardData?.cropCyclesCount || 0;
  
  const activeWorkersCount = workers?.filter(w => w.status === "نشط").length ?? 0;
  const activeEquipmentCount = equipmentList?.filter(e => e.status !== "معطل").length ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1 md:px-0">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
            مرحباً {userName} <span className="text-2xl animate-wave">👋</span>
          </h2>
          <p className="text-ink-muted mt-1 text-sm">إليك نظرة عامة على مزرعتك اليوم</p>
        </div>
        <div className="flex items-center gap-2">
          {dateRange === "custom" ? (
             <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={customDateRange.start || ""} 
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="bg-paper-sunken border border-border/50 text-sm font-medium rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-ink-muted text-sm">-</span>
                <input 
                  type="date" 
                  value={customDateRange.end || ""} 
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="bg-paper-sunken border border-border/50 text-sm font-medium rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                />
             </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-ink-muted">
              <Icons.CalendarRange className="h-4 w-4" />
              <span>اليوم، {currentDate}</span>
            </div>
          )}
          <div className="w-[180px]">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DashboardDateRange)}
              className="bg-paper-sunken border-border/50 text-sm font-medium"
            >
              <option value="all">كل الأوقات</option>
              <option value="today">اليوم</option>
              <option value="this_month">هذا الشهر</option>
              <option value="last_3_months">آخر 3 أشهر</option>
              <option value="last_6_months">آخر 6 أشهر</option>
              <option value="this_year">هذا العام</option>
              <option value="custom">تاريخ مخصص...</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Row 1: 6 Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-3 md:p-4 transition-transform hover:scale-[1.02] flex flex-col justify-between">
          <p className="text-sm font-medium text-ink-muted mb-2">إجمالي الإيرادات</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="tabular font-display text-xl lg:text-2xl font-bold text-ink">
                {isLoadingDashboard ? "-" : formatMoney(totalRevenues)}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-bg text-success">
              <Icons.ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[10px] text-success mt-2 font-medium flex items-center gap-0.5 opacity-0">
            <Icons.TrendingUp className="h-3 w-3" />
            +12% عن الشهر الماضي
          </p>
        </div>

        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-3 md:p-4 transition-transform hover:scale-[1.02] flex flex-col justify-between">
          <p className="text-sm font-medium text-ink-muted mb-2">إجمالي الإنفاق</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="tabular font-display text-xl lg:text-2xl font-bold text-ink">
                {isLoadingDashboard ? "-" : formatMoney(totalExpenses)}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-danger-bg text-danger">
              <Icons.ArrowUpRight className="h-4 w-4 rotate-90" />
            </div>
          </div>
          <p className="text-[10px] text-danger mt-2 font-medium flex items-center gap-0.5 opacity-0">
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
              <p className="tabular font-display text-xl lg:text-2xl font-bold text-ink">
                {isLoadingDashboard ? "-" : cropsCount}
              </p>
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
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-4 md:p-5 flex flex-col h-[380px]">
          <h3 className="text-base font-bold text-ink mb-2 text-center font-display">توزيع المحاصيل (بالمساحة)</h3>
          <div className="flex-1 w-full h-full relative -ms-2">
            <CropDistributionChart data={dashboardData?.cropDistributionData || []} />
          </div>
        </div>

        {/* Activity Overview */}
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-4 md:p-5 lg:col-span-2 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-ink font-display">التدفقات النقدية (الإيرادات والمصروفات)</h3>
          </div>
          
          <div className="flex-1 w-full h-full relative" dir="ltr">
            <CashflowChart data={dashboardData?.cashflowData || []} />
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-4 md:p-5 flex flex-col h-[380px]">
          <h3 className="text-base font-bold text-ink mb-2 text-center font-display">تحليل المصروفات</h3>
          <div className="flex-1 w-full h-full relative -ms-2">
            <ExpenseCategoriesChart data={dashboardData?.expensesByCategoryData || []} />
          </div>
        </div>
      </div>

      {/* Row 3: Tasks and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:p-4">
        {/* Today's Tasks */}
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
            <h3 className="font-display text-base font-bold text-ink">مهام اليوم</h3>
            <Link href="/operations" className="text-xs font-medium text-sky-500 hover:text-sky-600 transition-colors">عرض الجدولة</Link>
          </div>
          <div className="space-y-3">
            {isLoadingDashboard ? (
              <p className="text-sm text-ink-muted text-center py-4">جاري التحميل...</p>
            ) : !dashboardData?.todayTasks || dashboardData.todayTasks.length === 0 ? (
              <div className="text-center py-6 bg-paper-sunken/30 rounded-xl border border-border/30 border-dashed">
                <Icons.CheckCircle className="w-8 h-8 mx-auto text-success/50 mb-2" />
                <p className="text-sm text-ink-muted">لا توجد مهام مجدولة لهذا اليوم.</p>
              </div>
            ) : (
              dashboardData.todayTasks.slice(0, 5).map((task: any, i: number) => (
                <div key={i} className={`flex items-center gap-3 bg-paper-sunken/20 hover:bg-paper-sunken/50 transition-colors p-3 rounded-xl border border-border/30 border-s-4 border-s-primary`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-primary/10 text-primary`}>
                    <Icons.Activity className="h-4 w-4" />
                  </div>
                  <div className={`flex-1`}>
                    <p className="text-sm font-medium text-ink line-clamp-1">{task.title}</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">{task.type} - {task.cropName}</p>
                  </div>
                  <Link href={`/operations?new=true&type=${task.type}&farmId=${task.farmId}`} className="text-[10px] font-bold bg-primary text-white px-2 py-1.5 rounded hover:bg-primary-hover transition-colors shrink-0">
                    تنفيذ
                  </Link>
                </div>
              ))
            )}
            {(dashboardData?.todayTasks?.length ?? 0) > 5 && (
              <div className="text-center pt-2">
                 <Link href="/operations" className="text-xs font-bold text-primary hover:underline">
                   عرض كل المهام ({(dashboardData?.todayTasks?.length ?? 0)})
                 </Link>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-4 md:p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
            <h3 className="font-display text-base font-bold text-ink">التنبيهات الحالية</h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => notifications?.forEach(n => markAsRead.mutate(n.id))}
                className="text-xs font-medium text-ink-muted hover:text-ink transition-colors"
              >
                تحديد الكل كمقروء
              </button>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {!notifications ? (
              <p className="text-sm text-ink-muted text-center py-4">جاري التحميل...</p>
            ) : notifications.length === 0 ? (
              <div className="text-center py-6 bg-paper-sunken/30 rounded-xl border border-border/30 border-dashed h-full flex flex-col justify-center">
                <Icons.Bell className="w-8 h-8 mx-auto text-ink-faint mb-2" />
                <p className="text-sm text-ink-muted">لا توجد تنبيهات حالية.</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((alert: any) => {
                const color = alert.type === 'danger' ? 'text-danger bg-danger-bg' : alert.type === 'warning' ? 'text-warning bg-warning-bg' : 'text-sky-500 bg-sky-500/10';
                const borderColor = alert.type === 'danger' ? 'border-s-danger' : alert.type === 'warning' ? 'border-s-warning' : 'border-s-sky-500';
                const AlertWrapper = alert.actionUrl ? Link : "button";
                return (
                  <AlertWrapper 
                    key={alert.id} 
                    href={alert.actionUrl || "#"}
                    type={alert.actionUrl ? undefined : "button"}
                    className={`w-full flex items-center justify-between gap-3 bg-paper-sunken/20 hover:bg-paper-sunken/60 transition-all p-3 rounded-xl border border-border/30 border-s-4 ${borderColor} cursor-pointer hover:-translate-y-0.5 hover:shadow-sm text-right group`}
                  >
                    <div className={`flex-1 overflow-hidden`}>
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-sm font-bold text-ink truncate">{alert.title}</p>
                        {!alert.isRead && (
                           <span className="w-2 h-2 rounded-full bg-danger shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-ink-muted mt-1 truncate">{alert.message}</p>
                      <p className="text-[10px] text-ink-faint mt-1.5 font-medium">
                        {new Date(alert.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${color}`}>
                        <Icons.Bell className="h-4 w-4" />
                      </div>
                      {!alert.isRead && (
                        <div 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAsRead.mutate(alert.id); }} 
                          className="text-[10px] text-ink-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                        >
                          تجاهل
                        </div>
                      )}
                    </div>
                  </AlertWrapper>
                );
              })
            )}
            
            {(notifications?.length ?? 0) > 5 && (
              <div className="text-center pt-2 border-t border-border/30 mt-4">
                 <button onClick={() => setIsAllAlertsOpen(true)} className="text-xs font-bold text-primary hover:underline">
                   عرض كل التنبيهات ({(notifications?.length ?? 0)})
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Actions and Latest Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:p-4">
        
        {/* Quick Actions */}
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-4 md:p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
            <h3 className="font-display text-base font-bold text-ink">إجراءات سريعة</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2 flex-1">
            <Link href="/finance?tab=vouchers" className="flex flex-col items-center justify-center p-4 rounded-xl bg-paper border border-border/50 hover:border-primary hover:shadow-sm transition-all text-center gap-2 group h-full">
              <div className="bg-primary/10 text-primary p-2.5 rounded-full group-hover:scale-110 transition-transform">
                <Icons.Receipt className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-ink mt-1">سند جديد</span>
            </Link>
            
            <Link href="/operations" className="flex flex-col items-center justify-center p-4 rounded-xl bg-paper border border-border/50 hover:border-crop-500 hover:shadow-sm transition-all text-center gap-2 group h-full">
              <div className="bg-crop-500/10 text-crop-600 p-2.5 rounded-full group-hover:scale-110 transition-transform">
                <Icons.Activity className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-ink mt-1">عملية زراعية</span>
            </Link>
            
            <Link href="/sales" className="flex flex-col items-center justify-center p-4 rounded-xl bg-paper border border-border/50 hover:border-emerald-500 hover:shadow-sm transition-all text-center gap-2 group h-full">
              <div className="bg-emerald-500/10 text-emerald-600 p-2.5 rounded-full group-hover:scale-110 transition-transform">
                <Icons.TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-ink mt-1">فاتورة مبيعات</span>
            </Link>
            
            <Link href="/reports" className="flex flex-col items-center justify-center p-4 rounded-xl bg-paper border border-border/50 hover:border-amber-500 hover:shadow-sm transition-all text-center gap-2 group h-full">
              <div className="bg-amber-500/10 text-amber-600 p-2.5 rounded-full group-hover:scale-110 transition-transform">
                <Icons.FileText className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-ink mt-1">التقارير</span>
            </Link>
          </div>
        </div>

        {/* Latest Operations */}
        <div className="bg-paper-raised border border-border/50 shadow-sm rounded-2xl p-4 md:p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
            <h3 className="font-display text-base font-bold text-ink">آخر العمليات الزراعية</h3>
            <Link href="/operations" className="text-xs font-medium text-sky-500 hover:text-sky-600 transition-colors">عرض الكل</Link>
          </div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm text-right min-w-[500px]">
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
                {isLoadingDashboard ? (
                  <tr><td colSpan={5} className="text-center py-4 text-ink-muted">جاري التحميل...</td></tr>
                ) : !dashboardData?.latestOperations || dashboardData.latestOperations.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-ink-muted">لا توجد عمليات مسجلة</td></tr>
                ) : (
                  dashboardData.latestOperations.map((row, i) => {
                    const farmName = farms?.find(f => f.id === row.farmId)?.name || 'غير معروف';
                    const cycle = cropCycles?.find(c => c.id === row.cropCycleId);
                    const cropName = allCrops?.find(cr => cr.id === cycle?.cropId)?.name || 'غير معروف';
                    return (
                      <tr key={row.id || i} className="hover:bg-paper-sunken/30 transition-colors">
                        <td className="py-3 font-medium text-ink">{row.operationType}</td>
                        <td className="py-3 text-ink-muted">{farmName}</td>
                        <td className="py-3 text-ink-muted">{cropName}</td>
                        <td className="py-3 text-ink-muted" dir="ltr">{new Date(row.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="py-3 text-center">
                          <span className="inline-flex text-[10px] font-bold bg-success-bg/50 text-success border border-success/20 px-2 py-0.5 rounded-full">
                            مكتملة
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <Dialog
        open={isAllAlertsOpen}
        onClose={() => setIsAllAlertsOpen(false)}
        title="كل التنبيهات"
        description="جميع التنبيهات الواردة لحسابك مقسمة حسب الأهمية."
        className="max-w-3xl"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1 mt-4">
          <div className="flex justify-end mb-4">
             <button 
                onClick={() => notifications?.forEach(n => markAsRead.mutate(n.id))}
                className="text-sm font-bold text-sky-500 hover:text-sky-600 transition-colors"
              >
                تحديد الكل كمقروء
              </button>
          </div>
          {!notifications || notifications.length === 0 ? (
             <div className="text-center py-10">
               <Icons.Bell className="w-12 h-12 mx-auto text-ink-faint mb-3" />
               <p className="text-ink-muted">لا توجد تنبيهات متاحة.</p>
             </div>
          ) : (
            notifications.map((alert: any) => {
              const color = alert.type === 'danger' ? 'text-danger bg-danger-bg' : alert.type === 'warning' ? 'text-warning bg-warning-bg' : 'text-sky-500 bg-sky-500/10';
              const borderColor = alert.type === 'danger' ? 'border-s-danger' : alert.type === 'warning' ? 'border-s-warning' : 'border-s-sky-500';
              const AlertWrapper = alert.actionUrl ? Link : "button";
              
              return (
                <AlertWrapper 
                  key={alert.id} 
                  href={alert.actionUrl || "#"}
                  type={alert.actionUrl ? undefined : "button"}
                  className={`w-full flex items-center justify-between gap-4 bg-paper hover:bg-paper-sunken/60 transition-all p-4 rounded-xl border border-border/50 border-s-4 ${borderColor} cursor-pointer text-right group`}
                >
                  <div className={`flex-1 overflow-hidden`}>
                    <div className="flex items-center gap-3">
                      <p className="text-base font-bold text-ink">{alert.title}</p>
                      {!alert.isRead && (
                         <span className="text-[10px] font-bold bg-danger/10 text-danger px-2 py-0.5 rounded-full">جديد</span>
                      )}
                    </div>
                    <p className="text-sm text-ink-muted mt-1">{alert.message}</p>
                    <p className="text-xs text-ink-faint mt-2 font-medium">
                      {new Date(alert.createdAt).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${color}`}>
                      <Icons.Bell className="h-5 w-5" />
                    </div>
                    {!alert.isRead && (
                      <div 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAsRead.mutate(alert.id); }} 
                        className="text-xs font-bold text-ink-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                      >
                        تجاهل
                      </div>
                    )}
                  </div>
                </AlertWrapper>
              );
            })
          )}
        </div>
      </Dialog>
    </div>
  );
}
