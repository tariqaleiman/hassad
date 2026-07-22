import type { BaseEntity } from "./common";

export type ProgramPhaseType = "ري" | "تسميد" | "ري وتسميد" | "رش وقائي" | "رش علاجي" | "رش مغذي" | "عزيق" | "أخرى" | "حصاد" | string;

export interface CropProgramPhase {
  id: string;
  dayNumber: number;
  type: string[];
  title: string;
  description?: string;
  recommendedProduct?: string;
  recommendedQuantity?: number;
  quantityUnit?: string;
}

export interface CyclePhaseExecution {
  phaseId: string;
  isCompleted: boolean;
  completedAt?: string;
  actualProduct?: string;
  actualQuantity?: number;
  actualNotes?: string;
  inventoryItemId?: string;
  inventoryTransactionId?: string;
}

export interface CropProgramTemplate extends BaseEntity {
  name: string;
  cropId: string; // The ID of the crop in the crops database
  cropName: string; // The UI display name (denormalized for convenience)
  description: string;
  isCustom: boolean;
  farmId?: string;
  phases: CropProgramPhase[];
  // For UI display of standard templates
  totalDurationDays?: number;
  plantingMethods?: string[]; // طرق الزراعة المدعومة (إذا كان فارغاً يعني يدعم جميع الطرق)
}

export interface CropCycleProgram extends BaseEntity {
  farmId: string;
  cropCycleId: string;
  templateId: string; // ID of the CropProgramTemplate or "custom"
  startDate: string;
  status: "active" | "completed" | "cancelled";
  phases: CropProgramPhase[];
  executions: Record<string, CyclePhaseExecution>; // key is phaseId
}

// Aliases to match my new phase 6 UI while keeping compatibility
export type CropProgram = CropProgramTemplate;
export type ProgramStage = {
  id: string;
  name: string;
  startDay: number;
  endDay: number;
  tasks: CropProgramPhase[];
};
export type StageTask = CropProgramPhase;
