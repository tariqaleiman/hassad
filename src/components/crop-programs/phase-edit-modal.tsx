import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cropProgramPhaseSchema } from "./crop-program-schema";
import type { z } from "zod";
import type { CropProgramPhase } from "@/lib/types/crop-program";
import { PHASE_TYPES } from "./crop-program-form";
import { cn } from "@/lib/utils";

type PhaseSchema = z.infer<typeof cropProgramPhaseSchema>;

interface PhaseEditModalProps {
  phase: CropProgramPhase | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedPhase: CropProgramPhase) => Promise<void>;
  loading?: boolean;
}

export function PhaseEditModal({ phase, open, onClose, onSave, loading }: PhaseEditModalProps) {
  const form = useForm<PhaseSchema>({
    resolver: zodResolver(cropProgramPhaseSchema) as any,
    defaultValues: phase || {
      dayNumber: 0,
      title: "",
      type: ["أخرى"],
      description: "",
    },
    values: phase as PhaseSchema, // Update values when phase changes
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;

  const handleFormSubmit = async (data: PhaseSchema) => {
    if (!phase) return;
    await onSave({ ...phase, ...data } as CropProgramPhase);
  };

  const togglePhaseType = (type: string) => {
    const currentTypes = watch("type") || [];
    if (currentTypes.includes(type)) {
      setValue("type", currentTypes.filter(t => t !== type), { shouldDirty: true });
    } else {
      setValue("type", [...currentTypes, type], { shouldDirty: true });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="تعديل المهمة">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>اليوم (من تاريخ الزراعة) *</Label>
            <Input
              type="number"
              {...register("dayNumber", { valueAsNumber: true })}
            />
            {errors.dayNumber && <p className="text-xs text-danger">{errors.dayNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>عنوان المهمة *</Label>
            <Input {...register("title")} placeholder="مثال: رية المحاياة" />
            {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>نوع العملية (يمكن اختيار أكثر من نوع) *</Label>
            <div className="flex flex-wrap gap-2">
              {PHASE_TYPES.map(t => {
                const isSelected = (watch("type") || []).includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => togglePhaseType(t)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-lg transition-colors border",
                      isSelected 
                        ? "bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300 font-bold shadow-sm" 
                        : "bg-paper border-border text-ink-muted hover:border-amber-300"
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            {errors.type && <p className="text-xs text-danger">{errors.type.message}</p>}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>وصف المهمة (اختياري)</Label>
            <Textarea
              {...register("description")}
              className="resize-none h-20"
              placeholder="اكتب تفاصيل إضافية للمهمة..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>إلغاء</Button>
          <Button type="submit" loading={loading} disabled={loading}>
            حفظ التعديلات
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
