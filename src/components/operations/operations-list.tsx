"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { OperationForm } from "./operation-form";
import { Plus, Search, Trash2, Tractor, Leaf, Droplets, FlaskConical, Scissors, ScrollText, Edit2 } from "lucide-react";
import type { FarmingOperation } from "@/lib/types/farming-operation";
import type { Farm } from "@/lib/types/farm";
import { Select } from "@/components/ui/select";
import { useSeasons } from "@/lib/hooks/use-seasons";
import { useCropCycles } from "@/lib/hooks/use-crop-cycles";
import { useCrops } from "@/lib/hooks/use-crops";
import { useInventory } from "@/lib/hooks/use-inventory";
import { useContractors } from "@/lib/hooks/use-contractors";
import { useEquipment } from "@/lib/hooks/use-equipment";
import { useOperations, useCreateOperation, useUpdateOperation, useDeleteOperation } from "@/lib/hooks/use-operations";
import { useCurrency } from "@/lib/hooks/use-currency";
import { useCropProgramsActions } from "@/lib/hooks/use-crop-programs";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

interface OperationsListProps {
  farms: Farm[];
}

const getOperationIcon = (type: string) => {
  switch (type) {
    case "إعداد أرض": return <Tractor className="w-5 h-5" />;
    case "زراعة": return <Leaf className="w-5 h-5" />;
    case "ري": return <Droplets className="w-5 h-5" />;
    case "تسميد":
    case "رش مبيدات": return <FlaskConical className="w-5 h-5" />;
    case "حصاد": return <Scissors className="w-5 h-5" />;
    default: return <ScrollText className="w-5 h-5" />;
  }
};

