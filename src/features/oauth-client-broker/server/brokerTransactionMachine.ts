import {
    BROKER_COMPLETION_CODE_LIFETIME_SECONDS,
    BROKER_REVOCATION_GRACE_SECONDS,
    BROKER_REVOCATION_RETRY_SECONDS,
    BROKER_TRANSACTION_LIFETIME_SECONDS,
    type BrokerFailureError,
} from "@/features/oauth-client-broker/lib/brokerProtocol.ts";
import { timingSafeEqual } from "@/features/oauth-client-broker/lib/brokerCrypto.ts";

/**
 * Lifecycle of one WooCommerce broker transaction. Every method is synchronous: the Durable Object
 * that owns the record runs one call at a time, so each read-check-write below is atomic. Hashes
 * and random values are computed by the caller before entering a method.
 *
 * created → approved → exchanging → ready → consumed
 * created → denied | failed; exchanging → failed; denied | failed (with handoff) → consumed
 * ready → expired (undelivered credential awaiting revocation); any record is deleted after expiry.
 */
export type BrokerTransactionRecord =
    | PendingRecord<"created">
    | ApprovedRecord<"approved">
    | ApprovedRecord<"exchanging">
    | ReadyRecord
    | AnsweredRecord<"denied" | "failed">
    | ConsumedRecord
    | ExpiredRecord;

/** Immutable initiation context, fixed when the transaction is created. */
export interface BrokerTransactionContext {
    readonly transactionId: string;
    readonly clientId: string;
    readonly merchantRedirectUri: string;
    readonly clientState: string;
    readonly scope: string;
    readonly resource?: string;
    readonly completionChallenge: string;
    /** PKCE S256 challenge of the broker's own verifier; not secret. */
    readonly codeChallenge: string;
    readonly createdAt: number;
    readonly expiresAt: number;
}

interface PendingRecord<Phase> extends BrokerTransactionContext {
    readonly phase: Phase;
    readonly codeVerifier: string;
}

export interface BrokerApproval {
    readonly userSub: string;
    readonly sessionBindingHash: string;
    readonly callbackStateHash: string;
    readonly listingSourceId: string;
    readonly approvedAt: number;
}

interface ApprovedRecord<Phase> extends BrokerTransactionContext {
    readonly phase: Phase;
    /** Scrubbed once the exchange is claimed. */
    readonly codeVerifier?: string;
    readonly approval: BrokerApproval;
}

export interface BrokerHandoff {
    readonly completionCodeHash: string;
    readonly expiresAt: number;
}

export interface BrokerCredential {
    readonly accessToken: string;
    readonly tokenType: "Bearer";
    readonly scope: string;
    /** Only when the backend returned `expires_in`. */
    readonly accessTokenExpiresAt?: number;
}

interface ReadyRecord extends BrokerTransactionContext {
    readonly phase: "ready";
    readonly approval: BrokerApproval;
    readonly credential: BrokerCredential;
    readonly handoff: BrokerHandoff;
}

export type BrokerOutcome =
    | { readonly kind: "authorized" }
    | { readonly kind: "denied" }
    | { readonly kind: "failed"; readonly error: BrokerFailureError };

interface AnsweredRecord<Phase> extends BrokerTransactionContext {
    readonly phase: Phase;
    readonly outcome: BrokerOutcome;
    readonly listingSourceId?: string;
    /** Absent when the destination was not verified: the outcome then stays on Aura Historia. */
    readonly handoff?: BrokerHandoff;
}

interface ConsumedRecord extends BrokerTransactionContext {
    readonly phase: "consumed";
    readonly outcome: BrokerOutcome;
    readonly handoff: BrokerHandoff;
}

interface ExpiredRecord extends BrokerTransactionContext {
    readonly phase: "expired";
    /** An issued, undelivered credential that still has to be revoked. */
    readonly pendingRevocation?: string;
}

/** Where the Durable Object keeps the single record; reads and writes are synchronous. */
export interface BrokerTransactionStorage {
    read(): BrokerTransactionRecord | undefined;
    write(record: BrokerTransactionRecord): void;
    clear(): void;
}

export interface CreateTransactionInput
    extends Omit<BrokerTransactionContext, "createdAt" | "expiresAt"> {
    readonly codeVerifier: string;
}

