import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    SERVICE_PROBE_TIMEOUT_MS,
    ServiceStatusError,
    serviceStatusQueryOptions,
} from "../serviceStatusQuery.ts";

const api = vi.hoisted(() => ({ health: vi.fn(), ready: vi.fn() }));
vi.mock("@/client", () => ({ getHealth: api.health, getReadiness: api.ready }));

const respond = (status: number) => ({ response: { status, ok: status >= 200 && status < 300 } });
const noResponse = { error: new TypeError("Failed to fetch"), response: undefined };

describe("serviceStatusQueryOptions", () => {
    let client: QueryClient;

    const check = () => client.fetchQuery({ ...serviceStatusQueryOptions, retry: false });

    async function failedCheck() {
        const error = await check().catch((caught: unknown) => caught);
        expect(error).toBeInstanceOf(ServiceStatusError);
        return (error as ServiceStatusError).snapshot;
    }

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("probes liveness and readiness without browser caching", async () => {
        api.health.mockResolvedValue(respond(200));
        api.ready.mockResolvedValue(respond(204));

        const snapshot = await check();

        expect(snapshot.liveness.httpStatus).toBe(200);
        expect(snapshot.readiness.httpStatus).toBe(204);
        expect(snapshot.liveness.latencyMs).toBeGreaterThanOrEqual(0);
        for (const request of [api.health, api.ready]) {
            expect(request).toHaveBeenCalledWith({
                cache: "no-store",
                signal: expect.any(AbortSignal),
            });
        }
    });

    it("fails with the probe results when liveness reports maintenance", async () => {
        api.health.mockResolvedValue(respond(503));
        api.ready.mockResolvedValue(respond(503));

        const snapshot = await failedCheck();

        expect(snapshot.liveness.httpStatus).toBe(503);
        expect(snapshot.readiness.httpStatus).toBe(503);
    });

    it("fails when readiness fails while the API is live", async () => {
        api.health.mockResolvedValue(respond(200));
        api.ready.mockResolvedValue(respond(503));

        const snapshot = await failedCheck();

        expect(snapshot.readiness.httpStatus).toBe(503);
    });

    it("records a network failure as no response", async () => {
        api.health.mockResolvedValue(noResponse);
        api.ready.mockResolvedValue(noResponse);

        const snapshot = await failedCheck();

        expect(snapshot.liveness.httpStatus).toBeNull();
        expect(snapshot.readiness.httpStatus).toBeNull();
    });

    it("aborts a probe that exceeds the timeout and records no response", async () => {
        vi.useFakeTimers();
        let probeSignal: AbortSignal | undefined;
        api.health.mockImplementation(({ signal }: { signal: AbortSignal }) => {
            probeSignal = signal;
            return new Promise((resolve) =>
                signal.addEventListener("abort", () => resolve(noResponse)),
            );
        });
        api.ready.mockResolvedValue(respond(204));

        const result = failedCheck();
        await vi.advanceTimersByTimeAsync(SERVICE_PROBE_TIMEOUT_MS - 1);
        expect(probeSignal?.aborted).toBe(false);
        await vi.advanceTimersByTimeAsync(1);
        const snapshot = await result;

        expect(probeSignal?.aborted).toBe(true);
        expect(snapshot.liveness.httpStatus).toBeNull();
        expect(snapshot.readiness.httpStatus).toBe(204);
    });

    it("rechecks sooner while degraded", () => {
        const interval = serviceStatusQueryOptions.refetchInterval as (query: {
            state: { status: string };
        }) => number;

        expect(interval({ state: { status: "error" } })).toBeLessThan(
            interval({ state: { status: "success" } }),
        );
    });
});
