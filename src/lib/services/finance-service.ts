import { accountRepository } from "@/lib/repositories/account-repository";
import { voucherRepository } from "@/lib/repositories/voucher-repository";
import { farmRepository } from "@/lib/repositories/farm-repository";
import type { Account, AccountFormValues, Voucher, VoucherFormValues, VoucherType } from "@/lib/types/finance";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export const financeService = {
  // Accounts
  getAccountsByFarm: (farmId: string, userId: string) => accountRepository.getByField("farmId", farmId, userId),
  createAccount: (data: AccountFormValues & { farmId: string }, userId: string) => accountRepository.create({ ...data, balance: 0 }, userId),
  updateAccount: (id: string, data: Partial<AccountFormValues>, userId: string) => accountRepository.update(id, data, userId),
  deleteAccount: (id: string, userId: string) => accountRepository.delete(id, userId),

  // Vouchers
  getVouchersByFarm: (farmId: string, userId: string) => voucherRepository.getByField("farmId", farmId, userId),
  getVoucherById: (id: string) => voucherRepository.getById(id),
  
  createVoucher: async (data: VoucherFormValues & { farmId: string }, userId: string) => {
    // Check closing date
    const farm = await farmRepository.getById(data.farmId);
    if (farm?.lastClosingDate && new Date(data.date) <= new Date(farm.lastClosingDate)) {
      throw new Error("لا يمكن إضافة قيد في فترة مالية مغلقة.");
    }

    // 1. Generate Serial Number
    const prefix = data.type === "قبض" ? "REC" : data.type === "صرف" ? "PAY" : "JOU";
    const q = query(
      collection(db, "vouchers"),
      where("farmId", "==", data.farmId),
      where("type", "==", data.type),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const snap = await getDocs(q);
    let nextNum = 1;
    if (!snap.empty) {
      const lastVoucher = snap.docs[0].data() as Voucher;
      if (lastVoucher.serialNumber) {
        const parts = lastVoucher.serialNumber.split("-");
        if (parts.length === 2) {
          nextNum = parseInt(parts[1]) + 1;
        }
      }
    }
    const serialNumber = `${prefix}-${nextNum.toString().padStart(4, "0")}`;

    // 2. Fetch Accounts
    const mainAccount = await accountRepository.getById(data.mainAccountId);
    const oppositeAccount = await accountRepository.getById(data.oppositeAccountId);

    if (!mainAccount || !oppositeAccount) {
      throw new Error("الحساب المحدد غير موجود");
    }

    // 3. Create Double Entry Lines
    const isReceipt = data.type === "قبض";
    const lines = [
      {
        accountId: mainAccount.id,
        accountName: mainAccount.name,
        description: data.description,
        debit: isReceipt ? data.amount : 0,
        credit: isReceipt ? 0 : data.amount
      },
      {
        accountId: oppositeAccount.id,
        accountName: oppositeAccount.name,
        description: data.description,
        debit: isReceipt ? 0 : data.amount,
        credit: isReceipt ? data.amount : 0
      }
    ];

    const voucherData: Partial<Voucher> = {
      farmId: data.farmId,
      serialNumber,
      type: data.type,
      date: data.date,
      reference: data.reference,
      description: data.description,
      totalAmount: data.amount,
      lines,
    };

    // 4. Save Voucher
    const created = await voucherRepository.create(voucherData, userId);

    // 5. Update Account Balances
    const updateBalance = async (acc: Account, debit: number, credit: number) => {
      const isDebitNormal = acc.category === "أصول" || acc.category === "مصروفات";
      const change = isDebitNormal ? (debit - credit) : (credit - debit);
      const newBalance = (acc.balance || 0) + change;
      await accountRepository.update(acc.id, { balance: newBalance } as any, userId);
    };

    await updateBalance(mainAccount, lines[0].debit, lines[0].credit);
    await updateBalance(oppositeAccount, lines[1].debit, lines[1].credit);

    return created;
  },

  deleteVoucher: async (id: string, userId: string) => {
    const voucher = await voucherRepository.getById(id);
    if (!voucher) return;

    // Check closing date
    const farm = await farmRepository.getById(voucher.farmId);
    if (farm?.lastClosingDate && new Date(voucher.date) <= new Date(farm.lastClosingDate)) {
      throw new Error("لا يمكن حذف قيد في فترة مالية مغلقة.");
    }

    // Reverse the balances before deleting
    for (const line of voucher.lines) {
      const acc = await accountRepository.getById(line.accountId);
      if (acc) {
        const isDebitNormal = acc.category === "أصول" || acc.category === "مصروفات";
        const change = isDebitNormal ? (line.credit - line.debit) : (line.debit - line.credit);
        const newBalance = (acc.balance || 0) + change;
        await accountRepository.update(acc.id, { balance: newBalance } as any, userId);
      }
    }
    
    return voucherRepository.delete(id, userId);
  },

  // ---------------------------------------------------------------------------------
  // Advanced Reports & Period Closing
  // ---------------------------------------------------------------------------------

  getTrialBalance: async (farmId: string, upToDate?: string) => {
    const accounts = await accountRepository.getByField("farmId", farmId);
    let vouchers = await voucherRepository.getByField("farmId", farmId);

    if (upToDate) {
      vouchers = vouchers.filter(v => new Date(v.date) <= new Date(upToDate));
    }

    const trialBalance = accounts.map(acc => ({
      accountId: acc.id,
      code: acc.code,
      name: acc.name,
      category: acc.category,
      totalDebit: 0,
      totalCredit: 0,
      balance: 0,
    }));

    for (const voucher of vouchers) {
      for (const line of voucher.lines) {
        const tbAcc = trialBalance.find(a => a.accountId === line.accountId);
        if (tbAcc) {
          tbAcc.totalDebit += line.debit;
          tbAcc.totalCredit += line.credit;
        }
      }
    }

    trialBalance.forEach(tbAcc => {
      const isDebitNormal = tbAcc.category === "أصول" || tbAcc.category === "مصروفات";
      tbAcc.balance = isDebitNormal 
        ? tbAcc.totalDebit - tbAcc.totalCredit 
        : tbAcc.totalCredit - tbAcc.totalDebit;
    });

    return trialBalance;
  },

  getIncomeStatement: async (farmId: string, fromDate?: string, toDate?: string) => {
    let vouchers = await voucherRepository.getByField("farmId", farmId);

    if (fromDate) vouchers = vouchers.filter(v => new Date(v.date) >= new Date(fromDate));
    if (toDate) vouchers = vouchers.filter(v => new Date(v.date) <= new Date(toDate));

    const accounts = await accountRepository.getByField("farmId", farmId);
    const revenues = accounts.filter(a => a.category === "إيرادات");
    const expenses = accounts.filter(a => a.category === "مصروفات");

    const result = {
      revenues: revenues.map(acc => ({ id: acc.id, name: acc.name, amount: 0 })),
      expenses: expenses.map(acc => ({ id: acc.id, name: acc.name, amount: 0 })),
      totalRevenues: 0,
      totalExpenses: 0,
      netIncome: 0
    };

    for (const voucher of vouchers) {
      for (const line of voucher.lines) {
        const revAcc = result.revenues.find(r => r.id === line.accountId);
        if (revAcc) {
          const net = line.credit - line.debit; // normal for revenue
          revAcc.amount += net;
          result.totalRevenues += net;
        }

        const expAcc = result.expenses.find(e => e.id === line.accountId);
        if (expAcc) {
          const net = line.debit - line.credit; // normal for expenses
          expAcc.amount += net;
          result.totalExpenses += net;
        }
      }
    }

    result.netIncome = result.totalRevenues - result.totalExpenses;
    return result;
  },

  getBalanceSheet: async (farmId: string, upToDate?: string) => {
    // 1. Get Income Statement up to date to get Net Income
    const incomeStatement = await financeService.getIncomeStatement(farmId, undefined, upToDate);
    const netIncome = incomeStatement.netIncome;

    // 2. Get Trial Balance up to date for Assets, Liabilities, and Equity
    const tb = await financeService.getTrialBalance(farmId, upToDate);
    const assets = tb.filter(a => a.category === "أصول" && a.balance !== 0);
    const liabilities = tb.filter(a => a.category === "خصوم" && a.balance !== 0);
    const equities = tb.filter(a => a.category === "حقوق ملكية" && a.balance !== 0);

    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
    const totalEquityRaw = equities.reduce((sum, a) => sum + a.balance, 0);
    const totalEquity = totalEquityRaw + netIncome; // Add Net Income from current period

    return {
      assets,
      liabilities,
      equities,
      totalAssets,
      totalLiabilities,
      totalEquityRaw,
      netIncome,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity
    };
  },

  getAccountStatement: async (farmId: string, accountId: string, fromDate?: string, toDate?: string) => {
    let vouchers = await voucherRepository.getByField("farmId", farmId);
    
    // Sort vouchers chronologically
    vouchers = vouchers.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const account = await accountRepository.getById(accountId);
    if (!account) throw new Error("الحساب غير موجود");

    const isDebitNormal = account.category === "أصول" || account.category === "مصروفات";

    const statementLines = [];
    let runningBalance = 0;
    let openingBalance = 0;

    for (const voucher of vouchers) {
      const vDate = new Date(voucher.date);
      
      const lineMatch = voucher.lines.find(l => l.accountId === accountId);
      if (lineMatch) {
        const change = isDebitNormal ? (lineMatch.debit - lineMatch.credit) : (lineMatch.credit - lineMatch.debit);
        
        // If before fromDate, accumulate to opening balance
        if (fromDate && vDate < new Date(fromDate)) {
          openingBalance += change;
          runningBalance += change;
          continue;
        }

        // If after toDate, ignore
        if (toDate && vDate > new Date(toDate)) {
          continue;
        }

        runningBalance += change;

        statementLines.push({
          voucherId: voucher.id,
          date: voucher.date,
          serialNumber: voucher.serialNumber,
          type: voucher.type,
          description: voucher.description, // Can use lineMatch.description
          debit: lineMatch.debit,
          credit: lineMatch.credit,
          balance: runningBalance
        });
      }
    }

    return {
      account,
      openingBalance,
      endingBalance: runningBalance,
      lines: statementLines
    };
  },

  closeFinancialPeriod: async (farmId: string, closingDate: string, description: string, userId: string) => {
    // 1. Fetch Farm
    const farm = await farmRepository.getById(farmId);
    if (!farm) throw new Error("المزرعة غير موجودة");

    // 2. Fetch all revenues and expenses up to closingDate
    // But since we want to clear them, we need their CURRENT absolute balances 
    // Wait, the Trial Balance gives us exactly what we need to clear.
    // If a previous closing happened, the balances are cumulative since the dawn of time OR since the last closing?
    // In our system, balances are cumulative. If we zero them out with a journal entry, their new balance becomes 0.
    // So we just need the Trial Balance up to 'closingDate' for all revenues and expenses.
    
    const tb = await financeService.getTrialBalance(farmId, closingDate);
    const revenues = tb.filter(a => a.category === "إيرادات" && Math.abs(a.balance) > 0);
    const expenses = tb.filter(a => a.category === "مصروفات" && Math.abs(a.balance) > 0);

    if (revenues.length === 0 && expenses.length === 0) {
      throw new Error("لا توجد إيرادات أو مصروفات لإغلاقها في هذا التاريخ.");
    }

    // 3. Find or Create "Retained Earnings" account
    let accounts = await accountRepository.getByField("farmId", farmId);
    let retainedEarningsAcc = accounts.find(a => a.name === "الأرباح والخسائر المدورة");
    
    if (!retainedEarningsAcc) {
      retainedEarningsAcc = await accountRepository.create({
        farmId,
        code: "3999", // Typical equity code
        name: "الأرباح والخسائر المدورة",
        category: "حقوق ملكية",
        description: "حساب نظامي لتدوير الأرباح والخسائر عند الإغلاق المالي",
        balance: 0,
        isSystemAccount: true
      }, userId);
    }

    // 4. Create the Closing Journal Entry (قيد إقفال)
    let totalRevToClose = 0;
    let totalExpToClose = 0;
    const lines = [];

    // Revenue has normal Credit balance. To close it, we Debit it.
    for (const r of revenues) {
      lines.push({
        accountId: r.accountId,
        accountName: r.name,
        description: `إغلاق إيرادات فترة: ${closingDate}`,
        debit: r.balance,
        credit: 0
      });
      totalRevToClose += r.balance;
    }

    // Expense has normal Debit balance. To close it, we Credit it.
    for (const e of expenses) {
      lines.push({
        accountId: e.accountId,
        accountName: e.name,
        description: `إغلاق مصروفات فترة: ${closingDate}`,
        debit: 0,
        credit: e.balance
      });
      totalExpToClose += e.balance;
    }

    // The difference goes to Retained Earnings
    const netIncome = totalRevToClose - totalExpToClose;
    if (netIncome > 0) {
      // Profit: Credit Retained Earnings
      lines.push({
        accountId: retainedEarningsAcc.id,
        accountName: retainedEarningsAcc.name,
        description: `صافي ربح الفترة المغلقة في ${closingDate}`,
        debit: 0,
        credit: netIncome
      });
    } else if (netIncome < 0) {
      // Loss: Debit Retained Earnings
      lines.push({
        accountId: retainedEarningsAcc.id,
        accountName: retainedEarningsAcc.name,
        description: `صافي خسارة الفترة المغلقة في ${closingDate}`,
        debit: Math.abs(netIncome),
        credit: 0
      });
    }

    const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);

    // Generate Serial for Journal Entry
    const q = query(collection(db, "vouchers"), where("farmId", "==", farmId), where("type", "==", "قيد يومية"), orderBy("createdAt", "desc"), limit(1));
    const snap = await getDocs(q);
    let nextNum = 1;
    if (!snap.empty) {
      const lastVoucher = snap.docs[0].data() as Voucher;
      if (lastVoucher.serialNumber) {
        const parts = lastVoucher.serialNumber.split("-");
        if (parts.length === 2) nextNum = parseInt(parts[1]) + 1;
      }
    }
    const serialNumber = `JOU-${nextNum.toString().padStart(4, "0")}`;

    const closingVoucher: Partial<Voucher> = {
      farmId,
      serialNumber,
      type: "قيد يومية",
      date: closingDate,
      reference: "إقفال دوري",
      description: description || `إقفال الفترة المالية حتى تاريخ ${closingDate}`,
      totalAmount: totalDebit,
      lines,
    };

    const createdVoucher = await voucherRepository.create(closingVoucher, userId);

    // Update actual account balances
    for (const line of lines) {
      const acc = await accountRepository.getById(line.accountId);
      if (acc) {
        const isDebitNormal = acc.category === "أصول" || acc.category === "مصروفات";
        const change = isDebitNormal ? (line.debit - line.credit) : (line.credit - line.debit);
        await accountRepository.update(acc.id, { balance: (acc.balance || 0) + change } as any, userId);
      }
    }

    // 5. Update Farm lastClosingDate
    await farmRepository.update(farmId, { lastClosingDate: closingDate } as any, userId);

    return createdVoucher;
  }
};
