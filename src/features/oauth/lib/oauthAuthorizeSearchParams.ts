import { z } from "zod";

export const oauthAuthorizeSearchSchema = z.object({
    response_type: z.string().default("code"),
    client_id: z.string(),
    redirect_uri: z.string(),
    scope: z.string().optional(),
    state: z.string().optional(),
    /** RFC 8707 resource indicator, e.g. the MCP endpoint; the backend validates and binds it. */
    resource: z.string().optional(),
    code_challenge: z.string(),
    code_challenge_method: z.string().default("S256"),
    requires_listing_source_id: z
        .union([z.boolean(), z.enum(["true", "false"])])
        .transform((value) => value === true || value === "true")
        .default(false),
});

export type OAuthAuthorizeSearchParams = z.infer<typeof oauthAuthorizeSearchSchema>;
