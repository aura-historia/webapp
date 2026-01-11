import { Badge } from "@/components/ui/badge.tsx";
import { Calendar, ShieldCheck, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";
import type { ProductDetail } from "@/data/internal/ProductDetails.ts";
import type { OverviewProduct } from "@/data/internal/OverviewProduct.ts";
import {
    formatOriginYear,
    getOriginYearColor,
    PRODUCT_ATTRIBUTE_COLORS,
} from "@/components/product/detail/ProductQualityIndicator/ProductQualityIndicator.helpers.ts";
import { AUTHENTICITY_TRANSLATION_CONFIG } from "@/data/internal/Authenticity.ts";
import { CONDITION_TRANSLATION_CONFIG } from "@/data/internal/Condition.ts";

export function ProductQualityBadges({
    product,
}: {
    readonly product: ProductDetail | OverviewProduct;
}) {
    const { t } = useTranslation();

    const hasOriginYear =
        product.originYear != null ||
        product.originYearMin != null ||
        product.originYearMax != null;
    const hasAuthenticity = product.authenticity !== "UNKNOWN";
    const hasCondition = product.condition !== "UNKNOWN";

    return (
        <>
            {hasOriginYear && (
                <Badge
                    className={cn(
                        getOriginYearColor(
                            product.originYear,
                            product.originYearMin,
                            product.originYearMax,
                        ),
                        "text-white py-1 gap-1",
                    )}
                >
                    <Calendar className="size-3" />
                    {formatOriginYear(
                        product.originYear,
                        product.originYearMin,
                        product.originYearMax,
                        t,
                    )}
                </Badge>
            )}

            {hasAuthenticity && (
                <Badge
                    className={cn(
                        PRODUCT_ATTRIBUTE_COLORS.authenticity[product.authenticity],
                        "text-white py-1 gap-1",
                    )}
                >
                    <ShieldCheck className="size-3" />
                    {t(AUTHENTICITY_TRANSLATION_CONFIG[product.authenticity].translationKey)}
                </Badge>
            )}

            {hasCondition && (
                <Badge
                    className={cn(
                        PRODUCT_ATTRIBUTE_COLORS.condition[product.condition],
                        "text-white py-1 gap-1",
                    )}
                >
                    <Star className="size-3" />
                    {t(CONDITION_TRANSLATION_CONFIG[product.condition].translationKey)}
                </Badge>
            )}
        </>
    );
}
