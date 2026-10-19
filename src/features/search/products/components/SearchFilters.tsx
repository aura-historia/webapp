import { ProductStateFilter } from "@/features/search/products/components/filters/ProductStateFilter.tsx";
import { MerchantFilters } from "@/features/search/products/components/filters/MerchantFilters.tsx";
import { PriceSpanFilter } from "@/features/search/products/components/filters/PriceSpanFilter.tsx";
import { Form } from "@/components/ui/form.tsx";
import { FILTER_FOCUS_CLASS } from "@/features/search/common/components/filters/FilterCard.tsx";
import { cn } from "@/lib/utils.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { useSearchQueryContext } from "@/features/search/common/hooks/useSearchQueryContext.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useCallback, useEffect, useMemo } from "react";
import {
    AuctionDateSpanFilter,
    CreationDateSpanFilter,
    UpdateDateSpanFilter,
} from "@/features/search/products/components/filters/DateSpanFilter.tsx";
import { useTranslation } from "react-i18next";
import { mapFiltersToUrlParams } from "@/features/search/products/lib/searchUrlParams.ts";
import {
    FILTER_DEFAULTS,
    MIN_SEARCH_QUERY_LENGTH,
} from "@/features/search/products/lib/filterDefaults.ts";
import { toast } from "sonner";
import { serializeSearchParams } from "@/features/search/products/lib/searchValidation.ts";
import { useDebouncedCallback } from "use-debounce";
import {
    createFilterSchema,
    DEBOUNCE_DELAY_MS,
    DEBOUNCED_FIELDS,
    type FilterSchema,
    mapSearchFiltersToFormValues,
} from "@/features/search/common/lib/filterForm.ts";

type SearchFilterProps = {
    readonly searchFilters: SearchFilterArguments;
    /**
     * `sidebar`: the desktop column, with its heading and a reset link.
     * `sheet`: the phone drawer body, with a sticky footer to reset or close.
     */
    readonly variant?: "sidebar" | "sheet";
    /** Total of the current results, for the drawer's "Show 1,284 results" button. */
    readonly totalResults?: number;
    /** Closes the drawer from its footer. */
    readonly onShowResults?: () => void;
};

/** The product filter form. Every change applies at once by updating the URL. */
export function SearchFilters({
    searchFilters,
    variant = "sidebar",
    totalResults,
    onShowResults,
}: SearchFilterProps) {
    const navigate = useNavigate({ from: "/$lng/search" });
    const { t } = useTranslation();
    const { getQuery } = useSearchQueryContext();

    const getEffectiveQuery = useCallback((): string => {
        const currentQuery = getQuery()?.trim();

        if (currentQuery && currentQuery.length < MIN_SEARCH_QUERY_LENGTH) {
            toast.warning(t("search.validation.queryMinLength"), { duration: 2000 });
            return searchFilters.q;
        }

        return currentQuery;
    }, [getQuery, searchFilters.q, t]);

    const filterSchema = useMemo(() => createFilterSchema(t), [t]);

    // Sync the URL as one reset. Retaining field refs or dirty values would emit
    // individual watch events during reset and navigate with partially updated filters.
    const form = useForm<FilterSchema>({
        resolver: zodResolver(filterSchema),
        values: mapSearchFiltersToFormValues(searchFilters),
        resetOptions: { keepFieldsRef: false },
        mode: "onChange",
    });

    const applyFilters = useCallback(
        (data: FilterSchema) => {
            navigate({
                to: "/$lng/search",
                search: (prev) => ({
                    ...serializeSearchParams(prev),
                    ...mapFiltersToUrlParams({
                        query: getEffectiveQuery(),
                        priceSpan: data.priceSpan,
                        availability: data.availability,
                        listingSourceId: data.listingSourceId,
                        excludeListingSourceId: data.excludeListingSourceId,
                        listingSourceLabels: data.listingSourceLabels,
                        excludeListingSourceLabels: data.excludeListingSourceLabels,
                        creationDate: data.creationDate,
                        updateDate: data.updateDate,
                        auctionDate: data.auctionDate,
                    }),
                }),
            });
        },
        [navigate, getEffectiveQuery],
    );

    const debouncedApplyFilters = useDebouncedCallback((data) => {
        const result = filterSchema.safeParse(data);
        if (result.success) {
            applyFilters(result.data);
        }
    }, DEBOUNCE_DELAY_MS);

    useEffect(() => {
        const subscription = form.watch((data, { name }) => {
            if (!name) return;

            if (DEBOUNCED_FIELDS.has(name)) {
                debouncedApplyFilters(data);
            } else {
                debouncedApplyFilters.cancel();
                const result = filterSchema.safeParse(data);
                if (result.success) applyFilters(result.data);
            }
        });
        return () => {
            subscription.unsubscribe();
            debouncedApplyFilters.cancel();
        };
    }, [form, debouncedApplyFilters, filterSchema, applyFilters]);

    const handleResetAll = useCallback(() => {
        debouncedApplyFilters.cancel();
        form.reset(FILTER_DEFAULTS);
        navigate({
            to: "/$lng/search",
            search: {
                q: getEffectiveQuery(),
            },
        });
    }, [form, navigate, getEffectiveQuery, debouncedApplyFilters]);

    const groups = (
        <div className="flex min-w-0 flex-col border-b border-line">
            <ProductStateFilter />
            <MerchantFilters />
            <PriceSpanFilter />
            <AuctionDateSpanFilter />
            <CreationDateSpanFilter />
            <UpdateDateSpanFilter />
        </div>
    );

    if (variant === "sheet") {
        return (
            <Form {...form}>
                <form className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">{groups}</div>
                    <div className="flex shrink-0 gap-2.5 bg-surface px-5 pt-3 pb-6 shadow-[inset_0_1px_0_var(--line-subtle)]">
                        <button
                            type="button"
                            onClick={handleResetAll}
                            className={cn(
                                "min-h-12 shrink-0 cursor-pointer rounded-pill px-[18px] py-2 text-button leading-tight text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
                                FILTER_FOCUS_CLASS,
                            )}
                        >
                            {t("search.resetAll")}
                        </button>
                        <button
                            type="button"
                            onClick={onShowResults}
                            className={cn(
                                "min-h-12 min-w-0 flex-1 cursor-pointer rounded-pill bg-ink px-[18px] py-2 text-button leading-tight text-surface",
                                FILTER_FOCUS_CLASS,
                            )}
                        >
                            {totalResults
                                ? t("search.showResults", { count: totalResults })
                                : t("search.showResultsFallback")}
                        </button>
                    </div>
                </form>
            </Form>
        );
    }

    return (
        <Form {...form}>
            <form>
                <div className="flex items-baseline justify-between gap-3 pb-4">
                    <h2 className="font-serif text-title-md text-ink">{t("search.filters")}</h2>
                    <button
                        type="button"
                        onClick={handleResetAll}
                        className={cn(
                            "min-h-8 cursor-pointer text-meta font-medium text-ink underline decoration-line-strong underline-offset-3 hover:text-brass-ink",
                            FILTER_FOCUS_CLASS,
                        )}
                    >
                        {t("search.resetAllFilters")}
                    </button>
                </div>
                {groups}
            </form>
        </Form>
    );
}
