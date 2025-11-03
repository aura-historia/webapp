import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Controller, useFormContext, useFormState } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { Input } from "@/components/ui/input.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { FilterX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFilterNavigation } from "@/hooks/useFilterNavigation.ts";

export function MerchantFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: ["merchant"] });
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <H2>{t("search.filter.merchant")}</H2>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => resetAndNavigate("merchant")}
                            className="h-8 w-8 p-0"
                        >
                            <FilterX className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t("search.filter.resetTooltip.merchant")}</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent>
                <Controller
                    name="merchant"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type={"text"}
                            placeholder={t("search.filter.anyMerchant")}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                        />
                    )}
                />
                {errors?.merchant && (
                    <p className="text-destructive text-sm mt-1">
                        {String(errors.merchant.message ?? "")}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
