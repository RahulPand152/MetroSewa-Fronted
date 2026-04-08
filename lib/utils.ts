import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isToday, isTomorrow, format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBookingDate(date: Date | string | null | undefined, dateFormat = "MMM d, yyyy"): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, dateFormat);
}
