import { useState } from "react";
import type { OAuthListingSource } from "@/features/oauth/hooks/useOAuthListingSources.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import { getListingSourceIdFromRedirectUri } from "@/features/oauth/lib/oauthAuthorizeUrls.ts";

interface UseOAuthAuthorizeListingSourceSelectionParams {
    readonly searchParams: OAuthAuthorizeSearchParams;
    readonly listingSources: OAuthListingSource[];
}

interface ListingSourceSelection {
    readonly authorizationRequestId: string;
    readonly listingSourceId: string | undefined;
}

export function useOAuthAuthorizeListingSourceSelection({
    searchParams,
    listingSources,
}: UseOAuthAuthorizeListingSourceSelectionParams) {
    const requiresListingSourceId = searchParams.requires_listing_source_id;
    const authorizationRequestId = getAuthorizationRequestId(searchParams);

    const redirectUriListingSourceId = requiresListingSourceId
        ? getListingSourceIdFromRedirectUri(searchParams.redirect_uri)
        : undefined;

    const [selection, setSelection] = useState<ListingSourceSelection>({
        authorizationRequestId,
        listingSourceId: redirectUriListingSourceId,
    });
    // Discard the previous request's choice before rendering the new request.
    if (selection.authorizationRequestId !== authorizationRequestId) {
        setSelection({ authorizationRequestId, listingSourceId: redirectUriListingSourceId });
    }
    const selectedListingSourceId =
        selection.authorizationRequestId === authorizationRequestId
            ? selection.listingSourceId
            : redirectUriListingSourceId;

    const selectedListingSource = selectedListingSourceId
        ? listingSources.find((source) => source.listingSourceId === selectedListingSourceId)
        : undefined;
    const effectiveListingSource = requiresListingSourceId
        ? listingSources.length === 1
            ? listingSources[0]
            : selectedListingSource
        : undefined;
    const listingSourceId = effectiveListingSource?.listingSourceId;

    return {
        effectiveListingSource,
        effectiveListingSourceId: listingSourceId,
        listingSourceId,
        requestedScopes: searchParams.scope?.split(" ").filter(Boolean) ?? [],
        requiresListingSourceSelection: requiresListingSourceId && listingSources.length > 1,
        shouldShowSelectedListingSource: requiresListingSourceId && listingSources.length === 1,
        selectListingSource: (listingSourceId: string) =>
            setSelection({
                authorizationRequestId,
                listingSourceId,
            }),
    };
}

function getAuthorizationRequestId(searchParams: OAuthAuthorizeSearchParams): string {
    return JSON.stringify([
        searchParams.client_id,
        searchParams.redirect_uri,
        searchParams.state,
        searchParams.requires_listing_source_id,
        searchParams.code_challenge,
        searchParams.scope,
        searchParams.response_type,
        searchParams.code_challenge_method,
    ]);
}
