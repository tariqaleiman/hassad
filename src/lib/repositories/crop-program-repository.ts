import { FirestoreRepository } from "./firestore-repository";
import type { CropProgramTemplate, CropCycleProgram } from "../types/crop-program";

class CropProgramTemplateRepository extends FirestoreRepository<CropProgramTemplate, Partial<CropProgramTemplate>> {
  constructor() {
    super("cropProgramTemplates");
  }
}

class CropCycleProgramRepository extends FirestoreRepository<CropCycleProgram, Partial<CropCycleProgram>> {
  constructor() {
    super("cropCyclePrograms");
  }
}

export const cropProgramTemplateRepository = new CropProgramTemplateRepository();
export const cropCycleProgramRepository = new CropCycleProgramRepository();
