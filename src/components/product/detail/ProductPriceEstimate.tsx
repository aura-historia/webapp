import type { PriceEstimate } from "@/data/internal/PriceEstimate.ts";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Info } from "lucide-react";
import { SHOP_TYPE_TRANSLATION_CONFIG, type ShopType } from "@/data/internal/ShopType.ts";

interface ProductPriceEstimateProps {
    readonly priceEstimate: PriceEstimate;
    readonly shopType: ShopType;
}

export function ProductPriceEstimate({ priceEstimate, shopType }: ProductPriceEstimateProps) {
    const { t } = useTranslation();
    const min = priceEstimate.min;
    const max = priceEstimate.max;
    const shopTypeName = t(SHOP_TYPE_TRANSLATION_CONFIG[shopType]?.translationKey);

    const tooltipText =
        shopType === "UNKNOWN"
            ? t("product.priceEstimate.tooltipUnknown")
            : t("product.priceEstimate.tooltip", { shopType: shopTypeName });

    if (!min && !max) return;

    let priceText: string;
    if (min && max) {
        priceText = t("product.priceEstimate.range", { min, max });
    } else if (min) {
        priceText = t("product.priceEstimate.minOnly", { min });
    } else {
        priceText = t("product.priceEstimate.maxOnly", { max });
    }

    return (
        <div className="flex flex-row gap-2 items-center">
            <span className="text-sm text-muted-foreground">{priceText}</span>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Info className={"h-4 w-4 text-sm text-muted-foreground"} />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}
