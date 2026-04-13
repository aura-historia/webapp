import i18n from "@/i18n/i18n.ts";

const DESCRIPTION_KEY_PREFIX = "combination.descriptions";
const DEFAULT_DESCRIPTION_KEY = `${DESCRIPTION_KEY_PREFIX}.default`;

export function getCombinationDescriptionKey(slug: string | undefined): string {
    if (!slug) {
        return DEFAULT_DESCRIPTION_KEY;
    }

    const key = `${DESCRIPTION_KEY_PREFIX}.${slug}`;
    return i18n.exists(key) ? key : DEFAULT_DESCRIPTION_KEY;
}

export function getCombinationDescription(slug: string | undefined): string {
    return i18n.t(getCombinationDescriptionKey(slug));
}
