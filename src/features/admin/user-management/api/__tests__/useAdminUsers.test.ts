import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { clearViewerScopedQueries } from "@/features/authentication/lib/clearViewerScopedQueries.ts";
import type { AdminUserFilters } from "../../lib/adminUserSearch.ts";
import {
    adminUserDetailQueryKey,
    adminUserListQueryOptions,
    createAdminUserErrorFactory,
    useAdminUser,
    useAdminUsers,
    useDeleteAdminUser,
    useUpdateAdminUserProfile,
    useUpdateAdminUserRole,
    useUpdateAdminUserTier,
} from "../useAdminUsers.ts";

const api = vi.hoisted(() => ({
    search: vi.fn(),
    detail: vi.fn(),
    patch: vi.fn(),
    remove: vi.fn(),
}));
vi.mock("@/client", () => ({
    adminSearchUsers: api.search,
    adminGetUser: api.detail,
    adminPatchUser: api.patch,
    adminDeleteUser: api.remove,
}));

const summaryFixture = {
    userId: "opaque/user+01",
    email: "ada@example.test",
    firstName: "Ada",
    lastName: "Lovelace",
    tier: "PRO",
    role: "USER",
};
const detailFixture = {
    userId: "opaque/user+01",
    email: "ada@example.test",
    firstName: "Ada",
    lastName: null,
    language: "en",
    currency: "EUR",
    measurementUnit: "METRIC",
    showUnassessedOrSensitiveContent: true,
    tier: "PRO",
    role: "USER",
    created: "2020-01-01T00:00:00.000Z",
    updated: "2026-01-01T00:00:00.000Z",
    structuredAddress: { city: "London" },
};
const ok = (data: unknown, status = 200) => ({ data, response: { status, ok: true } });
const failure = (status: number, detail?: string) => ({
    error: { status, title: "Problem", error: "CONFLICT", detail },
    response: { status, ok: false },
});

