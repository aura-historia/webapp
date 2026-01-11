import type { ProductEvent } from "@/data/internal/ProductDetails.ts";
import {
    TimelineItem,
    TimelineTitle,
    TimelineDescription,
    TimelineTime,
    TimelineHeader,
} from "@/components/ui/timeline.tsx";
import { StatusBadge } from "@/components/product/StatusBadge.tsx";
import { PriceBadge } from "@/components/product/PriceBadge.tsx";
import { formatDate, formatTime, formatPrice, formatStateName } from "@/lib/utils.ts";
import {
    isCreatedEvent,
    isPriceChangedEvent,
    isPriceDiscoveredEvent,
    isPriceRemovedEvent,
    isStateChangedEvent,
} from "@/lib/eventFilters.ts";
import { useTranslation } from "react-i18next";

interface ProductEventHistoryProps {
    readonly event: ProductEvent;
}

export function ProductEventHistory({ event }: ProductEventHistoryProps) {
    const { t, i18n } = useTranslation();

    if (isStateChangedEvent(event)) {
        return (
            <TimelineItem>
                <TimelineHeader>
                    <TimelineTime>
                        <span>{formatDate(event.timestamp, i18n.language)}</span>
                        <span className="text-muted-foreground">
                            {formatTime(event.timestamp, i18n.language)}
                        </span>
                    </TimelineTime>
                    <TimelineTitle>
                        <StatusBadge status={event.payload.newState} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.statusChanged", {
                        oldState: formatStateName(event.payload.oldState, t),
                        newState: formatStateName(event.payload.newState, t),
                    })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isPriceDiscoveredEvent(event)) {
        return (
            <TimelineItem>
                <TimelineHeader>
                    <TimelineTime>
                        <span>{formatDate(event.timestamp, i18n.language)}</span>
                        <span className="text-muted-foreground">
                            {formatTime(event.timestamp, i18n.language)}
                        </span>
                    </TimelineTime>
                    <TimelineTitle>
                        <PriceBadge eventType={event.eventType} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.priceDiscovered", {
                        price: formatPrice(event.payload.newPrice, i18n.language),
                    })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isPriceChangedEvent(event)) {
        const isDropped = event.eventType === "PRICE_DROPPED";
        const verb = isDropped
            ? t("product.history.events.priceFallen")
            : t("product.history.events.priceIncreased");

        return (
            <TimelineItem>
                <TimelineHeader>
                    <TimelineTime>
                        <span>{formatDate(event.timestamp, i18n.language)}</span>
                        <span className="text-muted-foreground">
                            {formatTime(event.timestamp, i18n.language)}
                        </span>
                    </TimelineTime>
                    <TimelineTitle>
                        <PriceBadge eventType={event.eventType} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.priceChanged", {
                        oldPrice: formatPrice(event.payload.oldPrice, i18n.language),
                        newPrice: formatPrice(event.payload.newPrice, i18n.language),
                        verb,
                    })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isPriceRemovedEvent(event)) {
        return (
            <TimelineItem>
                <TimelineHeader>
                    <TimelineTime>
                        <span>{formatDate(event.timestamp, i18n.language)}</span>
                        <span className="text-muted-foreground">
                            {formatTime(event.timestamp, i18n.language)}
                        </span>
                    </TimelineTime>
                    <TimelineTitle>
                        <PriceBadge eventType={event.eventType} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.priceRemoved", {
                        price: formatPrice(event.payload.oldPrice, i18n.language),
                    })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isCreatedEvent(event)) {
        return (
            <TimelineItem>
                <TimelineHeader>
                    <TimelineTime>
                        <span>{formatDate(event.timestamp, i18n.language)}</span>
                        <span className="text-muted-foreground">
                            {formatTime(event.timestamp, i18n.language)}
                        </span>
                    </TimelineTime>
                    <TimelineTitle>
                        <StatusBadge status={event.payload.state} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.created")}
                    {event.payload.price
                        ? ` • ${formatPrice(event.payload.price, i18n.language)}`
                        : ""}
                    .
                </TimelineDescription>
            </TimelineItem>
        );
    }

    return null;
}
