export const OAUTH_AUTHORIZE_APPROVE_ACTION = "/api/oauth/authorize/approve";
const LISTING_SOURCE_ID_PARAM = "listing_source_id";

export function getSafeHttpsUrl(url: string | undefined): string | undefined {
    if (!url) {
        return undefined;
    }

    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === "https:" && !parsedUrl.username && !parsedUrl.password
            ? url
            : undefined;
    } catch {
        return undefined;
    }
}

export function getListingSourceIdFromRedirectUri(redirectUri: string): string | undefined {
    try {
        return new URL(redirectUri).searchParams.get(LISTING_SOURCE_ID_PARAM) ?? undefined;
    } catch {
        return undefined;
    }
}

export function setListingSourceIdOnRedirectUri(
    redirectUri: string,
    listingSourceId: string | undefined,
): string {
    try {
        const url = new URL(redirectUri);
        url.searchParams.delete("partner_shop_id");
        url.searchParams.delete("shopId");

        if (listingSourceId) {
            url.searchParams.set(LISTING_SOURCE_ID_PARAM, listingSourceId);
        } else {
            url.searchParams.delete(LISTING_SOURCE_ID_PARAM);
        }

        return url.toString();
    } catch {
        return redirectUri;
    }
}
