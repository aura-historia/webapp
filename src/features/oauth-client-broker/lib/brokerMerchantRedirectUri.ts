import { BROKER_MAX_REDIRECT_URI_LENGTH } from "@/features/oauth-client-broker/lib/brokerProtocol.ts";
import { isLoopbackHostname } from "@/features/oauth-client-broker/lib/brokerUrls.ts";

/** The plugin's settings page (`Plugin::PAGE_SLUG`), the only page that receives a handoff. */
export const WOOCOMMERCE_PLUGIN_PAGE = "aura-historia-partner-connect";
const ADMIN_PAGE_SUFFIX = "wp-admin/admin.php";
const ADMIN_PAGE_QUERY = `?page=${WOOCOMMERCE_PLUGIN_PAGE}`;

// biome-ignore lint/suspicious/noControlCharactersInRegex: control characters are what is rejected.
const UNSAFE_CHARACTERS = /[\u0000- \u007f\\#]/;

/**
 * Validates the exact WordPress return URI: the plugin's settings page as WordPress builds it,
 * `{site}/wp-admin/admin.php?page=aura-historia-partner-connect`. Only canonical absolute URLs
 * pass, so what the plugin sends is what the broker stores, shows and returns to.
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

    return url.pathname.endsWith(`/${ADMIN_PAGE_SUFFIX}`) && url.search === ADMIN_PAGE_QUERY
        ? url
        : undefined;
}

/** The return URI with the handoff parameters appended after the plugin's page parameter. */
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
    return `${merchantRedirectUri}&${handoffQuery.toString()}`;
}

/**
 * The WordPress site address that receives the connection: origin and install path, without the
 * admin page (`https://shop.example/` or `https://host.example/store/`).
 */
export function getMerchantSiteAddress(merchantRedirectUri: string): string {
    const url = new URL(merchantRedirectUri);
    return `${url.origin}${url.pathname.slice(0, -ADMIN_PAGE_SUFFIX.length)}`;
}

/** The site address as shown to people: `shop.example` or `host.example/store`. */
export function formatMerchantSiteAddress(siteAddress: string): string {
    const url = new URL(siteAddress);
    return `${url.host}${url.pathname.replace(/\/$/, "")}`;
}
