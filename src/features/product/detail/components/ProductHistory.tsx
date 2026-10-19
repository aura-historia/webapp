import type { Currency } from "@/data/internal/common/Currency.ts";
import type { ProductListingHistoryEntry } from "@/data/internal/product/ProductListingHistory.ts";
import { Timeline } from "@/components/ui/timeline.tsx";
import { useMemo, useState } from "react";
import {
    matchesHistoryFilter,
    type HistoryFilter,
} from "@/features/product/detail/lib/events/eventFilters.ts";
import { ProductEventHistory } from "@/features/product/detail/components/ProductEventHistory.tsx";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ProductSectionHeading } from "@/features/product/detail/components/ProductSectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

interface ProductHistoryProps {
    readonly history?: readonly ProductListingHistoryEntry[];
    readonly displayCurrency?: Currency;
}

const createFilterOptions = (t: TFunction) => {
    return [
        { label: t("product.history.filters.all"), value: "all" as const },
        { label: t("product.history.filters.price"), value: "price" as const },
        { label: t("product.history.filters.availability"), value: "availability" as const },
        { label: t("product.history.filters.details"), value: "details" as const },
    ] as const;
};

const HEADING_ID = "product-history-title";

export function ProductHistory({ history, displayCurrency }: ProductHistoryProps) {
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
    const [activeFilter, setActiveFilter] = useState<HistoryFilter>("all");

    const heading = (
        <div className="mb-3 sm:mb-4">
            <ProductSectionHeading id={HEADING_ID} title={t("product.history.title")} />
        </div>
    );

    /**
     * Underlined tabs for each filter option.
     */
    const filterTabs = (
        <div
            role="group"
            aria-label={t("product.history.filterLabel")}
            className="flex gap-5 shadow-[inset_0_-1px_0_var(--color-line-subtle)]"
        >
            {FILTER_OPTIONS.map((option) => {
                const selected = activeFilter === option.value;
                return (
                    <button
                        type="button"
                        aria-pressed={selected}
                        key={option.value}
                        onClick={() => setActiveFilter(option.value)}
                        className={cn(
                            "relative min-h-11 cursor-pointer text-body-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass",
                            selected ? "font-semibold text-ink" : "text-ink-muted hover:text-ink",
                        )}
                    >
                        {option.label}
                        <span
                            aria-hidden="true"
                            className={cn(
                                "absolute inset-x-0 bottom-0 h-0.5 rounded-xs",
                                selected ? "bg-oxblood" : "bg-transparent",
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );

    const emptyState = (text: string) => (
        <div className="flex h-49 flex-col items-center justify-center gap-3 border-b border-line-subtle text-center">
            <span
                aria-hidden="true"
                className="size-[11px] rounded-pill shadow-[inset_0_0_0_1.5px_var(--color-ink-muted)]"
            />
            <p className="text-body-sm text-ink-secondary">{text}</p>
        </div>
    );

    /**
     * Early return: Shows empty state when product has no events.
     */
    if (!history || history.length === 0) {
        return (
            <section aria-labelledby={HEADING_ID} className="flex min-w-0 flex-col">
                {heading}
                {emptyState(t("product.history.noData"))}
            </section>
        );
    }

    /**
     * Filter events based on selected filter type.
     */
    const filteredEvents = history.filter((event) => matchesHistoryFilter(event, activeFilter));

    return (
        <section aria-labelledby={HEADING_ID} className="flex min-w-0 flex-col">
            {heading}
            {filterTabs}
            {filteredEvents.length === 0 ? (
                emptyState(t("product.history.noEvents"))
            ) : (
                <Timeline className="max-h-[500px] overflow-y-auto [scrollbar-width:thin]">
                    {filteredEvents
                        .slice()
                        .reverse()
                        .map((event) => (
                            <ProductEventHistory
                                key={event.eventId}
                                event={event}
                                filter={activeFilter}
                                displayCurrency={displayCurrency}
                            />
                        ))}
                </Timeline>
            )}
        </section>
    );
}
