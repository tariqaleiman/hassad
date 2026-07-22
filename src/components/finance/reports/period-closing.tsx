"use client";

import { useState } from "react";
import { financeService } from "@/lib/services/finance-service";
import { useAuth } from "@/lib/providers/auth-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

export function PeriodClosing({ farmId, lastClosingDate }: { farmId: string, lastClosingDate?: string }) {
  const { user } = useAuth();
  const [closingDate, setClosingDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState<string>("إقفال الفترة المالية");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleClosePeriod = async () => {
    if (!user) return;
    
    // Validate
    if (lastClosingDate && new Date(closingDate) <= new Date(lastClosingDate)) {
      setError(`تاريخ الإغلاق يجب أن يكون أحدث من آخر إغلاق (${new Date(lastClosingDate).toLocaleDateString("ar-SA")})`);
      return;
    }

    if (!window.confirm("تحذير: بمجرد إغلاق الفترة لن تتمكن من التعديل أو الحذف لأي قيد أو فاتورة تسبق هذا التاريخ. هل أنت متأكد من المتابعة؟")) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await financeService.closeFinancialPeriod(farmId, closingDate, description, user.uid);
      setSuccess("تم إغلاق الفترة المالية وتدوير الأرصدة بنجاح! تم حماية هذه الفترة من التعديلات.");
      // Small timeout to let user read message before potentially reloading
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء عملية الإغلاق.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* Header Info */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-6">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-2">إغلاق الفترة المالية (Period Closing)</h3>
            <p className="text-sm text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
              عملية إغلاق الفترة المالية تقوم بتصفير حسابات الإيرادات والمصروفات وترحيل صافي الربح أو الخسارة تلقائياً إلى حساب "الأرباح والخسائر المدورة" ضمن حقوق الملكية. بمجرد الإغلاق، سيتم قفل الفترات السابقة لمنع أي تلاعب أو تعديل في الحركات القديمة. يمكنك إجراء الإغلاق بشكل دوري مع نهاية الموسم أو نهاية السنة المالية.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-2xl p-6 space-y-6">
        {lastClosingDate && (
          <div className="flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-lg text-sm font-medium">
            <AlertTriangle className="h-4 w-4 text-gray-500" />
            <span>تاريخ آخر إغلاق مالي: <span className="font-mono bg-white dark:bg-black px-2 py-0.5 rounded border border-black/10">{new Date(lastClosingDate).toLocaleDateString("ar-SA")}</span></span>
          </div>
        )}

        <div className="space-y-2">
          <Label>تاريخ الإغلاق (حتى تاريخ)</Label>
          <Input 
            type="date" 
            value={closingDate} 
            onChange={(e) => setClosingDate(e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <Label>البيان / وصف الإغلاق</Label>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="مثال: إقفال الموسم الزراعي لعام 2026"
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium">
            {success}
          </div>
        )}

        <button 
          onClick={handleClosePeriod}
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Spinner className="h-5 w-5" /> : (
            <>
              <Lock className="h-5 w-5" />
              <span>تنفيذ الإغلاق המالي (ترحيل وتدوير)</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
