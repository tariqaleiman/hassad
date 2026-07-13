import { FirestoreRepository } from "./firestore-repository";
import type { Crop, CropFormValues } from "@/lib/types/crop";

class CropRepository extends FirestoreRepository<Crop, CropFormValues> {
  constructor() {
    super("crops");
  }
}

export const cropRepository = new CropRepository();
