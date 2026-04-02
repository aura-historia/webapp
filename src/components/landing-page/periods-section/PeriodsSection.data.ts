import {
    Castle,
    Crown,
    Flame,
    History,
    Landmark,
    Library,
    type LucideIcon,
    Palette,
    Scroll,
    Sword,
    Hammer,
    Gem,
    Compass,
    AppWindow,
} from "lucide-react";
import type { TFunction } from "i18next";

/**
 * Mapping of period keys to Lucide icons.
 * This is used to display a representative icon for each period in the carousel.
 */
// TODO: Replace with s3 links to generated images
export const PERIOD_ICON_MAP: Record<string, LucideIcon> = {
    ANTIQUITY: Landmark,
    ART_DECO: Castle,
    ARTS_AND_CRAFTS: Hammer,
    BAROQUE: Crown,
    BIEDERMEIER: Scroll,
    EMPIRE: Gem,
    EARLY_MODERN: Library,
    EARLY_MEDIEVAL: Sword,
    GOTHIC: Castle,
    HISTORICISM: History,
    ART_NOUVEAU: Flame,
    NEOCLASSICISM: Landmark,
    MANNERISM: Palette,
    MID_CENTURY_MODERN: AppWindow,
    MODERNISM: Library,
    POSTMODERN: History,
    RENAISSANCE: Palette,
    ROCOCO: Landmark,
    ROMANESQUE: Landmark,
    CONTEMPORARY: Compass,
};

/**
 * Fallback icon for periods without a specific mapping.
 */
export const FALLBACK_PERIOD_ICON = History;

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
 * Returns the Lucide icon associated with a given period key.
 * If no specific mapping is found, returns the fallback icon.
 *
 * @param periodKey - The stable key of the period.
 * @returns The Lucide icon component.
 */
export const getPeriodIcon = (periodKey: string): LucideIcon => {
    return PERIOD_ICON_MAP[periodKey] || FALLBACK_PERIOD_ICON;
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
