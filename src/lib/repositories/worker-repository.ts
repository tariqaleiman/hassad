import { FirestoreRepository } from "./firestore-repository";
import type { Worker, WorkerFormValues } from "@/lib/types/worker";

class WorkerRepository extends FirestoreRepository<Worker, WorkerFormValues> {
  constructor() {
    super("workers");
  }
}

export const workerRepository = new WorkerRepository();
