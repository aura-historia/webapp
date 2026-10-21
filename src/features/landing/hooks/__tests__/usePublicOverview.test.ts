import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PUBLIC_OVERVIEW_QUERY_KEY, usePublicOverview } from "../usePublicOverview.ts";

const api = vi.hoisted(() => ({ overview: vi.fn() }));
vi.mock("@/client", () => ({ getPublicOverview: api.overview }));

const overview = {
    asOf: "2026-10-21T15:00:36.379941Z",
    sourcesIndexed: 5,
    liveObjects: 74,
    countries: 1,
    languages: 2,
    newObjectsLast7Days: 25,
};

describe("usePublicOverview", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    });

    it("reads the public overview without query parameters and maps it", async () => {
        api.overview.mockResolvedValue({ data: overview });

        const { result } = renderHook(() => usePublicOverview(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.overview).toHaveBeenCalledWith({
            signal: expect.any(AbortSignal),
            throwOnError: true,
        });
        expect(result.current.data?.liveObjects).toBe(74);
        expect(result.current.data?.asOf).toEqual(new Date("2026-10-21T15:00:36.379Z"));
        expect(client.getQueryData(PUBLIC_OVERVIEW_QUERY_KEY)).toBe(result.current.data);
    });

    it("fails instead of showing figures from an invalid response", async () => {
        api.overview.mockResolvedValue({ data: { ...overview, countries: -1 } });

        const { result } = renderHook(() => usePublicOverview(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.data).toBeUndefined();
    });
});
