import { env } from "@/env.ts";
import {
    decodeOAuthClientBrokerState,
    setOAuthErrorOnRedirectUri,
    setThirdPartyExchangeCodeOnRedirectUri,
} from "@/features/oauth-client-broker/lib/oauthClientBrokerState.ts";

const DEFAULT_API_URL = "https://api.dev.aura-historia.com";
const TOKEN_ENDPOINT = "/api/v1/oauth/token";
const THIRD_PARTY_EXCHANGE_CODE_RESPONSE_FIELD = "third_party_exchange_code";
const BROKER_HANDLED_CALLBACK_PARAMS = new Set([
    "access_token",
    "code",
    "error",
    "error_description",
    "error_uri",
    "id_token",
    "state",
    "third_party_exchange_code",
    "token",
]);

interface OAuthBrokerConfig {
    readonly clientId: string;
    readonly clientSecret: string;
}

const OAUTH_CLIENT_REDIRECT_BROKER_APPS = {
    woocommerce: {
        getClientId: () => env.OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_ID,
        getClientSecret: () => env.OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_SECRET,
    },
} as const;

type OAuthClientRedirectBrokerApp = keyof typeof OAUTH_CLIENT_REDIRECT_BROKER_APPS;

type OAuthClientRedirectBrokerHandler = (ctx: { request: Request }) => Promise<Response>;

export const getWooCommerceOAuthClientRedirectBroker =
    createOAuthClientRedirectBrokerHandler("woocommerce");

export function createOAuthClientRedirectBrokerHandler(
    app: OAuthClientRedirectBrokerApp,
): OAuthClientRedirectBrokerHandler {
    return ({ request }) => getOAuthClientRedirectBroker({ request, app });
}

async function getOAuthClientRedirectBroker({
    request,
    app,
}: {
    request: Request;
    app: OAuthClientRedirectBrokerApp;
}) {
    const requestUrl = new URL(request.url);
    const encodedState = requestUrl.searchParams.get("state");

    if (!encodedState) {
        return textResponse("Invalid OAuth broker callback.", 400);
    }

    let brokerState: ReturnType<typeof decodeOAuthClientBrokerState>;
    try {
        brokerState = decodeOAuthClientBrokerState(encodedState);
    } catch {
        return textResponse("Invalid OAuth broker state.", 400);
    }

    const forwardedParams = getForwardedOAuthRedirectParams(requestUrl.searchParams);
    const authorizationError = requestUrl.searchParams.get("error");
    if (authorizationError) {
        return redirectResponse(
            setOAuthErrorOnRedirectUri(brokerState.redirectUri, authorizationError, {
                errorDescription: requestUrl.searchParams.get("error_description") ?? undefined,
                errorUri: requestUrl.searchParams.get("error_uri") ?? undefined,
                clientState: brokerState.clientState,
                forwardedParams,
            }),
        );
    }

    const authorizationCode = requestUrl.searchParams.get("code");
    if (!authorizationCode) {
        return redirectResponse(
            setOAuthErrorOnRedirectUri(brokerState.redirectUri, "invalid_request", {
                errorDescription: "Missing OAuth authorization code.",
                clientState: brokerState.clientState,
                forwardedParams,
            }),
        );
    }

    const brokerConfig = getOAuthBrokerConfig(app);
    if (!brokerConfig) {
        return textResponse("OAuth broker is not configured.", 500);
    }

    const tokenResponse = await exchangeAuthorizationCode({
        authorizationCode,
        brokerRedirectUri: getBrokerRedirectUri(requestUrl),
        codeVerifier: brokerState.codeVerifier,
        config: brokerConfig,
    });

    if (!tokenResponse.ok) {
        return redirectResponse(
            setOAuthErrorOnRedirectUri(brokerState.redirectUri, tokenResponse.error, {
                errorDescription: tokenResponse.errorDescription,
                clientState: brokerState.clientState,
                forwardedParams,
            }),
        );
    }

    return redirectResponse(
        setThirdPartyExchangeCodeOnRedirectUri(
            brokerState.redirectUri,
            tokenResponse.thirdPartyExchangeCode,
            brokerState.clientState,
            forwardedParams,
        ),
    );
}

