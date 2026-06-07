import { useState } from "react";
import type { OAuthPartnerShop } from "@/features/oauth/hooks/useOAuthPartnerShops.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import {
    getPartnerShopIdFromRedirectUri,
    setPartnerShopIdOnRedirectUri,
} from "@/features/oauth/lib/oauthAuthorizeUrls.ts";

interface UseOAuthAuthorizePartnerShopSelectionParams {
    readonly searchParams: OAuthAuthorizeSearchParams;
    readonly partnerShops: OAuthPartnerShop[];
}

interface PartnerShopSelection {
    readonly authorizationRequestId: string;
    readonly partnerShopId: string | undefined;
}

export function useOAuthAuthorizePartnerShopSelection({
    searchParams,
    partnerShops,
}: UseOAuthAuthorizePartnerShopSelectionParams) {
    const requiresPartnerShopId = searchParams.requires_partner_shop_id;
    const authorizationRequestId = getAuthorizationRequestId(searchParams);

    const redirectUriPartnerShopId = requiresPartnerShopId
        ? getPartnerShopIdFromRedirectUri(searchParams.redirect_uri)
        : undefined;

    const [selection, setSelection] = useState<PartnerShopSelection>({
        authorizationRequestId,
        partnerShopId: redirectUriPartnerShopId,
    });
    const selectedPartnerShopId =
        selection.authorizationRequestId === authorizationRequestId
            ? selection.partnerShopId
            : redirectUriPartnerShopId;

    const selectedPartnerShop = selectedPartnerShopId
        ? partnerShops.find((shop) => shop.shopId === selectedPartnerShopId)
        : undefined;
    const effectivePartnerShop = partnerShops.length === 1 ? partnerShops[0] : selectedPartnerShop;
    const effectiveRedirectUri = requiresPartnerShopId
        ? setPartnerShopIdOnRedirectUri(searchParams.redirect_uri, effectivePartnerShop?.shopId)
        : searchParams.redirect_uri;

    return {
        effectivePartnerShop,
        effectivePartnerShopId: effectivePartnerShop?.shopId,
        effectiveRedirectUri,
        requestedScopes: searchParams.scope?.split(" ").filter(Boolean) ?? [],
        requiresPartnerShopSelection: requiresPartnerShopId && partnerShops.length > 1,
        shouldShowSelectedPartnerShop: requiresPartnerShopId && partnerShops.length === 1,
        selectPartnerShop: (partnerShopId: string) =>
            setSelection({
                authorizationRequestId,
                partnerShopId,
            }),
    };
}

function getAuthorizationRequestId(searchParams: OAuthAuthorizeSearchParams): string {
    return `${searchParams.client_id}:${searchParams.redirect_uri}:${searchParams.state ?? ""}`;
}
