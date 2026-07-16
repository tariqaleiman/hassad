"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { OperationForm } from "./operation-form";
import { Plus, Search, Trash2, Tractor, Leaf, Droplets, FlaskConical, Scissors, ScrollText, Edit2 } from "lucide-react";
import type { FarmingOperation } from "@/lib/types/farming-operation";
import type { Farm } from "@/lib/types/farm";
import type { Season } from "@/lib/types/season";
import type { CropCycle } from "@/lib/types/crop-cycle";
import type { InventoryItem } from "@/lib/types/inventory";
import { farmingOperationService } from "@/lib/services/farming-operation-service";
import { Select } from "@/components/ui/select";
import type { Crop } from "@/lib/types/crop";
import type { Contractor } from "@/lib/types/contractor";

interface OperationsListProps {
  farms: Farm[];
  seasons: Season[];
  cropCycles: CropCycle[];
  crops: Crop[];
  inventoryItems: InventoryItem[];
  contractors: Contractor[];
  operations: FarmingOperation[];
  userId: string;
  onUpdate: () => void;
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

export function OperationsList({
  farms,
  seasons,
  cropCycles,
  crops,
  inventoryItems,
  contractors,
  operations,
  userId,
  onUpdate,
}: OperationsListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || "");
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [selectedCropId, setSelectedCropId] = useState<string>("");
  
  const [editingOperation, setEditingOperation] = useState<FarmingOperation | null>(null);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      setLoading(true);
      await farmingOperationService.deleteOperation(deleteConfirmId, userId);
      setDeleteConfirmId(null);
      onUpdate();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "حدث خطأ أثناء الحذف");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (editingOperation) {
        await farmingOperationService.updateOperation(editingOperation.id, data, userId);
      } else {
        await farmingOperationService.createOperation(data, userId);
      }
      onUpdate();
      setIsFormOpen(false);
      setEditingOperation(null);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  const filteredSeasons = seasons.filter(s => !selectedFarmId || s.farmId === selectedFarmId);
  const filteredCrops = cropCycles.filter(c => 
    (!selectedFarmId || c.farmId === selectedFarmId) &&
    (!selectedSeasonId || c.seasonId === selectedSeasonId)
  );

  const filteredOperations = operations.filter(op => {
    const matchesFarm = !selectedFarmId || op.farmId === selectedFarmId;
    const matchesSeason = !selectedSeasonId || op.seasonId === selectedSeasonId;
    const matchesCrop = !selectedCropId || op.cropCycleId === selectedCropId;
    const matchesSearch = op.operationType.includes(searchQuery) || (op.notes && op.notes.includes(searchQuery));
    
    return matchesFarm && matchesSeason && matchesCrop && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-paper p-4 md:p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-ink">سجل العمليات الزراعية</h1>
          <p className="text-ink-muted mt-1">تتبع الأنشطة اليومية وحساب التكاليف لكل محصول</p>
        </div>
        <Button onClick={() => { setEditingOperation(null); setIsFormOpen(true); }} className="gap-2 w-full md:w-auto">
          <Plus className="w-5 h-5" />
          تسجيل عملية زراعية
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-paper p-4 rounded-xl border border-border">
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
          <div className="text-center py-12 bg-paper rounded-2xl border border-border border-dashed">
            <Tractor className="w-12 h-12 text-ink-muted mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-ink">لا توجد عمليات زراعية</p>
            <p className="text-ink-muted mt-1">قم بتسجيل العمليات لتتبع التكاليف بدقة.</p>
          </div>
        ) : (
          filteredOperations.map(op => {
            const crop = cropCycles.find(c => c.id === op.cropCycleId);
            return (
              <div key={op.id} className="bg-paper p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
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
                      <p className="text-2xl font-bold text-danger">{(op.totalCost || 0).toLocaleString()} <span className="text-sm font-normal">ج.م</span></p>
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
        isSubmitting={loading}
        defaultValues={editingOperation ? {
          ...editingOperation,
          inventoryItems: editingOperation.inventoryItems?.map(item => ({
            ...item,
            id: crypto.randomUUID()
          }))
        } : undefined}
      />

      <ConfirmDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف العملية"
        description="هل أنت متأكد من مسح هذه العملية الزراعية؟ (ملاحظة: لن يتم إرجاع الأصناف المسحوبة من المخزن تلقائياً في هذه النسخة)"
        loading={loading}
      />
    </div>
  );
}
