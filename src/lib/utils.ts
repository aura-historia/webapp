import type { PriceData } from "@/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

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
