import type { ProductEvent } from "@/data/internal/product/ProductDetails.ts";
import { H2 } from "@/components/typography/H2.tsx";
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
    const sectionHeadingClass =
        "font-display text-2xl font-normal uppercase tracking-[-0.02em] text-primary";

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
                <button
                    type="button"
                    key={option.value}
                    onClick={() => setActiveFilter(option.value)}
                    className={`border-b pb-1 text-xs tracking-widest uppercase transition-colors duration-300 ease-out ${
                        activeFilter === option.value
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-primary"
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );

    /**
     * Early return: Shows empty state when product has no events.
     */
    if (!history || history.length === 0) {
        return (
            <section className="flex min-w-0 flex-col gap-4">
                <H2 className={sectionHeadingClass}>{t("product.history.title")}</H2>
                <p className="text-sm text-muted-foreground">{t("product.history.noData")}</p>
            </section>
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
            <section className="flex min-w-0 flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <H2 className={sectionHeadingClass}>{t("product.history.title")}</H2>
                    {filterButtons}
                </div>
                <p className="text-sm text-muted-foreground">{t("product.history.noEvents")}</p>
            </section>
        );
    }

    return (
        <section className="flex h-full max-h-375 min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-4 w-full shrink-0">
                <H2 className={sectionHeadingClass}>{t("product.history.title")}</H2>
                {filterButtons}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto w-full px-1 pt-2">
                <Timeline>
                    {filteredEvents
                        .slice()
                        .reverse()
                        .map((event) => (
                            <ProductEventHistory key={event.eventId} event={event} />
                        ))}
                </Timeline>
            </div>
        </section>
    );
}
