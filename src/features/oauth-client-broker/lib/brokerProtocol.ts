/**
 * WooCommerce OAuth broker protocol v2: the shared contract with the WooCommerce extension.
 * `docs/oauth-protocol-guidelines.md` is the normative description; keep both in step.
 */
export const BROKER_PROTOCOL_VERSION = 2;

/** Absolute transaction lifetime from initiation; consent, callback and completion all end here. */
export const BROKER_TRANSACTION_LIFETIME_SECONDS = 900;
/** A completion code is redeemable for this long, and never past the transaction's expiry. */
export const BROKER_COMPLETION_CODE_LIFETIME_SECONDS = 120;
/** Undelivered credentials are revoked at expiry; failed revocations retry until this grace ends. */
export const BROKER_REVOCATION_RETRY_SECONDS = 60;
export const BROKER_REVOCATION_GRACE_SECONDS = 3600;

/** 32 random bytes as base64url without padding. */
export const BROKER_RANDOM_VALUE_PATTERN = /^[A-Za-z0-9_-]{43}$/;
/** Plugin-generated values: at least 32 random bytes, at most 96, as base64url without padding. */
export const BROKER_CLIENT_SECRET_VALUE_PATTERN = /^[A-Za-z0-9_-]{43,128}$/;
/** `transaction_id` and the broker's own secret, joined by a dot. */
export const BROKER_CALLBACK_STATE_PATTERN = /^([A-Za-z0-9_-]{43})\.([A-Za-z0-9_-]{43})$/;

export const BROKER_COMPLETION_CHALLENGE_METHOD = "S256";
export const BROKER_MAX_REQUEST_BYTES = 8192;
export const BROKER_MAX_REDIRECT_URI_LENGTH = 2048;
export const BROKER_MAX_RESOURCE_LENGTH = 512;

export type BrokerTransactionPhase =
    | "created"
    | "approved"
    | "exchanging"
    | "ready"
    | "denied"
    | "failed"
    | "consumed";

/** Non-credential outcomes the merchant can learn through a completion code. */
export type BrokerFailureError =
    | "access_denied"
    | "invalid_scope"
    | "invalid_target"
    | "invalid_grant"
    | "server_error"
    | "temporarily_unavailable";

/** Error identifiers of the server-to-server initiation and completion endpoints. */
export type BrokerEndpointError =
    | "invalid_request"
    | "unsupported_protocol_version"
    | "invalid_client"
    | "invalid_redirect_uri"
    | "invalid_scope"
    | "invalid_target"
    | "invalid_completion_challenge"
    | "invalid_transaction"
    | "invalid_code"
    | "invalid_proof"
    | "authorization_pending"
    | "already_consumed"
    | "expired_transaction"
    | "rate_limited"
    | "server_error"
    | "temporarily_unavailable";

export const BROKER_ENDPOINT_ERROR_STATUS: Record<BrokerEndpointError, number> = {
    invalid_request: 400,
    unsupported_protocol_version: 400,
    invalid_client: 400,
    invalid_redirect_uri: 400,
    invalid_scope: 400,
    invalid_target: 400,
    invalid_completion_challenge: 400,
    invalid_transaction: 400,
    invalid_code: 400,
    invalid_proof: 400,
    authorization_pending: 409,
    already_consumed: 409,
    expired_transaction: 410,
    rate_limited: 429,
    server_error: 500,
    temporarily_unavailable: 503,
};

/** Errors after which the same request may succeed later; all others need a fresh flow. */
export const BROKER_RETRYABLE_ENDPOINT_ERRORS = new Set<BrokerEndpointError>([
    "authorization_pending",
    "rate_limited",
    "temporarily_unavailable",
]);

/** Reasons the consent page shows; they never carry protocol values. */
export const BROKER_CONSENT_ERRORS = [
    "recipient_not_registered",
    "source_unavailable",
    "approval_failed",
    "session_mismatch",
    "invalid_request",
    "unavailable",
] as const;

export type BrokerConsentError = (typeof BROKER_CONSENT_ERRORS)[number];
