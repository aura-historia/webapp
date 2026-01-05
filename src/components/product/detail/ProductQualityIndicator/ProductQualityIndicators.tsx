import type { ProductDetail } from "@/data/internal/ProductDetails.ts";
import { Card } from "@/components/ui/card.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Calendar, ShieldCheck, Star, FileText, Paintbrush } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductQualityIndicatorItem } from "./ProductQualityIndicatorItem.tsx";
import {
    PRODUCT_ATTRIBUTE_COLORS,
    formatOriginYear,
    formatOriginYearDescription,
} from "@/components/product/detail/ProductQualityIndicator/ProductQualityIndicator.helpers.ts";

export function ProductQualityIndicators({ product }: { product: ProductDetail }) {
    const { t } = useTranslation();
    const originYear = formatOriginYear(
        product.originYear,
        product.originYearMin,
        product.originYearMax,
        t,
    );
    const originYearDescription = formatOriginYearDescription(
        product.originYear,
        product.originYearMin,
        product.originYearMax,
        t,
    );

    let originYearColor = "bg-gray-400";
    if (product.originYear) {
        originYearColor = "bg-green-700";
    } else if (product.originYearMin || product.originYearMax) {
        originYearColor = "bg-sky-600";
    }

    const qualityIndicators = [
        {
            key: "originYear",
            icon: Calendar,
            colorClass: originYearColor,
            label: t("product.qualityIndicators.originYear.label"),
            value: originYear,
            description: originYearDescription,
        },
        {
            key: "authenticity",
            icon: ShieldCheck,
            colorClass:
                PRODUCT_ATTRIBUTE_COLORS.authenticity[product.authenticity || "UNKNOWN"] ||
                "bg-gray-400",
            label: t("product.qualityIndicators.authenticity.label"),
            value: t(
                `product.qualityIndicators.authenticity.${(product.authenticity || "UNKNOWN").toLowerCase()}`,
            ),
            description: t(
                `product.qualityIndicators.authenticity.${(product.authenticity || "UNKNOWN").toLowerCase()}Description`,
            ),
        },
        {
            key: "condition",
            icon: Star,
            colorClass:
                PRODUCT_ATTRIBUTE_COLORS.condition[product.condition || "UNKNOWN"] || "bg-gray-400",
            label: t("product.qualityIndicators.condition.label"),
            value: t(
                `product.qualityIndicators.condition.${(product.condition || "UNKNOWN").toLowerCase()}`,
            ),
            description: t(
                `product.qualityIndicators.condition.${(product.condition || "UNKNOWN").toLowerCase()}Description`,
            ),
        },
        {
            key: "provenance",
            icon: FileText,
            colorClass:
                PRODUCT_ATTRIBUTE_COLORS.provenance[product.provenance || "UNKNOWN"] ||
                "bg-gray-400",
            label: t("product.qualityIndicators.provenance.label"),
            value: t(
                `product.qualityIndicators.provenance.${(product.provenance || "UNKNOWN").toLowerCase()}`,
            ),
            description: t(
                `product.qualityIndicators.provenance.${(product.provenance || "UNKNOWN").toLowerCase()}Description`,
            ),
        },
        {
            key: "restoration",
            icon: Paintbrush,
            colorClass:
                PRODUCT_ATTRIBUTE_COLORS.restoration[product.restoration || "UNKNOWN"] ||
                "bg-gray-400",
            label: t("product.qualityIndicators.restoration.label"),
            value: t(
                `product.qualityIndicators.restoration.${(product.restoration || "UNKNOWN").toLowerCase()}`,
            ),
            description: t(
                `product.qualityIndicators.restoration.${(product.restoration || "UNKNOWN").toLowerCase()}Description`,
            ),
        },
    ];

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
