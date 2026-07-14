"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowRight, MapPin, Droplets, Pencil, Trash2, Sprout, Briefcase, 
  Handshake, Landmark, Plus, Scale, Info, Wheat, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

import { useLands, useUpdateLand, useDeleteLand } from "@/lib/hooks/use-lands";
import { useFarms } from "@/lib/hooks/use-farms";
import { useSeasons } from "@/lib/hooks/use-seasons";
import { useCropCycles } from "@/lib/hooks/use-crop-cycles";
import { useLandLeases, useCreateLandLease, useUpdateLandLease, useDeleteLandLease } from "@/lib/hooks/use-land-leases";
import { useCrops } from "@/lib/hooks/use-crops";

import { LandForm } from "@/components/lands/land-form";
import { LandLeaseForm } from "@/components/lands/land-lease-form";
import { CropCycleDetails } from "@/components/crops/crop-cycle-details";
import { formatDate, cn } from "@/lib/utils";
import type { OwnershipCategory } from "@/lib/types/land";
import type { CropCycle } from "@/lib/types/crop-cycle";
import type { LandLeaseOut } from "@/lib/types/land-lease";

type Tab = "crops" | "leases" | "info";

function LandDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [tab, setTab] = useState<Tab>("crops");
  
  // Data Fetching
  const { data: lands, isLoading: loadingLands } = useLands();
  const { data: farms, isLoading: loadingFarms } = useFarms();
  const { data: seasons, isLoading: loadingSeasons } = useSeasons();
  const { data: cropCycles, isLoading: loadingCycles } = useCropCycles();
  const { data: leases, isLoading: loadingLeases } = useLandLeases();
  const { data: crops, isLoading: loadingCrops } = useCrops();

  // Mutations
  const updateLand = useUpdateLand();
  const deleteLand = useDeleteLand();
  const createLease = useCreateLandLease();
  const updateLease = useUpdateLandLease();
  const deleteLease = useDeleteLandLease();

  // State
  const [formOpen, setFormOpen] = useState(false);
  const [deletingLand, setDeletingLand] = useState(false);
  
  const [leaseFormOpen, setLeaseFormOpen] = useState(false);
  const [editingLease, setEditingLease] = useState<LandLeaseOut | null>(null);
  const [deletingLease, setDeletingLease] = useState<LandLeaseOut | null>(null);
  const [endingLease, setEndingLease] = useState<LandLeaseOut | null>(null);

  const [viewingCycle, setViewingCycle] = useState<CropCycle | null>(null);

  // Derived Data
  const isLoading = loadingLands || loadingFarms || loadingSeasons || loadingCycles || loadingLeases || loadingCrops;
  const land = lands?.find((l) => l.id === id);
  const farm = farms?.find((f) => f.id === land?.farmId);
  const activeSeasons = seasons?.filter(s => s.status === "مفتوح") || [];
  
  // For remaining area calculation, we'll pick the first active season (or the user can select, but for now we default to first)
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(activeSeasons[0]?.id || "");
  const selectedSeason = seasons?.find(s => s.id === selectedSeasonId);

  const landCrops = useMemo(() => {
    return cropCycles?.filter(c => c.landId === id && c.seasonId === selectedSeasonId && c.status === "نشطة") || [];
  }, [cropCycles, id, selectedSeasonId]);

  const landLeases = useMemo(() => {
    return leases?.filter(l => l.landId === id && l.status === "نشط") || [];
  }, [leases, id]);

  const usedByCrops = useMemo(() => landCrops.reduce((acc, curr) => acc + (curr.areaInFeddan || 0), 0), [landCrops]);
  const usedByLeases = useMemo(() => {
    return landLeases.reduce((acc, curr) => {
      // If it's a yearly lease or a seasonal lease for this season (or without seasonId)
      if (curr.duration === "year" || (curr.duration === "season" && (!curr.seasonId || curr.seasonId === selectedSeasonId))) {
        return acc + (curr.areaInFeddan || 0);
      }
      return acc;
    }, 0);
  }, [landLeases, selectedSeasonId]);

  const totalAreaInFeddan = land?.areaInFeddan || 0;
  const availableAreaInFeddan = Math.max(0, totalAreaInFeddan - usedByCrops - usedByLeases);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8 text-crop-500" />
      </div>
    );
  }

  if (!land) {
    return (
      <EmptyState
        icon={MapPin}
        title="قطعة الأرض غير موجودة"
        description="ربما تم حذف هذه القطعة أو أن الرابط غير صحيح."
        action={
          <Link href="/lands">
            <Button>العودة للأراضي</Button>
          </Link>
        }
      />
    );
  }

  const getTenureDetails = (category: OwnershipCategory) => {
    switch (category) {
      case "owned_full": return { label: "مملوكة", icon: Landmark, color: "text-crop-600", bg: "bg-crop-50" };
      case "owned_partner": return { label: "مملوكة (شراكة)", icon: Handshake, color: "text-sky-600", bg: "bg-sky-50" };
      case "rented_cash": return { label: "إيجار نقدي", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" };
      case "rented_crop_share": return { label: "مزارعة (مشاركة)", icon: Sprout, color: "text-emerald-600", bg: "bg-emerald-50" };
      case "rented_partner": return { label: "مستأجرة (إدارة مشتركة)", icon: Handshake, color: "text-indigo-600", bg: "bg-indigo-50" };
      default: return { label: "غير محدد", icon: MapPin, color: "text-ink-muted", bg: "bg-paper-sunken" };
    }
  };
  const tenureInfo = getTenureDetails(land.tenure?.category || "owned_full");
  const TenureIcon = tenureInfo.icon;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link
            href="/lands"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink mb-4 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للأراضي
          </Link>
          <div className="flex items-center gap-3">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tenureInfo.bg} ${tenureInfo.color} shadow-sm border border-border/50`}>
              <TenureIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display text-ink tracking-tight">{land.name}</h1>
              <p className="text-sm text-ink-muted mt-1 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                المزرعة: {farm?.name || "غير محدد"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFormOpen(true)} className="gap-2">
            <Pencil className="h-4 w-4" />
            تعديل الأرض
          </Button>
          <Button variant="outline" onClick={() => setDeletingLand(true)} className="gap-2 text-danger hover:bg-danger/10 hover:text-danger hover:border-danger/30">
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>

      {/* Area Summary Cards */}
      <div className="bg-paper border border-border/50 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">ملخص المساحة والاستخدام</h2>
            <p className="text-sm text-ink-muted mt-1">توضيح لحالة استخدام الأرض في الموسم الحالي</p>
          </div>
          
          <div className="flex items-center gap-3 bg-paper-sunken p-1.5 rounded-xl border border-border/40">
            <span className="text-sm font-medium text-ink-muted px-2">الموسم:</span>
            <Select 
              value={selectedSeasonId} 
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              className="w-48 bg-paper border-border shadow-none h-8 text-xs font-medium"
            >
              {activeSeasons.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
              {activeSeasons.length === 0 && <option value="">لا يوجد مواسم مفتوحة</option>}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-paper-sunken rounded-2xl p-4 border border-border/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-slate-400 rounded-r-2xl opacity-50"></div>
            <p className="text-sm font-medium text-ink-muted mb-1 flex items-center gap-2">
              <Scale className="h-4 w-4" />
              المساحة الكلية
            </p>
            <p className="text-2xl font-bold font-display text-ink">{totalAreaInFeddan.toFixed(2)}</p>
            <p className="text-xs text-ink-muted mt-1">فدان</p>
          </div>

          <div className="bg-paper-sunken rounded-2xl p-4 border border-border/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-crop-500 rounded-r-2xl opacity-80"></div>
            <p className="text-sm font-medium text-ink-muted mb-1 flex items-center gap-2">
              <Wheat className="h-4 w-4 text-crop-500" />
              المزروعة بالمحاصيل
            </p>
            <p className="text-2xl font-bold font-display text-ink">{usedByCrops.toFixed(2)}</p>
            <p className="text-xs text-ink-muted mt-1">فدان</p>
          </div>

          <div className="bg-paper-sunken rounded-2xl p-4 border border-border/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500 rounded-r-2xl opacity-80"></div>
            <p className="text-sm font-medium text-ink-muted mb-1 flex items-center gap-2">
              <Handshake className="h-4 w-4 text-amber-500" />
              مؤجرة للغير
            </p>
            <p className="text-2xl font-bold font-display text-ink">{usedByLeases.toFixed(2)}</p>
            <p className="text-xs text-ink-muted mt-1">فدان</p>
          </div>

          <div className="bg-paper-sunken rounded-2xl p-4 border border-border/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-sky-500 rounded-r-2xl opacity-80"></div>
            <p className="text-sm font-medium text-ink-muted mb-1 flex items-center gap-2">
              <Sprout className="h-4 w-4 text-sky-500" />
              المساحة المتبقية
            </p>
            <p className="text-2xl font-bold font-display text-ink">{availableAreaInFeddan.toFixed(2)}</p>
            <p className="text-xs text-ink-muted mt-1">فدان (متاحة)</p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-6 flex h-3 w-full overflow-hidden rounded-full bg-paper-sunken border border-border/40">
          <div className="bg-crop-500 transition-all duration-500" style={{ width: `${totalAreaInFeddan > 0 ? (usedByCrops / totalAreaInFeddan) * 100 : 0}%` }} title="مزروعة"></div>
          <div className="bg-amber-400 transition-all duration-500" style={{ width: `${totalAreaInFeddan > 0 ? (usedByLeases / totalAreaInFeddan) * 100 : 0}%` }} title="مؤجرة للغير"></div>
          <div className="bg-sky-500 transition-all duration-500" style={{ width: `${totalAreaInFeddan > 0 ? (availableAreaInFeddan / totalAreaInFeddan) * 100 : 0}%` }} title="متبقية"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-border">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            onClick={() => setTab("crops")}
            className={cn(
              "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
              tab === "crops"
                ? "border-crop-500 text-crop-600"
                : "border-transparent text-ink-muted hover:border-border hover:text-ink"
            )}
          >
            المحاصيل الحالية
            <Badge variant="wheat" className="mr-2 px-1.5 py-0.5 text-[10px]">{landCrops.length}</Badge>
          </button>
          <button
            onClick={() => setTab("leases")}
            className={cn(
              "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
              tab === "leases"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-ink-muted hover:border-border hover:text-ink"
            )}
          >
            الإيجارات للغير
            <Badge variant="neutral" className="mr-2 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 border-amber-200">{landLeases.length}</Badge>
          </button>
          <button
            onClick={() => setTab("info")}
            className={cn(
              "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
              tab === "info"
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-ink-muted hover:border-border hover:text-ink"
            )}
          >
            بيانات وملكية الأرض
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {tab === "crops" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-ink">دورات المحاصيل النشطة</h3>
                <p className="text-sm text-ink-muted">المحاصيل المزروعة حالياً في هذه الأرض خلال الموسم المحدد.</p>
              </div>
              <Link href="/crops">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة دورة جديدة
                </Button>
              </Link>
            </div>
            
            {landCrops.length === 0 ? (
              <EmptyState
                icon={Wheat}
                title="لا توجد محاصيل"
                description="لم يتم تسجيل أي دورة محصول نشطة لهذه الأرض في هذا الموسم."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {landCrops.map(cycle => (
                  <Card key={cycle.id} className="group hover:shadow-md transition-shadow overflow-hidden rounded-2xl border-border/60">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-crop-50 rounded-xl flex items-center justify-center text-crop-600 border border-crop-100">
                            <Wheat className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-ink font-display text-base">{crops?.find(c => c.id === cycle.cropId)?.name || "دورة زراعية"}</h4>
                            <p className="text-xs text-ink-muted">{formatDate(cycle.createdAt || "")}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setViewingCycle(cycle)} className="h-8 px-2 text-ink-muted hover:text-ink">
                          <Info className="h-4 w-4 ml-1" />
                          التفاصيل
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-border/40 pb-2">
                          <span className="text-ink-muted">المساحة:</span>
                          <span className="font-semibold text-ink">{cycle.areaValue} {cycle.areaUnit === "feddan" ? "فدان" : cycle.areaUnit === "qirat" ? "قيراط" : "متر"}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/40 pb-2">
                          <span className="text-ink-muted">تاريخ الزراعة:</span>
                          <span className="font-medium text-ink">{cycle.plantDate ? formatDate(cycle.plantDate) : "—"}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-ink-muted">المعادل:</span>
                          <span className="font-bold text-crop-600">{cycle.areaInFeddan?.toFixed(2)} فدان</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "leases" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-ink">الإيجارات الصادرة (تأجير للغير)</h3>
                <p className="text-sm text-ink-muted">سجل الأجزاء التي قمت بتأجيرها من هذه الأرض لآخرين.</p>
              </div>
              <Button onClick={() => { setEditingLease(null); setLeaseFormOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                تأجير للغير
              </Button>
            </div>
            
            {landLeases.length === 0 ? (
              <EmptyState
                icon={Handshake}
                title="لا توجد إيجارات نشطة"
                description="لم تقم بتأجير أي جزء من هذه الأرض للغير حالياً."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {landLeases.map(lease => (
                  <Card key={lease.id} className="group relative hover:shadow-md transition-shadow overflow-hidden rounded-2xl border-border/60">
                    <CardContent className="p-0">
                      <div className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                        {lease.duration === "year" ? "إيجار سنوي" : "إيجار موسمي"}
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4 mt-2">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                              <Briefcase className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-ink text-lg">{lease.tenantName}</h4>
                              <p className="text-xs text-ink-muted">{lease.tenantPhone || "بدون رقم"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm bg-paper-sunken p-3 rounded-xl border border-border/40">
                          <div className="flex justify-between">
                            <span className="text-ink-muted">المساحة المؤجرة:</span>
                            <span className="font-bold text-ink">{lease.areaValue} {lease.areaUnit === "feddan" ? "فدان" : "قيراط"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-muted">قيمة الإيجار:</span>
                            <span className="font-bold text-amber-600">{lease.rentAmount.toLocaleString()} ج.م</span>
                          </div>
                          <div className="flex justify-between border-t border-border/40 pt-2 mt-2">
                            <span className="text-ink-muted">التاريخ:</span>
                            <span className="text-xs font-medium">{lease.startDate ? formatDate(lease.startDate) : "—"}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                          <Button variant="outline" size="sm" onClick={() => { setEditingLease(lease); setLeaseFormOpen(true); }} className="flex-1 px-1 text-ink-muted hover:text-ink">
                            <Pencil className="h-3.5 w-3.5 ml-1" />
                            تعديل
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEndingLease(lease)} className="flex-1 px-1 text-sky-600 hover:bg-sky-50 hover:text-sky-700 border-sky-200">
                            <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
                            إنهاء
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeletingLease(lease)} className="flex-1 px-1 text-danger hover:bg-danger/10 hover:text-danger hover:border-danger/30 border-danger/30">
                            <Trash2 className="h-3.5 w-3.5 ml-1" />
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="rounded-3xl border-border/50 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold font-display text-lg text-ink flex items-center gap-2 mb-6">
                  <Landmark className="h-5 w-5 text-crop-500" />
                  بيانات الحيازة والملكية
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-ink-muted">نوع الحيازة</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${tenureInfo.bg} ${tenureInfo.color}`}>
                      {tenureInfo.label}
                    </span>
                  </div>
                  
                  {land.tenure?.partner && (
                    <div className="flex justify-between items-center py-2 border-b border-border/40">
                      <span className="text-ink-muted">الشريك</span>
                      <span className="font-semibold text-ink">{land.tenure.partner.name} ({land.tenure.partner.partnerSharePercent}%)</span>
                    </div>
                  )}
                  
                  {land.tenure?.landlord && (
                    <div className="flex justify-between items-center py-2 border-b border-border/40">
                      <span className="text-ink-muted">المالك الأصلي (المؤجر)</span>
                      <span className="font-semibold text-ink">{land.tenure.landlord.name}</span>
                    </div>
                  )}
                  
                  {land.tenure?.rentCash && (
                    <div className="flex justify-between items-center py-2 border-b border-border/40">
                      <span className="text-ink-muted">الإيجار المدفوع</span>
                      <span className="font-bold text-amber-600">{land.tenure.rentCash.amount.toLocaleString()} ج.م</span>
                    </div>
                  )}
                  
                  {land.tenure?.rentCropShare && (
                    <div className="flex justify-between items-center py-2 border-b border-border/40">
                      <span className="text-ink-muted">نسبة المزارعة</span>
                      <span className="font-bold text-emerald-600">{land.tenure.rentCropShare.ratio}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-3xl border-border/50 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold font-display text-lg text-ink flex items-center gap-2 mb-6">
                  <Droplets className="h-5 w-5 text-sky-500" />
                  المواصفات الفنية
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border/40">
                    <span className="text-ink-muted">نظام الري</span>
                    <span className="font-semibold text-ink bg-sky-50 text-sky-700 px-3 py-1 rounded-lg">
                      {land.irrigationType || "غير محدد"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/40">
                    <span className="text-ink-muted">نوع التربة</span>
                    <span className="font-semibold text-ink">
                      {land.soilType || "غير محدد"}
                    </span>
                  </div>
                  {land.notes && (
                    <div className="pt-2">
                      <span className="text-ink-muted block mb-2">ملاحظات:</span>
                      <p className="text-sm text-ink leading-relaxed bg-paper-sunken p-3 rounded-xl border border-border/40">
                        {land.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      {farm && (
        <Dialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title="تعديل بيانات الأرض"
          className="max-w-2xl"
        >
          <LandForm
            defaultValues={land}
            farmId={farm.id}
            onSubmit={(values) => updateLand.mutate({ id: land.id, values }, { onSuccess: () => setFormOpen(false) })}
            onCancel={() => setFormOpen(false)}
            loading={updateLand.isPending}
          />
        </Dialog>
      )}

      <ConfirmDialog
        open={deletingLand}
        onClose={() => setDeletingLand(false)}
        onConfirm={() => {
          deleteLand.mutate(land.id, {
            onSuccess: () => {
              setDeletingLand(false);
              window.location.href = "/lands"; // Redirect after delete
            }
          });
        }}
        title={`حذف الأرض "${land.name}"؟`}
        description="سيتم مسح الأرض من سجلات المزرعة، ولا يمكن التراجع عن هذا الإجراء حالياً."
        loading={deleteLand.isPending}
      />

      {farm && (
        <Dialog
          open={leaseFormOpen}
          onClose={() => setLeaseFormOpen(false)}
          title={editingLease ? "تعديل عقد تأجير للغير" : "إنشاء عقد تأجير للغير"}
          className="max-w-2xl"
        >
          <LandLeaseForm
            farmId={farm.id}
            lands={lands || []}
            defaultLandId={land.id}
            defaultValues={editingLease}
            onSubmit={(values) => {
              const finalValues = { ...values };
              if (finalValues.duration === "season") {
                finalValues.seasonId = selectedSeasonId;
              }
              if (editingLease) {
                updateLease.mutate(
                  { id: editingLease.id, values: finalValues },
                  { onSuccess: () => setLeaseFormOpen(false) }
                );
              } else {
                createLease.mutate(finalValues, { onSuccess: () => setLeaseFormOpen(false) });
              }
            }}
            onCancel={() => setLeaseFormOpen(false)}
            loading={createLease.isPending || updateLease.isPending}
          />
        </Dialog>
      )}

      <ConfirmDialog
        open={!!endingLease}
        onClose={() => setEndingLease(null)}
        onConfirm={() => endingLease && updateLease.mutate({ id: endingLease.id, values: { status: "منتهي" } }, { onSuccess: () => setEndingLease(null) })}
        title={`إنهاء عقد الإيجار؟`}
        description={`هل أنت متأكد من إنهاء عقد تأجير "${endingLease?.tenantName}"؟ سيتم تفريغ مساحة الأرض المؤجرة لتصبح متاحة من جديد.`}
        loading={updateLease.isPending}
      />

      <ConfirmDialog
        open={!!deletingLease}
        onClose={() => setDeletingLease(null)}
        onConfirm={() => deletingLease && deleteLease.mutate(deletingLease.id, { onSuccess: () => setDeletingLease(null) })}
        title={`إلغاء الإيجار؟`}
        description={`هل أنت متأكد من إلغاء عقد الإيجار باسم ${deletingLease?.tenantName}؟ ستعود المساحة المؤجرة لسيطرتك كـ "مساحة متبقية".`}
        loading={deleteLease.isPending}
      />

      <Dialog open={!!viewingCycle} onClose={() => setViewingCycle(null)} title="تفاصيل الدورة الزراعية" className="max-w-2xl">
        {viewingCycle && (
          <CropCycleDetails 
            cycle={viewingCycle}
            farm={farm}
            land={land}
            season={seasons?.find(s => s.id === viewingCycle.seasonId)}
            crop={crops?.find(c => c.id === viewingCycle.cropId)}
          />
        )}
      </Dialog>
    </div>
  );
}

export default function LandDetailsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-crop-500" /></div>}>
      <LandDetailsContent />
    </Suspense>
  );
}
