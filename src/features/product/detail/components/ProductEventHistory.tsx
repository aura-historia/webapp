import type { Currency } from "@/data/internal/common/Currency.ts";
import type {
    HistoricalDisplayPrice,
    HistoryListingPrice,
    HistoryPriceEstimate,
    ProductListingHistoryChange,
    ProductListingHistoryEntry,
} from "@/data/internal/product/ProductListingHistory.ts";
import type { ListingAvailability } from "@/data/internal/product/ProductListingDomain.ts";
import {
    TimelineItem,
    TimelineTitle,
    TimelineDescription,
    TimelineTime,
    TimelineHeader,
} from "@/components/ui/timeline.tsx";
import { formatDate, formatDateTime, formatTime } from "@/lib/utils.ts";
import {
    formatHistoryMoney,
    getHistoryDisplayPrice,
} from "@/features/product/detail/lib/events/priceHistory.ts";
import {
    getVisibleHistoryChanges,
    type HistoryFilter,
} from "@/features/product/detail/lib/events/eventFilters.ts";
import { useTranslation } from "react-i18next";
import { useRouteContext } from "@tanstack/react-router";
import type { TFunction } from "i18next";

interface ProductEventHistoryProps {
    readonly event: ProductListingHistoryEntry;
    readonly filter?: HistoryFilter;
    /** Requested display currency; omit to show source values only. */
    readonly displayCurrency?: Currency;
}

const AVAILABILITY_KEYS: Partial<Record<ListingAvailability, string>> = {
    AVAILABLE: "available",
    IN_STOCK: "inStock",
    LIMITED_AVAILABILITY: "limitedAvailability",
    BACK_ORDER: "backOrder",
    MADE_TO_ORDER: "madeToOrder",
    PRE_ORDER: "preOrder",
    PRE_SALE: "preSale",
    UNAVAILABLE: "unavailable",
    RESERVED: "reserved",
    OUT_OF_STOCK: "outOfStock",
    SOLD_OUT: "soldOut",
} as const;

type PriceLabel = HistoryListingPrice | HistoryPriceEstimate | null;
type HistoryDescription = { readonly key: string; readonly text: string };
type FormatPrice = (price: PriceLabel) => string;
type FormatAvailability = (availability: ListingAvailability | null) => string;

function formatAvailabilityLabel(availability: ListingAvailability | null, t: TFunction): string {
    const key = availability ? (AVAILABILITY_KEYS[availability] ?? "unknown") : "unknown";
    return t(`product.listingAvailability.${key}`);
}

/** Names the change without quoting the source text, which can be long or unassessed. */
function textChangeKey(
    field: "title" | "description",
    change: { readonly previous: unknown; readonly current: unknown },
): string {
    if (change.previous === null) return `${field}Added`;
    if (change.current === null) return `${field}Removed`;
    return `${field}Changed`;
}

