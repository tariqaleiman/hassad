"use client";

import { useState, useMemo } from "react";
import { CheckCircle, CalendarDays, Sprout, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { useCropCycles } from "@/lib/hooks/use-crop-cycles";
import { useCropPrograms } from "@/lib/hooks/use-crop-programs";
import { useFarms } from "@/lib/hooks/use-farms";
import { useLands } from "@/lib/hooks/use-lands";
import { useCrops } from "@/lib/hooks/use-crops";
import { useInventory } from "@/lib/hooks/use-inventory";
import { useContractors } from "@/lib/hooks/use-contractors";
import { useEquipment } from "@/lib/hooks/use-equipment";
import { useSeasons } from "@/lib/hooks/use-seasons";
import { OperationForm } from "@/components/operations/operation-form";
import { useCreateOperation } from "@/lib/hooks/use-operations";
import type { OperationSchema } from "@/components/operations/operation-schema";

export default function TasksPage() {
  const { data: cycles, isLoading: loadingCycles } = useCropCycles();
  const { data: programs, isLoading: loadingPrograms } = useCropPrograms();
  const { data: farms } = useFarms();
  const { data: lands } = useLands();
  const { data: crops } = useCrops();
  
  // Data needed for OperationForm
  const { data: inventoryItems = [] } = useInventory();
  const { data: contractors = [] } = useContractors();
  const { data: equipment = [] } = useEquipment();
  const { data: seasons = [] } = useSeasons();

  const createOperation = useCreateOperation();

  const [selectedTask, setSelectedTask] = useState<any>(null);

  const tasks = useMemo(() => {
    if (!cycles || !programs || !farms || !lands || !crops) return [];

    const generatedTasks: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const cycle of cycles) {
      if (cycle.status !== "نشطة" || !cycle.programId || !cycle.plantDate) continue;

      const program = programs.find(p => p.id === cycle.programId);
      if (!program) continue;

      const farm = farms.find(f => f.id === cycle.farmId);
      const land = lands.find(l => l.id === cycle.landId);
      const crop = crops.find(c => c.id === cycle.cropId);

      const plantDate = new Date(cycle.plantDate);
      plantDate.setHours(0, 0, 0, 0);
      const daysElapsed = Math.floor((today.getTime() - plantDate.getTime()) / (1000 * 60 * 60 * 24));

      for (const phase of program.phases) {
        // Skip if already executed
        if (cycle.id && program.id) {
          // Note: In a real app we'd fetch execution status per cycle.
          // For MVP, we will just show tasks around the current day (+/- 3 days).
        }
        
        const daysDifference = phase.dayNumber - daysElapsed;
        
        // Show tasks that are within -7 to +7 days window
        if (daysDifference >= -7 && daysDifference <= 7) {
          generatedTasks.push({
            id: `${cycle.id}-${phase.id}`,
            cycle,
            program,
            phase,
            farm,
            land,
            crop,
            daysDifference,
            status: daysDifference < 0 ? "overdue" : daysDifference === 0 ? "today" : "upcoming",
          });
        }
      }
    }

    return generatedTasks.sort((a, b) => a.daysDifference - b.daysDifference);
  }, [cycles, programs, farms, lands, crops]);

  const overdueTasks = tasks.filter(t => t.status === "overdue");
  const todayTasks = tasks.filter(t => t.status === "today");
  const upcomingTasks = tasks.filter(t => t.status === "upcoming");

  const handleCreateOperation = async (data: OperationSchema) => {
    await createOperation.mutateAsync(data);
    setSelectedTask(null);
  };

  const mapPhaseTypeToOperationType = (type: string | string[]) => {
    const types = Array.isArray(type) ? type : [type];
    
    if (types.includes("ري") && types.includes("تسميد")) return "ري وتسميد";
    if (types.includes("ري")) return "ري";
    if (types.includes("تسميد")) return "تسميد";
    if (types.some(t => typeof t === "string" && t.includes("رش"))) return "رش مبيدات";
    if (types.includes("حصاد")) return "حصاد";
    
    return types[0] || "أخرى";
  };

  if (loadingCycles || loadingPrograms) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-display text-ink flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-crop-500" />
          مهام اليوم
        </h1>
        <p className="text-ink-muted mt-2 max-w-2xl">
          تابع العمليات المطلوبة بناءً على أعمار النباتات والبرامج المعتمدة للزروعات النشطة.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20 bg-paper-raised rounded-2xl border border-border">
          <CheckCircle2 className="h-16 w-16 text-crop-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink">لا توجد مهام حالياً</h2>
          <p className="text-ink-muted mt-2">جميع مهامك مجدولة ولا يوجد ما يستدعي التدخل اليوم.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {overdueTasks.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-danger flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> مهام متأخرة
                <Badge variant="danger" className="mr-2">{overdueTasks.length}</Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overdueTasks.map(task => <TaskCard key={task.id} task={task} onExecute={() => setSelectedTask(task)} />)}
              </div>
            </div>
          )}

          {todayTasks.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-crop-600 flex items-center gap-2">
                <CalendarDays className="w-5 h-5" /> مستحقة اليوم
                <Badge variant="wheat" className="mr-2">{todayTasks.length}</Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayTasks.map(task => <TaskCard key={task.id} task={task} onExecute={() => setSelectedTask(task)} />)}
              </div>
            </div>
          )}

          {upcomingTasks.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-ink flex items-center gap-2">
                <Clock className="w-5 h-5 text-ink-muted" /> مهام قادمة (خلال أسبوع)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingTasks.map(task => <TaskCard key={task.id} task={task} onExecute={() => setSelectedTask(task)} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTask && (
        <OperationForm
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onSubmit={handleCreateOperation}
          isSubmitting={createOperation.isPending}
          farms={farms || []}
          seasons={seasons || []}
          cropCycles={cycles || []}
          crops={crops || []}
          inventoryItems={inventoryItems}
          contractors={contractors}
          equipment={equipment}
          lockContext={true}
          defaultValues={{
            farmId: selectedTask.farm?.id,
            seasonId: selectedTask.cycle?.seasonId,
            cropCycleId: selectedTask.cycle?.id,
            programId: selectedTask.program?.id,
            linkedPhaseId: selectedTask.phase?.id,
            operationType: mapPhaseTypeToOperationType(selectedTask.phase?.type),
            date: new Date().toISOString().split("T")[0],
          }}
        />
      )}
    </div>
  );
}

