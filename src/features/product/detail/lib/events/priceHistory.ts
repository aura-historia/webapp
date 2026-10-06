import type { ProductListingHistoryEntry } from "@/data/internal/product/ProductListingHistory.ts";
import type {
    ListingPrice,
    ListingPriceEstimate,
} from "@/data/internal/product/ProductListingDomain.ts";

export type PriceHistoryPoint = { readonly x: number; readonly y: number | null };
export type PriceHistorySeries = {
    readonly currency: string;
    readonly data: readonly PriceHistoryPoint[];
};

function minorUnitDigits(currency: string, locale = "en"): number {
    try {
        return (
            new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions()
                .maximumFractionDigits ?? 2
        );
    } catch {
        return 2;
    }
}

export function formatHistoryMoney(value: ListingPriceEstimate, locale: string): string {
    const digits = minorUnitDigits(value.currency, locale);
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: value.currency,
    }).format(value.amount / 10 ** digits);
}

export function formatHistoryPrice(
    value: ListingPrice | null,
    locale: string,
    labels: { readonly onRequest: string; readonly notProvided: string },
): string {
    if (value === null) return labels.notProvided;
    if (value.type === "ON_REQUEST") return labels.onRequest;
    return formatHistoryMoney(value, locale);
}

type PriceHistoryBuilder = {
    readonly seriesByCurrency: Map<string, PriceHistoryPoint[]>;
    activeCurrency?: string;
    latestMonetaryCurrency?: string;
};

function addPricePoint(
    builder: PriceHistoryBuilder,
    currency: string,
    timestamp: number,
    amount: number | null,
): void {
    if (!Number.isFinite(timestamp)) return;
    const data = builder.seriesByCurrency.get(currency) ?? [];
    data.push({
        x: timestamp,
        y: amount === null ? null : amount / 10 ** minorUnitDigits(currency),
    });
    builder.seriesByCurrency.set(currency, data);
}

function appendPriceChange(
    builder: PriceHistoryBuilder,
    change: Extract<ProductListingHistoryEntry["payload"], { kind: "CHANGED" }>["changes"][number],
    timestamp: number,
): void {
    if (change.type !== "MAIN_PRICE_CHANGED") return;

    const previousCurrency =
        change.previous?.type === "MONETARY" ? change.previous.currency : builder.activeCurrency;
    const current = change.current;
    if (current?.type === "MONETARY") {
        if (previousCurrency && previousCurrency !== current.currency) {
            addPricePoint(builder, previousCurrency, timestamp, null);
        }
        addPricePoint(builder, current.currency, timestamp, current.amount);
        builder.activeCurrency = current.currency;
        builder.latestMonetaryCurrency = current.currency;
        return;
    }

    if (previousCurrency) addPricePoint(builder, previousCurrency, timestamp, null);
    builder.activeCurrency = undefined;
}

function appendHistoryEntry(builder: PriceHistoryBuilder, entry: ProductListingHistoryEntry): void {
    const timestamp = entry.timestamp.getTime();
    if (entry.payload.kind === "DISCOVERED") {
        const initialPrice = entry.payload.discovery.pricing.price;
        if (initialPrice?.type === "MONETARY") {
            builder.activeCurrency = initialPrice.currency;
            builder.latestMonetaryCurrency = initialPrice.currency;
            addPricePoint(builder, initialPrice.currency, timestamp, initialPrice.amount);
        }
        return;
    }

    if (entry.payload.kind === "CHANGED") {
        for (const change of entry.payload.changes) {
            appendPriceChange(builder, change, timestamp);
        }
    }
}

export function getPriceHistorySeries(
    history: readonly ProductListingHistoryEntry[],
): PriceHistorySeries[] {
    const builder: PriceHistoryBuilder = { seriesByCurrency: new Map() };
    for (const entry of history) appendHistoryEntry(builder, entry);

    const series = [...builder.seriesByCurrency].map(([currency, data]) => ({ currency, data }));
    if (!builder.latestMonetaryCurrency) return series;

    return [
        ...series.filter(({ currency }) => currency !== builder.latestMonetaryCurrency),
        ...series.filter(({ currency }) => currency === builder.latestMonetaryCurrency),
    ];
}
