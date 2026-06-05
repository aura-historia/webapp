import { env } from "@/env.ts";
import { z } from "zod";

const DEFAULT_API_URL = "https://api.dev.aura-historia.com";
const AUTHORIZE_ENDPOINT = "/api/v1/oauth/authorize";
const LOGIN_PATH = "/login";
const AUTHORIZE_PAGE_PATH = "/oauth/authorize";

const oauthAuthorizeFormSchema = z.object({
    response_type: z.literal("code"),
    client_id: z.string().min(1),
    redirect_uri: z.string().min(1),
    scope: z.string().optional(),
    state: z.string().optional(),
    code_challenge: z.string().min(1),
    code_challenge_method: z.literal("S256"),
});

type OAuthAuthorizeFormData = z.infer<typeof oauthAuthorizeFormSchema>;

export async function postOAuthAuthorizeApprove({ request }: { request: Request }) {
    const formData = await request.formData();
    const parseResult = oauthAuthorizeFormSchema.safeParse({
        response_type: getFormValue(formData, "response_type"),
        client_id: getFormValue(formData, "client_id"),
        redirect_uri: getFormValue(formData, "redirect_uri"),
        scope: getFormValue(formData, "scope"),
        state: getFormValue(formData, "state"),
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

    try {
        const response = await fetch(buildBackendAuthorizeUrl(parseResult.data), {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            redirect: "manual",
        });

        const locationHeader = response.headers.get("Location");
        if (isRedirectResponse(response) && locationHeader) {
            return redirectResponse(locationHeader);
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
    const authorizeUrl = new URL(AUTHORIZE_PAGE_PATH, request.url);
    appendAuthorizeParams(authorizeUrl.searchParams, params);

    const loginUrl = new URL(LOGIN_PATH, request.url);
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
            Location: location,
        },
    });
}

async function forwardErrorResponse(response: Response): Promise<Response> {
    const headers = new Headers();
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
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}
