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

/**
 * Mapping of period keys to Lucide icons.
 * This is used to display a representative icon for each period in the carousel.
 */
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
 * Returns the Lucide icon associated with a given period key.
 * If no specific mapping is found, returns the fallback icon.
 *
 * @param periodKey - The stable key of the period.
 * @returns The Lucide icon component.
 */
export const getPeriodIcon = (periodKey: string): LucideIcon => {
    return PERIOD_ICON_MAP[periodKey] || FALLBACK_PERIOD_ICON;
};
