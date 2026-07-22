"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Leaf, CalendarDays, Sprout, Bug, Droplet, Sun, Settings } from "lucide-react";
import type { CropProgram } from "@/lib/types/crop-program";

interface CropProgramModalProps {
  program: CropProgram | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onPhaseClick?: (phase: any) => void;
}

export function CropProgramModal({ program, open, onClose, onEdit, onPhaseClick }: CropProgramModalProps) {
  if (!program) return null;

  const getTaskIcon = (type: string | string[]) => {
    const t = Array.isArray(type) ? type[0] : type;
    switch (t) {
      case "تسميد": return <Sprout className="h-4 w-4 text-emerald-500" />;
      case "ري": return <Droplet className="h-4 w-4 text-blue-500" />;
      case "رش وقائي":
      case "رش علاجي": return <Bug className="h-4 w-4 text-rose-500" />;
      default: return <Settings className="h-4 w-4 text-slate-500" />;
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
    <Dialog open={open} onClose={onClose} title={program.name} className="max-w-4xl">
      <div className="space-y-6 mt-4">
        {/* Header Info */}
        <div className="flex items-center gap-6 p-5 bg-gradient-to-r from-crop-50/50 to-transparent dark:from-crop-900/10 rounded-2xl border border-crop-100 dark:border-crop-900/30">
          <div className="h-16 w-16 bg-gradient-to-br from-crop-400 to-crop-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <Leaf className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-ink">{program.name}</h3>
            <p className="text-sm font-medium text-crop-600 mt-1">{program.cropName}</p>
            {program.plantingMethods && program.plantingMethods.length > 0 && (
              <div className="flex gap-2 mt-2">
                {program.plantingMethods.map(m => (
                  <Badge key={m} variant="neutral" className="text-[10px] bg-white/50 dark:bg-black/20 text-ink-muted">{m}</Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-ink-muted mt-2">{program.description}</p>
          </div>
          <div className="mr-auto text-center px-4 flex flex-col justify-center items-end gap-2">
            <div className="text-center px-4">
              <div className="flex items-center gap-1.5 text-ink-muted mb-1 justify-center">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-bold">المدة التقريبية</span>
              </div>
              <p className="text-2xl font-bold font-mono text-crop-600">{program.totalDurationDays || Math.max(...program.phases.map(p => p.dayNumber), 0) + 10} <span className="text-sm font-normal">يوم</span></p>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="mt-2 text-xs">
                تعديل البرنامج
              </Button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500" />
            مراحل النمو والعمليات
          </h4>
          
          <div className="pr-4 rtl:pl-4 rtl:pr-0">
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 rtl:before:ml-0 rtl:before:mr-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent">
              {program.phases.sort((a, b) => a.dayNumber - b.dayNumber).map((phase, index) => (
                <div key={phase.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline dot */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-paper bg-crop-100 text-crop-600 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 rtl:md:group-odd:translate-x-1/2 rtl:md:group-even:-translate-x-1/2 z-10">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  
                  {/* Content Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-paper border border-border/50 p-1 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className={`flex items-start gap-4 p-4 rounded-[14px] border ${getTaskColor(phase.type)}`}>
                      <div className="mt-0.5 bg-white/80 dark:bg-black/20 p-2 rounded-xl shadow-sm">{getTaskIcon(phase.type)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-bold text-base">{phase.title}</h5>
                            <div className="flex gap-1 mt-1">
                              {Array.isArray(phase.type) ? phase.type.map(t => (
                                <Badge key={t} variant="neutral" className="text-[10px] opacity-70">{t}</Badge>
                              )) : (
                                <Badge variant="neutral" className="text-[10px] opacity-70">{phase.type}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant="wheat" className="font-mono text-xs shadow-sm bg-white/80 dark:bg-black/50">اليوم {phase.dayNumber}</Badge>
                            {onPhaseClick && (
                              <button onClick={() => onPhaseClick(phase)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md">
                                <Settings className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        {phase.description && <p className="text-sm opacity-80 mb-3 leading-relaxed">{phase.description}</p>}
                        
                        {(phase.recommendedProduct || phase.recommendedQuantity) && (
                          <div className="mt-3 bg-white/60 dark:bg-black/20 rounded-xl p-3 text-xs flex gap-6 border border-white/20 dark:border-white/5">
                            {phase.recommendedProduct && (
                              <div>
                                <span className="opacity-60 block mb-1">المنتج المقترح:</span>
                                <strong className="font-bold text-sm">{phase.recommendedProduct}</strong>
                              </div>
                            )}
                            {phase.recommendedQuantity && (
                              <div>
                                <span className="opacity-60 block mb-1">الكمية:</span>
                                <strong className="font-bold font-mono text-sm">{phase.recommendedQuantity} {phase.quantityUnit}</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
