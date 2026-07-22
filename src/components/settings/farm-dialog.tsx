"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useCreateFarm, useUpdateFarm } from "@/lib/hooks/use-farms";
import type { Farm } from "@/lib/types/farm";
import { Building2, MapPin, Phone, StickyNote, Banknote } from "lucide-react";
import { useCurrency } from "@/lib/hooks/use-currency";

interface FarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farm?: Farm | null;
}

export function FarmDialog({ open, onOpenChange, farm }: FarmDialogProps) {
  const { formatMoney } = useCurrency();
  const isEditing = !!farm;
  const title = isEditing ? "تعديل بيانات الفرع" : "إضافة فرع / مزرعة جديدة";
  const description = isEditing ? "تحديث تفاصيل الفرع لضمان دقة التقارير." : "أدخل تفاصيل الفرع الجديد لإدارة عملياته ومستودعاته بشكل مستقل.";

  const create = useCreateFarm();
  const update = useUpdateFarm();

  const [name, setName] = useState("");
  const [commercialName, setCommercialName] = useState("");
  const [currency, setCurrency] = useState("ج.م");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (farm && open) {
      setName(farm.name || "");
      setCommercialName(farm.commercialName || "");
      setCurrency(farm.currency || "ج.م");
      setLocation(farm.mainLocation || "");
      setPhone(farm.phone || "");
      setNotes(farm.notes || "");
    } else if (!farm && open) {
      setName("");
      setCommercialName("");
      setCurrency("ج.م");
      setLocation("");
      setPhone("");
      setNotes("");
    }
  }, [farm, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const payload = {
        name,
        commercialName,
        currency,
        mainLocation: location,
        phone,
        notes
      };

      if (isEditing && farm) {
        await update.mutateAsync({ id: farm.id, values: payload });
      } else {
        await create.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} title={title} description={description} className="sm:max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5 pt-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink">الاسم الدارج (البراند) <span className="text-danger">*</span></label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="مثال: مزرعة النخيل الرئيسية" 
              required
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-ink-muted" /> الاسم التجاري الرسمي
            </label>
            <Input 
              value={commercialName} 
              onChange={e => setCommercialName(e.target.value)} 
              placeholder="مثال: شركة نخيل القصيم ذ.م.م" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-ink-muted" /> الموقع الجغرافي / العنوان
            </label>
            <Input 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              placeholder="المدينة، المنطقة، وصف الطريق..." 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-ink-muted" /> هاتف الفرع (للتواصل السريع)
            </label>
            <Input 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              placeholder="رقم هاتف مدير الفرع أو الحارس"
              dir="ltr"
              className="text-end" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
              <Banknote className="h-4 w-4 text-ink-muted" /> العملة الافتراضية للفرع
            </label>
            <Select value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="ج.م">الجنيه المصري ({currency})</option>
              <option value="ر.س">الريال السعودي (ر.س)</option>
              <option value="USD">الدولار الأمريكي ($)</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink flex items-center gap-1.5">
            <StickyNote className="h-4 w-4 text-ink-muted" /> ملاحظات داخلية (اختياري)
          </label>
          <Input 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="معلومات إضافية عن الفرع، نوع المحاصيل الأساسية، إلخ..." 
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-border/50">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="submit" disabled={create.isPending || update.isPending || !name.trim()}>
            {create.isPending || update.isPending ? "جاري الحفظ..." : isEditing ? "حفظ التعديلات" : "إضافة المزرعة"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
