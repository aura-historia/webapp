import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { adminOverviewFixture } from "@/data/internal/admin/__tests__/adminOverviewFixture.ts";
import { ADMIN_OVERVIEW_QUERY_KEY, useAdminOverview } from "../useAdminOverview.ts";

const api = vi.hoisted(() => ({ overview: vi.fn() }));
vi.mock("@/client", () => ({ getAdminOverview: api.overview }));

const ok = (data: unknown) => ({ data, response: { status: 200, ok: true } });
const failure = (status: number) => ({
    error: { status, title: "Problem", error: "PROBLEM", detail: "internal detail" },
    response: { status, ok: false },
});

describe("useAdminOverview", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    });

    it("reads the aggregate endpoint once without browser caching and maps it", async () => {
        api.overview.mockResolvedValue(ok(adminOverviewFixture));

        const { result } = renderHook(() => useAdminOverview(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.overview).toHaveBeenCalledTimes(1);
        expect(api.overview).toHaveBeenCalledWith(
            expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) }),
        );
        expect(result.current.data?.listingSources.methodAssignments.webCrawl).toBe(2);
        expect(client.getQueryData(ADMIN_OVERVIEW_QUERY_KEY)).toBe(result.current.data);
    });

    it.each([
        [403, "adminOverview.errors.forbidden"],
        [503, "adminOverview.errors.unavailable"],
        [500, "adminOverview.errors.requestFailed"],
    ])("maps a %i response to fixed localized copy", async (status, key) => {
        api.overview.mockResolvedValue(failure(status));

        const { result } = renderHook(() => useAdminOverview(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe(testI18n.t(key));
        expect(result.current.data).toBeUndefined();
    });

    it("treats an unsupported schema version as a failed request", async () => {
        api.overview.mockResolvedValue(ok({ ...adminOverviewFixture, schemaVersion: 2 }));

        const { result } = renderHook(() => useAdminOverview(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe(
            testI18n.t("adminOverview.errors.requestFailed"),
        );
    });
});
