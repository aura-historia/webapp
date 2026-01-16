import type { PriceEstimate } from "@/data/internal/PriceEstimate.ts";
import { useTranslation } from "react-i18next";

interface ProductPriceEstimateProps {
    readonly priceEstimate: PriceEstimate;
}

export function ProductPriceEstimate({ priceEstimate }: ProductPriceEstimateProps) {
    const { t } = useTranslation();
    const min = priceEstimate.min;
    const max = priceEstimate.max;

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
        <div className="flex flex-row gap-2">
            <span className="text-sm text-muted-foreground">
                {t("product.priceEstimate.label", { price: priceText })}
            </span>
        </div>
    );
}
