"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCycleProgram, useSystemTemplates, useCropProgramsActions } from "@/lib/hooks/use-crop-programs";
import { useInventory, useAddTransaction, useCreateInventoryItem } from "@/lib/hooks/use-inventory";
import { useOperations, useCreateOperation } from "@/lib/hooks/use-operations";
import { useEquipment } from "@/lib/hooks/use-equipment";
import { useContractors } from "@/lib/hooks/use-contractors";
import { useSeasons } from "@/lib/hooks/use-seasons";
import { useCropCycles } from "@/lib/hooks/use-crop-cycles";
import { useCrops } from "@/lib/hooks/use-crops";
import { useFarms } from "@/lib/hooks/use-farms";
import { Spinner } from "@/components/ui/spinner";
import { Select } from "@/components/ui/select";
import { CheckCircle2, Circle, AlertCircle, Droplets, Sprout, Bug, Calendar, Info, Printer, Users, Plus, Pencil, Trash2, Tractor, Link2 } from "lucide-react";
import type { CropProgramPhase, CyclePhaseExecution, ProgramPhaseType } from "@/lib/types/crop-program";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OperationForm } from "@/components/operations/operation-form";
import { ReportViewer } from "@/components/ui/report-viewer";
import { useCurrency } from "@/lib/hooks/use-currency";

const PHASE_ICONS: Record<string, React.ElementType> = {
  "ري": Droplets,
  "تسميد": Sprout,
  "ري وتسميد": Droplets,
  "رش وقائي": Bug,
  "رش علاجي": AlertCircle,
  "رش مغذي": Sprout,
  "عزيق": Users,
  "أخرى": Info,
};

const PHASE_COLORS: Record<string, string> = {
  "ري": "text-sky-600 bg-sky-50 dark:bg-sky-500/10 border-sky-200",
  "تسميد": "text-crop-600 bg-crop-50 dark:bg-crop-500/10 border-crop-200",
  "ري وتسميد": "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200",
  "رش وقائي": "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200",
  "رش علاجي": "text-danger bg-danger/10 border-danger/20",
  "رش مغذي": "text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-500/10 border-fuchsia-200",
  "عزيق": "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200",
  "أخرى": "text-ink-muted bg-paper-sunken border-border",
};

// Map phase types to operation types
const PHASE_TO_OP_TYPE: Record<string, string> = {
  "ري": "ري",
  "تسميد": "تسميد",
  "ري وتسميد": "ري وتسميد",
  "رش وقائي": "رش مبيدات",
  "رش علاجي": "رش مبيدات",
  "رش مغذي": "رش مغذي",
  "عزيق": "عزيق",
  "حصاد": "حصاد",
};

interface CropMonitoringProps {
  farmId: string;
  cropCycleId: string;
  plantDate: string | null;
}

