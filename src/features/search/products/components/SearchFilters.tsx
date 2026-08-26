import { CreationDateSpanFilter } from "@/features/search/products/components/filters/CreationDateSpanFilter.tsx";
import { ProductStateFilter } from "@/features/search/products/components/filters/ProductStateFilter.tsx";
import { PriceSpanFilter } from "@/features/search/products/components/filters/PriceSpanFilter.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Form } from "@/components/ui/form.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MerchantFilters } from "@/features/search/products/components/filters/MerchantFilters.tsx";
import { SellerFilters } from "@/features/search/products/components/filters/SellerFilters.tsx";
import { ShopTypeFilter } from "@/features/search/common/components/filters/ShopTypeFilter.tsx";
import { useNavigate } from "@tanstack/react-router";
import { useSearchQueryContext } from "@/features/search/common/hooks/useSearchQueryContext.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useCallback, useEffect, useMemo } from "react";
import { UpdateDateSpanFilter } from "@/features/search/products/components/filters/UpdateDateSpanFilter.tsx";
import { AuctionDateSpanFilter } from "@/features/search/products/components/filters/AuctionDateSpanFilter.tsx";
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
};

export function SearchFilters({ searchFilters }: SearchFilterProps) {
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

    // The `values` prop syncs URL→Form via an internal reset() call.
    // reset() fires watch with {name: undefined}, which our guard in the watch handler skips.
    // RHF's deepEqual compares Dates by getTime(), so identical dates don't trigger a reset.
    // `keepDirtyValues` preserves in-progress user edits in debounced fields (price, year).
    const form = useForm<FilterSchema>({
        resolver: zodResolver(filterSchema),
        values: mapSearchFiltersToFormValues(searchFilters),
        resetOptions: { keepDirtyValues: true },
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
                        productState: data.productState,
                        creationDate: data.creationDate,
                        updateDate: data.updateDate,
                        auctionDate: data.auctionDate,
                        merchant: data.merchant,
                        excludeMerchant: data.excludeMerchant,
                        seller: data.seller,
                        excludeSeller: data.excludeSeller,
                        shopType: data.shopType,
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
        form.reset(FILTER_DEFAULTS);
        navigate({
            to: "/$lng/search",
            search: {
                q: getEffectiveQuery(),
            },
        });
    }, [form, navigate, getEffectiveQuery]);

    return (
        <Form {...form}>
            <form className="space-y-4">
                <div className="flex min-w-0 w-full flex-col gap-4 overflow-visible">
                    <ProductStateFilter />
                    <PriceSpanFilter />
                    <ShopTypeFilter
                        onReset={() => form.setValue("shopType", FILTER_DEFAULTS.shopType)}
                    />
                    <MerchantFilters />
                    <SellerFilters />
                    <AuctionDateSpanFilter />
                    <CreationDateSpanFilter />
                    <UpdateDateSpanFilter />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-outline-variant text-primary uppercase text-sm shadow-none hover:bg-primary/8"
                    onClick={handleResetAll}
                >
                    {t("search.resetAllFilters")}
                </Button>
            </form>
        </Form>
    );
}
