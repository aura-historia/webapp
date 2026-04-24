import { CreationDateSpanFilter } from "@/components/search/filters/CreationDateSpanFilter.tsx";
import { ProductStateFilter } from "@/components/search/filters/ProductStateFilter.tsx";
import { PriceSpanFilter } from "@/components/search/filters/PriceSpanFilter.tsx";
import { QualityIndicatorsFilter } from "@/components/search/filters/QualityIndicatorsFilter.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Form } from "@/components/ui/form.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MerchantFilters } from "@/components/search/filters/MerchantFilters.tsx";
import { ShopTypeFilter } from "@/components/search/filters/ShopTypeFilter.tsx";
import { PeriodFilter } from "@/components/search/filters/PeriodFilter.tsx";
import { CategoryFilter } from "@/components/search/filters/CategoryFilter.tsx";
import { useNavigate } from "@tanstack/react-router";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useCallback, useEffect, useMemo } from "react";
import { UpdateDateSpanFilter } from "@/components/search/filters/UpdateDateSpanFilter.tsx";
import { AuctionDateSpanFilter } from "@/components/search/filters/AuctionDateSpanFilter.tsx";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { SaveSearchFilterDialog } from "@/components/search/SaveSearchFilterDialog.tsx";
import { BookmarkPlus } from "lucide-react";
import { mapFiltersToUrlParams } from "@/lib/utils.ts";
import { FILTER_DEFAULTS, MIN_SEARCH_QUERY_LENGTH } from "@/lib/filterDefaults.ts";
import { useSearchQueryContext } from "@/hooks/search/useSearchQueryContext.tsx";
import { toast } from "sonner";
import { RESTORATIONS } from "@/data/internal/quality-indicators/Restoration.ts";
import { PROVENANCES } from "@/data/internal/quality-indicators/Provenance.ts";
import { CONDITIONS } from "@/data/internal/quality-indicators/Condition.ts";
import { AUTHENTICITIES } from "@/data/internal/quality-indicators/Authenticity.ts";
import { PRODUCT_STATES } from "@/data/internal/product/ProductState.ts";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";
import { serializeSearchParams } from "@/lib/searchValidation.ts";
import { useDebouncedCallback } from "use-debounce";

export const createFilterSchema = (t: TFunction) =>
    z
        .object({
            priceSpan: z
                .object({
                    min: z.number().min(0).optional().or(z.undefined()),
                    max: z.number().min(0).optional().or(z.undefined()),
                })
                .optional(),
            productState: z.array(z.enum(PRODUCT_STATES)),
            creationDate: z.object({
                from: z.date().optional(),
                to: z.date().optional(),
            }),
            updateDate: z.object({
                from: z.date().optional(),
                to: z.date().optional(),
            }),
            auctionDate: z.object({
                from: z.date().optional(),
                to: z.date().optional(),
            }),
            merchant: z.array(z.string()).optional().or(z.array(z.string()).max(0)),
            excludeMerchant: z.array(z.string()).optional().or(z.array(z.string()).max(0)),
            shopType: z.array(z.enum(SHOP_TYPES)),
            periodId: z.array(z.string()),
            categoryId: z.array(z.string()),
            originYearSpan: z
                .object({
                    min: z.number().optional().or(z.undefined()),
                    max: z.number().optional().or(z.undefined()),
                })
                .optional(),
            authenticity: z.array(z.enum(AUTHENTICITIES)),
            condition: z.array(z.enum(CONDITIONS)),
            provenance: z.array(z.enum(PROVENANCES)),
            restoration: z.array(z.enum(RESTORATIONS)),
        })
        .superRefine((data, ctx) => {
            if (
                data.creationDate.from &&
                data.creationDate.to &&
                data.creationDate.from > data.creationDate.to
            ) {
                ctx.addIssue({
                    code: "custom",
                    message: t("search.validation.dateOrder"),
                    path: ["creationDate", "to"],
                });
            }
            if (
                data.updateDate.from &&
                data.updateDate.to &&
                data.updateDate.from > data.updateDate.to
            ) {
                ctx.addIssue({
                    code: "custom",
                    message: t("search.validation.dateOrder"),
                    path: ["updateDate", "to"],
                });
            }
            if (
                data.auctionDate.from &&
                data.auctionDate.to &&
                data.auctionDate.from > data.auctionDate.to
            ) {
                ctx.addIssue({
                    code: "custom",
                    message: t("search.validation.dateOrder"),
                    path: ["auctionDate", "to"],
                });
            }
            if (
                data.originYearSpan?.min &&
                data.originYearSpan?.max &&
                data.originYearSpan.min > data.originYearSpan.max
            ) {
                ctx.addIssue({
                    code: "custom",
                    message: t("search.validation.dateOrder"),
                    path: ["originYearSpan", "max"],
                });
            }
        });

