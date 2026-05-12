import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: any) {
  if (amount === undefined || amount === null) return "৳0.00";
  const num = typeof amount === 'number' ? amount : parseFloat(amount.toString());
  // Force 2 decimal precision before formatting to avoid float errors like 9999.9999...
  const fixedValue = Number(num.toFixed(2));
  return `৳${new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(fixedValue)}`;
}
