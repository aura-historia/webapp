import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useServiceStatus } from "../useServiceStatus.ts";

const api = vi.hoisted(() => ({ health: vi.fn(), ready: vi.fn() }));
vi.mock("@/client", () => ({ getHealth: api.health, getReadiness: api.ready }));

const respond = (status: number) => ({ response: { status, ok: status >= 200 && status < 300 } });

describe("useServiceStatus", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    // Long enough for the initial attempt plus both retries, short of the next scheduled check.
    const settle = () => act(() => vi.advanceTimersByTimeAsync(10_000));

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        client = new QueryClient();
    });

    afterEach(() => {
        client.clear();
        vi.useRealTimers();
    });

    it("has no result until the first check settles", () => {
        api.health.mockReturnValue(new Promise(() => {}));
        api.ready.mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() => useServiceStatus(), { wrapper });

        expect(result.current.result).toBeUndefined();
        expect(result.current.isChecking).toBe(true);
    });

    it("reports an operational API with the time of the check", async () => {
        api.health.mockResolvedValue(respond(200));
        api.ready.mockResolvedValue(respond(204));

        const { result } = renderHook(() => useServiceStatus(), { wrapper });
        await settle();

        expect(result.current.result?.availability).toBe("operational");
        expect(result.current.result?.checkedAt).toBeGreaterThan(0);
        expect(result.current.isChecking).toBe(false);
    });

    it("ignores a single failed check that a retry recovers", async () => {
        api.health.mockResolvedValueOnce(respond(502)).mockResolvedValue(respond(200));
        api.ready.mockResolvedValue(respond(204));

        const { result } = renderHook(() => useServiceStatus(), { wrapper });
        await settle();

        expect(api.health).toHaveBeenCalledTimes(2);
        expect(result.current.result?.availability).toBe("operational");
    });

    it("reports maintenance with the probe results once retries are exhausted", async () => {
        api.health.mockResolvedValue(respond(503));
        api.ready.mockResolvedValue(respond(503));

        const { result } = renderHook(() => useServiceStatus(), { wrapper });
        await settle();

        expect(api.health).toHaveBeenCalledTimes(3);
        expect(result.current.result?.availability).toBe("maintenance");
        expect(result.current.result?.snapshot.liveness.httpStatus).toBe(503);
    });

    it("clears a disruption once a later check succeeds", async () => {
        api.health.mockResolvedValue(respond(200));
        api.ready.mockResolvedValue(respond(503));

        const { result } = renderHook(() => useServiceStatus(), { wrapper });
        await settle();
        expect(result.current.result?.availability).toBe("disruption");

        api.ready.mockResolvedValue(respond(204));
        act(() => result.current.check());
        await settle();

        expect(result.current.result?.availability).toBe("operational");
    });
});
