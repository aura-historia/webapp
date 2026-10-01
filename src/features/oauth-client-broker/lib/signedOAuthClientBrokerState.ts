import {
    decodeOAuthClientBrokerState,
    encodeOAuthClientBrokerState,
    type OAuthClientBrokerState,
} from "./oauthClientBrokerState.ts";

const MAX_AGE_MS = 10 * 60 * 1000;

/** Server-only envelope. The OAuth client secret never leaves the broker. */
export async function signOAuthClientBrokerState(
    state: OAuthClientBrokerState,
    secret: string,
    context: string,
    now = Date.now(),
): Promise<string> {
    const payload = `${now}.${encodeOAuthClientBrokerState(state)}`;
    const signature = await crypto.subtle.sign(
        "HMAC",
        await signingKey(secret),
        new TextEncoder().encode(`${context}\n${payload}`),
    );
    return `${payload}.${encodeBytes(new Uint8Array(signature))}`;
}

export async function verifyOAuthClientBrokerState(
    encoded: string,
    secret: string,
    context: string,
    now = Date.now(),
): Promise<OAuthClientBrokerState> {
    const parts = encoded.split(".");
    if (parts.length !== 3) throw new Error("Unsigned OAuth broker callback.");
    const [issued, payload, signature] = parts;
    if (!/^\d+$/.test(issued) || !/^[A-Za-z0-9_-]+$/.test(signature)) {
        throw new Error("Invalid OAuth broker envelope.");
    }
    const age = now - Number(issued);
    if (age < 0 || age > MAX_AGE_MS) throw new Error("Expired OAuth broker state.");
    const bytes = Uint8Array.from(
        atob(signature.replaceAll("-", "+").replaceAll("_", "/")),
        (character) => character.charCodeAt(0),
    );
    const valid = await crypto.subtle.verify(
        "HMAC",
        await signingKey(secret),
        bytes,
        new TextEncoder().encode(`${context}\n${issued}.${payload}`),
    );
    if (!valid) throw new Error("Invalid OAuth broker signature.");
    return decodeOAuthClientBrokerState(payload);
}

export async function getS256Challenge(verifier: string): Promise<string> {
    return encodeBytes(
        new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))),
    );
}

function signingKey(secret: string): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"],
    );
}

function encodeBytes(bytes: Uint8Array): string {
    return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""))
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replaceAll("=", "");
}
