/**
 * The parts of the Workers runtime module this app uses. The full `wrangler types` output clashes
 * with the DOM library, so only the Durable Object and rate-limit surface is declared here.
 * Tests alias the module to `src/test/cloudflareWorkersStub.ts`.
 */
declare module "cloudflare:workers" {
    export type SqlStorageValue = ArrayBuffer | string | number | null;

    export interface SqlStorageCursor<T> {
        toArray(): T[];
    }

    export interface SqlStorage {
        exec<T extends Record<string, SqlStorageValue>>(
            query: string,
            ...bindings: SqlStorageValue[]
        ): SqlStorageCursor<T>;
    }

    export interface DurableObjectStorage {
        readonly sql: SqlStorage;
        setAlarm(scheduledTime: number): Promise<void>;
        deleteAlarm(): Promise<void>;
        deleteAll(): Promise<void>;
    }

    export interface DurableObjectState {
        readonly storage: DurableObjectStorage;
    }

    export abstract class DurableObject<Env = unknown> {
        protected readonly ctx: DurableObjectState;
        protected readonly env: Env;
        constructor(ctx: DurableObjectState, env: Env);
    }

    export interface DurableObjectId {
        toString(): string;
    }

    /** RPC stub: every public method of the object, returning a promise. */
    export type DurableObjectStub<T> = {
        [K in keyof T]: T[K] extends (...args: infer A) => infer R
            ? (...args: A) => Promise<Awaited<R>>
            : never;
    };

    export interface DurableObjectNamespace<T> {
        idFromName(name: string): DurableObjectId;
        get(id: DurableObjectId): DurableObjectStub<T>;
    }

    /** Workers rate limiting binding (`ratelimits` in `wrangler.jsonc`). */
    export interface RateLimit {
        limit(options: { key: string }): Promise<{ success: boolean }>;
    }

    /** Bindings of the running Worker. */
    export const env: Readonly<Record<string, unknown>>;

    /** The running Worker's own exports (`ctx.exports`), e.g. its Durable Object namespaces. */
    export const exports: Readonly<Record<string, unknown>>;
}
