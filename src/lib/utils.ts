import type { PriceData } from "@/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ItemState } from "@/data/internal/ItemState.ts";

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

export function getStateDescription(state: ItemState): string {
    const descriptions = {
        LISTED: "Der Artikel wurde neu gelistet.",
        AVAILABLE: "Der Artikel ist jetzt zum Kauf verfügbar.",
        RESERVED: "Der Artikel wurde von einem Käufer reserviert.",
        SOLD: "Der Artikel wurde verkauft.",
        REMOVED: "Der Artikel wurde entfernt.",
        UNKNOWN: "Der Status des Artikels ist unbekannt.",
    };
    return descriptions[state];
}
