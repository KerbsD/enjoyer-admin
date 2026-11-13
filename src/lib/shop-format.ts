export const peso = (amount: string) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(amount));
export const shopTime = (instant: string) => new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short",
}).format(new Date(instant));
export const statusLabel = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
