import type { TFunction } from "i18next";

/**
 * Mapping of period keys to period image assets.
 */
const PERIOD_ASSET_BASE_URL = "https://assets.aura-historia.com/webapp/periods";

const buildPeriodAssetUrl = (slug: string) => `${PERIOD_ASSET_BASE_URL}/${slug}.webp`;

export const PERIOD_ASSET_MAP: Record<string, string> = {
    ANTIQUITY: buildPeriodAssetUrl("antiquity"),
    ART_DECO: buildPeriodAssetUrl("art-deco"),
    ARTS_AND_CRAFTS: buildPeriodAssetUrl("arts-and-crafts"),
    BAROQUE: buildPeriodAssetUrl("baroque"),
    BIEDERMEIER: buildPeriodAssetUrl("biedermeier"),
    EMPIRE: buildPeriodAssetUrl("empire"),
    EARLY_MODERN: buildPeriodAssetUrl("early-modern"),
    EARLY_MEDIEVAL: buildPeriodAssetUrl("early-medieval"),
    GOTHIC: buildPeriodAssetUrl("gothic"),
    HISTORICISM: buildPeriodAssetUrl("historicism"),
    ART_NOUVEAU: buildPeriodAssetUrl("art-nouveau"),
    NEOCLASSICISM: buildPeriodAssetUrl("neoclassicism"),
    MANNERISM: buildPeriodAssetUrl("mannerism"),
    MID_CENTURY_MODERN: buildPeriodAssetUrl("mid-century-modern"),
    MODERNISM: buildPeriodAssetUrl("modernism"),
    POSTMODERN: buildPeriodAssetUrl("postmodern"),
    RENAISSANCE: buildPeriodAssetUrl("renaissance"),
    ROCOCO: buildPeriodAssetUrl("rococo"),
    ROMANESQUE: buildPeriodAssetUrl("romanesque"),
    CONTEMPORARY: buildPeriodAssetUrl("contemporary"),
};

/**
 * Fallback period image for unknown period keys.
 */
export const FALLBACK_PERIOD_ASSET_URL = buildPeriodAssetUrl("contemporary");

/**
 * Approximate date ranges used in the landing page period cards.
 * These ranges are placeholders for visual context and can be refined later.
 */
export const PERIOD_DATE_RANGE_MAP: Record<string, string> = {
    ANTIQUITY: "3000 BCE-500 CE",
    EARLY_MEDIEVAL: "500-1000",
    ROMANESQUE: "1000-1200",
    GOTHIC: "1200-1500",
    RENAISSANCE: "1400-1600",
    MANNERISM: "1520-1600",
    BAROQUE: "1600-1750",
    ROCOCO: "1730-1780",
    NEOCLASSICISM: "1750-1830",
    BIEDERMEIER: "1815-1848",
    HISTORICISM: "1830-1900",
    ARTS_AND_CRAFTS: "1860-1910",
    ART_NOUVEAU: "1890-1910",
    EARLY_MODERN: "1500-1800",
    EMPIRE: "1800-1815",
    ART_DECO: "1920-1940",
    MODERNISM: "1910-1970",
    MID_CENTURY_MODERN: "1945-1970",
    POSTMODERN: "1970-2000",
    CONTEMPORARY: "2000-Today",
};

/**
 * Creates a localized date range map using translated time markers.
 */
export const createLocalizedPeriodDateRangeMap = (t: TFunction): Record<string, string> => {
    const bce = t("landingPage.periods.rangeBce");
    const ce = t("landingPage.periods.rangeCe");
    const today = t("landingPage.periods.rangeToday");

    return {
        ...PERIOD_DATE_RANGE_MAP,
        ANTIQUITY: `3000 ${bce}-500 ${ce}`,
        CONTEMPORARY: `2000-${today}`,
    };
};

/**
 * Returns the period image asset URL for a given period key.
 * If no specific mapping is found, returns the fallback period image URL.
 *
 * @param periodKey - The stable key of the period.
 * @returns The period image URL.
 */
export const getPeriodAssetUrl = (periodKey: string): string => {
    return PERIOD_ASSET_MAP[periodKey] || FALLBACK_PERIOD_ASSET_URL;
};

/**
 * Returns the optional date range label for a period key.
 */
export const getPeriodDateRange = (
    periodKey: string,
    dateRangeMap: Record<string, string> = PERIOD_DATE_RANGE_MAP,
): string | undefined => {
    return dateRangeMap[periodKey];
};
