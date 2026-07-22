import { accountRepository } from "../repositories/account-repository";
import { voucherRepository } from "../repositories/voucher-repository";
import { financeService } from "./finance-service";
import type { Account, VoucherLine, VoucherType, VoucherSourceModule } from "@/lib/types/finance";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export const financeIntegrationService = {

  // 1. System Default Accounts Management
  ensureSystemAccounts: async (farmId: string, userId: string) => {
    const defaultAccounts = [
      { code: "100", name: "الصندوق", category: "أصول" },
      { code: "101", name: "العملاء (ذمم مدينة)", category: "أصول" },
      { code: "102", name: "المخزون الزراعي", category: "أصول" },
      { code: "105", name: "مجمع إهلاك الآلات والمعدات", category: "أصول" },
      { code: "200", name: "الموردون (ذمم دائنة)", category: "خصوم" },
      { code: "201", name: "مقاولون وعمالة", category: "خصوم" },
      { code: "300", name: "رأس المال", category: "حقوق ملكية" },
      { code: "400", name: "إيرادات المبيعات", category: "إيرادات" },
      { code: "500", name: "تكلفة البضاعة المباعة", category: "مصروفات" },
      { code: "501", name: "تكاليف العمالة الزراعية", category: "مصروفات" },
      { code: "502", name: "الأسمدة والمبيدات", category: "مصروفات" },
      { code: "503", name: "صيانة الآلات والمعدات", category: "مصروفات" },
      { code: "504", name: "الوقود والمحروقات", category: "مصروفات" },
      { code: "505", name: "مصروف الإهلاك", category: "مصروفات" },
    ] as const;

    const existingAccounts = await accountRepository.getByField("farmId", farmId, userId);
    
    // Create missing ones
    for (const def of defaultAccounts) {
      if (!existingAccounts.find(a => a.code === def.code)) {
        await accountRepository.create({
          farmId,
          code: def.code,
          name: def.name,
          category: def.category as any,
          balance: 0,
          isSystemAccount: true
        }, userId);
      }
    }
  },

  getSystemAccount: async (farmId: string, code: string, userId: string): Promise<Account | null> => {
    const accounts = await accountRepository.getByField("farmId", farmId, userId);
    const acc = accounts.find(a => a.code === code);
    if (!acc) {
      // Fallback, try to ensure they exist and retry
      await financeIntegrationService.ensureSystemAccounts(farmId, userId);
      const reAccounts = await accountRepository.getByField("farmId", farmId, userId);
      return reAccounts.find(a => a.code === code) || null;
    }
    return acc;
  },

  // 2. Entity Auto-Account Creation
  ensureEntityAccount: async (farmId: string, entityType: "customer" | "supplier" | "worker" | "contractor", entityId: string, entityName: string, userId: string): Promise<Account> => {
    const parentCode = entityType === "customer" ? "101" : (entityType === "supplier" || entityType === "contractor") ? "200" : "201";
    const category = entityType === "customer" ? "أصول" : "خصوم";
    
    // We append the entityId to parent code (in a real ERP we would auto-increment, but here ID or a hash is safer, or simply query by name/description)
    // To keep it clean, let's just use the name and category and add the ID in description
    const accounts = await accountRepository.getByField("farmId", farmId, userId);
    const existing = accounts.find(a => a.description === `Linked: ${entityType}:${entityId}`);
    
    if (existing) return existing;

    // Create new
    const parent = await financeIntegrationService.getSystemAccount(farmId, parentCode, userId);
    const code = parent ? `${parent.code}-${entityId.substring(0, 4)}` : `${entityId.substring(0, 4)}`;

    const newAcc = await accountRepository.create({
      farmId,
      code,
      name: `${entityName}`,
      category: category as any,
      balance: 0,
      parentAccountId: parent?.id,
      description: `Linked: ${entityType}:${entityId}`
    }, userId);

    return newAcc as Account;
  },

  // 3. Automated Journal Entry Creation
  postJournalEntry: async (
    farmId: string, 
    userId: string, 
    options: {
      type: VoucherType;
      date: string;
      description: string;
      sourceModule: VoucherSourceModule;
      sourceId: string;
      reference?: string;
      lines: Omit<VoucherLine, "accountName">[];
    }
  ) => {
    // Fill account names
    const accounts = await accountRepository.getByField("farmId", farmId, userId);
    const accountMap = new Map(accounts.map(a => [a.id, a]));

    let totalAmount = 0;
    const fullLines: VoucherLine[] = [];

    for (const line of options.lines) {
      const acc = accountMap.get(line.accountId);
      if (!acc) throw new Error(`Account ${line.accountId} not found`);
      fullLines.push({
        ...line,
        accountName: acc.name
      });
      if (line.debit > 0) totalAmount += line.debit;
    }

    // Generate Serial
    const prefix = options.type === "قبض" ? "REC" : options.type === "صرف" ? "PAY" : "JOU";
    const q = query(
      collection(db, "vouchers"),
      where("farmId", "==", farmId),
      where("type", "==", options.type),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const snap = await getDocs(q);
    let nextNum = 1;
    if (!snap.empty) {
      const lastVoucher = snap.docs[0].data();
      if (lastVoucher.serialNumber) {
        const parts = lastVoucher.serialNumber.split("-");
        if (parts.length === 2) {
          nextNum = parseInt(parts[1]) + 1;
        }
      }
    }
    const serialNumber = `${prefix}-${nextNum.toString().padStart(4, "0")}`;

    // Create Voucher
    const created = await voucherRepository.create({
      farmId,
      serialNumber,
      type: options.type,
      date: options.date,
      reference: options.reference,
      description: options.description,
      totalAmount,
      lines: fullLines,
      sourceModule: options.sourceModule,
      sourceId: options.sourceId
    }, userId);

    // Update balances
    const updateBalance = async (accId: string, debit: number, credit: number) => {
      const acc = accountMap.get(accId);
      if (!acc) return;
      const isDebitNormal = acc.category === "أصول" || acc.category === "مصروفات";
      const change = isDebitNormal ? (debit - credit) : (credit - debit);
      const newBalance = (acc.balance || 0) + change;
      await accountRepository.update(acc.id, { balance: newBalance }, userId);
    };

    for (const line of fullLines) {
      await updateBalance(line.accountId, line.debit, line.credit);
    }

    return created;
  }
};
