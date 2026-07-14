import { ownerRepository } from "@/lib/repositories/owner-repository";
import type { OwnerProfile } from "@/lib/types/owner";

export const ownerService = {
  get: (userId: string): Promise<OwnerProfile | null> => ownerRepository.get(userId),
  save: (profile: OwnerProfile, userId: string): Promise<void> => ownerRepository.save(profile, userId),
};
