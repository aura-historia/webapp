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

interface ItemEventHistoryProps {
    readonly event: ItemEvent;
}

export function ItemEventHistory({ event }: ItemEventHistoryProps) {
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
                    Der Status wurde von {formatStateName(event.payload.oldState)} auf{" "}
                    {formatStateName(event.payload.newState)} geändert.
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
                    Preis entdeckt • {formatPrice(event.payload.newPrice)}.
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isPriceChangedEvent(event)) {
        const isDropped = event.eventType === "PRICE_DROPPED";
        const verb = isDropped ? "gefallen" : "gestiegen";

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
                    Der Preis ist von {formatPrice(event.payload.oldPrice)} auf{" "}
                    {formatPrice(event.payload.newPrice)} {verb}.
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
                    Preis entfernt • Letzter Preis: {formatPrice(event.payload.oldPrice)}.
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
                    Im System erfasst
                    {event.payload.price ? ` • ${formatPrice(event.payload.price)}` : ""}.
                </TimelineDescription>
            </TimelineItem>
        );
    }

    return null;
}
