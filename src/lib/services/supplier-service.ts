import { supplierRepository, type SupplierFormValues } from "../repositories/supplier-repository";
import type { Supplier } from "../types/supplier";

export const supplierService = {
  createSupplier: async (data: Omit<SupplierFormValues, 'balance'>, userId?: string): Promise<Supplier> => {
    // When creating a supplier, balance starts as initialBalance
    return supplierRepository.create({
      ...data,
      balance: data.initialBalance,
    } as SupplierFormValues, userId);
  },

  updateSupplier: async (id: string, data: Partial<SupplierFormValues>, userId?: string): Promise<Supplier> => {
    // Note: updating initialBalance directly after creation might require recalulating balance,
    // but for simplicity, we just update the fields provided.
    return supplierRepository.update(id, data, userId);
  },

  getSuppliersByFarm: async (farmId: string): Promise<Supplier[]> => {
    return supplierRepository.getByField("farmId", farmId);
  },
  
  deleteSupplier: async (id: string, userId?: string): Promise<void> => {
    return supplierRepository.delete(id, userId);
  },
  
  updateBalance: async (id: string, amount: number, userId?: string): Promise<void> => {
    const supplier = await supplierRepository.getById(id);
    if (!supplier) throw new Error("Supplier not found");
    
    // positive amount increases debt, negative amount decreases debt
    const newBalance = (supplier.balance || 0) + amount;
    await supplierRepository.update(id, { balance: newBalance }, userId);
  }
};
