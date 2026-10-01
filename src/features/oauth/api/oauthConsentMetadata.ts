import type { OAuthClient } from "@/features/oauth/types/OAuthClient.ts";

/** MIG-00 has not supplied an ordinary-user metadata contract. Never use admin credentials here. */
export async function getOAuthConsentClient(_clientId: string): Promise<OAuthClient> {
    throw new OAuthConsentUnavailableError();
}

export class OAuthConsentUnavailableError extends Error {
    constructor() {
        super("OAuth consent metadata is unavailable.");
    }
}
