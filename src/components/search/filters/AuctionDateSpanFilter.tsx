import { H2 } from "@/components/typography/H2";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { DatePicker } from "@/components/search/filters/util/DatePicker.tsx";
import { useFormContext, useFormState } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { FilterX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFilterNavigation } from "@/hooks/search/useFilterNavigation.ts";
import { useMemo } from "react";

export function AuctionDateSpanFilter() {
    const { control, watch } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: ["auctionDate.from", "auctionDate.to"] });
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    const selectedShopTypes = watch("shopType");

    const isDisabled = useMemo(() => {
        return selectedShopTypes?.length > 0 && !selectedShopTypes.includes("AUCTION_HOUSE");
    }, [selectedShopTypes]);

    return (
        <Card className={isDisabled ? "opacity-50" : undefined}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <H2>{t("search.filter.auctionDate")}</H2>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => resetAndNavigate("auctionDate")}
                            className="h-8 w-8 p-0"
                            disabled={isDisabled}
                        >
                            <FilterX className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            {!isDisabled
                                ? t("search.filter.resetTooltip.auctionDate")
                                : t("search.filter.auctionDateDisabledTooltip")}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent>
                <div className={"flex flex-col w-full gap-2"}>
                    <div className={"flex flex-row gap-2 items-center justify-between"}>
                        <span>{t("search.filter.from")}</span>
                        <DatePicker fieldName="auctionDate.from" disabled={isDisabled} />
                    </div>
                    <div className={"flex flex-row gap-2 items-center justify-between"}>
                        <span>{t("search.filter.to")}</span>
                        <DatePicker fieldName="auctionDate.to" disabled={isDisabled} />
                    </div>
                    {(errors?.auctionDate?.from || errors?.auctionDate?.to) && (
                        <p className="text-destructive text-sm mt-1">
                            {errors.auctionDate.from?.message ??
                                errors.auctionDate.to?.message ??
                                ""}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
