import { formatShortDate, formatTime } from "@/lib/utils.ts";

/** A UTC calendar day for directory cells, e.g. "3 Nov 2026". */
export function formatAdminDay(date: Date, language: string): string {
    return formatShortDate(date, language, "UTC");
}

/** A UTC timestamp for record facts, e.g. "3 Nov 2026, 14:08 UTC". */
export function formatAdminTimestamp(date: Date, language: string): string {
    return `${formatShortDate(date, language, "UTC")}, ${formatTime(date, language, "UTC")} UTC`;
}