describe("admin user API", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    it("prefetches the first page with private query options for the route loader", async () => {
        api.search.mockResolvedValueOnce(ok({ items: [summaryFixture], size: 1, total: 1 }));
        const filters: AdminUserFilters = { sort: "name", order: "asc" };

        const options = adminUserListQueryOptions(filters, createAdminUserErrorFactory(testI18n.t));

        await client.prefetchInfiniteQuery(options);

        expect(api.search).toHaveBeenCalledWith(
            expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) }),
        );
        expect(client.getQueryData(options.queryKey)?.pages[0]?.items).toHaveLength(1);
    });

    it("uses declared query parameters and passes opaque cursors as returned", async () => {
        api.search
            .mockResolvedValueOnce(
                ok({
                    items: [summaryFixture],
                    size: 1,
                    total: 2,
                    searchAfter: "opaque/cursor+one",
                }),
            )
            .mockResolvedValueOnce(ok({ items: [], size: 0 }));
        const filters = {
            query: "ada",
            email: "example.test",
            tier: ["PRO"] as const,
            role: ["USER"] as const,
            createdFrom: "2026-01-01",
            updatedTo: "2026-03-31",
            sort: "name" as const,
            order: "asc" as const,
        };
        const hook = renderHook(() => useAdminUsers(filters), { wrapper });

        await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(1));
        expect(hook.result.current.data?.pages[0]?.items[0]).toMatchObject({
            userId: "opaque/user+01",
            email: "ada@example.test",
            tier: "pro",
        });
        expect(hook.result.current.data?.pages[0]?.items[0]).not.toHaveProperty("language");
        expect(api.search).toHaveBeenLastCalledWith({
            query: {
                size: 21,
                query: "ada",
                email: "example.test",
                tier: ["PRO"],
                role: ["USER"],
                "created[min]": "2026-01-01T00:00:00.000Z",
                "updated[max]": "2026-03-31T23:59:59.999Z",
                sort: "name",
                order: "asc",
            },
            signal: expect.any(AbortSignal),
            cache: "no-store",
        });

        await act(async () => {
            await hook.result.current.fetchNextPage();
        });
        expect(api.search).toHaveBeenLastCalledWith({
            query: {
                size: 21,
                query: "ada",
                email: "example.test",
                tier: ["PRO"],
                role: ["USER"],
                "created[min]": "2026-01-01T00:00:00.000Z",
                "updated[max]": "2026-03-31T23:59:59.999Z",
                sort: "name",
                order: "asc",
                searchAfter: "opaque/cursor+one",
            },
            signal: expect.any(AbortSignal),
            cache: "no-store",
        });
    });

    it("starts at page one when filters or sort change", async () => {
        api.search
            .mockResolvedValueOnce(
                ok({ items: [summaryFixture], size: 1, searchAfter: "cursor-A" }),
            )
            .mockResolvedValueOnce(ok({ items: [], size: 0 }))
            .mockResolvedValueOnce(ok({ items: [], size: 0 }));
        const firstFilters: AdminUserFilters = { sort: "name", order: "asc" };
        const hook = renderHook(({ filters }) => useAdminUsers(filters), {
            initialProps: { filters: firstFilters },
            wrapper,
        });

        await waitFor(() => expect(hook.result.current.hasNextPage).toBe(true));
        await act(async () => {
            await hook.result.current.fetchNextPage();
        });
        expect(api.search.mock.calls[1]?.[0].query.searchAfter).toBe("cursor-A");

        hook.rerender({ filters: { sort: "email", order: "desc" } });
        await waitFor(() => expect(api.search).toHaveBeenCalledTimes(3));
        expect(api.search.mock.calls[2]?.[0].query).toEqual({
            size: 21,
            sort: "email",
            order: "desc",
        });
    });

    it("maps detail separately and removes pending private reads when viewer data clears", async () => {
        api.detail.mockResolvedValue(ok(detailFixture));
        const hook = renderHook(() => useAdminUser("opaque/user+01"), { wrapper });
        await waitFor(() =>
            expect(hook.result.current.data?.showUnassessedOrSensitiveContent).toBe(true),
        );
        expect(hook.result.current.data).toMatchObject({
            userId: "opaque/user+01",
            lastName: null,
            language: "en",
            tier: "pro",
        });
        expect(hook.result.current.data).not.toHaveProperty("created");
        expect(hook.result.current.data).not.toHaveProperty("updated");
        expect(hook.result.current.data).not.toHaveProperty("structuredAddress");
        expect(api.detail).toHaveBeenCalledWith({
            path: { userId: "opaque/user+01" },
            signal: expect.any(AbortSignal),
            cache: "no-store",
        });

        hook.unmount();
        api.detail.mockImplementation(
            ({ signal }: { signal: AbortSignal }) =>
                new Promise((_resolve, reject) => {
                    signal.addEventListener("abort", () => reject(new Error("aborted")), {
                        once: true,
                    });
                }),
        );
        const pending = renderHook(() => useAdminUser("opaque/pending"), { wrapper });
        await waitFor(() => expect(api.detail).toHaveBeenCalledTimes(2));
        const signal: AbortSignal = api.detail.mock.calls[1]?.[0].signal;
        await act(async () => clearViewerScopedQueries(client));
        expect(signal.aborted).toBe(true);
        expect(client.getQueryData(adminUserDetailQueryKey("opaque/pending"))).toBeUndefined();
        pending.unmount();
    });

    it("sends role, tier, and profile changes in separate patch requests", async () => {
        api.patch.mockResolvedValue(ok(detailFixture));
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const role = renderHook(() => useUpdateAdminUserRole(), { wrapper });
        const tier = renderHook(() => useUpdateAdminUserTier(), { wrapper });
        const profile = renderHook(() => useUpdateAdminUserProfile(), { wrapper });

        await act(async () => {
            await role.result.current.mutateAsync({
                userId: "opaque/user+01",
                patch: { role: "ADMIN" },
            });
            await tier.result.current.mutateAsync({
                userId: "opaque/user+01",
                patch: { tier: "ULTIMATE" },
            });
            await profile.result.current.mutateAsync({
                userId: "opaque/user+01",
                patch: { firstName: null, email: "ada.new@example.test" },
            });
        });

        expect(api.patch).toHaveBeenNthCalledWith(1, {
            path: { userId: "opaque/user+01" },
            body: { role: "ADMIN" },
            cache: "no-store",
        });
        expect(api.patch).toHaveBeenNthCalledWith(2, {
            path: { userId: "opaque/user+01" },
            body: { tier: "ULTIMATE" },
            cache: "no-store",
        });
        expect(api.patch).toHaveBeenNthCalledWith(3, {
            path: { userId: "opaque/user+01" },
            body: { firstName: null, email: "ada.new@example.test" },
            cache: "no-store",
        });
        // Role and tier changes move users between overview aggregates.
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "overview"] });
    });

    it("surfaces last-active-admin conflicts for role demotion and deletion", async () => {
        api.patch.mockResolvedValue(failure(409, "Private account details"));
        const role = renderHook(() => useUpdateAdminUserRole(), { wrapper });
        await act(async () => {
            await expect(
                role.result.current.mutateAsync({
                    userId: "opaque/user+01",
                    patch: { role: "USER" },
                }),
            ).rejects.toMatchObject({
                status: 409,
                message: testI18n.t("adminUsers.errors.lastAdmin"),
            });
        });
        expect(role.result.current.error?.message).not.toContain("Private account details");

        api.remove.mockResolvedValue(failure(409, "Private account details"));
        const remove = renderHook(() => useDeleteAdminUser(), { wrapper });
        await act(async () => {
            await expect(remove.result.current.mutateAsync("opaque/user+01")).rejects.toMatchObject(
                {
                    status: 409,
                    message: testI18n.t("adminUsers.errors.deleteConflict"),
                },
            );
        });
        await waitFor(() =>
            expect(remove.result.current.error?.message).toBe(
                testI18n.t("adminUsers.errors.deleteConflict"),
            ),
        );
        expect(remove.result.current.error?.message).not.toContain("Private account details");
        expect(api.remove).toHaveBeenCalledWith({
            path: { userId: "opaque/user+01" },
            cache: "no-store",
        });
    });

    it("accepts a bodyless 204 delete response", async () => {
        api.remove.mockResolvedValue({ data: undefined, response: { status: 204, ok: true } });
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const remove = renderHook(() => useDeleteAdminUser(), { wrapper });
        await act(async () => {
            await expect(remove.result.current.mutateAsync("opaque/user+01")).resolves.toBe(
                "opaque/user+01",
            );
        });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "overview"] });
    });
});
