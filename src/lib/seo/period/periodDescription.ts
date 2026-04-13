import i18n from "@/i18n/i18n.ts";

const DESCRIPTION_KEY_PREFIX = "period.descriptions";
const DEFAULT_DESCRIPTION_KEY = "period.header.defaultDescription";

function normalizePeriodIdentifier(identifier: string): string {
    return identifier
        .trim()
        .toUpperCase()
        .replaceAll(/(^[^A-Z0-9]+)|([^A-Z0-9]+$)|[^A-Z0-9]+/g, (_, leading, trailing) =>
            leading || trailing ? "" : "_",
        );
}

/**
 * Resolves a period i18n description key from either a stable period key
 * (e.g. `EARLY_MODERN`) or a route id (e.g. `early-modern`).
 */
export function resolvePeriodDescriptionKey(identifier: string | undefined): string {
    if (!identifier) {
        return DEFAULT_DESCRIPTION_KEY;
    }

    const rawKey = `${DESCRIPTION_KEY_PREFIX}.${identifier}`;
    if (i18n.exists(rawKey)) {
        return rawKey;
    }

    const normalized = normalizePeriodIdentifier(identifier);
    if (!normalized) {
        return DEFAULT_DESCRIPTION_KEY;
    }

    const normalizedKey = `${DESCRIPTION_KEY_PREFIX}.${normalized}`;
    return i18n.exists(normalizedKey) ? normalizedKey : DEFAULT_DESCRIPTION_KEY;
}

export function getPeriodDescription(identifier: string | undefined): string {
    return i18n.t(resolvePeriodDescriptionKey(identifier));
}
