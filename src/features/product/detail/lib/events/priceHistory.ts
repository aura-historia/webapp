import type { Currency } from "@/data/internal/common/Currency.ts";
import { currencyFormatOptions, toMajorCurrencyAmount } from "@/data/internal/price/Price.ts";
import type {
    HistoricalDisplayPrice,
    HistoricalDisplayRange,
    HistoricalMainDisplayPrice,
    HistoryListingPrice,
    HistoryPriceEstimate,
    ProductListingHistoryEntry,
} from "@/data/internal/product/ProductListingHistory.ts";
import type { ListingPriceEstimate } from "@/data/internal/product/ProductListingDomain.ts";

export type PriceHistoryPoint = { readonly x: number; readonly y: number | null };
export type PriceHistorySeries = {
    readonly currency: string;
    readonly data: readonly PriceHistoryPoint[];
};

/**
 * Returns the backend's historical projection of a source value into `currency`, or `undefined`
 * when none applies: no currency was requested, the value is on request or missing, or the backend
 * had no snapshot or quote for it. A projection into a different currency is never used. A range
 * projects to a range, or to one amount when its bounds round to the same amount.
 */
export function getHistoryDisplayPrice(
    value: HistoryListingPrice | HistoryPriceEstimate | null | undefined,
    currency: Currency | undefined,
): HistoricalDisplayPrice | HistoricalMainDisplayPrice | undefined {
    if (!value || !currency || ("type" in value && value.type === "ON_REQUEST")) return undefined;
    return value.display?.currency === currency ? value.display : undefined;
}

export function formatHistoryMoney(value: ListingPriceEstimate, locale: string): string {
    return new Intl.NumberFormat(locale, currencyFormatOptions(value.currency)).format(
        toMajorCurrencyAmount(value.amount, value.currency),
    );
}

/** A historical amount or range, in the same format as `formatHistoryMoney`. */
export function formatHistoryValue(
    value: ListingPriceEstimate | Omit<HistoricalDisplayRange, "fxRateId" | "capturedAt">,
    locale: string,
): string {
    if ("amount" in value) return formatHistoryMoney(value, locale);
    const min = formatHistoryMoney({ amount: value.min, currency: value.currency }, locale);
    const max = formatHistoryMoney({ amount: value.max, currency: value.currency }, locale);
    return `${min} – ${max}`;
}

/**
 * Whether any main price in the history is a range. The chart plots single amounts only, so it
 * names the gaps that ranges leave.
 */
export function hasRangePriceHistory(history: readonly ProductListingHistoryEntry[]): boolean {
    return history.some((entry) => {
        if (entry.payload.kind === "DISCOVERED") {
            return entry.payload.discovery.pricing.price?.type === "RANGE";
        }
        if (entry.payload.kind !== "CHANGED") return false;
        return entry.payload.changes.some(
            (change) =>
                change.type === "MAIN_PRICE_CHANGED" &&
                (change.previous?.type === "RANGE" || change.current?.type === "RANGE"),
        );
    });
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
        y: amount === null ? null : toMajorCurrencyAmount(amount, currency),
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

    // A range, a price on request or a removed price is no single amount: the line has a gap.
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

function appendDisplayPoint(
    data: PriceHistoryPoint[],
    timestamp: number,
    price: HistoryListingPrice | null | undefined,
    currency: Currency,
): void {
    if (!Number.isFinite(timestamp)) return;
    const display = getHistoryDisplayPrice(price, currency);
    data.push({
        x: timestamp,
        // A range is a gap; one that rounded to a single amount in this currency is a point.
        y:
            display && "amount" in display
                ? toMajorCurrencyAmount(display.amount, display.currency)
                : null,
    });
}

/**
 * Builds one series in the requested display currency from the backend's per-entry historical
 * projections only. A source-currency change continues the same series because each point carries
 * its own projection. A missing projection, a range, an on-request or removed price is a gap; source
 * amounts are never plotted on this axis. Returns `undefined` when no point could be projected.
 */
export function getDisplayPriceHistorySeries(
    history: readonly ProductListingHistoryEntry[],
    currency: Currency | undefined,
): PriceHistorySeries | undefined {
    if (!currency) return undefined;
    const data: PriceHistoryPoint[] = [];
    for (const entry of history) {
        const timestamp = entry.timestamp.getTime();
        if (entry.payload.kind === "DISCOVERED") {
            const initialPrice = entry.payload.discovery.pricing.price;
            if (initialPrice) appendDisplayPoint(data, timestamp, initialPrice, currency);
        } else if (entry.payload.kind === "CHANGED") {
            for (const change of entry.payload.changes) {
                if (change.type === "MAIN_PRICE_CHANGED") {
                    appendDisplayPoint(data, timestamp, change.current, currency);
                }
            }
        }
    }

    return data.some(({ y }) => y !== null) ? { currency, data } : undefined;
}
