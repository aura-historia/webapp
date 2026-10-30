import type { DurableObjectState } from "cloudflare:workers";

/**
 * Test stand-in for the Workers runtime module `cloudflare:workers`, aliased in `vitest.config.ts`.
 * Tests put bindings on `env` and Durable Object namespaces on `exports`.
 */
export const env: Record<string, unknown> = {};
export const exports: Record<string, unknown> = {};

export abstract class DurableObject<Env = unknown> {
    protected readonly ctx: DurableObjectState;
    protected readonly env: Env;

    constructor(ctx: DurableObjectState, env: Env) {
        this.ctx = ctx;
        this.env = env;
    }
}
