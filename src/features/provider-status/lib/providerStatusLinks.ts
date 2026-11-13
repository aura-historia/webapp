import type { TFunction } from "i18next";
import { env } from "@/env.ts";
import { CONTACT_EMAIL } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { getProductListingPath } from "@/features/product/catalog/lib/productListingUrl.ts";
import { getShopProfilePath } from "@/features/shop/profile/lib/shopProfileUrl.ts";
import { localizeUrl } from "@/i18n/routing.ts";

export type ProviderStatusScope = "listing" | "provider";

type RemovalRequest = {
    readonly scope: ProviderStatusScope;
    readonly providerName: string;
    /** The Aura Historia page the request is about. */
    readonly pageUrl: string;
};

/**
 * Interim removal request: an e-mail to the contact address with the provider, the page and the
 * points a notice should contain already in the body. The web form of #1326 replaces it; the
 * e-mail then stays only as a fallback. Only public names and URLs go into the link, never data
 * about the person writing.
 */
export function buildRemovalMailto(t: TFunction, request: RemovalRequest): string {
    const subjectKey =
        request.scope === "provider"
            ? "providerStatus.removal.mail.subjectProvider"
            : "providerStatus.removal.mail.subjectListing";
    const subject = t(subjectKey, { provider: request.providerName });
    const body = t("providerStatus.removal.mail.body", {
        provider: request.providerName,
        url: request.pageUrl,
    });
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Absolute, localized address of the Aura Historia page a removal request is about, built from the
 * configured app URL so server and client render the same link.
 */
export function providerStatusPageUrl(
    target:
        | { readonly scope: "listing"; readonly productListingTitleSlugId?: string }
        | { readonly scope: "provider"; readonly shopSlugId: string },
    lng: string,
): string | undefined {
    let path: string;
    if (target.scope === "provider") {
        path = getShopProfilePath(target.shopSlugId);
    } else if (target.productListingTitleSlugId) {
        path = getProductListingPath(target.productListingTitleSlugId);
    } else {
        return undefined;
    }
    // Same fallback as the hreflang links, for environments without a configured app URL.
    const appUrl = env.VITE_APP_URL ?? "https://aura-historia.com";
    return localizeUrl(new URL(path, appUrl).toString(), lng);
}

/** The host shown for "Found automatically on …", without a leading "www.". */
export function displayHost(url: URL | string | undefined): string | undefined {
    if (!url) return undefined;
    try {
        const host = (typeof url === "string" ? new URL(url) : url).hostname;
        return host.replace(/^www\./, "") || undefined;
    } catch {
        return undefined;
    }
}
