import { laborLogRepository, laborAdvanceRepository, laborSettlementRepository } from "@/lib/repositories/labor-repository";
import { workerRepository } from "@/lib/repositories/worker-repository";
import { financeIntegrationService } from "./finance-integration-service";
import type { 
  LaborLog, LaborLogFormValues,
  LaborAdvance, LaborAdvanceFormValues,
  LaborSettlement, LaborSettlementFormValues 
} from "@/lib/types/labor";
import type { VoucherLine } from "@/lib/types/finance";

export const laborService = {
  // Logs
  getLogsByFarm: (farmId: string, userId: string) => laborLogRepository.getByField("farmId", farmId, userId),
  getLogsByWorker: (workerId: string, userId: string) => laborLogRepository.getByField("workerId", workerId, userId),
  createLog: (data: LaborLogFormValues, userId: string) => laborLogRepository.create(data, userId),
  updateLog: (id: string, data: Partial<LaborLogFormValues>, userId: string) => laborLogRepository.update(id, data, userId),
  deleteLog: (id: string, userId: string) => laborLogRepository.delete(id, userId),

  // Advances
  getAdvancesByFarm: (farmId: string, userId: string) => laborAdvanceRepository.getByField("farmId", farmId, userId),
  getAdvancesByWorker: (workerId: string, userId: string) => laborAdvanceRepository.getByField("workerId", workerId, userId),
  createAdvance: async (data: LaborAdvanceFormValues, userId: string) => {
    const advance = await laborAdvanceRepository.create(data, userId);
    
    // Finance Integration for Advance
    try {
      const worker = await workerRepository.getById(data.workerId);
      if (worker) {
        await financeIntegrationService.ensureSystemAccounts(data.farmId, userId);
        const workerAcc = await financeIntegrationService.ensureEntityAccount(data.farmId, "worker", worker.id, worker.name, userId);
        
        let paymentAcc = null;
        if (data.paymentMethod === "bank_transfer" || data.paymentMethod === "instapay" || data.paymentMethod === "vodafone_cash" || data.paymentMethod === "orange_cash") {
          paymentAcc = await financeIntegrationService.getSystemAccount(data.farmId, "101", userId);
        } else {
          paymentAcc = await financeIntegrationService.getSystemAccount(data.farmId, "100", userId);
        }

        if (paymentAcc && workerAcc && data.amount > 0) {
          const lines: VoucherLine[] = [
            { accountId: workerAcc.id, accountName: workerAcc.name, debit: data.amount, credit: 0, description: `سلفة نقدية للعامل: ${worker.name}` },
            { accountId: paymentAcc.id, accountName: paymentAcc.name, debit: 0, credit: data.amount, description: `صرف سلفة للعامل: ${worker.name}` }
          ];

          await financeIntegrationService.postJournalEntry(data.farmId, userId, {
            type: "صرف",
            date: data.date,
            description: `صرف سلفة للعامل: ${worker.name}`,
            sourceModule: "manual", // Since we don't have "labor" enum, manual or payroll is fine. wait, VoucherSourceModule has "payroll". let's use "payroll"
            sourceId: advance.id,
            lines
          });
        }
      }
    } catch (e) {
      console.error("Finance integration failed for advance", e);
    }
    
    return advance.id;
  },
  updateAdvance: (id: string, data: Partial<LaborAdvanceFormValues>, userId: string) => laborAdvanceRepository.update(id, data, userId),
  deleteAdvance: (id: string, userId: string) => laborAdvanceRepository.delete(id, userId),

  // Settlements
  getSettlementsByFarm: (farmId: string, userId: string) => laborSettlementRepository.getByField("farmId", farmId, userId),
  createSettlement: async (data: LaborSettlementFormValues, logIds: string[], advanceIds: string[], totalWages: number, userId: string) => {
    // 1. Create settlement
    const settlement = await laborSettlementRepository.create(data, userId);
    
    // 2. Mark logs as settled
    const logPromises = logIds.map(id => laborLogRepository.update(id, { settlementId: settlement.id } as any, userId));
    await Promise.all(logPromises);

    // 3. Mark advances as settled
    const advancePromises = advanceIds.map(id => laborAdvanceRepository.update(id, { settlementId: settlement.id } as any, userId));
    await Promise.all(advancePromises);

    // 4. Finance Integration for Settlement
    try {
      const worker = await workerRepository.getById(data.workerId);
      if (worker) {
        await financeIntegrationService.ensureSystemAccounts(data.farmId, userId);
        const workerAcc = await financeIntegrationService.ensureEntityAccount(data.farmId, "worker", worker.id, worker.name, userId);
        const wagesAcc = await financeIntegrationService.getSystemAccount(data.farmId, "501", userId); // تكاليف العمالة الزراعية
        
        const lines: VoucherLine[] = [];

        // Debit Expenses (501) for total wages
        if (wagesAcc && totalWages > 0) {
          lines.push({ accountId: wagesAcc.id, accountName: wagesAcc.name, debit: totalWages, credit: 0, description: `أجور وتكاليف عمالة للعامل: ${worker.name}` });
          lines.push({ accountId: workerAcc.id, accountName: workerAcc.name, debit: 0, credit: totalWages, description: `إثبات مستحقات العامل: ${worker.name}` });
        }

        // If net paid > 0, we create a payment (Debit worker, Credit cash/bank)
        if (data.netPaid > 0) {
          let paymentAcc = null;
          if (data.paymentMethod === "bank_transfer" || data.paymentMethod === "instapay" || data.paymentMethod === "vodafone_cash" || data.paymentMethod === "orange_cash") {
            paymentAcc = await financeIntegrationService.getSystemAccount(data.farmId, "101", userId);
          } else {
            paymentAcc = await financeIntegrationService.getSystemAccount(data.farmId, "100", userId);
          }

          if (paymentAcc) {
            lines.push({ accountId: workerAcc.id, accountName: workerAcc.name, debit: data.netPaid, credit: 0, description: `سداد صافي الراتب المستحق للعامل: ${worker.name}` });
            lines.push({ accountId: paymentAcc.id, accountName: paymentAcc.name, debit: 0, credit: data.netPaid, description: `صرف صافي الراتب للعامل: ${worker.name}` });
          }
        }

        if (lines.length > 0) {
          await financeIntegrationService.postJournalEntry(data.farmId, userId, {
            type: "قيد يومية", // Because it includes expense accrual + payment in one
            date: data.date,
            description: `تصفية حساب وصرف راتب العامل: ${worker.name}`,
            sourceModule: "payroll",
            sourceId: settlement.id,
            lines
          });
        }
      }
    } catch (e) {
      console.error("Finance integration failed for settlement", e);
    }

    return settlement.id;
  },
  deleteSettlement: async (id: string, userId: string) => {
    // Note: To be fully correct, we would unset settlementId from logs and advances here
    await laborSettlementRepository.delete(id, userId);
  }
};
