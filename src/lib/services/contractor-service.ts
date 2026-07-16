import { contractorRepository } from "../repositories/contractor-repository";
import type { Contractor, ContractorFormValues } from "../types/contractor";

export const contractorService = {
  createContractor: async (data: ContractorFormValues, userId?: string): Promise<Contractor> => {
    return contractorRepository.create({
      ...data,
      balance: data.initialBalance || 0,
    } as Partial<Contractor>, userId);
  },

  updateContractor: async (id: string, data: Partial<ContractorFormValues>, userId?: string): Promise<Contractor> => {
    return contractorRepository.update(id, data, userId);
  },

  getContractorsByFarm: async (farmId: string): Promise<Contractor[]> => {
    return contractorRepository.getByField("farmId", farmId);
  },

  getContractorById: async (id: string): Promise<Contractor | null> => {
    return contractorRepository.getById(id);
  },

  deleteContractor: async (id: string, userId?: string): Promise<void> => {
    return contractorRepository.delete(id, userId);
  },

  /**
   * تحديث رصيد المقاول.
   * amount موجب = زيادة الدين (خدمة جديدة آجلة).
   * amount سالب = سداد دفعة.
   */
  updateBalance: async (id: string, amount: number, userId?: string): Promise<void> => {
    const contractor = await contractorRepository.getById(id);
    if (!contractor) throw new Error("المقاول غير موجود");

    const newBalance = (contractor.balance || 0) + amount;
    await contractorRepository.update(id, { balance: newBalance } as Partial<Contractor>, userId);
  }
};
