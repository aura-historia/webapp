import type {
    OAuthClientConsentMetadataData,
    OAuthMetadataDocumentConsentClientData,
} from "@/client";
import type { AccessTokenScope } from "@/data/internal/access-tokens/AccessTokenScope.ts";

export type OAuthScope = AccessTokenScope;

/** A confidential client an administrator registered (`oc_…`), such as Shopify or WooCommerce. */
export type OAuthClient = {
    readonly kind: "registered";
    readonly clientId: string;
    readonly clientName: string;
    readonly tosUri: string;
    readonly policyUri: string;
    readonly clientUri: string;
    readonly logoUri: string;
    readonly redirectUris: readonly string[];
    readonly scopes: readonly OAuthScope[];
};

/**
 * A public client identified by the HTTPS URL of its Client ID Metadata Document, such as an MCP
 * agent. Name, client URI and logo are what the document claims about itself; the backend verified
 * the two hosts and that the document lists the requested callback.
 */
export type OAuthMetadataDocumentClient = {
    readonly kind: "metadataDocument";
    readonly clientId: string;
    readonly clientName: string;
    readonly clientUri?: string;
    readonly logoUri?: string;
    /** Host of `client_id`, which serves the document. */
    readonly clientHost: string;
    /** Host of the requested callback. */
    readonly redirectUriHost: string;
    /** The callback the consent metadata accepted: the only destination a denial may use. */
    readonly redirectUri: string;
    /** Every callback the document lists returns to the user's own device. */
    readonly loopbackRedirectUrisOnly: boolean;
    /** The scope ceiling: the ordinary-user scopes such a client may request. */
    readonly scopes: readonly string[];
    /** Scopes the signed-in user already granted this client. */
    readonly grantedScopes: readonly string[];
};

/** Consent metadata of either kind of client, told apart by the requested `client_id`. */
export type OAuthConsentClient = OAuthClient | OAuthMetadataDocumentClient;

/**
 * A `client_id` that parses as an `https` URL names a metadata document client; anything else is a
 * registered client. The backend applies the same rule and never falls back from one to the other.
 */
export function isMetadataDocumentClientId(clientId: string): boolean {
    try {
        return new URL(clientId).protocol === "https:";
    } catch {
        return false;
    }
}

export function mapToInternalOAuthClient(data: OAuthClientConsentMetadataData): OAuthClient {
    return {
        kind: "registered",
        clientId: data.client_id,
        clientName: data.client_name,
        tosUri: data.tos_uri,
        policyUri: data.policy_uri,
        clientUri: data.client_uri,
        logoUri: data.logo_uri,
        redirectUris: [...data.redirect_uris],
        scopes: [...data.scope],
    };
}

/**
 * Map the consent metadata of a metadata document client. `redirectUri` is the callback the
 * metadata was requested, and therefore validated, for; the response names only its host.
 */
export function mapToInternalOAuthMetadataDocumentClient(
    data: OAuthMetadataDocumentConsentClientData,
    redirectUri: string,
): OAuthMetadataDocumentClient {
    return {
        kind: "metadataDocument",
        clientId: data.client_id,
        clientName: data.client_name,
        ...(data.client_uri != null && { clientUri: data.client_uri }),
        ...(data.logo_uri != null && { logoUri: data.logo_uri }),
        clientHost: data.client_host,
        redirectUriHost: data.redirect_uri_host,
        redirectUri,
        loopbackRedirectUrisOnly: data.loopback_redirect_uris_only,
        scopes: [...data.scope],
        grantedScopes: [...data.granted_scope],
    };
}
