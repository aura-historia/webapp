import type {
    ListingHistoryMoney,
    ListingHistoryPrice,
    ProductListingHistoryEntry,
} from "@/data/internal/product/ProductListingHistory.ts";

export type PriceHistoryPoint = { readonly x: number; readonly y: number | null };
export type PriceHistorySeries = {
    readonly currency: string;
    readonly data: readonly PriceHistoryPoint[];
};

function minorUnitDigits(currency: string, locale = "en"): number {
    try {
        return new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions()
            .maximumFractionDigits;
    } catch {
        return 2;
    }
}

export function formatHistoryMoney(value: ListingHistoryMoney, locale: string): string {
    const digits = minorUnitDigits(value.currency, locale);
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: value.currency,
    }).format(value.amount / 10 ** digits);
}

export function formatHistoryPrice(
    value: ListingHistoryPrice | null,
    locale: string,
    labels: { readonly onRequest: string; readonly notProvided: string },
): string {
    if (value === null) return labels.notProvided;
    if (value.type === "ON_REQUEST") return labels.onRequest;
    return formatHistoryMoney(value, locale);
}

export function getPriceHistorySeries(
    history: readonly ProductListingHistoryEntry[],
): PriceHistorySeries[] {
    const seriesByCurrency = new Map<string, PriceHistoryPoint[]>();
    let activeCurrency: string | undefined;
    let latestMonetaryCurrency: string | undefined;

    const add = (currency: string, timestamp: number, amount: number | null) => {
        if (!Number.isFinite(timestamp)) return;
        const data = seriesByCurrency.get(currency) ?? [];
        data.push({
            x: timestamp,
            y: amount === null ? null : amount / 10 ** minorUnitDigits(currency),
        });
        seriesByCurrency.set(currency, data);
    };

    for (const entry of history) {
        if (entry.payload.kind === "DISCOVERED") {
            const initialPrice = entry.payload.discovery.pricing.price;
            if (initialPrice?.type === "MONETARY") {
                activeCurrency = initialPrice.currency;
                latestMonetaryCurrency = initialPrice.currency;
                add(initialPrice.currency, entry.timestamp.getTime(), initialPrice.amount);
            }
            continue;
        }

        if (entry.payload.kind !== "CHANGED") continue;
        for (const change of entry.payload.changes) {
            if (change.type !== "MAIN_PRICE_CHANGED") continue;

            const previousCurrency =
                change.previous?.type === "MONETARY" ? change.previous.currency : activeCurrency;
            const current = change.current;
            const timestamp = entry.timestamp.getTime();

            if (current?.type === "MONETARY") {
                if (previousCurrency && previousCurrency !== current.currency) {
                    add(previousCurrency, timestamp, null);
                }
                add(current.currency, timestamp, current.amount);
                activeCurrency = current.currency;
                latestMonetaryCurrency = current.currency;
            } else {
                if (previousCurrency) add(previousCurrency, timestamp, null);
                activeCurrency = undefined;
            }
        }
    }

    const series = [...seriesByCurrency].map(([currency, data]) => ({ currency, data }));
    if (!latestMonetaryCurrency) return series;

    return [
        ...series.filter(({ currency }) => currency !== latestMonetaryCurrency),
        ...series.filter(({ currency }) => currency === latestMonetaryCurrency),
    ];
}