export function OperationsList({ farms }: OperationsListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || "");
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [selectedCropId, setSelectedCropId] = useState<string>("");
  
  const [editingOperation, setEditingOperation] = useState<FarmingOperation | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: operations = [], isLoading: isLoadingOps } = useOperations();
  const { data: seasons = [] } = useSeasons();
  const { data: cropCycles = [] } = useCropCycles();
  const { data: crops = [] } = useCrops();
  const { data: inventoryItems = [] } = useInventory(selectedFarmId);
  const { data: contractors = [] } = useContractors();
  const { data: equipment = [] } = useEquipment();

  const createOp = useCreateOperation();
  const updateOp = useUpdateOperation();
  const deleteOp = useDeleteOperation();
  const { formatMoney } = useCurrency();
  
  const { updatePhaseExecution } = useCropProgramsActions();
  const searchParams = useSearchParams();
  const router = useRouter();

  const actionParam = searchParams?.get("action");
  const phaseIdParam = searchParams?.get("phaseId");
  const cropCycleIdParam = searchParams?.get("cropCycleId");
  const programIdParam = searchParams?.get("programId");
  const typeParam = searchParams?.get("type");

  const [urlDefaultValues, setUrlDefaultValues] = useState<any>(null);

  useEffect(() => {
    if (actionParam === "new" && phaseIdParam && cropCycleIdParam && cropCycles.length > 0) {
      const cycle = cropCycles.find(c => c.id === cropCycleIdParam);
      if (cycle) {
        setSelectedFarmId(cycle.farmId);
        setSelectedSeasonId(cycle.seasonId);
        setUrlDefaultValues({
          farmId: cycle.farmId,
          seasonId: cycle.seasonId,
          cropCycleId: cropCycleIdParam,
          operationType: typeParam && ['زراعة', 'ري', 'تسميد', 'رش مبيدات', 'عزيق', 'حصاد'].includes(typeParam) ? typeParam : "أخرى",
        });
        setIsFormOpen(true);
      }
    }
  }, [actionParam, phaseIdParam, cropCycleIdParam, typeParam, cropCycles]);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    await deleteOp.mutateAsync(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const handleSubmit = async (data: any) => {
    if (editingOperation) {
      await updateOp.mutateAsync({ id: editingOperation.id, values: data });
    } else {
      const newOp = await createOp.mutateAsync(data);
      // Clear params from URL so it doesn't reopen on refresh
      if (phaseIdParam || actionParam) {
        router.replace('/operations');
      }
    }
    
    // Ensure form closes
    setIsFormOpen(false);
    setEditingOperation(null);
    setUrlDefaultValues(null);
  };

  const filteredSeasons = seasons.filter(s => !selectedFarmId || s.farmId === selectedFarmId);
  const filteredCrops = cropCycles.filter(c => 
    (!selectedFarmId || c.farmId === selectedFarmId) &&
    (!selectedSeasonId || c.seasonId === selectedSeasonId)
  );

  const filteredOperations = operations
    .filter(op => {
      const matchesFarm = !selectedFarmId || op.farmId === selectedFarmId;
      const matchesSeason = !selectedSeasonId || op.seasonId === selectedSeasonId;
      const matchesCrop = !selectedCropId || op.cropCycleId === selectedCropId;
      const matchesSearch = op.operationType.includes(searchQuery) || (op.notes && op.notes.includes(searchQuery));
      return matchesFarm && matchesSeason && matchesCrop && matchesSearch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoadingOps) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-crop-500/10 text-crop-600">
              <Tractor className="h-5 w-5" />
            </div>
            العمليات الزراعية
          </h1>
          <p className="text-ink-muted mt-1">تتبع الأنشطة اليومية وحساب التكاليف لكل محصول</p>
        </div>
        <Button onClick={() => { setEditingOperation(null); setIsFormOpen(true); }} className="gap-2 w-full md:w-auto">
          <Plus className="w-5 h-5" />
          تسجيل عملية زراعية
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-paper p-4 rounded-xl border border-border/80 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
          <Input
            placeholder="ابحث في العمليات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10"
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select
            value={selectedFarmId}
            onChange={(e) => setSelectedFarmId(e.target.value)}
          >
            <option value="">كل المزارع</option>
            {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </Select>
        </div>
        <div className="w-full md:w-[200px]">
          <Select
            value={selectedSeasonId}
            onChange={(e) => setSelectedSeasonId(e.target.value)}
            disabled={!selectedFarmId}
          >
            <option value="">كل المواسم</option>
            {filteredSeasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
        <div className="w-full md:w-[200px]">
          <Select
            value={selectedCropId}
            onChange={(e) => setSelectedCropId(e.target.value)}
            disabled={!selectedSeasonId}
          >
            <option value="">كل المحاصيل</option>
            {filteredCrops.map(c => {
              const baseCrop = crops.find(crop => crop.id === c.cropId);
              const cropName = baseCrop?.name || c.cropId;
              return (
                <option key={c.id} value={c.id}>{cropName} {c.cropVariety ? `(${c.cropVariety})` : ''}</option>
              );
            })}
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOperations.length === 0 ? (
          <div className="text-center py-20 bg-paper-raised rounded-2xl border border-border">
            <Tractor className="w-16 h-16 text-crop-300 dark:text-crop-500/50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-ink">لا توجد عمليات زراعية</h2>
            <p className="text-ink-muted mt-2 mb-6 max-w-sm mx-auto">
              قم بتسجيل العمليات لتتبع التكاليف بدقة وتحديث أرصدة المخازن.
            </p>
            <Button onClick={() => { setEditingOperation(null); setIsFormOpen(true); }} className="gap-2">
              <Plus className="w-4 h-4" />
              تسجيل أول عملية
            </Button>
          </div>
        ) : (
          filteredOperations.map(op => {
            const crop = cropCycles.find(c => c.id === op.cropCycleId);
            return (
              <div key={op.id} className="bg-paper p-5 rounded-2xl border border-border/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  
                  <div className="flex gap-4 items-start w-full">
                    <div className="bg-crop-50 dark:bg-crop-900/30 text-crop-600 dark:text-crop-400 p-3 rounded-xl mt-1">
                      {getOperationIcon(op.operationType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-ink">{op.operationType}</h3>
                        <span className="text-xs bg-paper-sunken text-ink-muted px-2 py-1 rounded-md border border-border">
                          {new Date(op.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-crop-600 dark:text-crop-400 mt-1">
                        المحصول: {(() => {
                          const baseCrop = crops.find(cr => cr.id === crop?.cropId);
                          const cropName = baseCrop?.name || crop?.cropId || 'محصول غير معروف';
                          return `${cropName} ${crop?.cropVariety ? `(${crop.cropVariety})` : ''}`;
                        })()}
                      </p>
                      {op.notes && (
                        <p className="text-sm text-ink-muted mt-2 leading-relaxed max-w-2xl">{op.notes}</p>
                      )}
                      
                      {op.inventoryItems && op.inventoryItems.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {op.inventoryItems.map(item => {
                            const invItem = inventoryItems.find(i => i.id === item.itemId);
                            return (
                              <span key={item.itemId} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-800/50">
                                <FlaskConical className="w-3.5 h-3.5" />
                                {invItem?.name || 'صنف غير معروف'} ({item.quantity})
                              </span>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* عرض المقاولين إن وجدوا */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {op.laborContractorId && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50">
                            عمالة: {contractors.find(c => c.id === op.laborContractorId)?.name || 'غير معروف'}
                          </span>
                        )}
                        {op.equipmentContractorId && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50">
                            معدات: {contractors.find(c => c.id === op.equipmentContractorId)?.name || 'غير معروف'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 md:border-r border-border pt-4 md:pt-0 md:pr-6 mt-4 md:mt-0">
                    <div className="text-right">
                      <p className="text-xs text-ink-muted mb-1">إجمالي التكلفة</p>
                      <p className="text-2xl font-bold text-danger">{formatMoney(op.totalCost || 0)}</p>
                    </div>
                    <div className="mt-4 flex gap-2 w-full md:w-auto justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl"
                        onClick={() => {
                          setEditingOperation(op);
                          setIsFormOpen(true);
                        }}
                        title="تعديل العملية"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-danger hover:bg-danger/10 hover:text-danger rounded-xl"
                        onClick={() => setDeleteConfirmId(op.id)}
                        title="حذف العملية"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      <OperationForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOperation(null);
        }}
        onSubmit={handleSubmit}
        farms={farms}
        seasons={seasons}
        cropCycles={cropCycles}
        crops={crops}
        inventoryItems={inventoryItems}
        contractors={contractors}
        equipment={equipment}
        isSubmitting={createOp.isPending || updateOp.isPending}
        defaultValues={editingOperation ? {
          ...editingOperation,
          inventoryItems: editingOperation.inventoryItems?.map(item => ({
            ...item,
            id: crypto.randomUUID()
          }))
        } : urlDefaultValues ? urlDefaultValues : undefined}
      />

      <ConfirmDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف العملية"
        description="هل أنت متأكد من مسح هذه العملية الزراعية؟ (ملاحظة: لن يتم إرجاع الأصناف المسحوبة من المخزن تلقائياً في هذه النسخة)"
        loading={deleteOp.isPending}
      />
    </div>
  );
}
