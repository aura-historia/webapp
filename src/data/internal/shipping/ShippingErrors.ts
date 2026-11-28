import type { ApiErrorData } from "@/data/internal/hooks/ApiError.ts";

/**
 * Shipping error codes of the pinned contract, grouped by what a caller should do. Listing reads
 * fail with the enrichment codes; management and delivery commands add the revision, reference
 * and creation codes. The `SHIPPING_IMPORT_*` codes concern producer imports, which the browser
 * never sends.
 */
export const SHIPPING_ERROR_KINDS = {
    /** 503: retry the unchanged request later. */
    SHIPPING_TEMPORARILY_UNAVAILABLE: "UNAVAILABLE",
    /** 500: stored shipping dependencies are invalid; not retryable by the user. */
    SHIPPING_STORAGE_ERROR: "STORAGE",
    /** 409: refetch the current revision and decide again; never resend blindly. */
    SHIPPING_STALE_REVISION: "STALE",
    SHIPPING_REVISION_EXHAUSTED: "REVISION_EXHAUSTED",
    /** 409: the creation key was used for different content. */
    SHIPPING_CREATION_KEY_CONFLICT: "CREATION_CONFLICT",
    SHIPPING_PROFILE_NOT_FOUND: "NOT_FOUND",
    SHIPPING_LOCATION_NOT_FOUND: "NOT_FOUND",
    /** 409: restore the profile first. */
    SHIPPING_PROFILE_RETIRED: "INELIGIBLE",
    SHIPPING_REFERENCE_INELIGIBLE: "INELIGIBLE",
    SHIPPING_IMPORT_AUTHORITY_STALE: "IMPORT",
    SHIPPING_IMPORT_OWNERSHIP_CONFLICT: "IMPORT",
    SHIPPING_IMPORT_REQUEST_CONFLICT: "IMPORT",
    SHIPPING_IMPORT_OUT_OF_ORDER: "IMPORT",
    SHIPPING_IMPORT_IDENTITY_EXISTS: "IMPORT",
    SHIPPING_IMPORT_DEPENDENCY_MISSING: "IMPORT",
} as const;

export type ShippingErrorCode = keyof typeof SHIPPING_ERROR_KINDS;
export type ShippingErrorKind = (typeof SHIPPING_ERROR_KINDS)[ShippingErrorCode] | "OTHER";

export function isShippingErrorCode(code: string): code is ShippingErrorCode {
    return Object.hasOwn(SHIPPING_ERROR_KINDS, code);
}

/** `OTHER` for codes outside shipping, which the generic API error handling covers. */
export function classifyShippingError(error: ApiErrorData): ShippingErrorKind {
    return isShippingErrorCode(error.error) ? SHIPPING_ERROR_KINDS[error.error] : "OTHER";
}

/** Whether repeating the identical request later may succeed (a lost response included). */
export function isRetryableShippingError(error: ApiErrorData): boolean {
    return classifyShippingError(error) === "UNAVAILABLE" || error.status === 503;
}
