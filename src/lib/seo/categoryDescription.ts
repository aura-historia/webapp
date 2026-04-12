import i18n from "@/i18n/i18n.ts";

const DESCRIPTION_KEY_PREFIX = "category.descriptions";
const DEFAULT_DESCRIPTION_KEY = `${DESCRIPTION_KEY_PREFIX}.default`;

function normalizeCategoryIdentifier(identifier: string): string {
    return identifier
        .trim()
        .toUpperCase()
        .replaceAll(/(^[^A-Z0-9]+)|([^A-Z0-9]+$)|[^A-Z0-9]+/g, (_, leading, trailing) =>
            leading || trailing ? "" : "_",
        );
}

/**
 * Resolves a category i18n description key from either a stable category key
 * (e.g. `ANCIENT_POTTERY`) or a route id (e.g. `ancient-pottery`).
 */
export function resolveCategoryDescriptionKey(identifier: string | undefined): string {
    if (!identifier) {
        return DEFAULT_DESCRIPTION_KEY;
    }

    const rawKey = `${DESCRIPTION_KEY_PREFIX}.${identifier}`;
    if (i18n.exists(rawKey)) {
        return rawKey;
    }

    const normalized = normalizeCategoryIdentifier(identifier);
    if (!normalized) {
        return DEFAULT_DESCRIPTION_KEY;
    }

    const normalizedKey = `${DESCRIPTION_KEY_PREFIX}.${normalized}`;
    return i18n.exists(normalizedKey) ? normalizedKey : DEFAULT_DESCRIPTION_KEY;
}

export function getCategoryDescription(identifier: string | undefined): string {
    return i18n.t(resolveCategoryDescriptionKey(identifier));
}
