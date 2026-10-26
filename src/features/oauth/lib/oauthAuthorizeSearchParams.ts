import { z } from "zod";

/**
 * The router JSON-parses search values, so a numeric, boolean or `null` value such as `state=123`
 * arrives as a non-string. OAuth echoes protocol values unchanged, so restore their original text.
 */
const oauthParameter = z.preprocess(
    (value) =>
        typeof value === "number" || typeof value === "boolean" || value === null
            ? String(value)
            : value,
    z.string(),
);

export const oauthAuthorizeSearchSchema = z.object({
    response_type: oauthParameter.default("code"),
    client_id: oauthParameter,
    redirect_uri: oauthParameter,
    scope: oauthParameter.optional(),
    state: oauthParameter.optional(),
    /** RFC 8707 resource indicator, e.g. the MCP endpoint; the backend validates and binds it. */
    resource: oauthParameter.optional(),
    code_challenge: oauthParameter,
    code_challenge_method: oauthParameter.default("S256"),
    requires_listing_source_id: z
        .union([z.boolean(), z.enum(["true", "false"])])
        .transform((value) => value === true || value === "true")
        .default(false),
});

export type OAuthAuthorizeSearchParams = z.infer<typeof oauthAuthorizeSearchSchema>;
