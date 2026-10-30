import {
    BROKER_ENDPOINT_ERROR_STATUS,
    BROKER_MAX_REQUEST_BYTES,
    BROKER_PROTOCOL_VERSION,
    BROKER_RETRYABLE_ENDPOINT_ERRORS,
    type BrokerEndpointError,
} from "@/features/oauth-client-broker/lib/brokerProtocol.ts";
import { WOOCOMMERCE_BROKER_CALLBACK_PATH } from "@/features/oauth-client-broker/lib/brokerUrls.ts";

/** Every broker response carries protocol values or credentials: never cache or refer them. */
export function sensitiveHeaders(init?: HeadersInit): Headers {
    const headers = new Headers(init);
    headers.set("Cache-Control", "no-store");
    headers.set("Pragma", "no-cache");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("X-Content-Type-Options", "nosniff");
    return headers;
}

export function jsonResponse(body: Record<string, unknown>, status: number, init?: HeadersInit) {
    const headers = sensitiveHeaders(init);
    headers.set("Content-Type", "application/json; charset=utf-8");
    return new Response(JSON.stringify(body), { status, headers });
}

export function endpointErrorResponse(error: BrokerEndpointError): Response {
    return jsonResponse(
        {
            protocol_version: BROKER_PROTOCOL_VERSION,
            error,
            retryable: BROKER_RETRYABLE_ENDPOINT_ERRORS.has(error),
        },
        BROKER_ENDPOINT_ERROR_STATUS[error],
        error === "rate_limited" ? { "Retry-After": "60" } : undefined,
    );
}

export function redirectResponse(location: string, setCookies: readonly string[] = []): Response {
    const headers = sensitiveHeaders({ Location: location });
    for (const cookie of setCookies) {
        headers.append("Set-Cookie", cookie);
    }
    return new Response(null, { status: 303, headers });
}

export function textResponse(message: string, status: number): Response {
    const headers = sensitiveHeaders();
    headers.set("Content-Type", "text/plain; charset=utf-8");
    return new Response(message, { status, headers });
}

/**
 * Reads a form-encoded body in which every field is known and appears at most once. Returns
 * `undefined` for another content type, an oversized body, an unknown or a repeated field.
 */
export async function readStrictForm<Field extends string>(
    request: Request,
    fields: readonly Field[],
): Promise<Partial<Record<Field, string>> | undefined> {
    const contentType = request.headers.get("Content-Type")?.split(";")[0]?.trim().toLowerCase();
    const declaredLength = Number(request.headers.get("Content-Length") ?? "0");
    if (
        contentType !== "application/x-www-form-urlencoded" ||
        declaredLength > BROKER_MAX_REQUEST_BYTES
    ) {
        return undefined;
    }

    let body: string;
    try {
        body = await request.text();
    } catch {
        return undefined;
    }
    if (new TextEncoder().encode(body).length > BROKER_MAX_REQUEST_BYTES) {
        return undefined;
    }

    const allowed = new Set<string>(fields);
    const values: Partial<Record<Field, string>> = {};
    for (const [key, value] of new URLSearchParams(body)) {
        if (!allowed.has(key) || Object.hasOwn(values, key)) {
            return undefined;
        }
        values[key as Field] = value;
    }
    return values;
}

/**
 * Only Aura Historia's own pages may submit consent decisions. Browsers send `Sec-Fetch-Site` on
 * form posts, older ones at least `Origin`; a request with neither is rejected too.
 */
export function isSameOriginSubmission(request: Request): boolean {
    const fetchSite = request.headers.get("Sec-Fetch-Site");
    if (fetchSite !== null) {
        return fetchSite === "same-origin";
    }
    return request.headers.get("Origin") === new URL(request.url).origin;
}

/** A per-transaction cookie, so parallel transactions never share or overwrite a binding. */
export function getSessionBindingCookieName(transactionId: string): string {
    return `__Secure-ah-wc-${transactionId}`;
}

/**
 * Binds the approval to this browser: sent only to the broker callback, only from Aura Historia
 * itself, and never readable by scripts.
 */
export function createSessionBindingCookie(
    transactionId: string,
    value: string,
    maxAgeSeconds: number,
): string {
    return [
        `${getSessionBindingCookieName(transactionId)}=${value}`,
        `Path=${WOOCOMMERCE_BROKER_CALLBACK_PATH}`,
        `Max-Age=${Math.max(1, Math.floor(maxAgeSeconds))}`,
        "HttpOnly",
        "Secure",
        "SameSite=Strict",
    ].join("; ");
}

export function clearSessionBindingCookie(transactionId: string): string {
    return [
        `${getSessionBindingCookieName(transactionId)}=`,
        `Path=${WOOCOMMERCE_BROKER_CALLBACK_PATH}`,
        "Max-Age=0",
        "HttpOnly",
        "Secure",
        "SameSite=Strict",
    ].join("; ");
}

/** The cookie's value, or `undefined` when it is missing or sent more than once. */
export function readCookie(request: Request, name: string): string | undefined {
    const values = (request.headers.get("Cookie") ?? "")
        .split(";")
        .map((part) => part.trim())
        .filter((part) => part.startsWith(`${name}=`))
        .map((part) => part.slice(name.length + 1));
    return values.length === 1 ? values[0] : undefined;
}
