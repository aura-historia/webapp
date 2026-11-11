/** "6 Nov 2026" in UTC, for ledger cells. */
export function formatAdminDay(date: Date, locale: string): string {
    return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

/** "6 Nov 2026, 16:42 UTC", for record facts. */
export function formatAdminDateTime(date: Date, locale: string): string {
    return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
    }).format(date);
}
