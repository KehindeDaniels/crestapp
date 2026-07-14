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

/** e.g. 137216 -> "134kb" — matches the Figma KYC upload status rows' format. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}b`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}kb`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}mb`;
}
