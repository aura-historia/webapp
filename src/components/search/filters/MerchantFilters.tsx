import { H2 } from "@/components/typography/H2.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { FilterX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFormContext } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";
import { MerchantIncludeFilter } from "@/components/search/filters/MerchantIncludeFilter.tsx";
import { MerchantExcludeFilter } from "@/components/search/filters/MerchantExcludeFilter.tsx";

export function MerchantFilters() {
    const { t } = useTranslation();
    const { setValue } = useFormContext<FilterSchema>();

    const handleReset = () => {
        setValue("merchant", FILTER_DEFAULTS.merchant);
        setValue("excludeMerchant", FILTER_DEFAULTS.excludeMerchant);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <H2>{t("search.filter.merchants")}</H2>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="h-8 w-8 p-0"
                            aria-label={t("search.filter.resetTooltip.merchants")}
                        >
                            <FilterX className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t("search.filter.resetTooltip.merchants")}</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <MerchantIncludeFilter />
                    <MerchantExcludeFilter />
                </div>
            </CardContent>
        </Card>
    );
}
