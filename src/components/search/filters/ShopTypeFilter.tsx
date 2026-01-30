import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Controller, useFormContext } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { FilterX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFilterNavigation } from "@/hooks/search/useFilterNavigation.ts";
import { CheckboxMultiSelect } from "@/components/ui/checkbox-multi-select.tsx";
import { useMemo } from "react";
import { SHOP_TYPES, SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";

export function ShopTypeFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    const options = useMemo(
        () =>
            SHOP_TYPES.map((shopType) => ({
                value: shopType,
                label: t(SHOP_TYPE_TRANSLATION_CONFIG[shopType].translationKey),
            })),
        [t],
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <H2>{t("search.filter.shopType")}</H2>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => resetAndNavigate("shopType")}
                            className="h-8 w-8 p-0"
                        >
                            <FilterX className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t("search.filter.resetTooltip.shopType")}</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent>
                <Controller
                    name="shopType"
                    control={control}
                    render={({ field }) => (
                        <CheckboxMultiSelect
                            options={options}
                            value={field.value ?? []}
                            onChange={field.onChange}
                            allSelectedLabel={t("search.filter.all")}
                            placeholder={t("search.filter.select")}
                        />
                    )}
                />
            </CardContent>
        </Card>
    );
}
