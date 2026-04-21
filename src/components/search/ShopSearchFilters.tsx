import { Button } from "@/components/ui/button.tsx";
import { Form } from "@/components/ui/form.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { formatToDateString } from "@/lib/utils.ts";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/filterDefaults.ts";
import { useSearchQueryContext } from "@/hooks/search/useSearchQueryContext.tsx";
import { toast } from "sonner";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";
import { SHOP_PARTNER_STATUSES } from "@/data/internal/shop/ShopPartnerStatus.ts";
import { SHOP_FILTER_DEFAULTS } from "@/lib/shopFilterDefaults.ts";
import { ShopPartnerStatusFilter } from "@/components/search/filters/ShopPartnerStatusFilter.tsx";
import { ShopSearchShopTypeFilter } from "@/components/search/filters/ShopSearchShopTypeFilter.tsx";
import { ShopDateSpanFilter } from "@/components/search/filters/ShopDateSpanFilter.tsx";
import { serializeShopSearchParams } from "@/lib/shopSearchValidation.ts";

const createShopFilterSchema = (t: TFunction) =>
    z
        .object({
            shopType: z.array(z.enum(SHOP_TYPES)),
            partnerStatus: z.array(z.enum(SHOP_PARTNER_STATUSES)),
            creationDate: z.object({
                from: z.date().optional(),
                to: z.date().optional(),
            }),
            updateDate: z.object({
                from: z.date().optional(),
                to: z.date().optional(),
            }),
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

export type ShopFilterSchema = z.infer<ReturnType<typeof createShopFilterSchema>>;

type ShopSearchFiltersProps = {
    readonly searchFilters: ShopSearchFilterArguments;
};

function mapShopFiltersToFormValues(filters: ShopSearchFilterArguments): ShopFilterSchema {
    return {
        shopType: filters.shopType ?? SHOP_FILTER_DEFAULTS.shopType,
        partnerStatus: filters.partnerStatus ?? SHOP_FILTER_DEFAULTS.partnerStatus,
        creationDate: {
            from: filters.creationDateFrom,
            to: filters.creationDateTo,
        },
        updateDate: {
            from: filters.updateDateFrom,
            to: filters.updateDateTo,
        },
    };
}

function isDefaultShopType(types: ShopFilterSchema["shopType"]): boolean {
    return (
        types.length === SHOP_FILTER_DEFAULTS.shopType.length &&
        types.every((t) => (SHOP_FILTER_DEFAULTS.shopType as readonly string[]).includes(t))
    );
}

function isDefaultPartnerStatus(statuses: ShopFilterSchema["partnerStatus"]): boolean {
    return (
        statuses.length === SHOP_FILTER_DEFAULTS.partnerStatus.length &&
        statuses.every((s) => (SHOP_FILTER_DEFAULTS.partnerStatus as readonly string[]).includes(s))
    );
}

export function ShopSearchFilters({ searchFilters }: ShopSearchFiltersProps) {
    const navigate = useNavigate({ from: "/search/shops" });
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

    const filterSchema = useMemo(() => createShopFilterSchema(t), [t]);

    const form = useForm<ShopFilterSchema>({
        resolver: zodResolver(filterSchema),
        values: mapShopFiltersToFormValues(searchFilters),
        resetOptions: { keepDirtyValues: true },
        mode: "onChange",
    });

    const applyFilters = useCallback(
        (data: ShopFilterSchema) => {
            navigate({
                to: "/search/shops",
                search: (prev) => ({
                    ...serializeShopSearchParams(prev as ShopSearchFilterArguments),
                    q: getEffectiveQuery(),
                    shopType: isDefaultShopType(data.shopType) ? undefined : data.shopType,
                    partnerStatus: isDefaultPartnerStatus(data.partnerStatus)
                        ? undefined
                        : data.partnerStatus,
                    creationDateFrom: formatToDateString(data.creationDate.from),
                    creationDateTo: formatToDateString(data.creationDate.to),
                    updateDateFrom: formatToDateString(data.updateDate.from),
                    updateDateTo: formatToDateString(data.updateDate.to),
                }),
            });
        },
        [navigate, getEffectiveQuery],
    );

    useEffect(() => {
        const subscription = form.watch((data, { name }) => {
            if (!name) return;
            const result = filterSchema.safeParse(data);
            if (result.success) applyFilters(result.data);
        });
        return () => subscription.unsubscribe();
    }, [form, filterSchema, applyFilters]);

    const handleResetAll = useCallback(() => {
        form.reset(SHOP_FILTER_DEFAULTS);
        navigate({
            to: "/search/shops",
            search: {
                q: getEffectiveQuery(),
            },
        });
    }, [form, navigate, getEffectiveQuery]);

    return (
        <Form {...form}>
            <form className="space-y-4">
                <div className="flex min-w-0 w-full flex-col gap-4 overflow-visible">
                    <ShopSearchShopTypeFilter />
                    <ShopPartnerStatusFilter />
                    <ShopDateSpanFilter
                        field="creationDate"
                        title={t("search.filter.creationDate")}
                        resetTooltip={t("search.filter.resetTooltip.creationDate")}
                    />
                    <ShopDateSpanFilter
                        field="updateDate"
                        title={t("search.filter.updateDate")}
                        resetTooltip={t("search.filter.resetTooltip.updateDate")}
                    />
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
