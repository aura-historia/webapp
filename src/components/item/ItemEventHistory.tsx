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
import {
    formatDate,
    formatTime,
    formatPrice,
    getStateDescription,
    getPriceEventDescription,
} from "@/lib/utils.ts";
import { isCreatedEvent, isPriceEvent, isStateEvent } from "@/lib/eventFilters.ts";

interface ItemEventHistoryProps {
    readonly event: ItemEvent;
}

export function ItemEventHistory({ event }: ItemEventHistoryProps) {
    if (isStateEvent(event)) {
        return (
            <TimelineItem>
                <TimelineHeader>
                    <TimelineTime>
                        <span>{formatDate(event.timestamp)}</span>
                        <span className="text-muted-foreground">{formatTime(event.timestamp)}</span>
                    </TimelineTime>
                    <TimelineTitle>
                        <StatusBadge status={event.payload} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>{getStateDescription(event.payload)}</TimelineDescription>
            </TimelineItem>
        );
    }

    if (isPriceEvent(event)) {
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
                    {getPriceEventDescription(event.eventType)} • {formatPrice(event.payload)}
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
                    {event.payload.price ? ` • ${formatPrice(event.payload.price)}` : ""}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    return null;
}
