import type { ItemEvent } from "@/data/internal/ItemDetails.ts";
import { H2 } from "@/components/typography/H2.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Timeline } from "@/components/ui/timeline.tsx";
import { useState } from "react";
import { isPriceEvent, isStateEvent } from "@/lib/eventFilters.ts";
import { ItemEventHistory } from "@/components/item/ItemEventHistory.tsx";

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

interface ItemHistoryProps {
    readonly history?: readonly ItemEvent[];
}

export function ItemHistory({ history }: ItemHistoryProps) {
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
        <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0 h-full max-h-[500px] md:max-h-none items-start">
            <div className="flex flex-col gap-4 w-full flex-shrink-0">
                <H2>Historie</H2>
                {filterButtons}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto w-full px-1">
                <Timeline>
                    {filteredEvents
                        .slice()
                        .reverse()
                        .map((event) => (
                            <ItemEventHistory key={event.eventId} event={event} />
                        ))}
                </Timeline>
            </div>
        </Card>
    );
}
