/**
 * Creates an opaque `Idempotency-Key` for one logical create command. Generate it when the user
 * submits, keep it for transport retries of the unchanged command and discard it after a definite
 * outcome; a new submission gets a new key. Never derive it from personal data or render it.
 */
export function createIdempotencyKey(): string {
    return crypto.randomUUID();
}

const VISIBLE_ASCII_WITHOUT_COMMA = /^[\x21-\x2b\x2d-\x7e]{1,128}$/;

/** 1–128 visible ASCII characters, excluding the comma that would split a header value. */
export function isValidIdempotencyKey(key: string): boolean {
    return VISIBLE_ASCII_WITHOUT_COMMA.test(key);
}
