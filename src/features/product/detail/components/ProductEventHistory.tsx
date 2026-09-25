import type {
    ListingHistoryMoney,
    ListingHistoryPrice,
    ProductListingHistoryChange,
    ProductListingHistoryEntry,
} from "@/data/internal/product/ProductListingHistory.ts";
import type { ListingAvailabilityData } from "@/client";
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
    formatHistoryPrice,
} from "@/features/product/detail/lib/events/priceHistory.ts";
import {
    getVisibleHistoryChanges,
    type HistoryFilter,
} from "@/features/product/detail/lib/events/eventFilters.ts";
import { useTranslation } from "react-i18next";
import { useRouteContext } from "@tanstack/react-router";

interface ProductEventHistoryProps {
    readonly event: ProductListingHistoryEntry;
    readonly filter?: HistoryFilter;
}

const AVAILABILITY_KEYS: Partial<Record<ListingAvailabilityData, string>> = {
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

type PriceLabel = ListingHistoryPrice | ListingHistoryMoney | null;

export function ProductEventHistory({ event, filter = "all" }: ProductEventHistoryProps) {
    const { t, i18n } = useTranslation();
    const { timeZone } = useRouteContext({ from: "__root__" });
    const labels = {
        onRequest: t("product.history.values.onRequest"),
        notProvided: t("product.history.values.notProvided"),
    };

    const formatPrice = (price: PriceLabel) => {
        if (price && "type" in price) return formatHistoryPrice(price, i18n.language, labels);
        return price ? formatHistoryMoney(price, i18n.language) : labels.notProvided;
    };

    const formatAvailability = (availability: ListingAvailabilityData | null) =>
        availability
            ? t(`product.listingAvailability.${AVAILABILITY_KEYS[availability] ?? "unknown"}`)
            : t("product.listingAvailability.unknown");

    const renderChange = (change: ProductListingHistoryChange): string => {
        switch (change.type) {
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
                    observedAt: formatDateTime(
                        change.observation.observedAt,
                        i18n.language,
                        timeZone,
                    ),
                });
            case "SALE_OBSERVATION_RETRACTED":
                return t("product.history.events.saleObservationRetracted", {
                    observedAt: formatDateTime(
                        change.observation.observedAt,
                        i18n.language,
                        timeZone,
                    ),
                });
            case "UNKNOWN":
                return t("product.history.events.unknownChange");
        }
    };

    const descriptions: { readonly key: string; readonly text: string }[] = [];
    if (event.payload.kind === "DISCOVERED") {
        const discovery = event.payload.discovery;
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
            descriptions.push({
                key: "initial-url",
                text: t("product.history.events.initialUrl"),
            });
        }
        if (showDetails && discovery.auction !== null) {
            descriptions.push({
                key: "discovery-auction",
                text: t("product.history.events.initialAuction"),
            });
        }
    } else if (event.payload.kind === "CHANGED") {
        descriptions.push(
            ...getVisibleHistoryChanges(event, filter).map((change) => ({
                key: `${change.type}-${JSON.stringify(change)}`,
                text: renderChange(change),
            })),
        );
    } else {
        descriptions.push({
            key: "unknown",
            text: t("product.history.events.unknownChange"),
        });
    }

    const timeBlock = (
        <TimelineTime>
            <span>{formatDate(event.timestamp, i18n.language, timeZone)}</span>
            <span className="text-muted-foreground">
                {formatTime(event.timestamp, i18n.language, timeZone)}
            </span>
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
