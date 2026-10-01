import { z } from "zod";

export const oauthAuthorizeSearchSchema = z
    .object({
        response_type: z.literal("code").default("code"),
        client_id: z.string().min(1),
        redirect_uri: z.url(),
        scope: z.string().optional(),
        state: z.string().optional(),
        code_challenge: z.string().min(1),
        code_challenge_method: z.literal("S256").default("S256"),
        requires_partner_shop_id: z.never().optional(),
        partner_shop_id: z.never().optional(),
        requires_listing_source_id: z
            .union([z.boolean(), z.enum(["true", "false"])])
            .transform((value) => value === true || value === "true")
            .default(false),
    })
    .transform(
        ({ requires_partner_shop_id: _legacyFlag, partner_shop_id: _legacyId, ...params }) => ({
            ...params,
            requires_listing_source_id:
                params.requires_listing_source_id ||
                new URL(params.redirect_uri).pathname ===
                    "/api/oauth/client/redirect-broker/woocommerce",
        }),
    );

export type OAuthAuthorizeSearchParams = z.infer<typeof oauthAuthorizeSearchSchema>;