/**
 * What consent needs: no merchant state, proof commitment or verifier. The public PKCE challenge
 * is for the server's authorization request; the consent endpoint does not return it.
 */
export interface BrokerConsentContext {
    readonly transactionId: string;
    readonly clientId: string;
    readonly merchantRedirectUri: string;
    readonly scope: string;
    readonly resource?: string;
    readonly codeChallenge: string;
    readonly expiresAt: number;
}

export type ConsentView =
    | { readonly status: "pending"; readonly context: BrokerConsentContext }
    | { readonly status: "declined" | "answered" | "invalid" };

export type TransitionError =
    | "invalid_transaction"
    | "expired_transaction"
    | "already_answered"
    | "binding_mismatch";

export type TransitionResult<T = undefined> =
    | ({ readonly ok: true } & (T extends undefined ? unknown : { readonly value: T }))
    | { readonly ok: false; readonly error: TransitionError };

export interface ExchangeClaim {
    readonly codeVerifier: string;
    readonly resource?: string;
    readonly merchantRedirectUri: string;
    readonly clientState: string;
}

export interface HandoffDestination {
    readonly merchantRedirectUri: string;
    readonly clientState: string;
}

export type CompletionResult =
    | {
          readonly ok: true;
          readonly transactionId: string;
          readonly clientState: string;
          readonly outcome: BrokerOutcome;
          readonly listingSourceId?: string;
          readonly resource?: string;
          readonly credential?: BrokerCredential;
      }
    | {
          readonly ok: false;
          readonly error:
              | "invalid_transaction"
              | "authorization_pending"
              | "invalid_code"
              | "invalid_proof"
              | "already_consumed"
              | "expired_transaction";
          /** A credential that expired undelivered during this call; the caller revokes it. */
          readonly revokeAccessToken?: string;
      };

export interface CompletionAttempt {
    readonly completionCodeHash: string;
    /** `SHA256(completion_secret)`, compared with the stored commitment. */
    readonly completionSecretHash: string;
}

const SECOND = 1000;

export class BrokerTransactionMachine {
    constructor(private readonly storage: BrokerTransactionStorage) {}

    create(input: CreateTransactionInput, now: number): TransitionResult<{ expiresAt: number }> {
        if (this.storage.read()) {
            return { ok: false, error: "already_answered" };
        }

        const expiresAt = now + BROKER_TRANSACTION_LIFETIME_SECONDS * SECOND;
        this.storage.write({ ...input, phase: "created", createdAt: now, expiresAt });
        return { ok: true, value: { expiresAt } };
    }

    /** Presentation for the consent page. Reading never changes the record. */
    getConsentView(now: number): ConsentView {
        const record = this.readLive(now);
        if (!record) return { status: "invalid" };
        if (record.phase === "created") {
            return {
                status: "pending",
                context: {
                    transactionId: record.transactionId,
                    clientId: record.clientId,
                    merchantRedirectUri: record.merchantRedirectUri,
                    scope: record.scope,
                    ...(record.resource === undefined ? {} : { resource: record.resource }),
                    codeChallenge: record.codeChallenge,
                    expiresAt: record.expiresAt,
                },
            };
        }
        if (record.phase === "denied") return { status: "declined" };
        return { status: "answered" };
    }

    /** Freezes the approving account, browser, callback state and source; once only. */
    approve(approval: Omit<BrokerApproval, "approvedAt">, now: number): TransitionResult {
        const record = this.readLive(now);
        if (!record) return { ok: false, error: "invalid_transaction" };
        if (record.phase !== "created") return { ok: false, error: "already_answered" };

        this.storage.write({
            ...record,
            phase: "approved",
            approval: { ...approval, approvedAt: now },
        });
        return { ok: true };
    }

    /**
     * Ends a transaction that is still awaiting consent with a non-credential outcome. With a code
     * hash the merchant learns it through a handoff; without one it stays on Aura Historia.
     */
    answerBeforeApproval(
        params: {
            readonly outcome: Exclude<BrokerOutcome, { kind: "authorized" }>;
            readonly listingSourceId?: string;
            readonly completionCodeHash?: string;
        },
        now: number,
    ): TransitionResult<HandoffDestination> {
        const record = this.readLive(now);
        if (!record) return { ok: false, error: "invalid_transaction" };
        if (record.phase !== "created") return { ok: false, error: "already_answered" };

        this.storage.write({
            ...toContext(record),
            phase: params.outcome.kind === "denied" ? "denied" : "failed",
            outcome: params.outcome,
            ...(params.listingSourceId === undefined
                ? {}
                : { listingSourceId: params.listingSourceId }),
            ...(params.completionCodeHash === undefined
                ? {}
                : { handoff: this.createHandoff(record, params.completionCodeHash, now) }),
        });
        return { ok: true, value: toHandoffDestination(record) };
    }

