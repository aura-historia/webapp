import type { ItemEvent } from "@/data/internal/ItemDetails.ts";
import type { ItemStateData } from "@/client";
import { H2 } from "@/components/typography/H2.tsx";
import { Card } from "@/components/ui/card.tsx";
import { StatusBadge } from "@/components/item/StatusBadge.tsx";
import {
    Timeline,
    TimelineItem,
    TimelineTitle,
    TimelineDescription,
    TimelineTime,
    TimelineHeader,
} from "@/components/ui/timeline.tsx";
import { formatDate, formatTime, getStateDescription } from "@/lib/utils.ts";

export function ItemHistory({ history }: { readonly history?: readonly ItemEvent[] }) {
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
     * Filter only state events (where payload is a string like "AVAILABLE")
     * This excludes price events which have payload with {amount, currency}
     */
    const stateEvents = history.filter(
        (event): event is ItemEvent & { payload: ItemStateData } =>
            event.payload !== null && typeof event.payload === "string",
    );

    if (stateEvents.length === 0) {
        return (
            <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0">
                <H2>Historie</H2>
                <p className="text-sm text-muted-foreground">Keine Historie verfügbar.</p>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0 h-full items-start">
            <H2 className="flex-shrink-0">Historie</H2>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <Timeline>
                    {stateEvents
                        .slice()
                        .reverse()
                        .map((event) => {
                            const state: ItemStateData = event.payload;
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
                                            <StatusBadge status={state} />
                                        </TimelineTitle>
                                    </TimelineHeader>
                                    <TimelineDescription>
                                        {getStateDescription(state)}
                                    </TimelineDescription>
                                </TimelineItem>
                            );
                        })}
                </Timeline>
            </div>
        </Card>
    );
}
