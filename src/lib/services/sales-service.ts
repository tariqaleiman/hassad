import { salesInvoiceRepository } from "../repositories/sales-repository";
import { customerService } from "./customer-service";
import { inventoryService } from "./inventory-service";
import { financeIntegrationService } from "./finance-integration-service";
import type { SalesInvoice, SalesInvoiceFormValues } from "../types/sales";

export const salesService = {
  createInvoice: async (data: SalesInvoiceFormValues, userId?: string): Promise<SalesInvoice> => {
    // 1. Calculate total
    const totalAmount = data.items.reduce((sum, item) => sum + (item.totalPrice || (item.quantity * item.unitPrice)), 0);

    const invoiceData: Omit<SalesInvoice, "id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt"> = {
      ...data,
      totalAmount,
      paidAmount: data.paidAmount || 0,
    };

    // 2. Save the invoice
    const invoice = await salesInvoiceRepository.create(invoiceData, userId);

    // 3. Update customer balance if it's a credit sale or partially paid
    if (data.customerId && (data.paymentMethod === "credit" || (data.paidAmount || 0) < totalAmount)) {
      const remainingAmount = totalAmount - (data.paidAmount || 0);
      if (remainingAmount > 0) {
        // Increase the customer's debt
        await customerService.updateBalance(data.customerId, remainingAmount, userId);
      }
    }

    // 4. Update the actual inventory balances
    for (const item of data.items) {
      if (item.inventoryItemId) {
        await inventoryService.addTransaction({
          farmId: invoiceData.farmId,
          itemId: item.inventoryItemId,
          type: "out",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice || (item.quantity * item.unitPrice),
          date: invoiceData.invoiceDate,
          referenceType: "عملية زراعية", // Should add "مبيعات" to the type later if possible, but keeping it simple for now
          referenceId: invoice.id,
          notes: `فاتورة بيع رقم: ${invoice.id.substring(0, 8)}`
        }, userId);
      }
    }

    // 5. Finance Integration (Automated Journal Entry)
    if (userId) {
      try {
        await financeIntegrationService.ensureSystemAccounts(invoiceData.farmId, userId);
        let paymentAcc = null;
        if (data.paymentMethod === "bank_transfer" || data.paymentMethod === "instapay" || data.paymentMethod === "vodafone_cash" || data.paymentMethod === "orange_cash") {
          paymentAcc = await financeIntegrationService.getSystemAccount(invoiceData.farmId, "101", userId);
        } else {
          paymentAcc = await financeIntegrationService.getSystemAccount(invoiceData.farmId, "100", userId);
        }

        const salesAcc = await financeIntegrationService.getSystemAccount(invoiceData.farmId, "400", userId);
        
        let customerAcc = null;
        if (data.customerId && data.customerName) {
          customerAcc = await financeIntegrationService.ensureEntityAccount(invoiceData.farmId, "customer", data.customerId, data.customerName, userId);
        }

        const lines = [];
        // Credit Sales
        if (salesAcc) {
          lines.push({ accountId: salesAcc.id, debit: 0, credit: totalAmount, description: `مبيعات فاتورة رقم ${invoice.id.substring(0, 8)}` });
        }
        
        // Debit Cash/Bank
        let paidAmountValue = 0;
        if (data.paymentMethod !== "credit") {
          paidAmountValue = totalAmount; // Fully paid if not credit
        } else {
          paidAmountValue = data.paidAmount || 0; // Partially paid if credit
        }

        if (paymentAcc && paidAmountValue > 0) {
          lines.push({ accountId: paymentAcc.id, debit: paidAmountValue, credit: 0, description: `تحصيل من فاتورة رقم ${invoice.id.substring(0, 8)}` });
        }

        // Debit Customer for remaining
        const remaining = totalAmount - paidAmountValue;
        if (customerAcc && remaining > 0) {
          lines.push({ accountId: customerAcc.id, debit: remaining, credit: 0, description: `آجل على العميل فاتورة رقم ${invoice.id.substring(0, 8)}` });
        } else if (!customerAcc && remaining > 0 && paymentAcc) {
          // If no customer is specified, we assume it's fully cash regardless of paidAmount, or we throw it to cash
          lines.push({ accountId: paymentAcc.id, debit: remaining, credit: 0, description: `مبيعات نقدية فاتورة رقم ${invoice.id.substring(0, 8)}` });
        }



        if (lines.length >= 2) {
          await financeIntegrationService.postJournalEntry(invoiceData.farmId, userId, {
            type: "قيد يومية",
            date: invoiceData.invoiceDate,
            description: `قيد آلي: فاتورة مبيعات ${invoice.id.substring(0, 8)}`,
            sourceModule: "sales",
            sourceId: invoice.id,
            lines
          });
        }
      } catch (e) {
        console.error("Finance integration failed for sales invoice", e);
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

    // Reversing previous inventory transactions
    for (const item of existingInvoice.items) {
      if (item.inventoryItemId) {
        // Technically we should reverse the out transaction by adding an "in" transaction or soft deleting the out transaction.
        // For simplicity, we add an "in" transaction back.
        await inventoryService.addTransaction({
          farmId: existingInvoice.farmId,
          itemId: item.inventoryItemId,
          type: "in",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice || (item.quantity * item.unitPrice),
          date: new Date().toISOString(),
          referenceType: "تسوية",
          referenceId: existingInvoice.id,
          notes: `تسوية بسبب تعديل فاتورة البيع رقم: ${existingInvoice.id.substring(0, 8)}`
        }, userId);
      }
    }

    const items = data.items || existingInvoice.items;
    const totalAmount = items.reduce((sum, item) => sum + (item.totalPrice || (item.quantity * item.unitPrice)), 0);
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

    // Applying new inventory transactions
    for (const item of items) {
      if (item.inventoryItemId) {
        await inventoryService.addTransaction({
          farmId: data.farmId || existingInvoice.farmId,
          itemId: item.inventoryItemId,
          type: "out",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice || (item.quantity * item.unitPrice),
          date: data.invoiceDate || existingInvoice.invoiceDate,
          referenceType: "عملية زراعية", 
          referenceId: updatedInvoice.id,
          notes: `فاتورة بيع معدلة رقم: ${updatedInvoice.id.substring(0, 8)}`
        }, userId);
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

    // Reversing previous inventory transactions
    for (const item of existingInvoice.items) {
      if (item.inventoryItemId) {
        await inventoryService.addTransaction({
          farmId: existingInvoice.farmId,
          itemId: item.inventoryItemId,
          type: "in",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice || (item.quantity * item.unitPrice),
          date: new Date().toISOString(),
          referenceType: "تسوية",
          referenceId: existingInvoice.id,
          notes: `إلغاء فاتورة البيع رقم: ${existingInvoice.id.substring(0, 8)}`
        }, userId);
      }
    }

    await salesInvoiceRepository.softDelete(id, userId);
  }
};