function formatHistoryChange(
    change: ProductListingHistoryChange,
    t: TFunction,
    formatPrice: FormatPrice,
    formatAvailability: FormatAvailability,
    language: string,
    timeZone: string,
): string {
    switch (change.type) {
        case "TITLE_CHANGED":
            return t(`product.history.events.${textChangeKey("title", change)}`);
        case "DESCRIPTION_CHANGED":
            return t(`product.history.events.${textChangeKey("description", change)}`);
        case "MAIN_PRICE_CHANGED":
            return t("product.history.events.mainPriceChanged", {
                previous: formatPrice(change.previous),
                current: formatPrice(change.current),
            });
        case "MINIMUM_ESTIMATE_CHANGED":
            return t("product.history.events.minimumEstimateChanged", {
                previous: formatPrice(change.previous),
                current: formatPrice(change.current),
            });
        case "MAXIMUM_ESTIMATE_CHANGED":
            return t("product.history.events.maximumEstimateChanged", {
                previous: formatPrice(change.previous),
                current: formatPrice(change.current),
            });
        case "AVAILABILITY_CHANGED":
            return t("product.history.events.availabilityChanged", {
                previous: formatAvailability(change.previous),
                current: formatAvailability(change.current),
            });
        case "URL_CHANGED":
            return t("product.history.events.urlChanged");
        case "IMAGES_CHANGED":
            return t("product.history.events.imagesChangedWithCounts", {
                previousCount: change.previousCount,
                currentCount: change.currentCount,
            });
        case "AUCTION_CHANGED":
            return t("product.history.events.auctionChanged");
        case "WITHDRAWN":
            return t("product.history.events.withdrawn", {
                previousAvailability: formatAvailability(change.previousAvailability),
            });
        case "RESTORED":
            return t("product.history.events.restored");
        case "SALE_OBSERVED":
            return t("product.history.events.saleObserved", {
                observedAt: formatDateTime(change.observation.observedAt, language, timeZone),
            });
        case "SALE_OBSERVATION_RETRACTED":
            return t("product.history.events.saleObservationRetracted", {
                observedAt: formatDateTime(change.observation.observedAt, language, timeZone),
            });
        case "UNKNOWN":
            return t("product.history.events.unknownChange");
    }
}

function getDiscoveryDescriptions(
    discovery: Extract<ProductListingHistoryEntry["payload"], { kind: "DISCOVERED" }>["discovery"],
    filter: HistoryFilter,
    t: TFunction,
    formatPrice: FormatPrice,
    formatAvailability: FormatAvailability,
): HistoryDescription[] {
    const descriptions: HistoryDescription[] = [];
    const showPrice = filter === "all" || filter === "price";
    const showAvailability = filter === "all" || filter === "availability";
    const showDetails = filter === "all" || filter === "details";
    if (filter === "all") {
        descriptions.push({
            key: "discovered",
            text: t("product.history.events.listingDiscovered"),
        });
    }
    if (showPrice && discovery.pricing.price) {
        descriptions.push({
            key: "initial-price",
            text: t("product.history.events.initialPrice", {
                price: formatPrice(discovery.pricing.price),
            }),
        });
    }
    if (showPrice && discovery.pricing.priceEstimateMin) {
        descriptions.push({
            key: "initial-minimum-estimate",
            text: t("product.history.events.initialMinimumEstimate", {
                price: formatPrice(discovery.pricing.priceEstimateMin),
            }),
        });
    }
    if (showPrice && discovery.pricing.priceEstimateMax) {
        descriptions.push({
            key: "initial-maximum-estimate",
            text: t("product.history.events.initialMaximumEstimate", {
                price: formatPrice(discovery.pricing.priceEstimateMax),
            }),
        });
    }
    if (showAvailability && discovery.availability !== null) {
        descriptions.push({
            key: "initial-availability",
            text: t("product.history.events.initialAvailability", {
                availability: formatAvailability(discovery.availability),
            }),
        });
    }
    if (showDetails && discovery.imageCount > 0) {
        descriptions.push({
            key: "initial-images",
            text: t("product.history.events.initialImages", { count: discovery.imageCount }),
        });
    }
    if (showDetails && discovery.url) {
        descriptions.push({ key: "initial-url", text: t("product.history.events.initialUrl") });
    }
    if (showDetails && discovery.auction !== null) {
        descriptions.push({
            key: "discovery-auction",
            text: t("product.history.events.initialAuction"),
        });
    }
    return descriptions;
}

function getVisiblePriceValues(
    event: ProductListingHistoryEntry,
    filter: HistoryFilter,
): readonly PriceLabel[] {
    if (filter !== "all" && filter !== "price") return [];
    if (event.payload.kind === "DISCOVERED") {
        const { price, priceEstimateMin, priceEstimateMax } = event.payload.discovery.pricing;
        return [price ?? null, priceEstimateMin ?? null, priceEstimateMax ?? null];
    }
    return getVisibleHistoryChanges(event, filter).flatMap((change) =>
        change.type === "MAIN_PRICE_CHANGED" ||
        change.type === "MINIMUM_ESTIMATE_CHANGED" ||
        change.type === "MAXIMUM_ESTIMATE_CHANGED"
            ? [change.previous, change.current]
            : [],
    );
}

