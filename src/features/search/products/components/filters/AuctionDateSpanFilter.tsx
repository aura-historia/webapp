import { DatePicker } from "@/features/search/common/components/filters/util/DatePicker.tsx";
import { useFormContext, useFormState } from "react-hook-form";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { useTranslation } from "react-i18next";
import { useFilterNavigation } from "@/features/search/products/hooks/useFilterNavigation.ts";
import { FilterCard } from "@/features/search/common/components/filters/FilterCard.tsx";
import { useMemo } from "react";

export function AuctionDateSpanFilter({
    defaultOpen = false,
    disabled: tierDisabled = false,
}: {
    readonly defaultOpen?: boolean;
    readonly disabled?: boolean;
}) {
    const { control, watch } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: ["auctionDate.from", "auctionDate.to"] });
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    const selectedShopTypes = watch("shopType");

    const isAuctionDisabled = useMemo(() => {
        return selectedShopTypes?.length > 0 && !selectedShopTypes.includes("AUCTION_HOUSE");
    }, [selectedShopTypes]);

    const isDisabled = tierDisabled || isAuctionDisabled;

    return (
        <FilterCard
            title={t("search.filter.auctionDate")}
            resetTooltip={
                isDisabled
                    ? t("search.filter.auctionDateDisabledTooltip")
                    : t("search.filter.resetTooltip.auctionDate")
            }
            onReset={() => resetAndNavigate("auctionDate")}
            defaultOpen={defaultOpen}
            disabled={isDisabled}
        >
            <div className="flex min-w-0 w-full flex-col gap-2">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
                        {t("search.filter.from")}
                    </span>
                    <div className="min-w-0 flex-1">
                        <DatePicker fieldName="auctionDate.from" disabled={isDisabled} />
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
                        {t("search.filter.to")}
                    </span>
                    <div className="min-w-0 flex-1">
                        <DatePicker fieldName="auctionDate.to" disabled={isDisabled} />
                    </div>
                </div>
                {(errors?.auctionDate?.from || errors?.auctionDate?.to) && (
                    <p className="text-destructive text-sm mt-1">
                        {errors.auctionDate.from?.message ?? errors.auctionDate.to?.message ?? ""}
                    </p>
                )}
            </div>
        </FilterCard>
    );
}