export function CropMonitoring({ farmId, cropCycleId, plantDate }: CropMonitoringProps) {
  const { formatMoney, currency } = useCurrency();
  const { data: program, isLoading } = useCycleProgram(cropCycleId);
  const { data: systemTemplates, isLoading: templatesLoading } = useSystemTemplates();
  const { createCycleProgram, updatePhaseExecution, updateCycleProgramPhases, createTemplate } = useCropProgramsActions();
  
  // Data hooks
  const { data: inventoryItems, isLoading: inventoryLoading } = useInventory(farmId);
  const { data: operations = [], isLoading: operationsLoading } = useOperations();
  const { data: equipment = [] } = useEquipment();
  const { data: contractors = [] } = useContractors();
  const { data: seasons = [] } = useSeasons();
  const { data: cropCycles = [] } = useCropCycles();
  const { data: crops = [] } = useCrops();
  const { data: farms = [] } = useFarms();
  const addTransaction = useAddTransaction();
  const createInventoryItem = useCreateInventoryItem();
  const createOp = useCreateOperation();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [phaseToComplete, setPhaseToComplete] = useState<CropProgramPhase | null>(null);
  
  // Form for Add/Edit Phase
  const [editingPhase, setEditingPhase] = useState<Partial<CropProgramPhase> | null>(null);
  
  // States for Smart Learning Confirmation & Completion
  const [actualProduct, setActualProduct] = useState("");
  const [actualQuantity, setActualQuantity] = useState<number>(0);
  const [actualNotes, setActualNotes] = useState("");
  const [inventoryItemId, setInventoryItemId] = useState("");
  
  // Filter for Print
  const [printFilter, setPrintFilter] = useState<string>("الكل");
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  
  // === NEW: Inline Operation Form State ===
  const [operationPhase, setOperationPhase] = useState<CropProgramPhase | null>(null);

  // Types Generation
  const DEFAULT_TYPES = ['ري', 'تسميد', 'ري وتسميد', 'رش وقائي', 'رش علاجي', 'رش مغذي', 'عزيق', 'حصاد', 'أخرى'];
  const customTypes = useMemo(() => {
    if (!program) return [];
    return Array.from(new Set(program.phases.flatMap(p => Array.isArray(p.type) ? p.type : [p.type as unknown as string]).filter(t => !DEFAULT_TYPES.includes(t))));
  }, [program]);
  const ALL_TYPES = [...DEFAULT_TYPES, ...customTypes];

  const handleStartProgram = () => {
    if (!selectedTemplateId) return;
    
    if (selectedTemplateId === "custom") {
      createCycleProgram.mutate({
        farmId,
        cropCycleId,
        templateId: "custom",
        startDate: plantDate || new Date().toISOString(),
        phases: [],
        executions: {},
        status: "active",
      });
      return;
    }

    const template = systemTemplates?.find(t => t.id === selectedTemplateId);
    if (!template) return;

    createCycleProgram.mutate({
      farmId,
      cropCycleId,
      templateId: template.id,
      startDate: plantDate || new Date().toISOString(),
      phases: template.phases,
      executions: {},
      status: "active",
    });
  };

  const handleSavePhase = () => {
    if (!program || !editingPhase) return;
    
    let newPhases = [...program.phases];
    
    if (editingPhase.id) {
      // Edit existing
      const index = newPhases.findIndex(p => p.id === editingPhase.id);
      if (index > -1) {
        newPhases[index] = { ...newPhases[index], ...editingPhase } as CropProgramPhase;
      }
    } else {
      // Add new
      newPhases.push({
        ...editingPhase,
        id: Math.random().toString(36).substring(7),
      } as CropProgramPhase);
    }
    
    updateCycleProgramPhases.mutate({ programId: program.id, phases: newPhases }, {
      onSuccess: () => setEditingPhase(null)
    });
  };

  const handleDeletePhase = (id: string) => {
    if (!program) return;
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;
    const newPhases = program.phases.filter(p => p.id !== id);
    updateCycleProgramPhases.mutate({ programId: program.id, phases: newPhases });
  };

  const handleCompletePhase = async () => {
    if (!program || !phaseToComplete) return;

    let transactionId = undefined;
    let inventoryId = inventoryItemId;

    // --- HARVEST LOGIC ---
    if (phaseToComplete.type.includes("حصاد") && actualQuantity > 0 && actualProduct) {
      // Create a new finished product item in inventory
      try {
        const newItem = await createInventoryItem.mutateAsync({
          farmId,
          name: actualProduct,
          category: "محاصيل تامة",
          unit: editingPhase?.quantityUnit || "طن",
          initialQuantity: actualQuantity,
          initialUnitPrice: 0, // Cost is handled via cycle reports
          notes: `تم إنتاجه من دورة زراعية: ${cropCycleId.substring(0, 8)}`,
        });
        inventoryId = newItem.id;
        // The mutateAsync of createInventoryItem actually creates the 'in' transaction if initialQuantity is provided!
      } catch (e) {
        console.error("Failed to add harvest to inventory", e);
        alert("فشل إضافة المحصول للمخزن");
        return;
      }
    } 
    // --- NORMAL OPERATION INVENTORY USAGE LOGIC ---
    else if (inventoryId && actualQuantity > 0) {
      const selectedItem = inventoryItems?.find(i => i.id === inventoryId);
      if (selectedItem) {
        if (selectedItem.quantity < actualQuantity) {
          if (!confirm(`تحذير: رصيد المخزن (${selectedItem.quantity} ${selectedItem.unit}) أقل من الكمية المطلوبة. هل تريد المتابعة والسحب بالسالب؟`)) {
            return;
          }
        }
        try {
          const transaction = await addTransaction.mutateAsync({
            farmId,
            itemId: inventoryId,
            type: "out",
            quantity: actualQuantity,
            unitPrice: selectedItem.averageCost,
            totalPrice: actualQuantity * selectedItem.averageCost,
            date: new Date().toISOString(),
            referenceType: "عملية زراعية",
            referenceId: cropCycleId,
            notes: `تنفيذ مهمة: ${phaseToComplete.title}`
          });
          transactionId = transaction.id;
        } catch (e) {
          console.error("Failed to add inventory transaction", e);
          alert("فشل خصم الكمية من المخزن");
          return;
        }
      }
    }

    const isDifferent = 
      (actualProduct && actualProduct !== phaseToComplete.recommendedProduct) ||
      (actualQuantity > 0 && actualQuantity !== phaseToComplete.recommendedQuantity) ||
      program.templateId === "custom";

    const execute = () => {
      updatePhaseExecution.mutate({
        programId: program.id,
        phaseId: phaseToComplete.id,
        execution: {
          phaseId: phaseToComplete.id,
          isCompleted: true,
          completedAt: new Date().toISOString(),
          actualProduct,
          actualQuantity,
          actualNotes,
          inventoryItemId: inventoryId || undefined,
          inventoryTransactionId: transactionId,
        }
      });
      setPhaseToComplete(null);
    };

    if (isDifferent && program.templateId === "custom") {
      if (confirm("ملاحظة (تعلم ذكي): هل ترغب في حفظ هذا البرنامج المخصص كقالب دائم لتستخدمه لاحقاً لمحاصيل أخرى؟")) {
        createTemplate.mutate({
          name: `برنامج مخصص - ${new Date().toLocaleDateString('ar-EG')}`,
          cropName: "مخصص",
          phases: program.phases,
          isCustom: true,
          farmId,
        });
      }
      execute();
    } else {
      execute();
    }
  };

  // === NEW: Handle inline operation submit ===
  const handleOperationSubmit = async (data: any) => {
    if (!program || !operationPhase) return;
    
    // Get crop cycle info to fill required fields
    const cycle = cropCycles.find(c => c.id === cropCycleId);
    
    const opData = {
      ...data,
      farmId,
      seasonId: cycle?.seasonId || "",
      cropCycleId,
      linkedPhaseId: operationPhase.id,
      programId: program.id,
      inventoryItems: data.inventoryItems?.map((item: any) => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      })) || [],
    };
    
    await createOp.mutateAsync(opData);
    setOperationPhase(null);
  };

  // Compute expected date from phase dayNumber
  const getPhaseDate = (dayNumber: number): string => {
    if (!plantDate) return new Date().toISOString().split("T")[0];
    const d = new Date(plantDate);
    d.setDate(d.getDate() + dayNumber);
    return d.toISOString().split("T")[0];
  };

  if (isLoading || templatesLoading || inventoryLoading || operationsLoading) {
    return <div className="flex justify-center p-8"><Spinner className="w-8 h-8" /></div>;
  }

  if (!program) {
    return (
      <Card className="bg-paper border-border print:hidden">
        <CardContent className="p-8 text-center flex flex-col items-center">
          <div className="p-5 bg-crop-50 dark:bg-crop-500/10 rounded-full mb-5 shadow-sm border border-crop-100 dark:border-crop-500/20">
            <Sprout className="w-12 h-12 text-crop-600" />
          </div>
          <h3 className="text-xl font-bold font-display text-ink mb-3">لا يوجد برنامج متابعة نشط</h3>
          <p className="text-ink-muted max-w-sm mb-8 leading-relaxed text-sm">
            اختر قالب برنامج زراعي جاهز أو قم بإنشاء برنامج مخصص فارغ لتبني مهامك بنفسك.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <Select 
              value={selectedTemplateId} 
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full text-start"
            >
              <option value="">-- اختر البرنامج --</option>
              <optgroup label="برامج مخصصة وفارغة">
                <option value="custom">✨ إنشاء برنامج فارغ مخصص</option>
              </optgroup>
              <optgroup label="برامج النظام الجاهزة">
                {systemTemplates?.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </optgroup>
            </Select>
            <Button onClick={handleStartProgram} disabled={!selectedTemplateId || createCycleProgram.isPending} size="lg" className="w-full">
              {createCycleProgram.isPending ? <Spinner className="w-5 h-5 ml-2" /> : "بدء البرنامج"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate current day
  const startD = new Date(program.startDate).getTime();
  const today = new Date().getTime();
  const currentDay = Math.floor((today - startD) / (1000 * 3600 * 24));

  // Sort phases by day number
  const sortedPhases = [...program.phases].sort((a, b) => a.dayNumber - b.dayNumber);
  const filteredPhases = printFilter === "الكل" ? sortedPhases : sortedPhases.filter(p => p.type.includes(printFilter));

  return (
    <>
      <Card className="bg-paper border-border print:hidden">
        <CardHeader className="border-b border-border/50 pb-4 flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-crop-600" />
              البرنامج الزمني للمحصول
            </CardTitle>
            <p className="text-sm text-ink-muted mt-1">اليوم الحالي منذ الزراعة: <strong className="text-ink text-lg">{currentDay}</strong> يوم</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={printFilter} onChange={(e) => setPrintFilter(e.target.value)} className="w-32 text-sm">
              <option value="الكل">كل المهام</option>
              {Array.from(new Set(sortedPhases.flatMap(p => Array.isArray(p.type) ? p.type : [p.type as unknown as string]))).map(type => (
                <option key={type} value={type}>مهام {type}</option>
              ))}
            </Select>
            <Button variant="outline" size="sm" onClick={() => setIsReportViewerOpen(true)} className="gap-2 hidden sm:flex">
              <Printer className="w-4 h-4" />
              طباعة ({printFilter})
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditingPhase({ dayNumber: currentDay, type: ["تسميد"] })} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة مهمة
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative p-6">
            {/* Timeline Line */}
            <div className="absolute top-6 bottom-6 right-10 w-0.5 bg-border/60"></div>
            
            <div className="space-y-8">
              {filteredPhases.length === 0 && (
                <div className="text-center py-8 text-ink-muted">
                  لا توجد مهام في هذا البرنامج. اضغط على "إضافة مهمة" للبدء.
                </div>
              )}
              {filteredPhases.map((phase) => {
                const execution = program.executions[phase.id];
                const isCompleted = execution?.isCompleted;
                const isDue = currentDay >= phase.dayNumber && !isCompleted;
                const primaryType = Array.isArray(phase.type) ? phase.type[0] : phase.type as unknown as string;
                const Icon = PHASE_ICONS[primaryType] || Info;
                const phaseColor = PHASE_COLORS[primaryType] || PHASE_COLORS["أخرى"];
                
                // Get linked operations for this phase
                const linkedOps = operations.filter(op => op.linkedPhaseId === phase.id);
                const totalLinkedCost = linkedOps.reduce((sum, op) => sum + (op.totalCost || 0), 0);
                
                return (
                  <div key={phase.id} className={`relative flex gap-6 z-10 ${isCompleted ? 'opacity-60' : ''}`}>
                    {/* Day Badge */}
                    <div className="w-16 shrink-0 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-paper ${isCompleted ? 'border-success text-success' : isDue ? 'border-danger text-danger' : 'border-border text-ink-muted'}`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-bold text-ink-muted mt-2">اليوم {phase.dayNumber}</span>
                    </div>

                    {/* Content Card */}
                    <div className={`flex-1 rounded-xl border p-4 transition-colors ${isDue ? 'border-danger/30 bg-danger/5' : isCompleted ? 'border-success/20 bg-success/5' : 'border-border bg-paper'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${phaseColor}`}>
                            <Icon className="w-3 h-3" /> {phase.type}
                          </span>
                          <h4 className={`font-bold text-sm ${isDue ? 'text-danger' : 'text-ink'}`}>{phase.title}</h4>
                        </div>
                        <div className="flex items-center gap-1">
                          {!isCompleted && isDue && (
                            <span className="text-[10px] font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full animate-pulse ml-2">مستحقة</span>
                          )}
                          {!isCompleted && (
                            <>
                              <button onClick={() => setEditingPhase(phase)} className="p-1 text-ink-muted hover:text-ink hover:bg-paper-sunken rounded-md transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeletePhase(phase.id)} className="p-1 text-ink-muted hover:text-danger hover:bg-danger-bg rounded-md transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-ink-muted mb-3 leading-relaxed">{phase.description}</p>
                      
                      {phase.recommendedProduct && (
                        <div className="flex items-center gap-4 text-xs font-medium bg-black/5 dark:bg-white/5 p-2 rounded-lg mb-3">
                          <span className="text-ink">المادة الموصى بها: <span className="text-sky-600 dark:text-sky-400">{phase.recommendedProduct}</span></span>
                          {phase.recommendedQuantity && (
                            <span className="text-ink">الكمية: <span className="text-amber-600 dark:text-amber-400">{phase.recommendedQuantity} {phase.quantityUnit}</span></span>
                          )}
                        </div>
                      )}

                      {/* === Linked Operations === */}
                      {linkedOps.length > 0 && (
                        <div className="mt-3 mb-3 border-t border-border/50 pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-ink-muted flex items-center gap-1">
                              <Tractor className="w-3.5 h-3.5" /> العمليات المرتبطة ({linkedOps.length})
                            </p>
                            <span className="text-xs font-bold text-danger">
                              إجمالي: {formatMoney(totalLinkedCost)}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {linkedOps.map(op => (
                              <div key={op.id} className="bg-paper-sunken p-2.5 rounded-lg text-xs flex justify-between items-center border border-border">
                                <div className="flex items-center gap-2">
                                  <Link2 className="w-3 h-3 text-indigo-500" />
                                  <span className="font-bold text-ink">{op.operationType}</span>
                                  <span className="text-ink-muted">- {new Date(op.date).toLocaleDateString('ar-EG')}</span>
                                  {op.notes && <span className="text-ink-muted truncate max-w-[150px]">({op.notes})</span>}
                                </div>
                                <span className="font-bold text-danger">{formatMoney((op.totalCost || 0))}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* === Action Buttons === */}
                      {!isCompleted ? (
                        <div className="flex flex-wrap justify-end gap-2 mt-3">
                          {/* Add/Link operation button */}
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            onClick={() => setOperationPhase(phase)}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            تسجيل عملية
                          </Button>
                          
                          {/* Complete phase button */}
                          <Button 
                            size="sm" 
                            variant={isDue ? "primary" : "outline"} 
                            onClick={() => {
                              setPhaseToComplete(phase);
                              setActualProduct(phase.recommendedProduct || "");
                              setActualQuantity(phase.recommendedQuantity || 0);
                              setActualNotes("");
                              setInventoryItemId("");
                            }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                            تأشير كمكتمل
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-success font-bold flex flex-col gap-1">
                          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> تم التنفيذ بنجاح</span>
                          {(execution.actualProduct || execution.actualQuantity || execution.inventoryItemId) && (
                            <span className="text-ink-muted font-normal block mt-1 border-t border-border/50 pt-1">
                              تم استخدام: {execution.actualProduct || "مواد من المخزن"} ({execution.actualQuantity})
                              {execution.actualNotes && ` - ${execution.actualNotes}`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportViewer
        open={isReportViewerOpen}
        onClose={() => setIsReportViewerOpen(false)}
        title={`ورقة مهام العمل الزراعي - ${printFilter}`}
        documentNo={cropCycleId.substring(0, 8)}
        exportFileName={`مهام_المحصول_${cropCycleId.substring(0, 8)}`}
        data={filteredPhases.filter(p => !program.executions[p.id]?.isCompleted)}
        columns={[
          { header: "اليوم", cell: (row) => <div className="font-bold text-center">{row.dayNumber}</div> },
          { header: "النوع", accessorKey: "type" },
          { 
            header: "المهمة والتفاصيل", 
            cell: (row) => (
              <div>
                <strong>{row.title}</strong>
                {row.description && <p className="text-gray-600 text-xs mt-1">{row.description}</p>}
              </div>
            )
          },
          { 
            header: "الكمية / المادة", 
            cell: (row) => row.recommendedProduct ? `${row.recommendedProduct} (${row.recommendedQuantity || '-'} ${row.quantityUnit || ''})` : '---' 
          },
          { header: "توقيع المنفذ", cell: () => "" },
        ]}
      />

      {/* === INLINE Operation Form Dialog === */}
      <OperationForm
        open={!!operationPhase}
        onClose={() => setOperationPhase(null)}
        onSubmit={handleOperationSubmit}
        farms={farms}
        seasons={seasons}
        cropCycles={cropCycles}
        crops={crops}
        inventoryItems={inventoryItems || []}
        contractors={contractors}
        equipment={equipment || []}
        isSubmitting={createOp.isPending}
        lockContext={true}
        defaultValues={operationPhase ? {
          farmId,
          seasonId: cropCycles.find(c => c.id === cropCycleId)?.seasonId || "",
          cropCycleId,
          operationType: PHASE_TO_OP_TYPE[Array.isArray(operationPhase.type) ? operationPhase.type[0] : operationPhase.type as unknown as string] || "أخرى",
          date: getPhaseDate(operationPhase.dayNumber),
          linkedPhaseId: operationPhase.id,
          programId: program?.id || "",
        } : undefined}
      />

      {/* Completion Dialog */}
      <Dialog open={!!phaseToComplete} onClose={() => setPhaseToComplete(null)} title="تأكيد تنفيذ المهمة">
        <div className="space-y-5">
          
          {/* Show linked operations summary if any */}
          {(() => {
            const ops = operations.filter(op => op.linkedPhaseId === phaseToComplete?.id);
            if (ops.length > 0) {
              return (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800/30">
                  <p className="text-sm font-bold text-indigo-800 dark:text-indigo-400 mb-2 flex items-center gap-2">
                    <Tractor className="w-4 h-4" /> العمليات المسجلة لهذه المهمة ({ops.length})
                  </p>
                  <div className="space-y-1">
                    {ops.map(op => (
                      <div key={op.id} className="flex justify-between text-xs p-1.5 bg-white/50 dark:bg-black/10 rounded-md">
                        <span>{op.operationType} - {new Date(op.date).toLocaleDateString('ar-EG')}</span>
                        <span className="font-bold text-danger">{formatMoney((op.totalCost || 0))}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-indigo-600/70 mt-2">
                    إجمالي: <strong>{ops.reduce((s, o) => s + (o.totalCost || 0), 0).toLocaleString()}</strong> ج.م
                  </p>
                </div>
              );
            }
            return null;
          })()}

          <div className="p-3 bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800/30 text-sm leading-relaxed">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>إذا لم تُسجل عملية زراعية لهذه المهمة، يمكنك إتمامها سريعاً من هنا (بدون تسجيل تكاليف تفصيلية).</span>
            </div>
          </div>

          {phaseToComplete?.type?.includes("حصاد") ? (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800/30 text-sm leading-relaxed">
                <span>تهانينا! تسجيل هذا الحصاد سيقوم بإضافة المنتج كـ "منتج تام" في المخزن تلقائياً لتتمكن من بيعه.</span>
              </div>
              <div className="space-y-1.5">
                <Label>اسم المحصول (المنتج)</Label>
                <Input value={actualProduct} onChange={e => setActualProduct(e.target.value)} placeholder="مثال: طماطم فرز أول" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>الكمية المحصودة</Label>
                  <Input type="number" value={actualQuantity} onChange={e => setActualQuantity(Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>وحدة القياس</Label>
                  <Input value={editingPhase?.quantityUnit || "طن"} onChange={e => setEditingPhase(prev => prev ? { ...prev, quantityUnit: e.target.value } : null)} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>سحب مادة من المخزن (اختياري)</Label>
                <Select value={inventoryItemId} onChange={e => {
                  setInventoryItemId(e.target.value);
                  const item = inventoryItems?.find(i => i.id === e.target.value);
                  if (item) setActualProduct(item.name);
                }}>
                  <option value="">-- بدون سحب أو مادة خارجية --</option>
                  {inventoryItems?.filter(i => ["أسمدة حرة", "أسمدة مدعمة", "مغذيات", "مبيدات"].includes(i.category)).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (المتاح: {item.quantity} {item.unit})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>المادة المستخدمة أو اسم السماد</Label>
                <Input value={actualProduct} onChange={e => setActualProduct(e.target.value)} disabled={!!inventoryItemId} />
              </div>
              <div className="space-y-1.5">
                <Label>الكمية المستخدمة</Label>
                <Input type="number" value={actualQuantity} onChange={e => setActualQuantity(Number(e.target.value))} />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>ملاحظات إضافية</Label>
            <Input value={actualNotes} onChange={e => setActualNotes(e.target.value)} placeholder="مثال: تم إضافة مقوي جذور مع الخلطة..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setPhaseToComplete(null)}>إلغاء</Button>
            <Button onClick={handleCompletePhase} disabled={updatePhaseExecution.isPending || addTransaction.isPending}>
              {updatePhaseExecution.isPending || addTransaction.isPending ? "جاري الحفظ..." : "حفظ كمكتمل"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Add/Edit Phase Dialog */}
      <Dialog open={!!editingPhase} onClose={() => setEditingPhase(null)} title={editingPhase?.id ? "تعديل المهمة" : "إضافة مهمة جديدة"}>
        <div className="space-y-5">
          
          {/* Task Type */}
          <div className="space-y-2">
            <Label>نوع المهمة (اختر أو اكتب جديد)</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select 
                value={ALL_TYPES.includes(Array.isArray(editingPhase?.type) ? editingPhase?.type[0] : (editingPhase?.type as unknown as string) || "") ? (Array.isArray(editingPhase?.type) ? editingPhase?.type[0] : editingPhase?.type) as unknown as string : 'custom'} 
                onChange={e => {
                  if (e.target.value !== 'custom') {
                    setEditingPhase(prev => ({ ...prev, type: [e.target.value] as any }));
                  } else {
                    setEditingPhase(prev => ({ ...prev, type: [] as any }));
                  }
                }}
                className="w-full sm:w-1/2"
              >
                {ALL_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
                <option value="custom">+ إضافة نوع جديد (نص مخصص)</option>
              </Select>
              {!ALL_TYPES.includes(Array.isArray(editingPhase?.type) ? editingPhase?.type[0] : (editingPhase?.type as unknown as string) || "") && (
                <Input 
                  value={Array.isArray(editingPhase?.type) ? editingPhase?.type[0] : (editingPhase?.type as unknown as string) || ""} 
                  onChange={e => setEditingPhase(prev => ({ ...prev, type: [e.target.value] as any }))} 
                  placeholder="اكتب نوع المهمة الجديد..."
                  className="w-full sm:w-1/2"
                />
              )}
            </div>
          </div>

          {/* Date / Day Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-paper-sunken p-4 rounded-xl border border-border">
            <div className="space-y-2">
              <Label>عدد الأيام (من الزراعة)</Label>
              <Input 
                type="number" min="0" 
                value={editingPhase?.dayNumber || 0} 
                onChange={e => setEditingPhase(prev => ({ ...prev, dayNumber: Number(e.target.value) }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>أو تحديد التاريخ المستهدف</Label>
              <Input 
                type="date" 
                value={(() => {
                  if (!plantDate || editingPhase?.dayNumber === undefined) return "";
                  const d = new Date(plantDate);
                  d.setDate(d.getDate() + editingPhase.dayNumber);
                  return d.toISOString().split("T")[0];
                })()}
                onChange={e => {
                  if (!plantDate || !e.target.value) return;
                  const plant = new Date(plantDate).getTime();
                  const target = new Date(e.target.value).getTime();
                  const diffDays = Math.floor((target - plant) / (1000 * 3600 * 24));
                  setEditingPhase(prev => ({ ...prev, dayNumber: diffDays >= 0 ? diffDays : 0 }));
                }} 
              />
              <p className="text-[10px] text-ink-muted">اختيار التاريخ سيحسب الأيام تلقائياً</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>عنوان المهمة</Label>
            <Input value={editingPhase?.title || ""} onChange={e => setEditingPhase(prev => ({ ...prev, title: e.target.value }))} placeholder="مثال: رية المحاياة" />
          </div>
          <div className="space-y-1.5">
            <Label>الوصف الفني</Label>
            <Input value={editingPhase?.description || ""} onChange={e => setEditingPhase(prev => ({ ...prev, description: e.target.value }))} placeholder="وصف تفصيلي للمهمة" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>المادة الموصى بها (اختياري)</Label>
              <Input value={editingPhase?.recommendedProduct || ""} onChange={e => setEditingPhase(prev => ({ ...prev, recommendedProduct: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>الكمية</Label>
                <Input type="number" value={editingPhase?.recommendedQuantity || 0} onChange={e => setEditingPhase(prev => ({ ...prev, recommendedQuantity: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <Label>الوحدة</Label>
                <Input value={editingPhase?.quantityUnit || ""} onChange={e => setEditingPhase(prev => ({ ...prev, quantityUnit: e.target.value }))} placeholder="مثال: لتر/فدان" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
            <Button variant="outline" onClick={() => setEditingPhase(null)}>إلغاء</Button>
            <Button onClick={handleSavePhase} disabled={updateCycleProgramPhases.isPending || !editingPhase?.title}>
              {updateCycleProgramPhases.isPending ? "جاري الحفظ..." : "حفظ المهمة"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
