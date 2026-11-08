import {
    getOAuthConsentClient as getOAuthConsentClientDto,
    getOAuthMetadataDocumentConsentClient as getOAuthMetadataDocumentConsentClientDto,
} from "@/client";
import {
    mapToInternalOAuthClient,
    mapToInternalOAuthMetadataDocumentClient,
    type OAuthClient,
    type OAuthMetadataDocumentClient,
} from "@/data/internal/oauth/OAuthClient.ts";
import { env } from "@/env.ts";
import { getApiBaseUrl } from "@/lib/apiBaseUrl.ts";

/** Backend codes of a consent metadata refusal that the consent page tells apart. */
const CONSENT_METADATA_ERROR_CODES = [
    "OAUTH_INVALID_CLIENT",
    "OAUTH_INVALID_REDIRECT_URI",
    "BAD_QUERY_PARAMETER_VALUE",
] as const;

export type OAuthConsentMetadataErrorCode = (typeof CONSENT_METADATA_ERROR_CODES)[number];

/** Map the generated ordinary-user consent response before providing it to the application. */
export async function getOAuthConsentClient(clientId: string): Promise<OAuthClient> {
    const result = await getOAuthConsentClientDto({
        baseUrl: getApiBaseUrl(env.VITE_API_URL),
        path: { clientId },
        cache: "no-store",
        redirect: "error",
        throwOnError: false,
    }).catch(() => {
        throw new OAuthConsentUnavailableError();
    });
    if (!result.response) throw new OAuthConsentUnavailableError();
    if (result.error || !result.response.ok) {
        throw getConsentMetadataFailure(result.response.status, result.error);
    }
    if (result.data?.client_id !== clientId) throw new OAuthConsentUnavailableError();
    return mapToInternalOAuthClient(result.data);
}

/**
 * Read the consent metadata of a metadata document client. The backend loads and validates the
 * client's current document and answers only when it lists `redirectUri`, so a successful read is
 * what allows the consent page to offer approval, or a denial to that callback.
 */
export async function getOAuthMetadataDocumentConsentClient(
    clientId: string,
    redirectUri: string,
): Promise<OAuthMetadataDocumentClient> {
    const result = await getOAuthMetadataDocumentConsentClientDto({
        baseUrl: getApiBaseUrl(env.VITE_API_URL),
        query: { client_id: clientId, redirect_uri: redirectUri },
        cache: "no-store",
        redirect: "error",
        throwOnError: false,
    }).catch(() => {
        throw new OAuthConsentUnavailableError();
    });
    if (!result.response) throw new OAuthConsentUnavailableError();
    if (result.error || !result.response.ok) {
        throw getConsentMetadataFailure(result.response.status, result.error);
    }
    if (result.data?.client_id !== clientId) throw new OAuthConsentUnavailableError();
    return mapToInternalOAuthMetadataDocumentClient(result.data, redirectUri);
}

/** A refused request (4xx) keeps only its status and a known code; anything else is unavailable. */
function getConsentMetadataFailure(status: number, error: unknown): Error {
    if (status >= 400 && status < 500) {
        return new OAuthConsentMetadataError(status, getKnownErrorCode(error));
    }
    return new OAuthConsentUnavailableError();
}

function getKnownErrorCode(error: unknown): OAuthConsentMetadataErrorCode | undefined {
    if (typeof error !== "object" || error === null || !("error" in error)) {
        return undefined;
    }
    return CONSENT_METADATA_ERROR_CODES.find((code) => code === error.error);
}

export class OAuthConsentMetadataError extends Error {
    constructor(
        readonly status: number,
        readonly code?: OAuthConsentMetadataErrorCode,
    ) {
        super("OAuth consent metadata request failed.");
    }
}

export class OAuthConsentUnavailableError extends Error {
    constructor() {
        super("OAuth consent metadata is unavailable.");
    }
}
