/** Formatting helpers for money and dates (NGN/USD domain). */

export function formatCurrency(
  amount: number | string,
  currency = "NGN",
  locale = "en-NG",
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(
  input: string | number | Date,
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
  locale = "en-NG",
): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, opts).format(date);
}
