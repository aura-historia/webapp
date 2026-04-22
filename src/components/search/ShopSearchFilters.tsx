import { Button } from "@/components/ui/button.tsx";
import { Form } from "@/components/ui/form.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/filterDefaults.ts";
import { useSearchQueryContext } from "@/hooks/search/useSearchQueryContext.tsx";
import { toast } from "sonner";
import { SHOP_PARTNER_STATUSES } from "@/data/internal/shop/ShopPartnerStatus.ts";
import { SHOP_FILTER_DEFAULTS } from "@/lib/shopFilterDefaults.ts";
import { ShopPartnerStatusFilter } from "@/components/search/filters/ShopPartnerStatusFilter.tsx";
import { serializeShopSearchParams } from "@/lib/shopSearchValidation.ts";
import { FILTERABLE_SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";
import { ShopTypeFilter } from "@/components/search/filters/ShopTypeFilter.tsx";

const shopFilterSchema = z.object({
    shopType: z.array(z.enum(FILTERABLE_SHOP_TYPES)),
    partnerStatus: z.array(z.enum(SHOP_PARTNER_STATUSES)),
});

export type ShopFilterSchema = z.infer<typeof shopFilterSchema>;

type ShopSearchFiltersProps = {
    readonly searchFilters: ShopSearchFilterArguments;
};

function mapShopFiltersToFormValues(filters: ShopSearchFilterArguments): ShopFilterSchema {
    return {
        shopType: filters.shopType ?? SHOP_FILTER_DEFAULTS.shopType,
        partnerStatus: filters.partnerStatus ?? SHOP_FILTER_DEFAULTS.partnerStatus,
    };
}

function isDefaultShopType(types: ShopFilterSchema["shopType"]): boolean {
    const defaults = new Set<string>(SHOP_FILTER_DEFAULTS.shopType);
    if (types.length !== defaults.size) return false;
    return types.every((type) => defaults.has(type));
}

function isDefaultPartnerStatus(statuses: ShopFilterSchema["partnerStatus"]): boolean {
    const defaults = new Set<string>(SHOP_FILTER_DEFAULTS.partnerStatus);
    if (statuses.length !== defaults.size) return false;
    return statuses.every((s) => defaults.has(s));
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

    const filterSchema = useMemo(() => shopFilterSchema, []);

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
                    <ShopTypeFilter
                        onReset={() => form.setValue("shopType", SHOP_FILTER_DEFAULTS.shopType)}
                    />
                    <ShopPartnerStatusFilter />
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
