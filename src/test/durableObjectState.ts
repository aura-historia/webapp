import type { SQLInputValue } from "node:sqlite";
import type { DurableObjectState, SqlStorageValue } from "cloudflare:workers";

// Loaded through the runtime: Vite cannot resolve the prefix-only `node:sqlite` built-in.
const { DatabaseSync } = process.getBuiltinModule("node:sqlite");

/**
 * A Durable Object state backed by real SQLite (`node:sqlite`), as SQLite-backed objects are, with
 * an inspectable alarm. One instance stands for one object.
 */
export function createSqliteDurableObjectState() {
    let database = new DatabaseSync(":memory:");
    const state = {
        alarm: undefined as number | undefined,
        deletedAll: 0,
    };

    const ctx: DurableObjectState = {
        storage: {
            sql: {
                exec<T extends Record<string, SqlStorageValue>>(
                    query: string,
                    ...bindings: SqlStorageValue[]
                ) {
                    const rows = database
                        .prepare(query)
                        .all(...(bindings as SQLInputValue[])) as unknown as T[];
                    return { toArray: () => rows };
                },
            },
            async setAlarm(scheduledTime: number) {
                state.alarm = scheduledTime;
            },
            async deleteAlarm() {
                state.alarm = undefined;
            },
            async deleteAll() {
                database.close();
                database = new DatabaseSync(":memory:");
                state.deletedAll++;
            },
        },
    };

    return {
        ctx,
        state,
        tableCount: () =>
            (
                database
                    .prepare("SELECT count(*) AS count FROM sqlite_master WHERE type = 'table'")
                    .get() as { count: number }
            ).count,
    };
}
