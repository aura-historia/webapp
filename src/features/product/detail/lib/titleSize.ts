/**
 * How large the listing title is set on the product page. Decided from the character count, never
 * a measurement, so the server and the first client render agree and nothing shifts after mount.
 */
export type ProductTitleSize = "short" | "medium" | "long";

const SHORT_MAX = 60;
const MEDIUM_MAX = 110;

/** Over this, the long size alone still runs past four lines, so the title starts clamped. */
export const TITLE_CLAMP_CHARACTERS = 180;

export function productTitleSize(title: string): ProductTitleSize {
    const length = title.trim().length;
    if (length <= SHORT_MAX) return "short";
    if (length <= MEDIUM_MAX) return "medium";
    return "long";
}

export function isTitleClampable(title: string): boolean {
    return title.trim().length > TITLE_CLAMP_CHARACTERS;
}
