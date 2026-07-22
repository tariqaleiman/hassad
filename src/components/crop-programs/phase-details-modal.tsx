import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sprout, Droplet, Bug, Settings, CalendarDays, Edit3 } from "lucide-react";
import type { CropProgramPhase, CropProgramTemplate } from "@/lib/types/crop-program";

interface PhaseDetailsModalProps {
  program: CropProgramTemplate | null;
  phase: CropProgramPhase | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function PhaseDetailsModal({ program, phase, open, onClose, onEdit }: PhaseDetailsModalProps) {
  if (!phase || !program) return null;

  const getTaskIcon = (type: string | string[]) => {
    const t = Array.isArray(type) ? type[0] : type;
    switch (t) {
      case "تسميد": return <Sprout className="h-6 w-6 text-emerald-500" />;
      case "ري": return <Droplet className="h-6 w-6 text-blue-500" />;
      case "رش وقائي":
      case "رش علاجي": return <Bug className="h-6 w-6 text-rose-500" />;
      default: return <Settings className="h-6 w-6 text-slate-500" />;
    }
  };

  const getTaskColor = (type: string | string[]) => {
    const t = Array.isArray(type) ? type[0] : type;
    switch (t) {
      case "تسميد": return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400";
      case "ري": return "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400";
      case "رش وقائي":
      case "رش علاجي": return "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400";
      default: return "bg-slate-50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-900/30 text-slate-700 dark:text-slate-400";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="تفاصيل المهمة" className="max-w-xl">
      <div className="space-y-6 mt-4">
        {/* Header */}
        <div className={`flex items-start gap-4 p-5 rounded-2xl border ${getTaskColor(phase.type)}`}>
          <div className="mt-1 bg-white/80 dark:bg-black/20 p-3 rounded-xl shadow-sm">
            {getTaskIcon(phase.type)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-xl">{phase.title}</h3>
                <div className="flex gap-1.5 mt-2">
                  {Array.isArray(phase.type) ? phase.type.map(t => (
                    <Badge key={t} variant="neutral" className="text-xs bg-white/50 dark:bg-black/20 border-none">{t}</Badge>
                  )) : (
                    <Badge variant="neutral" className="text-xs bg-white/50 dark:bg-black/20 border-none">{phase.type as unknown as string}</Badge>
                  )}
                </div>
              </div>
              <div className="text-center bg-white/60 dark:bg-black/40 px-3 py-2 rounded-lg shadow-sm border border-black/5 dark:border-white/5">
                <div className="flex items-center justify-center gap-1 opacity-70 mb-1">
                  <CalendarDays className="w-3 h-3" />
                  <span className="text-[10px] font-bold">التوقيت</span>
                </div>
                <div className="font-mono font-bold text-sm">اليوم {phase.dayNumber}</div>
              </div>
            </div>
            {phase.description && (
              <p className="text-sm opacity-90 mt-4 leading-relaxed p-3 bg-white/40 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/5">
                {phase.description}
              </p>
            )}
          </div>
        </div>

        {/* Resources */}
        {(phase.recommendedProduct || phase.recommendedQuantity) && (
          <div>
            <h4 className="font-bold text-sm mb-3">الموارد المقترحة</h4>
            <div className="grid grid-cols-2 gap-4">
              {phase.recommendedProduct && (
                <div className="bg-paper p-4 rounded-xl border border-border">
                  <span className="text-xs text-ink-muted block mb-1">المنتج المقترح</span>
                  <strong className="font-bold">{phase.recommendedProduct}</strong>
                </div>
              )}
              {phase.recommendedQuantity && (
                <div className="bg-paper p-4 rounded-xl border border-border">
                  <span className="text-xs text-ink-muted block mb-1">الكمية</span>
                  <strong className="font-bold font-mono">{phase.recommendedQuantity} {phase.quantityUnit}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Program Context */}
        <div className="bg-paper-sunken p-4 rounded-xl border border-border/50 flex justify-between items-center">
          <div>
            <span className="text-xs text-ink-muted block mb-1">جزء من برنامج:</span>
            <strong className="font-bold text-sm">{program.name}</strong>
          </div>
          <Badge variant="wheat" className="text-[10px]">{program.cropName}</Badge>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
          <Button onClick={onEdit} className="gap-2">
            <Edit3 className="w-4 h-4" />
            تعديل المهمة
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
