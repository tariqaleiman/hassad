"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cropProgramService } from "@/lib/services/crop-program-service";
import type { CropProgramTemplate, CropCycleProgram, CyclePhaseExecution } from "@/lib/types/crop-program";

export const CROP_PROGRAMS_KEY = ["crop-programs"] as const;
export const SYSTEM_TEMPLATES_KEY = ["system-templates"] as const;
export const CYCLE_PROGRAM_KEY = ["cycle-program"] as const;

export function useSystemTemplates() {
  return useQuery({
    queryKey: [...SYSTEM_TEMPLATES_KEY],
    queryFn: () => cropProgramService.getSystemTemplates(),
  });
}

export function useCycleProgram(cycleId: string | null) {
  return useQuery({
    queryKey: [...CYCLE_PROGRAM_KEY, cycleId],
    queryFn: () => cycleId ? cropProgramService.getProgramByCycleId(cycleId) : null,
    enabled: !!cycleId,
  });
}

// Added this to satisfy my new page `crop-programs/page.tsx`
export function useCropPrograms() {
  return useQuery({
    queryKey: [...SYSTEM_TEMPLATES_KEY], // They are the same thing
    queryFn: () => cropProgramService.getSystemTemplates(),
  });
}

export function useCropProgramsActions() {
  const queryClient = useQueryClient();

  const createTemplate = useMutation({
    mutationFn: (data: Partial<CropProgramTemplate>) => cropProgramService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYSTEM_TEMPLATES_KEY });
    },
  });

  const createCycleProgram = useMutation({
    mutationFn: (data: Partial<CropCycleProgram>) => cropProgramService.createCycleProgram(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...CYCLE_PROGRAM_KEY, variables.cropCycleId] });
    },
  });

  const updatePhaseExecution = useMutation({
    mutationFn: ({ programId, phaseId, execution }: { programId: string, phaseId: string, execution: CyclePhaseExecution }) => 
      cropProgramService.updatePhaseExecution(programId, phaseId, execution),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CYCLE_PROGRAM_KEY });
    },
  });

  const updateCycleProgramPhases = useMutation({
    mutationFn: ({ programId, phases }: { programId: string, phases: any[] }) => 
      cropProgramService.updateCycleProgramPhases(programId, phases),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CYCLE_PROGRAM_KEY });
    },
  });

  return {
    createTemplate,
    createCycleProgram,
    updatePhaseExecution,
    updateCycleProgramPhases,
  };
}
