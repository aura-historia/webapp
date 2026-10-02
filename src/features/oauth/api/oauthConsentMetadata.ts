import type { OAuthClient } from "@/features/oauth/types/OAuthClient.ts";
import { getOAuthConsentClient as getOAuthConsentClientDto } from "@/client";
import { mapToInternalOAuthClient } from "@/data/internal/oauth/OAuthClient.ts";
import { env } from "@/env.ts";

/** Map the generated ordinary-user consent response before providing it to the application. */
export async function getOAuthConsentClient(clientId: string): Promise<OAuthClient> {
    const result = await getOAuthConsentClientDto({
        baseUrl: env.VITE_API_URL ?? "https://api.dev.aura-historia.com",
        path: { clientId },
        cache: "no-store",
        redirect: "error",
        throwOnError: false,
    }).catch(() => {
        throw new OAuthConsentUnavailableError();
    });
    if (!result.response) throw new OAuthConsentUnavailableError();
    if (result.error || !result.response.ok) {
        const status = result.response.status;
        if (status >= 400 && status < 500) throw new OAuthConsentMetadataError(status);
        throw new OAuthConsentUnavailableError();
    }
    if (!result.data || result.data.client_id !== clientId)
        throw new OAuthConsentUnavailableError();
    return mapToInternalOAuthClient(result.data);
}

export class OAuthConsentMetadataError extends Error {
    constructor(readonly status: number) {
        super("OAuth consent metadata request failed.");
    }
}

export class OAuthConsentUnavailableError extends Error {
    constructor() {
        super("OAuth consent metadata is unavailable.");
    }
}
