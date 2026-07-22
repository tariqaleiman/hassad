"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Wrench, Droplet, Calculator, Activity, Trash2 } from "lucide-react";
import { useCurrency } from "@/lib/hooks/use-currency";
import type { Equipment } from "@/lib/types/equipment";
import { useMaintenanceLogs, useFuelLogs, useAddMaintenance, useAddFuelLog, usePostDepreciation } from "@/lib/hooks/use-equipment";
import { MaintenanceForm } from "./maintenance-form";
import { FuelForm } from "./fuel-form";
import { formatDate } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

interface EquipmentDetailsModalProps {
  equipment: Equipment | null;
  open: boolean;
  onClose: () => void;
}

export function EquipmentDetailsModal({ equipment, open, onClose }: EquipmentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("info");
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [showAddFuel, setShowAddFuel] = useState(false);
  const [showDepreciationConfirm, setShowDepreciationConfirm] = useState(false);

  const { formatMoney } = useCurrency();

  const { data: maintenanceLogs = [], isLoading: loadingMaintenance } = useMaintenanceLogs(equipment?.id || "");
  const { data: fuelLogs = [], isLoading: loadingFuel } = useFuelLogs(equipment?.id || "");
  
  const addMaintenance = useAddMaintenance();
  const addFuel = useAddFuelLog();
  const postDepreciation = usePostDepreciation();

  if (!equipment) return null;

  // Depreciation calculations
  const usefulLife = equipment.usefulLifeYears || 0;
  const purchaseValue = equipment.purchaseValue || 0;
  const salvageValue = equipment.salvageValue || 0;
  const accumulatedDep = equipment.accumulatedDepreciation || 0;
  const netBookValue = purchaseValue - accumulatedDep;

  const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
  const totalFuelCost = fuelLogs.reduce((sum, log) => sum + (log.cost || 0), 0);

  let annualDepreciation = 0;
  if (usefulLife > 0 && purchaseValue > 0) {
    annualDepreciation = (purchaseValue - salvageValue) / usefulLife;
  }
  const monthlyDepreciation = annualDepreciation / 12;

  const handlePostDepreciation = () => {
    if (!equipment) return;
    postDepreciation.mutate(
      { equipmentId: equipment.id, amount: monthlyDepreciation, date: new Date().toISOString().split("T")[0] },
      { onSuccess: () => setShowDepreciationConfirm(false) }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title={`تفاصيل المعدة: ${equipment.name}`} className="max-w-4xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="info" className="gap-2"><Activity className="w-4 h-4" /> المعلومات</TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-2"><Wrench className="w-4 h-4" /> الصيانة</TabsTrigger>
          <TabsTrigger value="fuel" className="gap-2"><Droplet className="w-4 h-4" /> الوقود</TabsTrigger>
          <TabsTrigger value="depreciation" className="gap-2"><Calculator className="w-4 h-4" /> الإهلاك</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-paper-sunken rounded-xl">
              <p className="text-sm text-ink-muted mb-1">النوع</p>
              <p className="font-bold">{equipment.type}</p>
            </div>
            <div className="p-4 bg-paper-sunken rounded-xl">
              <p className="text-sm text-ink-muted mb-1">الحالة</p>
              <p className="font-bold">{equipment.status}</p>
            </div>
            <div className="p-4 bg-paper-sunken rounded-xl">
              <p className="text-sm text-ink-muted mb-1">تاريخ الشراء</p>
              <p className="font-bold">{equipment.purchaseDate ? formatDate(equipment.purchaseDate) : "—"}</p>
            </div>
            <div className="p-4 bg-paper-sunken rounded-xl">
              <p className="text-sm text-ink-muted mb-1">قيمة الشراء</p>
              <p className="font-bold font-mono text-emerald-600">{formatMoney(equipment.purchaseValue || 0)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-rose-600">
                <Wrench className="w-4 h-4" />
                <p className="text-sm font-bold">إجمالي تكلفة الصيانة</p>
              </div>
              <p className="font-bold font-mono text-xl text-rose-700 dark:text-rose-400">{formatMoney(totalMaintenanceCost)}</p>
            </div>
            
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-amber-600">
                <Droplet className="w-4 h-4" />
                <p className="text-sm font-bold">إجمالي تكلفة الوقود</p>
              </div>
              <p className="font-bold font-mono text-xl text-amber-700 dark:text-amber-400">{formatMoney(totalFuelCost)}</p>
            </div>

            {equipment.nextMaintenanceDate && (
              <div className={`p-4 rounded-xl border ${new Date(equipment.nextMaintenanceDate) < new Date() ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 text-rose-600' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4" />
                  <p className="text-sm font-bold">موعد الصيانة القادمة</p>
                </div>
                <p className="font-bold text-lg">
                  {formatDate(equipment.nextMaintenanceDate)}
                  {new Date(equipment.nextMaintenanceDate) < new Date() && " (تجاوز الموعد)"}
                </p>
              </div>
            )}
          </div>

          {equipment.notes && (
            <div className="p-4 bg-paper-sunken rounded-xl">
              <p className="text-sm text-ink-muted mb-2">ملاحظات</p>
              <p className="text-sm">{equipment.notes}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">سجل الصيانة</h3>
            <Button size="sm" onClick={() => setShowAddMaintenance(true)} className="gap-2">
              <Plus className="w-4 h-4" /> إضافة سجل
            </Button>
          </div>

          {showAddMaintenance && (
            <div className="p-4 border border-border/50 bg-paper-sunken/30 rounded-xl mb-4">
              <MaintenanceForm 
                equipmentId={equipment.id} 
                farmId={equipment.farmId}
                onSubmit={(vals) => addMaintenance.mutate(vals, { onSuccess: () => setShowAddMaintenance(false) })}
                onCancel={() => setShowAddMaintenance(false)}
                loading={addMaintenance.isPending}
              />
            </div>
          )}

          {loadingMaintenance ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : maintenanceLogs.length === 0 ? (
            <div className="py-4">
              <EmptyState 
                icon={Wrench} 
                title="لا توجد سجلات صيانة" 
                description="لم يتم تسجيل أي عمليات صيانة لهذه المعدة بعد." 
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-paper-sunken/50">
                    <th className="p-3 text-right">التاريخ</th>
                    <th className="p-3 text-right">النوع</th>
                    <th className="p-3 text-right">التكلفة</th>
                    <th className="p-3 text-right">الجهة المنفذة</th>
                    <th className="p-3 text-right">الوصف</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceLogs.map(log => (
                    <tr key={log.id} className="border-b hover:bg-black/5">
                      <td className="p-3">{formatDate(log.date)}</td>
                      <td className="p-3">{log.type}</td>
                      <td className="p-3 font-mono font-semibold text-rose-600">{formatMoney(log.cost)}</td>
                      <td className="p-3">{log.performedBy || "—"}</td>
                      <td className="p-3 truncate max-w-[200px]">{log.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">سجل الوقود</h3>
            <Button size="sm" onClick={() => setShowAddFuel(true)} className="gap-2">
              <Plus className="w-4 h-4" /> تعبئة وقود
            </Button>
          </div>

          {showAddFuel && (
            <div className="p-4 border border-border/50 bg-paper-sunken/30 rounded-xl mb-4">
              <FuelForm 
                equipmentId={equipment.id} 
                farmId={equipment.farmId}
                onSubmit={(vals) => addFuel.mutate(vals, { onSuccess: () => setShowAddFuel(false) })}
                onCancel={() => setShowAddFuel(false)}
                loading={addFuel.isPending}
              />
            </div>
          )}

          {loadingFuel ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : fuelLogs.length === 0 ? (
            <div className="py-4">
              <EmptyState 
                icon={Droplet} 
                title="لا توجد سجلات وقود" 
                description="لم يتم تسجيل أي عمليات تعبئة وقود لهذه المعدة بعد." 
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-paper-sunken/50">
                    <th className="p-3 text-right">التاريخ</th>
                    <th className="p-3 text-right">النوع</th>
                    <th className="p-3 text-right">الكمية</th>
                    <th className="p-3 text-right">التكلفة</th>
                    <th className="p-3 text-right">القراءة (ساعة/كم)</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map(log => (
                    <tr key={log.id} className="border-b hover:bg-black/5">
                      <td className="p-3">{formatDate(log.date)}</td>
                      <td className="p-3">{log.fuelType}</td>
                      <td className="p-3 font-mono font-semibold">{log.quantity} لتر</td>
                      <td className="p-3 font-mono font-semibold text-rose-600">{formatMoney(log.cost)}</td>
                      <td className="p-3">{log.odometerOrHours || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-paper-sunken rounded-xl">
              <p className="text-sm text-ink-muted mb-1">القيمة الأصلية</p>
              <p className="font-bold font-mono">{formatMoney(purchaseValue)}</p>
            </div>
            <div className="p-4 bg-paper-sunken rounded-xl">
              <p className="text-sm text-ink-muted mb-1">العمر الافتراضي</p>
              <p className="font-bold">{usefulLife ? `${usefulLife} سنوات` : "غير محدد"}</p>
            </div>
            <div className="p-4 bg-paper-sunken rounded-xl border border-rose-100">
              <p className="text-sm text-rose-600 mb-1">مجمع الإهلاك الحالي</p>
              <p className="font-bold font-mono text-rose-600">{formatMoney(accumulatedDep)}</p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-sm text-emerald-800 mb-1">القيمة الدفترية الحالية</p>
              <p className="font-bold font-mono text-emerald-600">{formatMoney(netBookValue)}</p>
            </div>
          </div>

          <div className="p-6 bg-paper-sunken/50 rounded-xl border border-border/50">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg">محاكي الإهلاك (القسط الثابت)</h3>
                <p className="text-sm text-ink-muted mt-1">
                  الإهلاك السنوي = (القيمة الأصلية - القيمة الخردة) / العمر الافتراضي
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-ink-muted mb-1">قيمة الخردة</p>
                <p className="font-semibold font-mono">{formatMoney(salvageValue)}</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted mb-1">قسط الإهلاك السنوي</p>
                <p className="font-semibold font-mono text-amber-600">{formatMoney(annualDepreciation)}</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted mb-1">قسط الإهلاك الشهري</p>
                <p className="font-bold font-mono text-amber-600 text-lg">{formatMoney(monthlyDepreciation)}</p>
              </div>
            </div>

            {monthlyDepreciation > 0 && netBookValue > salvageValue && (
              <div className="pt-4 border-t border-border flex justify-end">
                <Button 
                  onClick={() => setShowDepreciationConfirm(true)} 
                  className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Calculator className="w-4 h-4" />
                  إثبات الإهلاك الشهري محاسبياً
                </Button>
              </div>
            )}
            
            {netBookValue <= salvageValue && purchaseValue > 0 && (
               <div className="mt-4 p-3 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-semibold">
                 ✅ تم إهلاك المعدة بالكامل وصولاً إلى قيمتها التخريدية.
               </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showDepreciationConfirm}
        onClose={() => setShowDepreciationConfirm(false)}
        title="تأكيد الإهلاك"
        description={`هل أنت متأكد من إنشاء قيد محاسبي لإثبات مصروف الإهلاك الشهري بقيمة ${formatMoney(monthlyDepreciation)}؟`}
        onConfirm={handlePostDepreciation}
        loading={postDepreciation.isPending}
      />
    </Dialog>
  );
}
