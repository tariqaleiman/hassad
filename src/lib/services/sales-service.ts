import { salesInvoiceRepository } from "../repositories/sales-repository";
import { customerService } from "./customer-service";
import { cropCycleRepository } from "../repositories/crop-cycle-repository";
import type { SalesInvoice, SalesInvoiceFormValues } from "../types/sales";

export const salesService = {
  createInvoice: async (data: SalesInvoiceFormValues, userId?: string): Promise<SalesInvoice> => {
    // 1. Calculate total
    const totalAmount = data.items.reduce((sum, item) => sum + item.totalPrice, 0);

    const invoiceData: Omit<SalesInvoice, "id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt"> = {
      ...data,
      totalAmount,
    };

    // 2. Save the invoice
    const invoice = await salesInvoiceRepository.create(invoiceData, userId);

    // 3. Update customer balance if it's a credit sale or partially paid
    if (data.customerId && (data.paymentMethod === "credit" || data.paidAmount < totalAmount)) {
      const remainingAmount = totalAmount - data.paidAmount;
      if (remainingAmount > 0) {
        // Increase the customer's debt
        await customerService.updateBalance(data.customerId, remainingAmount, userId);
      }
    }

    // 4. Update the actual revenue for each crop cycle
    for (const item of data.items) {
      if (item.cropCycleId) {
        const cropCycle = await cropCycleRepository.getById(item.cropCycleId);
        if (cropCycle) {
          const newRevenue = (cropCycle.actualRevenue || 0) + item.totalPrice;
          await cropCycleRepository.update(item.cropCycleId, { actualRevenue: newRevenue }, userId);
        }
      }
    }

    return invoice;
  },

  updateInvoice: async (id: string, data: Partial<SalesInvoiceFormValues>, userId?: string): Promise<SalesInvoice> => {
    const existingInvoice = await salesInvoiceRepository.getById(id);
    if (!existingInvoice) throw new Error("الفاتورة غير موجودة");

    // Reversing previous customer balance
    if (existingInvoice.customerId) {
      const oldRemaining = existingInvoice.totalAmount - (existingInvoice.paidAmount || 0);
      if (oldRemaining > 0) {
        await customerService.updateBalance(existingInvoice.customerId, -oldRemaining, userId);
      }
    }

    // Reversing previous crop cycle revenues
    for (const item of existingInvoice.items) {
      if (item.cropCycleId) {
        const cropCycle = await cropCycleRepository.getById(item.cropCycleId);
        if (cropCycle) {
          const reversedRevenue = Math.max(0, (cropCycle.actualRevenue || 0) - item.totalPrice);
          await cropCycleRepository.update(item.cropCycleId, { actualRevenue: reversedRevenue }, userId);
        }
      }
    }

    const items = data.items || existingInvoice.items;
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const paidAmount = data.paidAmount !== undefined ? data.paidAmount : existingInvoice.paidAmount;
    const customerId = data.customerId !== undefined ? data.customerId : existingInvoice.customerId;

    const invoiceData = {
      ...data,
      totalAmount,
    };

    const updatedInvoice = await salesInvoiceRepository.update(id, invoiceData, userId);

    // Applying new customer balance
    if (customerId) {
      const newRemaining = totalAmount - paidAmount;
      if (newRemaining > 0) {
        await customerService.updateBalance(customerId, newRemaining, userId);
      }
    }

    // Applying new crop cycle revenues
    for (const item of items) {
      if (item.cropCycleId) {
        const cropCycle = await cropCycleRepository.getById(item.cropCycleId);
        if (cropCycle) {
          const newRevenue = (cropCycle.actualRevenue || 0) + item.totalPrice;
          await cropCycleRepository.update(item.cropCycleId, { actualRevenue: newRevenue }, userId);
        }
      }
    }

    return updatedInvoice;
  },

  getInvoicesByFarm: async (farmId: string): Promise<SalesInvoice[]> => {
    return salesInvoiceRepository.getByField("farmId", farmId);
  },

  getInvoiceById: async (id: string): Promise<SalesInvoice | null> => {
    return salesInvoiceRepository.getById(id);
  },

  deleteInvoice: async (id: string, userId?: string): Promise<void> => {
    const existingInvoice = await salesInvoiceRepository.getById(id);
    if (!existingInvoice) throw new Error("الفاتورة غير موجودة");

    // Reversing previous customer balance
    if (existingInvoice.customerId) {
      const oldRemaining = existingInvoice.totalAmount - (existingInvoice.paidAmount || 0);
      if (oldRemaining > 0) {
        await customerService.updateBalance(existingInvoice.customerId, -oldRemaining, userId);
      }
    }

    // Reversing previous crop cycle revenues
    for (const item of existingInvoice.items) {
      if (item.cropCycleId) {
        const cropCycle = await cropCycleRepository.getById(item.cropCycleId);
        if (cropCycle) {
          const reversedRevenue = Math.max(0, (cropCycle.actualRevenue || 0) - item.totalPrice);
          await cropCycleRepository.update(item.cropCycleId, { actualRevenue: reversedRevenue }, userId);
        }
      }
    }

    await salesInvoiceRepository.softDelete(id, userId);
  }
};
