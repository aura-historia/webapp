import type { ItemEvent } from "@/data/internal/ItemDetails.ts";
import type { ItemStateData, PriceData } from "@/client";
import { H2 } from "@/components/typography/H2.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { StatusBadge } from "@/components/item/StatusBadge.tsx";
import { PriceBadge } from "@/components/item/PriceBadge.tsx";
import {
    Timeline,
    TimelineItem,
    TimelineTitle,
    TimelineDescription,
    TimelineTime,
    TimelineHeader,
} from "@/components/ui/timeline.tsx";
import {
    formatDate,
    formatTime,
    formatPrice,
    getStateDescription,
    getPriceEventDescription,
} from "@/lib/utils.ts";
import { useState } from "react";
import type { PriceEventTypeData, StateEventTypeData } from "@/types/events.ts";

type FilterType = "all" | "price" | "state";

/**
 * Filter options for the event history timeline.
 * Allows users to filter events by type: all events, price changes only, or state changes only.
 */
const FILTER_OPTIONS = [
    { label: "Alle", value: "all" },
    { label: "Preis", value: "price" },
    { label: "Verfügbarkeit", value: "state" },
] as const;

/**
 * Filter only state events (where payload is a string like "AVAILABLE")
 * This excludes price events which have payload with {amount, currency}
 */
function isStateEvent(event: ItemEvent): event is ItemEvent & {
    payload: ItemStateData;
    eventType: StateEventTypeData;
} {
    return event.payload !== null && typeof event.payload === "string";
}

/**
 * Filter only price events (where payload is a object like { amount: 4999, currency: "EUR" }
 * This excludes state events which have payload with string like "AVAILABLE"
 */
function isPriceEvent(event: ItemEvent): event is ItemEvent & {
    payload: PriceData;
    eventType: PriceEventTypeData;
} {
    return (
        event.payload !== null &&
        typeof event.payload === "object" &&
        "amount" in event.payload &&
        "currency" in event.payload
    );
}

export function ItemHistory({ history }: { readonly history?: readonly ItemEvent[] }) {
    /**
     * Currently active filter state.
     * Controls which event types are displayed in the timeline.
     */
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");

    /**
     * Renders buttons for each filter option with active state highlighting.
     */
    const filterButtons = (
        <div className="flex gap-2 flex-wrap">
            {FILTER_OPTIONS.map((option) => (
                <Button
                    key={option.value}
                    onClick={() => setActiveFilter(option.value)}
                    variant={activeFilter === option.value ? "default" : "outline"}
                    size="sm"
                >
                    {option.label}
                </Button>
            ))}
        </div>
    );

    /**
     * Early return: Shows empty state when item has no events.
     */
    if (!history || history.length === 0) {
        return (
            <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0">
                <H2>Historie</H2>
                <p className="text-sm text-muted-foreground">
                    Keine Daten für diesen Artikel vorhanden.
                </p>
            </Card>
        );
    }

    /**
     * Filter events based on selected filter type.
     */
    const filteredEvents = history.filter((event) => {
        switch (activeFilter) {
            case "all":
                return true;
            case "state":
                return isStateEvent(event);
            case "price":
                return isPriceEvent(event);
            default:
                return false;
        }
    });

    /**
     * Early return: Shows when there are no events for the specified filter.
     */
    if (filteredEvents.length === 0) {
        return (
            <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <H2>Historie</H2>
                    {filterButtons}
                </div>
                <p className="text-sm text-muted-foreground">
                    Keine Events für diesen Filter verfügbar.
                </p>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0 h-full items-start">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full flex-shrink-0">
                <H2>Historie</H2>
                {filterButtons}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto w-full px-1">
                <Timeline>
                    {filteredEvents
                        .slice()
                        .reverse()
                        .map((event) => {
                            if (isStateEvent(event)) {
                                return (
                                    <TimelineItem key={event.eventId}>
                                        <TimelineHeader>
                                            <TimelineTime>
                                                <span>{formatDate(event.timestamp)}</span>
                                                <span className="text-muted-foreground">
                                                    {formatTime(event.timestamp)}
                                                </span>
                                            </TimelineTime>
                                            <TimelineTitle>
                                                <StatusBadge status={event.payload} />
                                            </TimelineTitle>
                                        </TimelineHeader>
                                        <TimelineDescription>
                                            {getStateDescription(event.payload)}
                                        </TimelineDescription>
                                    </TimelineItem>
                                );
                            }

                            if (isPriceEvent(event)) {
                                return (
                                    <TimelineItem key={event.eventId}>
                                        <TimelineHeader>
                                            <TimelineTime>
                                                <span>{formatDate(event.timestamp)}</span>
                                                <span className="text-muted-foreground">
                                                    {formatTime(event.timestamp)}
                                                </span>
                                            </TimelineTime>
                                            <TimelineTitle>
                                                <PriceBadge eventType={event.eventType} />
                                            </TimelineTitle>
                                        </TimelineHeader>
                                        <TimelineDescription>
                                            {getPriceEventDescription(event.eventType)} •{" "}
                                            {formatPrice(event.payload)}{" "}
                                            {/*TODO:
                                            I asked Julian to include the old price in the payload so that I can display
                                            something like “Price has increased from X€ to Y€.” */}
                                        </TimelineDescription>
                                    </TimelineItem>
                                );
                            }

                            return null;
                        })}
                </Timeline>
            </div>
        </Card>
    );
}
