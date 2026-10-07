import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import {
    adminApplicationDetailQueryKey,
    adminApplicationListQueryKey,
    useAdminPartnershipApplication,
    useAdminPartnershipApplications,
    useDecideAdminApplication,
    useMarkAdminApplicationInReview,
} from "../useAdminPartnershipApplications.ts";

const api = vi.hoisted(() => ({
    search: vi.fn(),
    detail: vi.fn(),
    markInReview: vi.fn(),
    decide: vi.fn(),
}));
vi.mock("@/client", () => ({
    adminSearchPartnershipApplications: api.search,
    adminGetPartnershipApplication: api.detail,
    adminMarkPartnershipApplicationInReview: api.markInReview,
    adminDecidePartnershipApplication: api.decide,
}));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: () => "Request failed" }),
}));

const proposal = { type: "EXISTING_LISTING_SOURCE" as const, listingSourceId: "ls_1" };
const detail = {
    id: "pa_1",
    applicantUserId: "user_1",
    state: "SUBMITTED" as const,
    proposal,
    approvedPartnershipId: null,
    approvedListingSourceId: null,
};
const summary = { ...detail, created: "2026-09-01T10:00:00Z", updated: "2026-09-01T10:00:00Z" };
const ok = (data: unknown, status = 200) => ({ data, response: { status, ok: true } });
const failure = (status: number) => ({
    error: { status, title: "Problem", error: "PROBLEM" },
    response: { status, ok: false },
});

describe("admin partnership application API", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    it("searches with serialized filters and pages with the returned cursor", async () => {
        api.search
            .mockResolvedValueOnce(
                ok({ items: [summary], size: 1, searchAfter: ["2026-09-01T10:00:00Z", "pa_1"] }),
            )
            .mockResolvedValueOnce(ok({ items: [], size: 0 }));
        const filters = {
            states: ["SUBMITTED" as const],
            sort: "created" as const,
            order: "asc" as const,
        };
        const hook = renderHook(() => useAdminPartnershipApplications(filters), { wrapper });
        await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(1));
        expect(api.search).toHaveBeenLastCalledWith({
            query: { size: 21, state: ["SUBMITTED"], sort: "created", order: "asc" },
        });
        expect(hook.result.current.hasNextPage).toBe(true);

        await act(async () => {
            await hook.result.current.fetchNextPage();
        });
        expect(api.search).toHaveBeenLastCalledWith({
            query: {
                size: 21,
                state: ["SUBMITTED"],
                sort: "created",
                order: "asc",
                searchAfter: '["2026-09-01T10:00:00Z","pa_1"]',
            },
        });
        await waitFor(() => expect(hook.result.current.hasNextPage).toBe(false));
    });

    it("reads detail without timestamps", async () => {
        api.detail.mockResolvedValue(ok(detail));
        const hook = renderHook(() => useAdminPartnershipApplication("pa_1"), { wrapper });
        await waitFor(() => expect(hook.result.current.data?.id).toBe("pa_1"));
        expect(api.detail).toHaveBeenCalledWith({ path: { partnershipApplicationId: "pa_1" } });
        expect(hook.result.current.data).not.toHaveProperty("created");
    });

    it("localizes a missing application", async () => {
        api.detail.mockResolvedValue(failure(404));
        const hook = renderHook(() => useAdminPartnershipApplication("pa_missing"), { wrapper });
        await waitFor(() =>
            expect(hook.result.current.error).toMatchObject({
                status: 404,
                message: testI18n.t("adminApplications.errors.missing"),
            }),
        );
    });

    it("marks in review with a body-less PATCH and stores the authoritative result", async () => {
        api.markInReview.mockResolvedValue(ok({ ...detail, state: "IN_REVIEW" }));
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const hook = renderHook(() => useMarkAdminApplicationInReview(), { wrapper });
        await act(async () => {
            await hook.result.current.mutateAsync("pa_1");
        });
        expect(api.markInReview).toHaveBeenCalledWith({
            path: { partnershipApplicationId: "pa_1" },
        });
        const [request] = api.markInReview.mock.calls[0];
        expect(request).not.toHaveProperty("body");
        expect(client.getQueryData(adminApplicationDetailQueryKey("pa_1"))).toMatchObject({
            state: "IN_REVIEW",
        });
        expect(invalidate).toHaveBeenCalledWith({
            queryKey: ["admin", "partnership-applications", "list"],
        });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "overview"] });
    });

    it.each(["APPROVE", "REJECT"] as const)("sends only the %s decision", async (decision) => {
        api.decide.mockResolvedValue(
            ok({
                ...detail,
                state: decision === "APPROVE" ? "APPROVED" : "REJECTED",
                ...(decision === "APPROVE"
                    ? { approvedPartnershipId: "pship_1", approvedListingSourceId: "ls_1" }
                    : {}),
            }),
        );
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const hook = renderHook(() => useDecideAdminApplication(), { wrapper });
        await act(async () => {
            await hook.result.current.mutateAsync({ id: "pa_1", decision });
        });
        expect(api.decide).toHaveBeenCalledWith({
            path: { partnershipApplicationId: "pa_1" },
            body: { decision },
        });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "partnerships"] });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "listing-sources"] });
    });

    async function primeActiveQueries() {
        api.detail.mockResolvedValue(ok({ ...detail, state: "IN_REVIEW" }));
        api.search.mockResolvedValue(ok({ items: [summary], size: 1 }));
        const detailHook = renderHook(() => useAdminPartnershipApplication("pa_1"), { wrapper });
        const listHook = renderHook(() => useAdminPartnershipApplications({}), { wrapper });
        await waitFor(() => expect(detailHook.result.current.data).toBeDefined());
        await waitFor(() => expect(listHook.result.current.data).toBeDefined());
        api.detail.mockClear();
        api.search.mockClear();
    }

    async function expectAuthoritativeRefetch() {
        await waitFor(() => expect(api.detail).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(api.search).toHaveBeenCalledTimes(1));
    }

    const conflict = {
        status: 409,
        message: testI18n.t("adminApplications.errors.conflict"),
    };

    it("reports review conflicts and refetches authoritative state", async () => {
        await primeActiveQueries();
        api.markInReview.mockResolvedValue(failure(409));
        const hook = renderHook(() => useMarkAdminApplicationInReview(), { wrapper });
        await act(async () => {
            await expect(hook.result.current.mutateAsync("pa_1")).rejects.toMatchObject(conflict);
        });
        await expectAuthoritativeRefetch();
        expect(client.getQueryData(adminApplicationDetailQueryKey("pa_1"))).toMatchObject({
            state: "IN_REVIEW",
        });
    });

    it("reports decision conflicts and refetches authoritative state", async () => {
        await primeActiveQueries();
        api.decide.mockResolvedValue(failure(409));
        const hook = renderHook(() => useDecideAdminApplication(), { wrapper });
        await act(async () => {
            await expect(
                hook.result.current.mutateAsync({ id: "pa_1", decision: "APPROVE" }),
            ).rejects.toMatchObject(conflict);
        });
        await expectAuthoritativeRefetch();
        expect(client.getQueryData(adminApplicationListQueryKey({}))).toBeDefined();
    });
});
