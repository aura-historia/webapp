import type { ProductDetail } from "@/data/internal/product/ProductDetails.ts";
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
                colorClass: PRODUCT_ATTRIBUTE_COLORS.authenticity[product.authenticity],
                label: t("product.qualityIndicators.authenticity.label"),
                value: t(AUTHENTICITY_TRANSLATION_CONFIG[product.authenticity].translationKey),
                description: t(
                    AUTHENTICITY_TRANSLATION_CONFIG[product.authenticity].descriptionKey,
                ),
            },
            {
                key: "condition",
                colorClass: PRODUCT_ATTRIBUTE_COLORS.condition[product.condition],
                label: t("product.qualityIndicators.condition.label"),
                value: t(CONDITION_TRANSLATION_CONFIG[product.condition].translationKey),
                description: t(CONDITION_TRANSLATION_CONFIG[product.condition].descriptionKey),
            },
            {
                key: "provenance",
                colorClass: PRODUCT_ATTRIBUTE_COLORS.provenance[product.provenance],
                label: t("product.qualityIndicators.provenance.label"),
                value: t(PROVENANCE_TRANSLATION_CONFIG[product.provenance].translationKey),
                description: t(PROVENANCE_TRANSLATION_CONFIG[product.provenance].descriptionKey),
            },
            {
                key: "restoration",
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
        <section className="w-full border-t border-border/30 pt-8">
            <h2 className="sr-only">{t("product.qualityIndicators.title")}</h2>
            <div className="space-y-3">
                {qualityIndicators.map((indicator) => (
                    <ProductQualityIndicatorItem
                        key={indicator.key}
                        colorClass={indicator.colorClass}
                        label={indicator.label}
                        value={indicator.value}
                        description={indicator.description}
                    />
                ))}
            </div>
        </section>
    );
}
