import { useSettingsStore } from "@/lib/store/settings-store";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/format";

export function useCurrency() {
  const { currency } = useSettingsStore();

  return {
    currency,
    formatMoney: (amount: number) => formatCurrencyUtil(amount, currency),
  };
}
