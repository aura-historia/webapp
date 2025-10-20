import type { PriceData, ItemStateData, ItemEventTypeData } from "@/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(data: PriceData, locale: string | undefined = undefined): string {
    return new Intl.NumberFormat(locale ?? navigator.language, {
        style: "currency",
        currency: data?.currency,
    }).format((data?.amount ?? 0) / 100);
}

export function formatToDateString(date?: Date): string | undefined {
    if (date === undefined) {
        return undefined;
    }
    return format(date, "yyyy-MM-dd");
}

export function isSimpleSearch(searchArgs: SearchFilterArguments): boolean {
    return !(
        searchArgs.priceFrom ||
        searchArgs.priceTo ||
        searchArgs.allowedStates ||
        searchArgs.creationDateFrom ||
        searchArgs.creationDateTo ||
        searchArgs.updateDateFrom ||
        searchArgs.updateDateTo ||
        searchArgs.merchant
    );
}

export function formatDateTime(date: Date, locale?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function formatDate(date: Date, locale?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

export function formatTime(date: Date, locale?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function formatTimeWithSeconds(date: Date, locale?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
    }).format(value);
}

export function formatCompactCurrency(value: number): string {
    const formatted = new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
    }).format(value);
    return `${formatted} €`;
}

export function getStateDescription(state: ItemStateData): string {
    switch (state) {
        case "LISTED":
            return "Der Artikel wurde neu gelistet.";
        case "AVAILABLE":
            return "Der Artikel ist jetzt zum Kauf verfügbar.";
        case "RESERVED":
            return "Der Artikel wurde von einem Käufer reserviert.";
        case "SOLD":
            return "Der Artikel wurde verkauft.";
        case "REMOVED":
            return "Der Artikel wurde entfernt.";
        case "UNKNOWN":
            return "Der Status des Artikels ist unbekannt.";
    }
}

export function getPriceEventDescription(eventType: ItemEventTypeData): string {
    switch (eventType) {
        case "PRICE_DISCOVERED":
            return "Preis wurde entdeckt";
        case "PRICE_DROPPED":
            return "Preis ist gesunken";
        case "PRICE_INCREASED":
            return "Preis ist gestiegen";
        case "PRICE_REMOVED":
            return "Preis wurde entfernt";
        default:
            return "Preisänderung";
    }
}
