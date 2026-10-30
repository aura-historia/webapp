import {
    BROKER_MAX_REDIRECT_URI_LENGTH,
    BROKER_RESERVED_REDIRECT_PARAMS,
} from "@/features/oauth-client-broker/lib/brokerProtocol.ts";
import { isLoopbackHostname } from "@/features/oauth-client-broker/lib/brokerUrls.ts";

// biome-ignore lint/suspicious/noControlCharactersInRegex: control characters are what is rejected.
const UNSAFE_CHARACTERS = /[\u0000- \u007f\\#]/;

/**
 * Validates the exact WordPress return URI. Only canonical absolute URLs pass: what the plugin
 * sends is what the broker stores, shows and returns to, with no normalization in between.
 */
export function validateMerchantRedirectUri(
    rawUri: string,
    options: { readonly allowLoopbackHttp: boolean },
): URL | undefined {
    if (rawUri.length > BROKER_MAX_REDIRECT_URI_LENGTH || UNSAFE_CHARACTERS.test(rawUri)) {
        return undefined;
    }

    let url: URL;
    try {
        url = new URL(rawUri);
    } catch {
        return undefined;
    }

    // Round-tripping rejects case, default-port, dot-segment and percent-encoding variants.
    if (url.toString() !== rawUri || url.username || url.password) {
        return undefined;
    }

    const isHttps = url.protocol === "https:";
    const isLoopbackHttp =
        options.allowLoopbackHttp && url.protocol === "http:" && isLoopbackHostname(url.hostname);
    if (!isHttps && !isLoopbackHttp) {
        return undefined;
    }

    return hasUnambiguousStaticQuery(url) ? url : undefined;
}

/** The merchant's own static query, with the handoff parameters appended after it unchanged. */
export function buildMerchantHandoffUrl(
    merchantRedirectUri: string,
    handoff: {
        readonly transactionId: string;
        readonly clientState: string;
        readonly completionCode: string;
    },
): string {
    const handoffQuery = new URLSearchParams({
        transaction_id: handoff.transactionId,
        state: handoff.clientState,
        completion_code: handoff.completionCode,
    });
    const separator = new URL(merchantRedirectUri).search ? "&" : "?";
    return `${merchantRedirectUri}${separator}${handoffQuery.toString()}`;
}

/** The address shown to the user: the origin that receives the connection. */
export function getMerchantRecipient(merchantRedirectUri: string): string {
    return new URL(merchantRedirectUri).origin;
}

function hasUnambiguousStaticQuery(url: URL): boolean {
    const query = url.search.slice(1);
    if (url.search === "" && !url.href.endsWith("?")) return true;
    if (query === "") return false;

    const seen = new Set<string>();
    for (const segment of query.split("&")) {
        const rawKey = segment.split("=", 1)[0];
        if (!rawKey) return false;

        let key: string;
        try {
            key = decodeURIComponent(rawKey.replaceAll("+", " ")).toLowerCase();
        } catch {
            return false;
        }
        if (seen.has(key) || BROKER_RESERVED_REDIRECT_PARAMS.has(key)) return false;
        seen.add(key);
    }
    return true;
}
