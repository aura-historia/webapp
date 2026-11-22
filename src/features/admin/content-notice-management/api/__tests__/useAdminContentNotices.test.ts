import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import {
    type AdminContentNoticeRequestError,
    useAdminContentNotice,
    useAdminContentNotices,
} from "../useAdminContentNotices.ts";

const api = vi.hoisted(() => ({ search: vi.fn(), detail: vi.fn() }));
vi.mock("@/client", () => ({
    adminSearchContentNotices: api.search,
    adminGetContentNotice: api.detail,
}));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: () => "Request failed" }),
}));

const summary = {
    contentNoticeId: "ntc_1",
    state: "SUBMITTED",
    created: "2026-11-21T16:42:00Z",
    target: { type: "LISTING_SOURCE", listingSourceId: "ls_1" },
    listingSourceName: "Galerie Lenbach",
    partner: false,
    submitterRole: "PROVIDER",
    reasonCategory: "PROVIDER_OPT_OUT",
    submitterName: "Peter Lenbach",
    submitterEmail: "peter@example.com",
};
const details = {
    ...summary,
    updated: "2026-11-21T16:43:00Z",
    version: 1,
    targetSnapshot: { listingSourceName: "Galerie Lenbach", partner: false },
    currentTarget: { listingSource: { exists: false } },
    additionalUrls: [],
    submitter: { name: "Peter Lenbach", email: "peter@example.com", language: "de" },
    goodFaithStatement: "GOOD_FAITH_V1",
};
const ok = (data: unknown) => ({ data, response: { status: 200, ok: true } });
const failure = (status: number) => ({
    error: { status, title: "Problem", error: "PROBLEM" },
    response: { status, ok: false },
});

describe("admin content notice API", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    });

    it("searches with the mapped filters and pages with the returned cursor", async () => {
        api.search
            .mockResolvedValueOnce(ok({ items: [summary], size: 1, searchAfter: "next" }))
            .mockResolvedValueOnce(ok({ items: [], size: 0 }));
        const hook = renderHook(
            () => useAdminContentNotices({ reason: "PROVIDER_OPT_OUT", order: "asc" }),
            { wrapper },
        );

        await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(1));
        expect(api.search).toHaveBeenLastCalledWith({
            query: { size: 25, reasonCategory: "PROVIDER_OPT_OUT", sort: "created", order: "asc" },
            signal: expect.any(AbortSignal),
        });
        expect(hook.result.current.data?.pages[0]?.items[0]?.id).toBe("ntc_1");
        expect(hook.result.current.hasNextPage).toBe(true);

        await act(async () => {
            await hook.result.current.fetchNextPage();
        });
        expect(api.search).toHaveBeenLastCalledWith({
            query: {
                size: 25,
                reasonCategory: "PROVIDER_OPT_OUT",
                sort: "created",
                order: "asc",
                searchAfter: "next",
            },
            signal: expect.any(AbortSignal),
        });
        await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(2));
        expect(hook.result.current.hasNextPage).toBe(false);
    });

    it("turns a rejected filter into its own message", async () => {
        api.search.mockResolvedValue(failure(400));
        const hook = renderHook(() => useAdminContentNotices({ sourceId: "bad" }), { wrapper });

        await waitFor(() => expect(hook.result.current.error).toBeTruthy());
        const error = hook.result.current.error as AdminContentNoticeRequestError;
        expect(error.status).toBe(400);
        expect(error.message).toBe(testI18n.t("adminContentNotices.errors.filterRejected"));
    });

    it("uses the shared message for other failures", async () => {
        api.search.mockResolvedValue(failure(500));
        const hook = renderHook(() => useAdminContentNotices({}), { wrapper });

        await waitFor(() => expect(hook.result.current.error).toBeTruthy());
        expect(hook.result.current.error?.message).toBe("Request failed");
    });

    it("loads one notice by ID only while enabled", async () => {
        api.detail.mockResolvedValue(ok(details));
        const disabled = renderHook(() => useAdminContentNotice("ntc_1", false), { wrapper });
        expect(disabled.result.current.fetchStatus).toBe("idle");
        expect(api.detail).not.toHaveBeenCalled();

        const hook = renderHook(() => useAdminContentNotice("ntc_1"), { wrapper });
        await waitFor(() => expect(hook.result.current.data?.id).toBe("ntc_1"));
        expect(api.detail).toHaveBeenCalledWith({
            path: { contentNoticeId: "ntc_1" },
            signal: expect.any(AbortSignal),
        });
        expect(hook.result.current.data?.current.listingSource).toEqual({ exists: false });
    });

    it("reports a missing notice without retrying", async () => {
        client = new QueryClient();
        api.detail.mockResolvedValue(failure(404));
        const hook = renderHook(() => useAdminContentNotice("ntc_gone"), { wrapper });

        await waitFor(() => expect(hook.result.current.error).toBeTruthy());
        const error = hook.result.current.error as AdminContentNoticeRequestError;
        expect(error.status).toBe(404);
        expect(error.message).toBe(testI18n.t("adminContentNotices.errors.missing"));
        expect(api.detail).toHaveBeenCalledTimes(1);
    });
});
