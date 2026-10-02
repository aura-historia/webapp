import type { OAuthClient } from "@/features/oauth/types/OAuthClient.ts";
import { client } from "@/client/client.gen";
import {
    mapToInternalOAuthClient,
    oauthConsentMetadataSchema,
} from "@/data/internal/oauth/OAuthClient.ts";
import { env } from "@/env.ts";

/** Ordinary-user consent read; replace transport when the generated operation is available. */
export async function getOAuthConsentClient(
    clientId: string,
    accessToken?: string,
): Promise<OAuthClient> {
    const result = await client
        .get<unknown, unknown>({
            baseUrl: env.VITE_API_URL ?? "https://api.dev.aura-historia.com",
            url: "/api/v1/oauth/clients/{clientId}",
            path: { clientId },
            security: [{ scheme: "bearer", type: "http" }],
            ...(accessToken ? { auth: accessToken } : {}),
            cache: "no-store",
            redirect: "error",
            throwOnError: false,
        })
        .catch(() => {
            throw new OAuthConsentUnavailableError();
        });
    if (!result.response) throw new OAuthConsentUnavailableError();
    if (result.error || !result.response.ok) {
        const status = result.response.status;
        if (status >= 400 && status < 500) throw new OAuthConsentMetadataError(status);
        throw new OAuthConsentUnavailableError();
    }
    const parsed = oauthConsentMetadataSchema.safeParse(result.data);
    if (!parsed.success || parsed.data.client_id !== clientId)
        throw new OAuthConsentUnavailableError();
    return mapToInternalOAuthClient(parsed.data);
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
