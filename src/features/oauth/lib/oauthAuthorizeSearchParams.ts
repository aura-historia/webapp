import { z } from "zod";

export const oauthAuthorizeSearchSchema = z.object({
    response_type: z.string().default("code"),
    client_id: z.string(),
    redirect_uri: z.string(),
    scope: z.string().optional(),
    state: z.string().optional(),
    code_challenge: z.string(),
    code_challenge_method: z.string().default("S256"),
});

export type OAuthAuthorizeSearchParams = z.infer<typeof oauthAuthorizeSearchSchema>;
