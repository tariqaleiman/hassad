import { ownerRepository } from "@/lib/repositories/owner-repository";
import type { OwnerProfile } from "@/lib/types/owner";

export const ownerService = {
  get: (): Promise<OwnerProfile | null> => ownerRepository.get(),
  save: (profile: OwnerProfile): Promise<void> => ownerRepository.save(profile),
};
