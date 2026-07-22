import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema, type AccountSchema } from "./finance-schemas";
import { useCreateAccount } from "@/lib/hooks/use-finance";
import { financeService } from "@/lib/services/finance-service";
import { useAuth } from "@/lib/providers/auth-provider";
import { toast } from "sonner";
import { useState } from "react";
import type { Account } from "@/lib/types/finance";

interface AccountFormProps {
  farmId: string;
  defaultValues?: Partial<Account>;
  isEdit: boolean;
  onClose: () => void;
}

export function AccountForm({ farmId, defaultValues, isEdit, onClose }: AccountFormProps) {
  const createAccount = useCreateAccount();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AccountSchema>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      code: defaultValues?.code || "",
      name: defaultValues?.name || "",
      category: defaultValues?.category || "أصول",
      description: defaultValues?.description || "",
    }
  });

  const onSubmit = async (data: AccountSchema) => {
    if (isEdit && defaultValues?.id && user) {
      try {
        setIsUpdating(true);
        await financeService.updateAccount(defaultValues.id, data, user.uid);
        toast.success("تم تحديث الحساب بنجاح");
        onClose();
        // Force reload by invalidating or refreshing (the parent query will refresh on focus, or we can use invalidateQueries inside component but we are not passing queryClient)
        // Simplest is to let it auto-refresh or reload page if needed, but react-query usually refetches.
      } catch (e: any) {
        toast.error(e.message || "فشل تحديث الحساب");
      } finally {
        setIsUpdating(false);
      }
    } else {
      createAccount.mutate({ ...data, farmId }, {
        onSuccess: () => onClose()
      });
    }
  };

  const loading = createAccount.isPending || isUpdating;

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      title={isEdit ? "تعديل حساب" : "إضافة حساب جديد"} 
      description="أدخل تفاصيل الحساب المحاسبي ليتم استخدامه في سندات القبض والصرف."
      className="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>رمز الحساب</Label>
              <Input 
                {...register("code")} 
                placeholder="مثال: 1001" 
                dir="ltr"
                disabled={defaultValues?.isSystemAccount} 
              />
              {errors.code && <p className="text-sm text-rose-500">{errors.code.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>تصنيف الحساب</Label>
              <Select 
                {...register("category")} 
                disabled={defaultValues?.isSystemAccount}
              >
                <option value="أصول">أصول (صندوق، بنك، مدينون)</option>
                <option value="خصوم">خصوم (موردون، قروض)</option>
                <option value="إيرادات">إيرادات (مبيعات)</option>
                <option value="مصروفات">مصروفات (أجور، صيانة)</option>
                <option value="حقوق ملكية">حقوق ملكية (رأس مال)</option>
              </Select>
              {errors.category && <p className="text-sm text-rose-500">{errors.category.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>اسم الحساب</Label>
            <Input {...register("name")} placeholder="مثال: صندوق المزرعة الرئيسي" />
            {errors.name && <p className="text-sm text-rose-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>وصف إضافي (اختياري)</Label>
            <Input {...register("description")} placeholder="وصف استخدام هذا الحساب" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <Button type="button" variant="ghost" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover text-white rounded-full px-6">
              {loading ? "جاري الحفظ..." : "حفظ الحساب"}
            </Button>
          </div>
      </form>
    </Dialog>
  );
}
