import {
    Castle,
    Crown,
    Flame,
    History,
    Landmark,
    Library,
    Mountain,
    type LucideIcon,
    Palette,
    Scroll,
    Sword,
} from "lucide-react";

/**
 * Mapping of period keys to Lucide icons.
 * This is used to display a representative icon for each period in the carousel.
 */
export const PERIOD_ICON_MAP: Record<string, LucideIcon> = {
    RENAISSANCE: Palette,
    BAROQUE: Crown,
    ROCOCO: Landmark,
    NEOCLASSICISM: Landmark,
    ROMANTICISM: Mountain,
    REALISM: Scroll,
    IMPRESSIONISM: Palette,
    ART_NOUVEAU: Flame,
    ART_DECO: Castle,
    MODERNISM: Library,
    POSTMODERNISM: History,
    MEDIEVAL: Sword,
    ANCIENT: Landmark,
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
