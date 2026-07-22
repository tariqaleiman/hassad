import { useState } from "react";
import { useAccounts, useDeleteAccount } from "@/lib/hooks/use-finance";
import { AccountForm } from "./account-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Account } from "@/lib/types/finance";
import { useCurrency } from "@/lib/hooks/use-currency";

export function AccountsTab({ farmId }: { farmId: string }) {
  const { data: accounts = [], isLoading } = useAccounts(farmId);
  const deleteAccount = useDeleteAccount();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const { formatMoney } = useCurrency();

  if (isLoading) {
    return <div className="p-12 flex justify-center"><Spinner /></div>;
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف الحساب "${name}"؟`)) {
      deleteAccount.mutate({ id, farmId });
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "أصول": return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30";
      case "إيرادات": return "text-blue-600 bg-blue-50 dark:bg-blue-950/30";
      case "مصروفات": return "text-rose-600 bg-rose-50 dark:bg-rose-950/30";
      case "خصوم": return "text-amber-600 bg-amber-50 dark:bg-amber-950/30";
      case "حقوق ملكية": return "text-purple-600 bg-purple-50 dark:bg-purple-950/30";
      default: return "text-gray-600 bg-gray-50 dark:bg-gray-950/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-ink">دليل الحسابات</h3>
          <p className="text-sm text-ink-muted mt-1">تكويد وإدارة الحسابات المحاسبية وأرصدتها</p>
        </div>
        <Button 
          onClick={() => { setEditingAccount(null); setIsFormOpen(true); }}
          className="gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-6 shadow-xl"
        >
          <Plus className="w-5 h-5" />
          إضافة حساب
        </Button>
      </div>

      <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-black/5 dark:bg-white/5 text-ink-muted">
              <tr>
                <th className="p-4 font-semibold w-24">رمز الحساب</th>
                <th className="p-4 font-semibold">اسم الحساب</th>
                <th className="p-4 font-semibold">التصنيف</th>
                <th className="p-4 font-semibold">الرصيد</th>
                <th className="p-4 font-semibold w-24">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-ink-muted">
                    لا يوجد حسابات مسجلة حالياً
                  </td>
                </tr>
              ) : (
                accounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-sm text-ink-muted">{acc.code}</td>
                    <td className="p-4 font-bold text-ink">{acc.name}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(acc.category)}`}>
                        {acc.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-semibold" dir="ltr">
                      {formatMoney(acc.balance || 0)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(acc)}>
                          <Edit className="w-4 h-4 text-ink-muted hover:text-primary transition-colors" />
                        </Button>
                        {!acc.isSystemAccount && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(acc.id, acc.name)}>
                            <Trash2 className="w-4 h-4 text-ink-muted hover:text-rose-500 transition-colors" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <AccountForm 
          farmId={farmId}
          defaultValues={editingAccount || undefined}
          isEdit={!!editingAccount}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