/** One provenance line per historical FX snapshot behind a converted value in this entry. */
function getConversionSnapshots(
    values: readonly PriceLabel[],
    displayCurrency: Currency | undefined,
): HistoricalDisplayPrice[] {
    const snapshots = new Map<string, HistoricalDisplayPrice>();
    for (const value of values) {
        const display = getHistoryDisplayPrice(value, displayCurrency);
        if (display && value && "currency" in value && value.currency !== display.currency) {
            snapshots.set(display.fxRateId, display);
        }
    }
    return [...snapshots.values()];
}

export function ProductEventHistory({
    event,
    filter = "all",
    displayCurrency,
}: ProductEventHistoryProps) {
    const { t, i18n } = useTranslation();
    const { timeZone } = useRouteContext({ from: "__root__" });
    const labels = {
        onRequest: t("product.history.values.onRequest"),
        notProvided: t("product.history.values.notProvided"),
    };

    const formatPrice = (price: PriceLabel) => {
        if (price === null) return labels.notProvided;
        if ("type" in price && price.type === "ON_REQUEST") return labels.onRequest;
        const source = formatHistoryMoney(price, i18n.language);
        if (!displayCurrency || price.currency === displayCurrency) return source;

        const display = getHistoryDisplayPrice(price, displayCurrency);
        if (!display) {
            return t("product.history.values.sourceOnly", {
                price: source,
                currency: displayCurrency,
            });
        }
        return t("product.history.values.converted", {
            display: formatHistoryMoney(display, i18n.language),
            source,
        });
    };

    const formatAvailability = (availability: ListingAvailability | null) =>
        formatAvailabilityLabel(availability, t);

    let descriptions: HistoryDescription[] = [];
    if (event.payload.kind === "DISCOVERED") {
        descriptions = getDiscoveryDescriptions(
            event.payload.discovery,
            filter,
            t,
            formatPrice,
            formatAvailability,
        );
    } else if (event.payload.kind === "CHANGED") {
        descriptions.push(
            ...getVisibleHistoryChanges(event, filter).map((change) => ({
                key: `${change.type}-${JSON.stringify(change)}`,
                text: formatHistoryChange(
                    change,
                    t,
                    formatPrice,
                    formatAvailability,
                    i18n.language,
                    timeZone,
                ),
            })),
        );
    } else {
        descriptions.push({
            key: "unknown",
            text: t("product.history.events.unknownChange"),
        });
    }

    if (descriptions.length > 0) {
        for (const snapshot of getConversionSnapshots(
            getVisiblePriceValues(event, filter),
            displayCurrency,
        )) {
            descriptions.push({
                key: `fx-${snapshot.fxRateId}`,
                text: t("product.history.values.fxProvenance", {
                    currency: snapshot.currency,
                    capturedAt: formatDateTime(snapshot.capturedAt, i18n.language, timeZone),
                }),
            });
        }
    }

    const timeBlock = (
        <TimelineTime>
            <span>{formatDate(event.timestamp, i18n.language, timeZone)}</span>
            <span>{formatTime(event.timestamp, i18n.language, timeZone)}</span>
        </TimelineTime>
    );

    if (descriptions.length === 0) return null;

    return (
        <TimelineItem>
            <TimelineHeader>
                {timeBlock}
                <TimelineTitle>
                    {event.eventType === "PRODUCT_LISTING_DISCOVERED"
                        ? t("product.history.events.listingDiscoveredTitle")
                        : t("product.history.events.listingChangedTitle")}
                </TimelineTitle>
            </TimelineHeader>
            {descriptions.map((description) => (
                <TimelineDescription key={`${event.eventId}-${description.key}`}>
                    {description.text}
                </TimelineDescription>
            ))}
        </TimelineItem>
    );
}
