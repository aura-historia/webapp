import type { PriceData, ItemStateData, ItemEventTypeData } from "@/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(data: PriceData, locale: string | undefined = undefined): string {
    return new Intl.NumberFormat(locale ?? navigator.language, {
        style: "currency",
        currency: data?.currency,
    }).format((data?.amount ?? 0) / 100);
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

/**
     * Formats currency values in a compact format for display on small screens (e.g., mobile/tablet charts).
     *
     * Uses custom German abbreviations ("Tsd.", "Mio.") because the native Intl.NumberFormat
     * with notation="compact" doesn't show "Tsd." for thousands in German locale.

     * @example
     * formatCompactCurrency(499)      // → "499 €"
     * formatCompactCurrency(5500)     // → "5,5 Tsd. €"
     * formatCompactCurrency(25000)    // → "25 Tsd. €"
     * formatCompactCurrency(1500000)  // → "1,5 Mio. €"
     */

/*
    export function formatCompactCurrency(value: number): string {
        const absValue = Math.abs(value);

        if (absValue >= 1000000) {
            return `${(value / 1000000).toFixed(1).replace('.', ',')} Mio. €`;
        }

        if (absValue >= 1000) {
            const thousands = value / 1000;
            if (absValue < 10000) {
                return `${thousands.toFixed(1).replace('.', ',')} Tsd. €`;
            }
            return `${Math.round(thousands)} Tsd. €`;
        }

        return `${Math.round(value)} €`;
    }
     */

export function formatCompactCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
    }).format(value);
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
