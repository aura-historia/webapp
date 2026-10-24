import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { replaceCurrencyCodeWithSymbol } from "@/data/internal/price/Price.ts";
import type { CheckedState } from "@radix-ui/react-checkbox";

/** Design-system type styles from `src/styles.css`, so `text-tag` is not mistaken for a colour. */
const TYPE_STYLES = [
    "display-hero",
    "display-section",
    "display-figure",
    "display-rail",
    "title-lg",
    "title-md",
    "title-sm",
    "stat",
    "question",
    "object-title",
    "object-title-sm",
    "wordmark",
    "lead",
    "body-lg",
    "body",
    "body-sm",
    "meta",
    "button",
    "price",
    "eyebrow",
    "kicker",
    "label",
    "tag",
];

const twMerge = extendTailwindMerge({
    extend: { classGroups: { "font-size": [{ text: TYPE_STYLES }] } },
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDateTime(date: Date, locale?: string, timeZone?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone,
    }).format(date);
}

export function formatDate(date: Date, locale?: string, timeZone?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone,
    }).format(date);
}

export function formatTime(date: Date, locale?: string, timeZone?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone,
    }).format(date);
}

export function formatTimeWithSeconds(date: Date, locale?: string, timeZone?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone,
    }).format(date);
}

export function formatCompactCurrency(value: number, currency: string, locale: string): string {
    const formatted = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
    }).format(value);

    return replaceCurrencyCodeWithSymbol(formatted, currency);
}

export function formatShortDate(date: Date, locale?: string, timeZone?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone,
    }).format(date);
}

export function handleCheckedChange(
    field: { value: string[]; onChange: (value: string[]) => void },
    state: string,
    isChecked: CheckedState,
): void {
    if (isChecked) {
        field.onChange([...field.value, state]);
    } else {
        field.onChange(field.value?.filter((value) => value !== state));
    }
}
