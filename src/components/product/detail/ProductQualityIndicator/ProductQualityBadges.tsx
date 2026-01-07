import { Badge } from "@/components/ui/badge";
import { Calendar, ShieldCheck, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/data/internal/ProductDetails";
import type { OverviewProduct } from "@/data/internal/OverviewProduct";
import {
    formatOriginYear,
    getOriginYearColor,
    PRODUCT_ATTRIBUTE_COLORS,
} from "@/components/product/detail/ProductQualityIndicator/ProductQualityIndicator.helpers.ts";

export function ProductQualityBadges({ product }: { product: ProductDetail | OverviewProduct }) {
    const { t } = useTranslation();

    const hasOriginYear =
        product.originYear != null ||
        product.originYearMin != null ||
        product.originYearMax != null;
    const hasAuthenticity = product.authenticity !== "UNKNOWN";
    const hasCondition = product.condition !== "UNKNOWN";

    // No iteration: OriginYear differs greatly (different functions, 3 parameters), only 2 similar badges → build array + filter + map = more code than currently. Not worth it.
    // We could move the badge structure (icon + text in a badge with styling) to its own QualityBadge component, but I don't think that really adds any value, so I'll leave everything as it is.
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
                    {t(
                        `product.qualityIndicators.authenticity.${product.authenticity.toLowerCase()}`,
                    )}
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
                    {t(`product.qualityIndicators.condition.${product.condition.toLowerCase()}`)}
                </Badge>
            )}
        </>
    );
}