export type FilterSchema = z.infer<ReturnType<typeof createFilterSchema>>;

type SearchFilterProps = {
    readonly searchFilters: SearchFilterArguments;
};

/**
 * Maps URL search params (SearchFilterArguments) to the form's value shape (FilterSchema).
 * Used by the RHF `values` prop for declarative URL→Form synchronization.
 */
export function mapSearchFiltersToFormValues(filters: SearchFilterArguments): FilterSchema {
    return {
        priceSpan: {
            min: filters.priceFrom,
            max: filters.priceTo,
        },
        productState: filters.allowedStates ?? FILTER_DEFAULTS.productState,
        creationDate: {
            from: filters.creationDateFrom,
            to: filters.creationDateTo,
        },
        updateDate: {
            from: filters.updateDateFrom,
            to: filters.updateDateTo,
        },
        auctionDate: {
            from: filters.auctionDateFrom,
            to: filters.auctionDateTo,
        },
        merchant: filters.merchant,
        excludeMerchant: filters.excludeMerchant,
        shopType: filters.shopType ?? FILTER_DEFAULTS.shopType,
        periodId: filters.periodId ?? [],
        categoryId: filters.categoryId ?? [],
        originYearSpan: {
            min: filters.originYearMin,
            max: filters.originYearMax,
        },
        authenticity: filters.authenticity ?? FILTER_DEFAULTS.authenticity,
        condition: filters.condition ?? FILTER_DEFAULTS.condition,
        provenance: filters.provenance ?? FILTER_DEFAULTS.provenance,
        restoration: filters.restoration ?? FILTER_DEFAULTS.restoration,
    };
}

/** Converts form values (FilterSchema) to SearchFilterArguments. Used by SearchFilterFormProvider and SearchFilters. */
export function mapFormValuesToSearchFilterArguments(
    data: FilterSchema,
    q: string,
): SearchFilterArguments {
    return {
        q,
        priceFrom: data.priceSpan?.min,
        priceTo: data.priceSpan?.max,
        allowedStates: data.productState,
        creationDateFrom: data.creationDate.from,
        creationDateTo: data.creationDate.to,
        updateDateFrom: data.updateDate.from,
        updateDateTo: data.updateDate.to,
        auctionDateFrom: data.auctionDate.from,
        auctionDateTo: data.auctionDate.to,
        merchant: data.merchant?.length ? data.merchant : undefined,
        excludeMerchant: data.excludeMerchant?.length ? data.excludeMerchant : undefined,
        shopType: data.shopType,
        periodId: data.periodId?.length ? data.periodId : undefined,
        categoryId: data.categoryId?.length ? data.categoryId : undefined,
        originYearMin: data.originYearSpan?.min,
        originYearMax: data.originYearSpan?.max,
        authenticity: data.authenticity,
        condition: data.condition,
        provenance: data.provenance,
        restoration: data.restoration,
    };
}

export const DEBOUNCE_DELAY_MS = 500;

export const DEBOUNCED_FIELDS = new Set([
    "priceSpan.min",
    "priceSpan.max",
    "originYearSpan.min",
    "originYearSpan.max",
]);

export function SearchFilters({ searchFilters }: SearchFilterProps) {
    const navigate = useNavigate({ from: "/search" });
    const { t } = useTranslation();
    const { getQuery } = useSearchQueryContext();
    const { user } = useAuthenticator((context) => [context.user]);

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
                to: "/search",
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
                        shopType: data.shopType,
                        periodId: data.periodId,
                        categoryId: data.categoryId,
                        originYearSpan: data.originYearSpan,
                        authenticity: data.authenticity,
                        condition: data.condition,
                        provenance: data.provenance,
                        restoration: data.restoration,
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
            to: "/search",
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
                    <PeriodFilter />
                    <CategoryFilter />
                    <QualityIndicatorsFilter />
                    <ShopTypeFilter />
                    <MerchantFilters />
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
                {user && (
                    <SaveSearchFilterDialog searchArgs={searchFilters}>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-outline-variant text-primary uppercase text-sm shadow-none hover:bg-primary/8"
                        >
                            <BookmarkPlus className="size-4" />
                            {t("searchFilter.saveButton")}
                        </Button>
                    </SaveSearchFilterDialog>
                )}
            </form>
        </Form>
    );
}
