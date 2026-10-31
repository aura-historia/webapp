import { DurableObject, type SqlStorage } from "cloudflare:workers";
import { revokeAccessToken } from "@/features/oauth-client-broker/server/brokerBackend.ts";
import { getWooCommerceBrokerConfig } from "@/features/oauth-client-broker/server/brokerConfig.ts";
import {
    type BrokerApproval,
    type BrokerCredential,
    type BrokerOutcome,
    type BrokerTransactionRecord,
    BrokerTransactionMachine,
    type BrokerTransactionStorage,
    type CompletionAttempt,
    type CreateTransactionInput,
} from "@/features/oauth-client-broker/server/brokerTransactionMachine.ts";
import type { BrokerFailureError } from "@/features/oauth-client-broker/lib/brokerProtocol.ts";

const TABLE = "broker_transaction";

/**
 * One SQLite-backed Durable Object per WooCommerce broker transaction, addressed by its
 * `transaction_id`. The runtime delivers one call at a time and every transition runs without an
 * await between its read and write, so claims, approvals and releases are atomic. An alarm at
 * expiry revokes an undelivered credential and deletes the record.
 */
export class WooCommerceOAuthBrokerTransaction extends DurableObject {
    private readonly storage = new SqlTransactionStorage(this.ctx.storage.sql);
    private readonly machine = new BrokerTransactionMachine(this.storage);

    async create(input: CreateTransactionInput) {
        return this.mutate(() => this.machine.create(input, Date.now()));
    }

    getConsentView() {
        return this.machine.getConsentView(Date.now());
    }

    async approve(approval: Omit<BrokerApproval, "approvedAt">) {
        return this.mutate(() => this.machine.approve(approval, Date.now()));
    }

    async answerBeforeApproval(params: {
        readonly outcome: Exclude<BrokerOutcome, { kind: "authorized" }>;
        readonly listingSourceId?: string;
        readonly completionCodeHash?: string;
    }) {
        return this.mutate(() => this.machine.answerBeforeApproval(params, Date.now()));
    }

    async claimExchange(
        binding: Pick<BrokerApproval, "callbackStateHash" | "sessionBindingHash" | "userSub">,
    ) {
        return this.mutate(() => this.machine.claimExchange(binding, Date.now()));
    }

    async storeCredential(credential: BrokerCredential, completionCodeHash: string) {
        return this.mutate(() =>
            this.machine.storeCredential(credential, completionCodeHash, Date.now()),
        );
    }

    async failExchange(error: BrokerFailureError, completionCodeHash: string) {
        return this.mutate(() => this.machine.failExchange(error, completionCodeHash, Date.now()));
    }

    async complete(attempt: CompletionAttempt) {
        const result = await this.mutate(() => this.machine.complete(attempt, Date.now()));
        if (result.ok || !result.revokeAccessToken) {
            return result;
        }

        // The credential expired undelivered: revoke it here and never hand it to the caller.
        await this.revoke(result.revokeAccessToken);
        return { ok: false as const, error: result.error };
    }

    async alarm() {
        const { revokeAccessToken, retryAt } = this.machine.sweep(Date.now());
        if (revokeAccessToken && !(await this.revoke(revokeAccessToken)) && retryAt) {
            await this.ctx.storage.setAlarm(retryAt);
            return;
        }
        await this.syncAlarm();
    }

    private async revoke(accessToken: string): Promise<boolean> {
        const config = getWooCommerceBrokerConfig();
        if (!config || !(await revokeAccessToken(accessToken, config))) {
            console.error("[OAuth broker] Undelivered credential revocation failed.");
            return false;
        }
        this.machine.confirmRevocation(Date.now());
        await this.syncAlarm();
        return true;
    }

    /** Runs one synchronous transition, then aligns the alarm with what is left. */
    private async mutate<T>(transition: () => T): Promise<T> {
        this.storage.changed = false;
        const result = transition();
        if (this.storage.changed) {
            await this.syncAlarm();
        }
        return result;
    }

    private async syncAlarm() {
        const alarmAt = this.machine.getAlarmAt();
        if (alarmAt === undefined) {
            await this.ctx.storage.deleteAlarm();
            await this.ctx.storage.deleteAll();
            return;
        }
        await this.ctx.storage.setAlarm(alarmAt);
    }
}

/** The single record as JSON in one row; probing an unknown ID creates no storage. */
export class SqlTransactionStorage implements BrokerTransactionStorage {
    changed = false;

    constructor(private readonly sql: SqlStorage) {}

    read(): BrokerTransactionRecord | undefined {
        if (!this.hasTable()) return undefined;
        const [row] = this.sql
            .exec<{ record: string }>(`SELECT record FROM ${TABLE} WHERE id = 1`)
            .toArray();
        return row ? (JSON.parse(row.record) as BrokerTransactionRecord) : undefined;
    }

    write(record: BrokerTransactionRecord): void {
        this.sql.exec(
            `CREATE TABLE IF NOT EXISTS ${TABLE} (id INTEGER PRIMARY KEY CHECK (id = 1), record TEXT NOT NULL)`,
        );
        this.sql.exec(
            `INSERT INTO ${TABLE} (id, record) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET record = excluded.record`,
            JSON.stringify(record),
        );
        this.changed = true;
    }

    clear(): void {
        if (this.hasTable()) {
            this.sql.exec(`DELETE FROM ${TABLE}`);
        }
        this.changed = true;
    }

    private hasTable(): boolean {
        return (
            this.sql
                .exec<{ name: string }>(
                    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
                    TABLE,
                )
                .toArray().length > 0
        );
    }
}
