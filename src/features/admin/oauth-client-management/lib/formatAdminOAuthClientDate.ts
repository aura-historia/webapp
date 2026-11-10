/** "14 Jan 2026" in UTC, for ledger cells. */
export function formatAdminDay(date: Date, locale: string): string {
    return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

/** "14 Jan 2026, 11:02 UTC", for record lines. */
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
