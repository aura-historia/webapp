import type { ProductEvent } from "@/data/internal/ProductDetails.ts";
import { H2 } from "@/components/typography/H2.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Timeline } from "@/components/ui/timeline.tsx";
import { useMemo, useState } from "react";
import { isPriceEvent, isStateEvent } from "@/lib/eventFilters.ts";
import { ProductEventHistory } from "@/components/product/detail/ProductEventHistory.tsx";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

type FilterType = "all" | "price" | "state";

interface ProductHistoryProps {
    readonly history?: readonly ProductEvent[];
}

const createFilterOptions = (t: TFunction) => {
    return [
        { label: t("product.history.filters.all"), value: "all" as const },
        { label: t("product.history.filters.price"), value: "price" as const },
        { label: t("product.history.filters.availability"), value: "state" as const },
    ] as const;
};

export function ProductHistory({ history }: ProductHistoryProps) {
    const { t } = useTranslation();

    /**
     * Filter options for the event history timeline.
     * Allows users to filter events by type: all events, price changes only, or state changes only.
     */
    const FILTER_OPTIONS = useMemo(() => createFilterOptions(t), [t]);

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
     * Early return: Shows empty state when product has no events.
     */
    if (!history || history.length === 0) {
        return (
            <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0">
                <H2>{t("product.history.title")}</H2>
                <p className="text-sm text-muted-foreground">{t("product.history.noData")}</p>
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
                    <H2>{t("product.history.title")}</H2>
                    {filterButtons}
                </div>
                <p className="text-sm text-muted-foreground">{t("product.history.noEvents")}</p>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0 h-full max-h-[500px] md:max-h-none items-start">
            <div className="flex flex-col gap-4 w-full flex-shrink-0">
                <H2>{t("product.history.title")}</H2>
                {filterButtons}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto w-full px-1 mask-linear-[to_bottom,transparent,black_5%,black_95%,transparent] pt-4">
                <Timeline>
                    {filteredEvents
                        .slice()
                        .reverse()
                        .map((event) => (
                            <ProductEventHistory key={event.eventId} event={event} />
                        ))}
                </Timeline>
            </div>
        </Card>
    );
}