    /** Claims the single code exchange for the browser and account that approved. */
    claimExchange(
        binding: Pick<BrokerApproval, "callbackStateHash" | "sessionBindingHash" | "userSub">,
        now: number,
    ): TransitionResult<ExchangeClaim> {
        const record = this.readLive(now);
        if (!record) return { ok: false, error: "invalid_transaction" };
        if (record.phase !== "approved" || !record.codeVerifier) {
            return { ok: false, error: "already_answered" };
        }
        if (
            !timingSafeEqual(record.approval.callbackStateHash, binding.callbackStateHash) ||
            !timingSafeEqual(record.approval.sessionBindingHash, binding.sessionBindingHash) ||
            record.approval.userSub !== binding.userSub
        ) {
            return { ok: false, error: "binding_mismatch" };
        }

        const { codeVerifier, ...claimed } = record;
        this.storage.write({ ...claimed, phase: "exchanging" });
        return {
            ok: true,
            value: {
                codeVerifier,
                merchantRedirectUri: record.merchantRedirectUri,
                clientState: record.clientState,
                ...(record.resource === undefined ? {} : { resource: record.resource }),
            },
        };
    }

    /** Stores the exchanged credential for one completion; past expiry the caller revokes it. */
    storeCredential(
        credential: BrokerCredential,
        completionCodeHash: string,
        now: number,
    ): TransitionResult<HandoffDestination> {
        const record = this.readLive(now);
        if (!record) return { ok: false, error: "expired_transaction" };
        if (record.phase !== "exchanging") return { ok: false, error: "already_answered" };

        this.storage.write({
            ...toContext(record),
            phase: "ready",
            approval: record.approval,
            credential,
            handoff: this.createHandoff(record, completionCodeHash, now),
        });
        return { ok: true, value: toHandoffDestination(record) };
    }

    failExchange(
        error: BrokerFailureError,
        completionCodeHash: string,
        now: number,
    ): TransitionResult<HandoffDestination> {
        const record = this.readLive(now);
        if (!record) return { ok: false, error: "expired_transaction" };
        if (record.phase !== "exchanging") return { ok: false, error: "already_answered" };

        this.storage.write({
            ...toContext(record),
            phase: "failed",
            outcome: { kind: "failed", error },
            listingSourceId: record.approval.listingSourceId,
            handoff: this.createHandoff(record, completionCodeHash, now),
        });
        return { ok: true, value: toHandoffDestination(record) };
    }

    /**
     * Releases a result at most once, only for the callback-delivered code together with the
     * secret behind the initiation commitment. Wrong input never changes the record.
     */
    complete(attempt: CompletionAttempt, now: number): CompletionResult {
        const record = this.storage.read();
        if (!record) return { ok: false, error: "invalid_transaction" };

        if (now >= record.expiresAt || record.phase === "expired") {
            return {
                ok: false,
                error: "expired_transaction",
                ...this.expireReadyCredential(record),
            };
        }

        const handoff = "handoff" in record ? record.handoff : undefined;
        if (!handoff) {
            // No code exists yet, or the outcome was never handed off: nothing can match.
            return {
                ok: false,
                error: isAwaitingResult(record) ? "authorization_pending" : "invalid_code",
            };
        }
        if (!timingSafeEqual(handoff.completionCodeHash, attempt.completionCodeHash)) {
            return { ok: false, error: "invalid_code" };
        }
        if (!timingSafeEqual(record.completionChallenge, attempt.completionSecretHash)) {
            return { ok: false, error: "invalid_proof" };
        }
        if (record.phase === "consumed") return { ok: false, error: "already_consumed" };
        if (now >= handoff.expiresAt) {
            return {
                ok: false,
                error: "expired_transaction",
                ...this.expireReadyCredential(record),
            };
        }

        if (record.phase === "ready") {
            this.storage.write({
                ...toContext(record),
                phase: "consumed",
                outcome: { kind: "authorized" },
                handoff,
            });
            return {
                ok: true,
                transactionId: record.transactionId,
                clientState: record.clientState,
                outcome: { kind: "authorized" },
                listingSourceId: record.approval.listingSourceId,
                credential: record.credential,
                ...(record.resource === undefined ? {} : { resource: record.resource }),
            };
        }

        if (record.phase === "denied" || record.phase === "failed") {
            this.storage.write({
                ...toContext(record),
                phase: "consumed",
                outcome: record.outcome,
                handoff,
            });
            return {
                ok: true,
                transactionId: record.transactionId,
                clientState: record.clientState,
                outcome: record.outcome,
            };
        }

        return { ok: false, error: "invalid_transaction" };
    }