function TaskCard({ task, onExecute }: { task: any; onExecute: () => void }) {
  const isOverdue = task.status === "overdue";
  const isToday = task.status === "today";
  
  return (
    <Card className={`group overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all ${isOverdue ? 'border-danger/30' : isToday ? 'border-crop-500/30' : 'border-border/50'}`}>
      <div className={`h-2 w-full ${isOverdue ? 'bg-danger/80' : isToday ? 'bg-crop-500' : 'bg-ink-faint'}`} />
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-ink leading-tight">{task.phase.title}</h3>
          <Badge variant={isOverdue ? "danger" : isToday ? "wheat" : "neutral"} className="shrink-0 text-[10px]">
            {isOverdue ? `متأخرة ${Math.abs(task.daysDifference)} أيام` : isToday ? "اليوم" : `بعد ${task.daysDifference} أيام`}
          </Badge>
        </div>
        
        <p className="text-sm text-ink-muted mb-4 line-clamp-2 min-h-[40px]">{task.phase.description}</p>
        
        <div className="space-y-2 text-sm bg-paper-sunken p-3 rounded-xl border border-border/50 mb-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-crop-600" />
            <span className="font-bold text-ink">{task.crop?.name} {task.cycle?.cropVariety ? `(${task.cycle.cropVariety})` : ''}</span>
          </div>
          <div className="flex items-center justify-between text-ink-muted">
            <span>{task.farm?.name} - {task.land?.name}</span>
            <span className="font-mono">{task.cycle?.areaValue} {task.cycle?.areaUnit === "feddan" ? "فدان" : task.cycle?.areaUnit === "qirat" ? "قيراط" : "متر"}</span>
          </div>
        </div>

        <Button onClick={onExecute} className="w-full" variant={isOverdue ? "danger" : isToday ? "primary" : "secondary"}>
          تسجيل العملية
        </Button>
      </CardContent>
    </Card>
  );
}
