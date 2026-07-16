import { paymentRepository } from "../repositories/payment-repository";
import { supplierService } from "./supplier-service";
import { contractorService } from "./contractor-service";
import { customerService } from "./customer-service";
import type { Payment, PaymentFormValues } from "../types/payment";

export const paymentService = {
  createPayment: async (data: PaymentFormValues, userId?: string): Promise<Payment> => {
    // 1. Create payment record
    const payment = await paymentRepository.create(data, userId);

    // 2. Update balances
    if (data.type === "pay_supplier" && data.supplierId) {
      // Paying a supplier reduces our debt to them
      await supplierService.updateBalance(data.supplierId, -data.amount, userId);
    } else if (data.type === "pay_contractor" && data.contractorId) {
      // Paying a contractor reduces our debt to them
      await contractorService.updateBalance(data.contractorId, -data.amount, userId);
    } else if (data.type === "receive_from_customer" && data.customerId) {
      // Receiving from customer reduces their debt to us
      await customerService.updateBalance(data.customerId, -data.amount, userId);
    }

    return payment;
  },

  updatePayment: async (id: string, data: Partial<PaymentFormValues>, userId?: string): Promise<Payment> => {
    const existingPayment = await paymentRepository.getById(id);
    if (!existingPayment) throw new Error("عملية الدفع غير موجودة");

    // Reversing old balance change
    if (existingPayment.type === "pay_supplier" && existingPayment.supplierId) {
      await supplierService.updateBalance(existingPayment.supplierId, existingPayment.amount, userId);
    } else if (existingPayment.type === "pay_contractor" && existingPayment.contractorId) {
      await contractorService.updateBalance(existingPayment.contractorId, existingPayment.amount, userId);
    } else if (existingPayment.type === "receive_from_customer" && existingPayment.customerId) {
      await customerService.updateBalance(existingPayment.customerId, existingPayment.amount, userId);
    }

    const updatedPayment = await paymentRepository.update(id, data, userId);

    const newType = data.type || existingPayment.type;
    const newAmount = data.amount !== undefined ? data.amount : existingPayment.amount;

    // Applying new balance change
    if (newType === "pay_supplier") {
      const supplierId = data.supplierId || existingPayment.supplierId;
      if (supplierId) await supplierService.updateBalance(supplierId, -newAmount, userId);
    } else if (newType === "pay_contractor") {
      const contractorId = data.contractorId || existingPayment.contractorId;
      if (contractorId) await contractorService.updateBalance(contractorId, -newAmount, userId);
    } else if (newType === "receive_from_customer") {
      const customerId = data.customerId || existingPayment.customerId;
      if (customerId) await customerService.updateBalance(customerId, -newAmount, userId);
    }

    return updatedPayment;
  },

  getPaymentsByFarm: async (farmId: string): Promise<Payment[]> => {
    return paymentRepository.getByField("farmId", farmId);
  },

  deletePayment: async (id: string, userId?: string): Promise<void> => {
    const existingPayment = await paymentRepository.getById(id);
    if (!existingPayment) throw new Error("عملية الدفع غير موجودة");

    // Reversing balance change
    if (existingPayment.type === "pay_supplier" && existingPayment.supplierId) {
      await supplierService.updateBalance(existingPayment.supplierId, existingPayment.amount, userId);
    } else if (existingPayment.type === "pay_contractor" && existingPayment.contractorId) {
      await contractorService.updateBalance(existingPayment.contractorId, existingPayment.amount, userId);
    } else if (existingPayment.type === "receive_from_customer" && existingPayment.customerId) {
      await customerService.updateBalance(existingPayment.customerId, existingPayment.amount, userId);
    }

    await paymentRepository.softDelete(id, userId);
  }
};
