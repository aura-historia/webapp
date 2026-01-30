import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Controller, useFormContext, useFormState } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { FilterX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFilterNavigation } from "@/hooks/search/useFilterNavigation.ts";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select.tsx";
import { useMutation } from "@tanstack/react-query";
import { searchShopsMutation } from "@/client/@tanstack/react-query.gen.ts";
import { useState, useCallback, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";

const DEBOUNCE_DELAY_MS = 300;

export function ExcludeMerchantFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: ["excludeMerchant"] });
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();
    const [searchQuery, setSearchQuery] = useState("");

    const { mutate: searchShops, data: shopsData, isPending } = useMutation(searchShopsMutation());

    const debouncedSearch = useDebouncedCallback((query: string) => {
        if (query.length > 0) {
            searchShops({
                body: { shopNameQuery: query },
            });
        }
    }, DEBOUNCE_DELAY_MS);

    const handleSearchChange = useCallback(
        (query: string) => {
            setSearchQuery(query);
            debouncedSearch(query);
        },
        [debouncedSearch],
    );

    const shopOptions: MultiSelectOption[] = useMemo(() => {
        if (!shopsData?.items) return [];
        return shopsData.items.map((shop) => ({
            value: shop.name,
            label: shop.name,
        }));
    }, [shopsData?.items]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <H2>{t("search.filter.excludeMerchant")}</H2>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => resetAndNavigate("excludeMerchant")}
                            className="h-8 w-8 p-0"
                        >
                            <FilterX className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t("search.filter.resetTooltip.excludeMerchant")}</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent>
                <Controller
                    name="excludeMerchant"
                    control={control}
                    render={({ field }) => {
                        const selectedOptions: MultiSelectOption[] = (field.value || []).map(
                            (name: string) => ({ value: name, label: name }),
                        );

                        return (
                            <MultiSelect
                                options={shopOptions}
                                value={selectedOptions}
                                onChange={(options) => {
                                    field.onChange(options.map((opt) => opt.value));
                                }}
                                onSearchChange={handleSearchChange}
                                placeholder={t("search.filter.searchExcludeMerchants")}
                                isLoading={isPending && searchQuery.length > 0}
                                emptyMessage={t("search.filter.noMerchantsFound")}
                            />
                        );
                    }}
                />
                {errors?.excludeMerchant && (
                    <p className="text-destructive text-sm mt-1">
                        {String(errors.excludeMerchant.message ?? "")}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
