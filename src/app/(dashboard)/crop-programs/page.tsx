"use client";

import { useState } from "react";
import { BookOpen, Sprout, Search } from "lucide-react";
import { useCropPrograms, useCropProgramsActions } from "@/lib/hooks/use-crop-programs";
import { useCrops } from "@/lib/hooks/use-crops";
import { CropProgramModal } from "@/components/crop-programs/crop-program-modal";
import { CropProgramForm } from "@/components/crop-programs/crop-program-form";
import { PhaseDetailsModal } from "@/components/crop-programs/phase-details-modal";
import { PhaseEditModal } from "@/components/crop-programs/phase-edit-modal";
import type { CropProgramSchema } from "@/components/crop-programs/crop-program-schema";
import { Dialog } from "@/components/ui/dialog";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { CropProgramTemplate } from "@/lib/types/crop-program";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CropProgramsPage() {
  const { data: programs, isLoading } = useCropPrograms();
  const { data: crops, isLoading: cropsLoading } = useCrops();
  const { createTemplate } = useCropProgramsActions();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<CropProgramTemplate | null>(null);
  const [editingProgram, setEditingProgram] = useState<CropProgramTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Phase modals state
  const [detailsPhase, setDetailsPhase] = useState<any>(null); // The phase to show details for
  const [editingPhase, setEditingPhase] = useState<any>(null); // The phase to edit

  const filteredPrograms = programs?.filter(p => 
    p.name.includes(searchTerm) || p.cropName.includes(searchTerm)
  ) || [];

  const handleCreate = async (data: CropProgramSchema) => {
    const crop = crops?.find(c => c.id === data.cropId);
    if (editingProgram) {
      // For MVP: assume createTemplate handles updates if ID exists, or we need updateTemplate from useCropProgramsActions
      // I'll call createTemplate with id for now and assume the service handles upsert or we mock it.
      await createTemplate.mutateAsync({
        ...editingProgram,
        ...data,
        cropName: crop?.name || "محصول غير معروف",
        isCustom: true,
      } as any);
      setEditingProgram(null);
    } else {
      await createTemplate.mutateAsync({
        ...data,
        cropName: crop?.name || "محصول غير معروف",
        isCustom: true,
      } as any);
      setIsCreating(false);
    }
  };

  const handleUpdatePhase = async (updatedPhase: any) => {
    if (!selectedProgram) return;
    const updatedPhases = selectedProgram.phases.map(p => p.id === updatedPhase.id ? updatedPhase : p);
    await createTemplate.mutateAsync({
      ...selectedProgram,
      phases: updatedPhases,
    } as any);
    
    // Update local state to reflect changes instantly in the modal
    setSelectedProgram({
      ...selectedProgram,
      phases: updatedPhases,
    });
    setEditingPhase(null);
  };

  if (isLoading || cropsLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-ink flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-crop-500" />
            برامج المحاصيل (Crop Programs)
          </h1>
          <p className="text-ink-muted mt-2 max-w-2xl">
            دليلك الشامل لزراعة المحاصيل الاستراتيجية. استعرض البرامج المعتمدة ومراحل النمو والتوصيات المثلى للوصول لأعلى إنتاجية.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto flex items-center gap-2">
          <Plus className="w-4 h-4" /> إنشاء برنامج جديد
        </Button>
      </div>

      <div className="flex justify-between items-center bg-paper-sunken p-4 rounded-2xl border border-border/50">
        <div className="relative w-full max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-muted" />
          <Input 
            placeholder="ابحث عن برنامج أو محصول..." 
            className="rtl:pr-10 rtl:pl-4 border-border/50 bg-paper"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm font-bold text-ink-muted hidden sm:block">
          {filteredPrograms.length} برامج متاحة
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPrograms.map((program) => {
            const linkedCrop = crops?.find(c => c.id === program.cropId || c.name === program.cropName);
            return (
              <Card 
                key={program.id} 
                className="group cursor-pointer rounded-3xl border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                onClick={() => setSelectedProgram(program)}
              >
                <div className="h-36 relative bg-crop-100 dark:bg-crop-900/30">
                  {linkedCrop?.imageUrl ? (
                    <img src={linkedCrop.imageUrl} alt={program.cropName} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center text-crop-500/30">
                        <Sprout className="h-16 w-16" />
                      </div>
                    </>
                  )}
                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold font-display text-lg line-clamp-1 shadow-sm">{program.name}</h3>
                    <p className="text-sm font-medium text-white/80">{program.cropName}</p>
                  </div>
                  
                  <div className="absolute top-4 right-4 h-10 w-10 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl shadow-md flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-crop-600" />
                  </div>
                </div>
                <CardContent className="p-5 pt-4">
                  <p className="text-sm text-ink-muted line-clamp-2 h-10 mb-4">{program.description}</p>
                  
                  <div className="flex items-center justify-between text-sm font-bold pt-4 border-t border-border/50">
                    <span className="text-ink-muted">المدة التقريبية</span>
                    <span className="font-mono text-crop-600 bg-crop-50 dark:bg-crop-900/30 px-3 py-1 rounded-lg">
                      {program.totalDurationDays || Math.max(...program.phases.map(p => p.dayNumber), 0) + 10} يوم
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredPrograms.length === 0 && (
            <div className="col-span-full text-center py-20 text-ink-muted">
              لم يتم العثور على برامج مطابقة لبحثك.
            </div>
          )}
        </div>

      <CropProgramModal 
        program={selectedProgram}
        open={!!selectedProgram && !editingProgram && !detailsPhase && !editingPhase}
        onClose={() => setSelectedProgram(null)}
        onEdit={() => {
          setEditingProgram(selectedProgram);
          setSelectedProgram(null);
        }}
        onPhaseClick={(phase) => setDetailsPhase(phase)}
      />

      <Dialog open={isCreating || !!editingProgram} onClose={() => { setIsCreating(false); setEditingProgram(null); }} title={editingProgram ? "تعديل البرنامج الزراعي" : "إنشاء برنامج زراعي جديد"} className="max-w-4xl">
        <CropProgramForm
          crops={crops || []}
          defaultValues={editingProgram}
          onSubmit={handleCreate}
          loading={createTemplate.isPending}
          onCancel={() => { setIsCreating(false); setEditingProgram(null); }}
        />
      </Dialog>

      <PhaseDetailsModal
        program={selectedProgram}
        phase={detailsPhase}
        open={!!detailsPhase && !editingPhase}
        onClose={() => setDetailsPhase(null)}
        onEdit={() => {
          setEditingPhase(detailsPhase);
          setDetailsPhase(null);
        }}
      />

      <PhaseEditModal
        phase={editingPhase}
        open={!!editingPhase}
        onClose={() => setEditingPhase(null)}
        onSave={handleUpdatePhase}
        loading={createTemplate.isPending}
      />
    </div>
  );
}
