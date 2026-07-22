"use client";

import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

export function AccountingTab() {
  const handleSave = () => {
    // محاكاة لعملية الحفظ لإعطاء المستخدم تفاعل مبدئي
    toast.success("تم حفظ إعدادات المحاسبة والضرائب بنجاح");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-xl font-bold text-ink mb-1">الإعدادات المالية والضرائب</h2>
        <p className="text-ink-muted mb-6 text-sm">ضبط القواعد المحاسبية، الضرائب، وترقيم الفواتير.</p>
        <Card className="shadow-sm border-border/60 bg-paper rounded-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">السنة المالية تبدأ في</label>
                <Select>
                  <option value="1-1">1 يناير</option>
                  <option value="7-1">1 يوليو</option>
                </Select>
                <p className="text-xs text-ink-muted mt-2">بداية الدورة المحاسبية للمنشأة.</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-ink mb-2">نسبة ضريبة القيمة المضافة الافتراضية</label>
                <div className="relative">
                  <Input type="number" defaultValue="15" className="pl-8 h-11 rounded-xl" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">%</span>
                </div>
                <p className="text-xs text-ink-muted mt-2">تطبق تلقائياً على الفواتير إذا لم يتم تغييرها.</p>
              </div>
            </div>

            <div className="border-t border-border/60 pt-8">
              <h3 className="font-bold text-lg text-ink mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-ink-muted" />
                ترقيم الفواتير والمستندات
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">بادئة فاتورة المبيعات (Prefix)</label>
                  <Input defaultValue="INV-" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">تسلسل البدء</label>
                  <Input type="number" defaultValue="1000" className="rounded-xl" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-border/60">
              <Button onClick={handleSave} className="rounded-xl px-8">حفظ الإعدادات</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
