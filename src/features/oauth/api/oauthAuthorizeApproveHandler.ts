import { env } from "@/env.ts";
import { setListingSourceIdOnRedirectUri } from "@/features/oauth/lib/oauthAuthorizeUrls.ts";
import { z } from "zod";
import { isSupportedLanguage, localizePathname } from "@/i18n/routing.ts";
import { getMyListingSources } from "@/client";
import { mapToOAuthListingSource } from "@/data/internal/oauth/OAuthListingSource.ts";
import { getOAuthConsentClient } from "./oauthConsentMetadata.ts";
import { isValidOAuthConsentRequest } from "@/features/oauth/lib/oauthConsentValidation.ts";
import { decodeOAuthClientBrokerState } from "@/features/oauth-client-broker/lib/oauthClientBrokerState.ts";
import {
    getS256Challenge,
    signOAuthClientBrokerState,
} from "@/features/oauth-client-broker/lib/signedOAuthClientBrokerState.ts";

const DEFAULT_API_URL = "https://api.dev.aura-historia.com";
const AUTHORIZE_ENDPOINT = "/api/v1/oauth/authorize";
const LOGIN_PATH = "/login";
const AUTHORIZE_PAGE_PATH = "/oauth/authorize";

const oauthAuthorizeFormSchema = z.object({
    lng: z.string().refine(isSupportedLanguage),
    response_type: z.literal("code"),
    client_id: z.string().min(1),
    redirect_uri: z.string().min(1),
    scope: z.string().optional(),
    state: z.string().optional(),
    listing_source_id: z.string().min(1).optional(),
    requires_listing_source_id: z.enum(["true", "false"]).default("false"),
    decision: z.enum(["approve", "deny"]).default("approve"),
    code_challenge: z.string().min(1),
    code_challenge_method: z.literal("S256"),
});

type OAuthAuthorizeFormData = z.infer<typeof oauthAuthorizeFormSchema>;

export async function postOAuthAuthorizeApprove({ request }: { request: Request }) {
    if (request.headers.get("Origin") !== new URL(request.url).origin) {
        return textResponse("Invalid OAuth authorization origin.", 403);
    }
    const formData = await request.formData();
    if (formData.has("partner_shop_id") || formData.has("requires_partner_shop_id")) {
        return textResponse("Legacy shop selection is not supported. Restart authorization.", 400);
    }
    const parseResult = oauthAuthorizeFormSchema.safeParse({
        lng: getFormValue(formData, "lng"),
        response_type: getFormValue(formData, "response_type"),
        client_id: getFormValue(formData, "client_id"),
        redirect_uri: getFormValue(formData, "redirect_uri"),
        scope: getFormValue(formData, "scope"),
        state: getFormValue(formData, "state"),
        listing_source_id: getFormValue(formData, "listing_source_id"),
        requires_listing_source_id: getFormValue(formData, "requires_listing_source_id"),
        decision: getFormValue(formData, "decision"),
        code_challenge: getFormValue(formData, "code_challenge"),
        code_challenge_method: getFormValue(formData, "code_challenge_method"),
    });

    if (!parseResult.success) {
        return textResponse("Invalid OAuth authorization request.", 400);
    }

    const { getServerAuthToken } = await import("@/lib/server/amplify.server.ts");
    const authToken = await getServerAuthToken();
    if (!authToken) {
        return redirectResponse(buildLoginRedirectUrl(request, parseResult.data));
    }

    const params = parseResult.data;
    let client: Awaited<ReturnType<typeof getOAuthConsentClient>>;
    try {
        client = await getOAuthConsentClient(params.client_id);
    } catch {
        return textResponse("OAuth consent metadata is unavailable.", 503);
    }
    if (!isValidOAuthConsentRequest(client, params)) {
        return textResponse("Invalid OAuth authorization request.", 400);
    }

    try {
        if (
            params.decision === "approve" &&
            params.requires_listing_source_id === "true" &&
            !params.listing_source_id
        ) {
            return textResponse("A listing source selection is required.", 400);
        }
        if (params.decision === "approve" && params.listing_source_id) {
            const sources = await getMyListingSources({
                baseUrl: env.VITE_API_URL ?? DEFAULT_API_URL,
                headers: { Authorization: `Bearer ${authToken}` },
                cache: "no-store",
            });
            if (
                sources.error ||
                !sources.data
                    ?.map(mapToOAuthListingSource)
                    .some((source) => source.listingSourceId === params.listing_source_id)
            ) {
                return textResponse("Listing source access is unavailable.", 403);
            }
        }

        const redirectUrl = new URL(params.redirect_uri);
        const isWooCommerceBroker =
            redirectUrl.origin === new URL(request.url).origin &&
            redirectUrl.pathname === "/api/oauth/client/redirect-broker/woocommerce";
        if (isWooCommerceBroker) {
            if (params.decision === "approve" && !params.listing_source_id) {
                return textResponse("A listing source selection is required.", 400);
            }
            if (
                params.client_id !== env.OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_ID ||
                !env.OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_SECRET ||
                !params.state ||
                redirectUrl.search ||
                redirectUrl.hash
            ) {
                return textResponse("Invalid OAuth broker request.", 400);
            }
            let state: ReturnType<typeof decodeOAuthClientBrokerState>;
            try {
                state = decodeOAuthClientBrokerState(params.state);
            } catch {
                return textResponse("Invalid OAuth broker request.", 400);
            }
            if (
                (await getS256Challenge(state.codeVerifier)) !== params.code_challenge ||
                (params.decision === "approve" &&
                    state.listingSourceId !== undefined &&
                    state.listingSourceId !== params.listing_source_id)
            ) {
                return textResponse("Invalid OAuth broker request.", 400);
            }
            params.state = await signOAuthClientBrokerState(
                {
                    ...state,
                    listingSourceId:
                        params.decision === "approve" ? params.listing_source_id : undefined,
                },
                env.OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_SECRET,
                `${params.client_id}\n${params.redirect_uri}`,
            );
        }

        if (params.decision === "deny") {
            redirectUrl.searchParams.set("error", "access_denied");
            if (params.state !== undefined) redirectUrl.searchParams.set("state", params.state);
            return redirectResponse(redirectUrl.toString());
        }

        const response = await fetch(buildBackendAuthorizeUrl(params), {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            redirect: "manual",
        });

        const locationHeader = response.headers.get("Location");
        if (isRedirectResponse(response) && locationHeader) {
            const callback = new URL(locationHeader);
            const expected = new URL(params.redirect_uri);
            if (
                callback.origin !== expected.origin ||
                callback.pathname !== expected.pathname ||
                callback.hash !== expected.hash ||
                callback.username ||
                callback.password ||
                [...expected.searchParams.keys()].some(
                    (key) =>
                        key !== "state" &&
                        key !== "code" &&
                        JSON.stringify(callback.searchParams.getAll(key)) !==
                            JSON.stringify(expected.searchParams.getAll(key)),
                ) ||
                callback.searchParams.get("state") !== (params.state ?? null)
            ) {
                return textResponse("Invalid OAuth authorization response.", 502);
            }
            return redirectResponse(
                setListingSourceIdOnRedirectUri(locationHeader, params.listing_source_id),
            );
        }

        return await forwardErrorResponse(response);
    } catch {
        return textResponse("OAuth authorization request failed.", 502);
    }
}

