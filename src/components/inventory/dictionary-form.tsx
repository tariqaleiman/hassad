"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ItemDictionaryFormValues } from "@/lib/types/dictionary";

const dictionarySchema = z.object({
  category: z.enum([
    "تقاوي", 
    "أسمدة حرة", 
    "أسمدة مدعمة", 
    "مغذيات", 
    "مبيدات", 
    "محروقات وزيوت", 
    "محاصيل تامة", 
    "نواتج ثانوية", 
    "أخرى"
  ], {
    error: "اختر فئة المادة",
  }),
  mainType: z.string().min(2, "النوع الرئيسي مطلوب"),
  subType: z.string().optional(),
  variety: z.string().optional(),
  unit: z.string().min(1, "الوحدة مطلوبة"),
});

export function DictionaryForm({
  onSubmit,
  loading,
  onCancel,
  defaultValues,
}: {
  onSubmit: (values: ItemDictionaryFormValues) => void;
  loading?: boolean;
  onCancel: () => void;
  defaultValues?: Partial<ItemDictionaryFormValues>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemDictionaryFormValues>({
    resolver: zodResolver(dictionarySchema),
    defaultValues: defaultValues || {
      category: "تقاوي",
      mainType: "",
      subType: "",
      variety: "",
      unit: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="category">الفئة *</Label>
        <Select id="category" {...register("category")} className="bg-paper">
          <option value="">اختر الفئة</option>
          <option value="تقاوي">تقاوي</option>
          <option value="أسمدة حرة">أسمدة حرة</option>
          <option value="أسمدة مدعمة">أسمدة مدعمة</option>
          <option value="مغذيات">مغذيات</option>
          <option value="مبيدات">مبيدات</option>
          <option value="محروقات وزيوت">محروقات وزيوت</option>
          <option value="محاصيل تامة">محاصيل تامة (للبيع)</option>
          <option value="نواتج ثانوية">نواتج ثانوية (تبن، دريس)</option>
          <option value="أخرى">أخرى</option>
        </Select>
        {errors.category && <p className="mt-1 text-xs text-danger">{errors.category.message}</p>}
      </div>

      <div>
        <Label htmlFor="mainType">النوع الرئيسي *</Label>
        <Input 
          id="mainType" 
          {...register("mainType")} 
          placeholder="مثال: أرز، قمح، يوريا، مبيد حشري..." 
          className="bg-paper"
        />
        {errors.mainType && <p className="mt-1 text-xs text-danger">{errors.mainType.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subType">النوع الفرعي (اختياري)</Label>
          <Input 
            id="subType" 
            {...register("subType")} 
            placeholder="مثال: رفيع الحبة، 46%، سائل..." 
            className="bg-paper"
          />
        </div>
        <div>
          <Label htmlFor="variety">السلالة / الصنف (اختياري)</Label>
          <Input 
            id="variety" 
            {...register("variety")} 
            placeholder="مثال: جيزة 178، سخا 104..." 
            className="bg-paper"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="unit">الوحدة الافتراضية *</Label>
        <Input 
          id="unit" 
          list="common-units"
          {...register("unit")} 
          placeholder="مثال: شيكارة 50كجم، لتر، إردب..." 
          className="bg-paper"
        />
        {errors.unit && <p className="mt-1 text-xs text-danger">{errors.unit.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={loading}>
          حفظ الصنف
        </Button>
      </div>

      <datalist id="common-units">
        <option value="كيلوجرام" />
        <option value="جرام" />
        <option value="طن" />
        <option value="لتر" />
        <option value="مللي" />
        <option value="شيكارة 50 كجم" />
        <option value="شيكارة 25 كجم" />
        <option value="عبوة 1 لتر" />
        <option value="عبوة 500 مل" />
        <option value="عبوة 250 مل" />
        <option value="عبوة 100 مل" />
        <option value="ملوة ماتور رش 20 لتر" />
        <option value="ملوة ماتور رش 600 لتر" />
        <option value="إردب" />
        <option value="قنطار" />
        <option value="حمل تبن" />
        <option value="بالة دريس" />
        <option value="مقطورة" />
        <option value="متر مكعب" />
      </datalist>
    </form>
  );
}
