import type { ItemEvent } from "@/data/internal/ItemDetails.ts";
import {
    TimelineItem,
    TimelineTitle,
    TimelineDescription,
    TimelineTime,
    TimelineHeader,
} from "@/components/ui/timeline.tsx";
import { StatusBadge } from "@/components/item/StatusBadge.tsx";
import { PriceBadge } from "@/components/item/PriceBadge.tsx";
import { formatDate, formatTime, formatPrice, formatStateName } from "@/lib/utils.ts";
import {
    isCreatedEvent,
    isPriceChangedEvent,
    isPriceDiscoveredEvent,
    isPriceRemovedEvent,
    isStateChangedEvent,
} from "@/lib/eventFilters.ts";
import { useTranslation } from "react-i18next";

interface ItemEventHistoryProps {
    readonly event: ItemEvent;
}

export function ItemEventHistory({ event }: ItemEventHistoryProps) {
    const { t } = useTranslation();

    if (isStateChangedEvent(event)) {
        return (
            <TimelineItem>
                <TimelineHeader>
                    <TimelineTime>
                        <span>{formatDate(event.timestamp)}</span>
                        <span className="text-muted-foreground">{formatTime(event.timestamp)}</span>
                    </TimelineTime>
                    <TimelineTitle>
                        <StatusBadge status={event.payload.newState} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("item.history.events.statusChanged", {
                        oldState: formatStateName(event.payload.oldState),
                        newState: formatStateName(event.payload.newState),
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
                        <span>{formatDate(event.timestamp)}</span>
                        <span className="text-muted-foreground">{formatTime(event.timestamp)}</span>
                    </TimelineTime>
                    <TimelineTitle>
                        <PriceBadge eventType={event.eventType} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("item.history.events.priceDiscovered", {
                        price: formatPrice(event.payload.newPrice),
                    })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isPriceChangedEvent(event)) {
        const isDropped = event.eventType === "PRICE_DROPPED";
        const verb = isDropped
            ? t("item.history.events.priceFallen")
            : t("item.history.events.priceIncreased");

        return (
            <TimelineItem>
                <TimelineHeader>
                    <TimelineTime>
                        <span>{formatDate(event.timestamp)}</span>
                        <span className="text-muted-foreground">{formatTime(event.timestamp)}</span>
                    </TimelineTime>
                    <TimelineTitle>
                        <PriceBadge eventType={event.eventType} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("item.history.events.priceChanged", {
                        oldPrice: formatPrice(event.payload.oldPrice),
                        newPrice: formatPrice(event.payload.newPrice),
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
                        <span>{formatDate(event.timestamp)}</span>
                        <span className="text-muted-foreground">{formatTime(event.timestamp)}</span>
                    </TimelineTime>
                    <TimelineTitle>
                        <PriceBadge eventType={event.eventType} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("item.history.events.priceRemoved", {
                        price: formatPrice(event.payload.oldPrice),
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
                        <span>{formatDate(event.timestamp)}</span>
                        <span className="text-muted-foreground">{formatTime(event.timestamp)}</span>
                    </TimelineTime>
                    <TimelineTitle>
                        <StatusBadge status={event.payload.state} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("item.history.events.created")}
                    {event.payload.price ? ` • ${formatPrice(event.payload.price)}` : ""}.
                </TimelineDescription>
            </TimelineItem>
        );
    }

    return null;
}