function getFormValue(formData: FormData, key: string): string | undefined {
    const value = formData.get(key);
    return typeof value === "string" ? value : undefined;
}

function buildBackendAuthorizeUrl(params: OAuthAuthorizeFormData): string {
    const url = new URL(AUTHORIZE_ENDPOINT, env.VITE_API_URL ?? DEFAULT_API_URL);
    appendAuthorizeParams(url.searchParams, params);
    return url.toString();
}

function buildLoginRedirectUrl(request: Request, params: OAuthAuthorizeFormData): string {
    const authorizeUrl = new URL(localizePathname(AUTHORIZE_PAGE_PATH, params.lng), request.url);
    appendAuthorizeParams(authorizeUrl.searchParams, params);
    authorizeUrl.searchParams.set("requires_listing_source_id", params.requires_listing_source_id);

    const loginUrl = new URL(localizePathname(LOGIN_PATH, params.lng), request.url);
    loginUrl.searchParams.set("redirect", `${authorizeUrl.pathname}${authorizeUrl.search}`);
    return loginUrl.toString();
}

function appendAuthorizeParams(searchParams: URLSearchParams, params: OAuthAuthorizeFormData) {
    searchParams.set("response_type", params.response_type);
    searchParams.set("client_id", params.client_id);
    searchParams.set("redirect_uri", params.redirect_uri);
    searchParams.set("code_challenge", params.code_challenge);
    searchParams.set("code_challenge_method", params.code_challenge_method);

    if (params.scope !== undefined) {
        searchParams.set("scope", params.scope);
    }

    if (params.state !== undefined) {
        searchParams.set("state", params.state);
    }
}

function isRedirectResponse(response: Response): boolean {
    return response.status >= 300 && response.status < 400;
}

function redirectResponse(location: string): Response {
    return new Response(null, {
        status: 302,
        headers: {
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer",
            Location: location,
        },
    });
}

async function forwardErrorResponse(response: Response): Promise<Response> {
    const headers = new Headers();
    headers.set("Cache-Control", "no-store");
    headers.set("Referrer-Policy", "no-referrer");
    const contentType = response.headers.get("Content-Type");
    if (contentType) {
        headers.set("Content-Type", contentType);
    }

    return new Response(await response.text(), {
        status: response.status,
        headers,
    });
}

function textResponse(message: string, status: number): Response {
    return new Response(message, {
        status,
        headers: {
            "Cache-Control": "no-store",
            "Content-Type": "text/plain; charset=utf-8",
            "Referrer-Policy": "no-referrer",
        },
    });
}
