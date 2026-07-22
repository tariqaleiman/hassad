export function formatCurrency(amount: number, currency: string = "ر.س"): string {
  const formattedAmount = new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formattedAmount} ${currency}`;
}