    /** When the owning Durable Object should wake next, or `undefined` once nothing is left. */
    getAlarmAt(): number | undefined {
        const record = this.storage.read();
        if (!record) return undefined;
        if (record.phase === "ready") return Math.min(record.handoff.expiresAt, record.expiresAt);
        return record.expiresAt;
    }

    /**
     * Expiry sweep: an undelivered credential is scrubbed and handed back for revocation; every
     * other record is deleted once its transaction has expired.
     */
    sweep(now: number): { readonly revokeAccessToken?: string; readonly retryAt?: number } {
        const record = this.storage.read();
        if (!record) return {};

        if (
            record.phase === "ready" &&
            now >= Math.min(record.handoff.expiresAt, record.expiresAt)
        ) {
            const { revokeAccessToken } = this.expireReadyCredential(record);
            return { revokeAccessToken, retryAt: now + BROKER_REVOCATION_RETRY_SECONDS * SECOND };
        }

        if (record.phase === "expired" && record.pendingRevocation) {
            if (now < record.expiresAt + BROKER_REVOCATION_GRACE_SECONDS * SECOND) {
                return {
                    revokeAccessToken: record.pendingRevocation,
                    retryAt: now + BROKER_REVOCATION_RETRY_SECONDS * SECOND,
                };
            }
            // Out of retries: the token stays revocable by its owner in account settings.
            this.storage.clear();
            return {};
        }

        if (now >= record.expiresAt) {
            this.storage.clear();
        }
        return {};
    }

    /** Records a successful revocation; the record is deleted once the transaction has expired. */
    confirmRevocation(now: number): void {
        const record = this.storage.read();
        if (record?.phase !== "expired") return;
        if (now >= record.expiresAt) {
            this.storage.clear();
            return;
        }
        this.storage.write({ ...toContext(record), phase: "expired" });
    }

    private readLive(now: number): BrokerTransactionRecord | undefined {
        const record = this.storage.read();
        return record && now < record.expiresAt && record.phase !== "expired" ? record : undefined;
    }

    private createHandoff(
        record: BrokerTransactionContext,
        completionCodeHash: string,
        now: number,
    ): BrokerHandoff {
        return {
            completionCodeHash,
            expiresAt: Math.min(
                now + BROKER_COMPLETION_CODE_LIFETIME_SECONDS * SECOND,
                record.expiresAt,
            ),
        };
    }

    /** Moves an undelivered credential out of the readable record and returns it for revocation. */
    private expireReadyCredential(record: BrokerTransactionRecord): { revokeAccessToken?: string } {
        if (record.phase !== "ready") return {};
        this.storage.write({
            ...toContext(record),
            phase: "expired",
            pendingRevocation: record.credential.accessToken,
        });
        return { revokeAccessToken: record.credential.accessToken };
    }
}

function toContext(record: BrokerTransactionContext): BrokerTransactionContext {
    return {
        transactionId: record.transactionId,
        clientId: record.clientId,
        merchantRedirectUri: record.merchantRedirectUri,
        clientState: record.clientState,
        scope: record.scope,
        ...(record.resource === undefined ? {} : { resource: record.resource }),
        completionChallenge: record.completionChallenge,
        codeChallenge: record.codeChallenge,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
    };
}

function isAwaitingResult(record: BrokerTransactionRecord): boolean {
    return (
        record.phase === "created" || record.phase === "approved" || record.phase === "exchanging"
    );
}

function toHandoffDestination(record: BrokerTransactionContext): HandoffDestination {
    return { merchantRedirectUri: record.merchantRedirectUri, clientState: record.clientState };
}
