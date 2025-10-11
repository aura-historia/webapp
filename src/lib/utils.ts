import type { PriceData } from "@/client";
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
