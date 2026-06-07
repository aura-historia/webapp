export const OAUTH_AUTHORIZE_APPROVE_ACTION = "/api/oauth/authorize/approve";
const PARTNER_SHOP_ID_PARAM = "partner_shop_id";

export function getSafeHttpsUrl(url: string | undefined): string | undefined {
    if (!url) {
        return undefined;
    }

    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === "https:" ? url : undefined;
    } catch {
        return undefined;
    }
}

export function getPartnerShopIdFromRedirectUri(redirectUri: string): string | undefined {
    try {
        return new URL(redirectUri).searchParams.get(PARTNER_SHOP_ID_PARAM) ?? undefined;
    } catch {
        return undefined;
    }
}

export function setPartnerShopIdOnRedirectUri(
    redirectUri: string,
    partnerShopId: string | undefined,
): string {
    try {
        const url = new URL(redirectUri);

        if (partnerShopId) {
            url.searchParams.set(PARTNER_SHOP_ID_PARAM, partnerShopId);
        } else {
            url.searchParams.delete(PARTNER_SHOP_ID_PARAM);
        }

        return url.toString();
    } catch {
        return redirectUri;
    }
}
