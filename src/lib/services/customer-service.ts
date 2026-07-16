import { customerRepository } from "../repositories/customer-repository";
import type { Customer, CustomerFormValues } from "../types/customer";

export const customerService = {
  createCustomer: async (data: CustomerFormValues, userId?: string): Promise<Customer> => {
    return customerRepository.create({
      ...data,
      balance: data.initialBalance || 0,
    } as Partial<Customer>, userId);
  },

  updateCustomer: async (id: string, data: Partial<CustomerFormValues>, userId?: string): Promise<Customer> => {
    return customerRepository.update(id, data, userId);
  },

  getCustomersByFarm: async (farmId: string): Promise<Customer[]> => {
    return customerRepository.getByField("farmId", farmId);
  },

  getCustomerById: async (id: string): Promise<Customer | null> => {
    return customerRepository.getById(id);
  },

  deleteCustomer: async (id: string, userId?: string): Promise<void> => {
    return customerRepository.delete(id, userId);
  },

  /**
   * تحديث رصيد العميل.
   * amount موجب = زيادة الدين المستحق على العميل (عملية بيع آجلة).
   * amount سالب = سداد العميل لدفعة.
   */
  updateBalance: async (id: string, amount: number, userId?: string): Promise<void> => {
    const customer = await customerRepository.getById(id);
    if (!customer) throw new Error("العميل غير موجود");

    const newBalance = (customer.balance || 0) + amount;
    await customerRepository.update(id, { balance: newBalance } as Partial<Customer>, userId);
  }
};
