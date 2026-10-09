/** Matches the backend's 512-byte cap on the opaque confirmation capability. */
export const NEWSLETTER_CONFIRMATION_TOKEN_MAX_LENGTH = 512;

// The backend issues unpadded base64url tokens, which need no percent-decoding.
const TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;

export type NewsletterConfirmationFragment =
    | { readonly kind: "token"; readonly token: string }
    | { readonly kind: "missing" }
    | { readonly kind: "malformed" };

/**
 * Reads the confirmation capability from a `#token=<value>` URL fragment.
 * Missing, duplicate, empty, oversized and non-base64url values never yield a token.
 */
export function parseNewsletterConfirmationFragment(hash: string): NewsletterConfirmationFragment {
    const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
    if (fragment === "") {
        return { kind: "missing" };
    }

    const tokens = fragment
        .split("&")
        .filter((part) => part === "token" || part.startsWith("token="))
        .map((part) => part.slice("token=".length));

    if (tokens.length === 0) {
        return { kind: "missing" };
    }

    const [token] = tokens;
    if (
        tokens.length !== 1 ||
        token === undefined ||
        token.length > NEWSLETTER_CONFIRMATION_TOKEN_MAX_LENGTH ||
        !TOKEN_PATTERN.test(token)
    ) {
        return { kind: "malformed" };
    }

    return { kind: "token", token };
}
