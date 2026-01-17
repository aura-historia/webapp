import { CreationDateSpanFilter } from "@/components/search/filters/CreationDateSpanFilter.tsx";
import { ProductStateFilter } from "@/components/search/filters/ProductStateFilter.tsx";
import { PriceSpanFilter } from "@/components/search/filters/PriceSpanFilter.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Form } from "@/components/ui/form.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MerchantFilter } from "@/components/search/filters/MerchantFilter.tsx";
import { useNavigate } from "@tanstack/react-router";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import { useCallback, useEffect, useMemo } from "react";
import { UpdateDateSpanFilter } from "@/components/search/filters/UpdateDateSpanFilter.tsx";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { mapFiltersToUrlParams } from "@/lib/utils.ts";
import { FILTER_DEFAULTS, MIN_SEARCH_QUERY_LENGTH } from "@/lib/filterDefaults.ts";
import { useSearchQueryContext } from "@/hooks/search/useSearchQueryContext.tsx";
import { toast } from "sonner";

const createFilterSchema = (t: TFunction) =>
    z
        .object({
            priceSpan: z
                .object({
                    min: z.number().min(0).optional().or(z.undefined()),
                    max: z.number().min(0).optional().or(z.undefined()),
                })
                .optional(),
            productState: z.array(
                z.enum(["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"]),
            ),
            creationDate: z.object({
                from: z.date().optional(),
                to: z.date().optional(),
            }),
            updateDate: z.object({
                from: z.date().optional(),
                to: z.date().optional(),
            }),
            merchant: z
                .array(z.string())
                .min(1, { error: t("search.validation.merchantMinLength") })
                .optional()
                .or(z.array(z.string()).max(0)),
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
        });

export type FilterSchema = z.infer<ReturnType<typeof createFilterSchema>>;

type SearchFilterProps = {
    readonly searchFilters: SearchFilterArguments;
    readonly onFiltersApplied?: () => void;
};

export function SearchFilters({ searchFilters, onFiltersApplied }: SearchFilterProps) {
    const navigate = useNavigate({ from: "/search" });
    const { t } = useTranslation();
    const { getQuery } = useSearchQueryContext();

    /**
     * Gets the effective search query to use.
     * Returns the current typed query if valid, otherwise falls back to URL param.
     */
    const getEffectiveQuery = useCallback((): string => {
        const currentQuery = getQuery()?.trim();

        if (currentQuery && currentQuery.length < MIN_SEARCH_QUERY_LENGTH) {
            toast.warning(t("search.validation.queryMinLength"), { duration: 2000 });
            return searchFilters.q;
        }

        return currentQuery;
    }, [getQuery, searchFilters.q, t]);

    const filterSchema = useMemo(() => createFilterSchema(t), [t]);

    const form = useForm<FilterSchema>({
        resolver: zodResolver(filterSchema),
        defaultValues: FILTER_DEFAULTS,
        mode: "onSubmit",
    });

    // Set initial values from search filters after form is created
    useEffect(() => {
        if (searchFilters.priceFrom !== undefined) {
            form.setValue("priceSpan.min", searchFilters.priceFrom, { shouldDirty: false });
        }
        if (searchFilters.priceTo !== undefined) {
            form.setValue("priceSpan.max", searchFilters.priceTo, { shouldDirty: false });
        }
        if (searchFilters.creationDateFrom) {
            form.setValue("creationDate.from", new Date(searchFilters.creationDateFrom), {
                shouldDirty: false,
            });
        }
        if (searchFilters.creationDateTo) {
            form.setValue("creationDate.to", new Date(searchFilters.creationDateTo), {
                shouldDirty: false,
            });
        }
        if (searchFilters.updateDateFrom) {
            form.setValue("updateDate.from", new Date(searchFilters.updateDateFrom), {
                shouldDirty: false,
            });
        }
        if (searchFilters.updateDateTo) {
            form.setValue("updateDate.to", new Date(searchFilters.updateDateTo), {
                shouldDirty: false,
            });
        }
        if (searchFilters.merchant) {
            form.setValue("merchant", searchFilters.merchant, { shouldDirty: false });
        }
        if (searchFilters.allowedStates) {
            form.setValue("productState", searchFilters.allowedStates, { shouldDirty: false });
        }
    }, [
        searchFilters.priceFrom,
        searchFilters.priceTo,
        searchFilters.creationDateFrom,
        searchFilters.creationDateTo,
        searchFilters.updateDateFrom,
        searchFilters.updateDateTo,
        searchFilters.merchant,
        searchFilters.allowedStates,
        form,
    ]);

    const onSubmit = useCallback(
        (data: FilterSchema) => {
            navigate({
                to: "/search",
                search: mapFiltersToUrlParams({
                    query: getEffectiveQuery(),
                    priceSpan: data.priceSpan,
                    productState: data.productState,
                    creationDate: data.creationDate,
                    updateDate: data.updateDate,
                    merchant: data.merchant,
                }),
            });
            onFiltersApplied?.();
        },
        [navigate, onFiltersApplied, getEffectiveQuery],
    );
    const handleResetAll = useCallback(() => {
        form.reset(FILTER_DEFAULTS);
        navigate({
            to: "/search",
            search: {
                q: getEffectiveQuery(),
            },
        });
        onFiltersApplied?.();
    }, [form, navigate, onFiltersApplied, getEffectiveQuery]);
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className={"flex flex-col gap-4"}>
                    <PriceSpanFilter />
                    <ProductStateFilter />
                    <CreationDateSpanFilter />
                    <UpdateDateSpanFilter />
                    <MerchantFilter />
                </div>
                <div className="flex flex-col gap-2">
                    <Button className="w-full shadow-sm" type="submit">
                        {t("search.applyFilters")}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full shadow-sm"
                        onClick={handleResetAll}
                    >
                        {t("search.resetAllFilters")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
