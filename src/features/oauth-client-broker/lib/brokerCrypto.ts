const RANDOM_VALUE_BYTES = 32;

/** 32 bytes from the platform CSPRNG as base64url without padding (43 characters). */
export function createRandomBase64Url(): string {
    const bytes = new Uint8Array(RANDOM_VALUE_BYTES);
    globalThis.crypto.getRandomValues(bytes);
    return encodeBase64Url(bytes);
}

/** `BASE64URL_NO_PADDING(SHA256(ASCII(value)))`, used for PKCE, proofs and stored hashes. */
export async function sha256Base64Url(value: string): Promise<string> {
    const digest = await globalThis.crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(value),
    );
    return encodeBase64Url(new Uint8Array(digest));
}

/** Compares two digests without an early exit on the first differing character. */
export function timingSafeEqual(a: string, b: string): boolean {
    const length = Math.max(a.length, b.length);
    let difference = a.length ^ b.length;
    for (let index = 0; index < length; index++) {
        difference |= (a.codePointAt(index) ?? 0) ^ (b.codePointAt(index) ?? 0);
    }
    return difference === 0;
}

function encodeBase64Url(bytes: Uint8Array): string {
    const binary = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
    return globalThis.btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
