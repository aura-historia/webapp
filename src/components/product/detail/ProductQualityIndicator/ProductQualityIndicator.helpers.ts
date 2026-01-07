import type { TFunction } from "i18next";

const COLOR_LEVELS = {
    BEST: "bg-green-700",
    GOOD: "bg-sky-600",
    MEDIUM: "bg-yellow-500",
    POOR: "bg-orange-500",
    WORST: "bg-red-700",
    UNKNOWN: "bg-gray-400",
} as const;

export const PRODUCT_ATTRIBUTE_COLORS = {
    condition: {
        EXCELLENT: COLOR_LEVELS.BEST,
        GREAT: COLOR_LEVELS.BEST,
        GOOD: COLOR_LEVELS.GOOD,
        FAIR: COLOR_LEVELS.MEDIUM,
        POOR: COLOR_LEVELS.WORST,
        UNKNOWN: COLOR_LEVELS.UNKNOWN,
    },
    authenticity: {
        ORIGINAL: COLOR_LEVELS.BEST,
        LATER_COPY: COLOR_LEVELS.GOOD,
        REPRODUCTION: COLOR_LEVELS.MEDIUM,
        QUESTIONABLE: COLOR_LEVELS.POOR,
        UNKNOWN: COLOR_LEVELS.UNKNOWN,
    },
    provenance: {
        COMPLETE: COLOR_LEVELS.BEST,
        PARTIAL: COLOR_LEVELS.GOOD,
        CLAIMED: COLOR_LEVELS.MEDIUM,
        NONE: COLOR_LEVELS.POOR,
        UNKNOWN: COLOR_LEVELS.UNKNOWN,
    },
    restoration: {
        NONE: COLOR_LEVELS.BEST,
        MINOR: COLOR_LEVELS.GOOD,
        MAJOR: COLOR_LEVELS.POOR,
        UNKNOWN: COLOR_LEVELS.UNKNOWN,
    },
} as const;

export function formatOriginYear(
    originYear: number | null | undefined,
    originYearMin: number | null | undefined,
    originYearMax: number | null | undefined,
    t: TFunction,
    isDescription: boolean = false,
): string {
    if (originYear != null) {
        return isDescription
            ? t("product.qualityIndicators.originYear.exactDescription", { year: originYear })
            : `${originYear}`;
    }
    if (originYearMin != null && originYearMax != null) {
        return isDescription
            ? t("product.qualityIndicators.originYear.rangeDescription", {
                  min: originYearMin,
                  max: originYearMax,
              })
            : t("product.qualityIndicators.originYear.range", {
                  min: originYearMin,
                  max: originYearMax,
              });
    }
    if (originYearMin != null) {
        return isDescription
            ? t("product.qualityIndicators.originYear.fromDescription", { year: originYearMin })
            : t("product.qualityIndicators.originYear.from", { year: originYearMin });
    }
    if (originYearMax != null) {
        return isDescription
            ? t("product.qualityIndicators.originYear.untilDescription", { year: originYearMax })
            : t("product.qualityIndicators.originYear.until", { year: originYearMax });
    }
    return isDescription
        ? t("product.qualityIndicators.originYear.unknownDescription")
        : t("product.qualityIndicators.originYear.unknown");
}

export function formatOriginYearDescription(
    originYear: number | null | undefined,
    originYearMin: number | null | undefined,
    originYearMax: number | null | undefined,
    t: TFunction,
): string {
    return formatOriginYear(originYear, originYearMin, originYearMax, t, true);
}

export function getOriginYearColor(
    originYear: number | null | undefined,
    originYearMin: number | null | undefined,
    originYearMax: number | null | undefined,
): string {
    if (originYear != null) return COLOR_LEVELS.BEST;
    if (originYearMin != null || originYearMax != null) return COLOR_LEVELS.GOOD;
    return COLOR_LEVELS.UNKNOWN;
}