interface ExchangeAuthorizationCodeParams {
    readonly authorizationCode: string;
    readonly brokerRedirectUri: string;
    readonly codeVerifier: string;
    readonly config: OAuthBrokerConfig;
}

type TokenExchangeResult =
    | {
          readonly ok: true;
          readonly thirdPartyExchangeCode: string;
      }
    | {
          readonly ok: false;
          readonly error: "invalid_grant" | "server_error";
          readonly errorDescription?: string;
      };

async function exchangeAuthorizationCode(
    params: ExchangeAuthorizationCodeParams,
): Promise<TokenExchangeResult> {
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: params.authorizationCode,
        redirect_uri: params.brokerRedirectUri,
        client_id: params.config.clientId,
        client_secret: params.config.clientSecret,
        code_verifier: params.codeVerifier,
    });

    let response: Response;
    try {
        response = await fetch(new URL(TOKEN_ENDPOINT, env.VITE_API_URL ?? DEFAULT_API_URL), {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
            redirect: "manual",
        });
    } catch {
        return {
            ok: false,
            error: "server_error",
            errorDescription: "OAuth token exchange request failed.",
        };
    }

    if (!response.ok) {
        return {
            ok: false,
            error: response.status === 400 ? "invalid_grant" : "server_error",
            errorDescription: "OAuth token exchange failed.",
        };
    }

    let payload: unknown;
    try {
        payload = await response.json();
    } catch {
        return {
            ok: false,
            error: "server_error",
            errorDescription: "OAuth token response was invalid.",
        };
    }

    const thirdPartyExchangeCode = getThirdPartyExchangeCode(payload);
    if (!thirdPartyExchangeCode) {
        return {
            ok: false,
            error: "server_error",
            errorDescription: "OAuth token response did not include a third-party exchange code.",
        };
    }

    return {
        ok: true,
        thirdPartyExchangeCode,
    };
}

function getForwardedOAuthRedirectParams(
    searchParams: URLSearchParams,
): Array<readonly [string, string]> {
    return [...searchParams.entries()].filter(
        ([key]) => !BROKER_HANDLED_CALLBACK_PARAMS.has(key.toLowerCase()),
    );
}

function getOAuthBrokerConfig(app: OAuthClientRedirectBrokerApp): OAuthBrokerConfig | undefined {
    const appConfig = OAUTH_CLIENT_REDIRECT_BROKER_APPS[app];
    const clientId = appConfig.getClientId();
    const clientSecret = appConfig.getClientSecret();

    if (!clientId || !clientSecret) {
        return undefined;
    }

    return {
        clientId,
        clientSecret,
    };
}

function getBrokerRedirectUri(requestUrl: URL): string {
    const redirectUri = new URL(requestUrl);
    redirectUri.search = "";
    redirectUri.hash = "";
    return redirectUri.toString();
}

function getThirdPartyExchangeCode(payload: unknown): string | undefined {
    if (typeof payload !== "object" || payload === null) {
        return undefined;
    }

    const value = (payload as Record<string, unknown>)[THIRD_PARTY_EXCHANGE_CODE_RESPONSE_FIELD];
    return typeof value === "string" && value.length > 0 ? value : undefined;
}

function redirectResponse(location: string): Response {
    return new Response(null, {
        status: 302,
        headers: {
            "Cache-Control": "no-store",
            Location: location,
            Pragma: "no-cache",
            "Referrer-Policy": "no-referrer",
            "X-Content-Type-Options": "nosniff",
        },
    });
}

function textResponse(message: string, status: number): Response {
    return new Response(message, {
        status,
        headers: {
            "Cache-Control": "no-store",
            "Content-Type": "text/plain; charset=utf-8",
            Pragma: "no-cache",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
