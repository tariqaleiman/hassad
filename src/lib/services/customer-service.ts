import { customerRepository } from "../repositories/customer-repository";
import { customerPaymentRepository } from "../repositories/customer-payment-repository";
import { financeIntegrationService } from "./finance-integration-service";
import type { Customer, CustomerFormValues, CustomerPayment, CustomerPaymentFormValues } from "../types/customer";

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

  updateBalance: async (id: string, amount: number, userId?: string): Promise<void> => {
    const customer = await customerRepository.getById(id);
    if (!customer) throw new Error("العميل غير موجود");

    const newBalance = (customer.balance || 0) + amount;
    await customerRepository.update(id, { balance: newBalance } as Partial<Customer>, userId);
  },

  createPayment: async (data: CustomerPaymentFormValues, userId?: string): Promise<CustomerPayment> => {
    const payment = await customerPaymentRepository.create(data as Partial<CustomerPayment>, userId);
    
    // Update balance (payment reduces debt, so it's a negative amount)
    await customerService.updateBalance(data.customerId, -data.amount, userId);

    // Finance Integration
    if (userId) {
      try {
        const customer = await customerRepository.getById(data.customerId);
        await financeIntegrationService.ensureSystemAccounts(data.farmId, userId);
        
        let paymentAccId = null;
        if (data.paymentMethod === "bank_transfer") {
          const bankAcc = await financeIntegrationService.getSystemAccount(data.farmId, "101", userId);
          paymentAccId = bankAcc?.id;
        } else {
          const cashAcc = await financeIntegrationService.getSystemAccount(data.farmId, "100", userId);
          paymentAccId = cashAcc?.id;
        }

        const customerAcc = customer ? await financeIntegrationService.ensureEntityAccount(data.farmId, "customer", data.customerId, customer.name, userId) : null;

        if (paymentAccId && customerAcc) {
          await financeIntegrationService.postJournalEntry(data.farmId, userId, {
            type: "قبض",
            date: data.date,
            description: `سداد دفعة من العميل: ${customer?.name}`,
            sourceModule: "sales",
            sourceId: payment.id,
            lines: [
              { accountId: paymentAccId, debit: data.amount, credit: 0, description: `استلام دفعة: ${data.notes || ''}` },
              { accountId: customerAcc.id, debit: 0, credit: data.amount, description: `سداد من الحساب` }
            ]
          });
        }
      } catch (e) {
        console.error("Finance integration failed for customer payment", e);
      }
    }

    return payment;
  },

  getPaymentsByCustomer: async (customerId: string): Promise<CustomerPayment[]> => {
    return customerPaymentRepository.getByField("customerId", customerId);
  }
};
