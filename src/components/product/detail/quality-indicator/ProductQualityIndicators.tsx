import type { ProductDetail } from "@/data/internal/product/ProductDetails.ts";
import { Card } from "@/components/ui/card.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Calendar, ShieldCheck, Star, FileText, Paintbrush } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductQualityIndicatorItem } from "./ProductQualityIndicatorItem.tsx";

import { useMemo } from "react";
import { AUTHENTICITY_TRANSLATION_CONFIG } from "@/data/internal/quality-indicators/Authenticity.ts";
import { CONDITION_TRANSLATION_CONFIG } from "@/data/internal/quality-indicators/Condition.ts";
import { PROVENANCE_TRANSLATION_CONFIG } from "@/data/internal/quality-indicators/Provenance.ts";
import { RESTORATION_TRANSLATION_CONFIG } from "@/data/internal/quality-indicators/Restoration.ts";
import {
    formatOriginYear,
    formatOriginYearDescription,
    getOriginYearColor,
    PRODUCT_ATTRIBUTE_COLORS,
} from "@/components/product/detail/quality-indicator/ProductQualityIndicator.helpers.ts";

export function ProductQualityIndicators({ product }: { readonly product: ProductDetail }) {
    const { t } = useTranslation();

    const qualityIndicators = useMemo(
        () => [
            {
                key: "originYear",
                icon: Calendar,
                colorClass: getOriginYearColor(
                    product.originYear,
                    product.originYearMin,
                    product.originYearMax,
                ),
                label: t("product.qualityIndicators.originYear.label"),
                value: formatOriginYear(
                    product.originYear,
                    product.originYearMin,
                    product.originYearMax,
                    t,
                ),
                description: formatOriginYearDescription(
                    product.originYear,
                    product.originYearMin,
                    product.originYearMax,
                    t,
                ),
            },
            {
                key: "authenticity",
                icon: ShieldCheck,
                colorClass: PRODUCT_ATTRIBUTE_COLORS.authenticity[product.authenticity],
                label: t("product.qualityIndicators.authenticity.label"),
                value: t(AUTHENTICITY_TRANSLATION_CONFIG[product.authenticity].translationKey),
                description: t(
                    AUTHENTICITY_TRANSLATION_CONFIG[product.authenticity].descriptionKey,
                ),
            },
            {
                key: "condition",
                icon: Star,
                colorClass: PRODUCT_ATTRIBUTE_COLORS.condition[product.condition],
                label: t("product.qualityIndicators.condition.label"),
                value: t(CONDITION_TRANSLATION_CONFIG[product.condition].translationKey),
                description: t(CONDITION_TRANSLATION_CONFIG[product.condition].descriptionKey),
            },
            {
                key: "provenance",
                icon: FileText,
                colorClass: PRODUCT_ATTRIBUTE_COLORS.provenance[product.provenance],
                label: t("product.qualityIndicators.provenance.label"),
                value: t(PROVENANCE_TRANSLATION_CONFIG[product.provenance].translationKey),
                description: t(PROVENANCE_TRANSLATION_CONFIG[product.provenance].descriptionKey),
            },
            {
                key: "restoration",
                icon: Paintbrush,
                colorClass: PRODUCT_ATTRIBUTE_COLORS.restoration[product.restoration],
                label: t("product.qualityIndicators.restoration.label"),
                value: t(RESTORATION_TRANSLATION_CONFIG[product.restoration].translationKey),
                description: t(RESTORATION_TRANSLATION_CONFIG[product.restoration].descriptionKey),
            },
        ],
        [
            product.originYear,
            product.originYearMin,
            product.originYearMax,
            product.authenticity,
            product.condition,
            product.provenance,
            product.restoration,
            t,
        ],
    );

    return (
        <Card className="p-6 shadow-md">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b">
                <H2>{t("product.qualityIndicators.title")}</H2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {qualityIndicators.map((indicator) => (
                    <ProductQualityIndicatorItem
                        key={indicator.key}
                        icon={indicator.icon}
                        colorClass={indicator.colorClass}
                        label={indicator.label}
                        value={indicator.value}
                        description={indicator.description}
                    />
                ))}
            </div>
        </Card>
    );
}
