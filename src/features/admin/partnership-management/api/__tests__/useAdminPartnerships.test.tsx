import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { OWN_LISTING_SOURCES_QUERY_KEY } from "@/features/partner/common/api/useOwnListingSources.ts";
import {
    useAdminPartnership,
    useAdminPartnerships,
    useDissolveAdminPartnership,
    useGrantAdminPartnershipListingSource,
    useGrantAdminPartnershipMembership,
    useRevokeAdminPartnershipListingSource,
    useRevokeAdminPartnershipMembership,
} from "../useAdminPartnerships.ts";

const api = vi.hoisted(() => ({
    search: vi.fn(),
    detail: vi.fn(),
    dissolve: vi.fn(),
    grantSource: vi.fn(),
    revokeSource: vi.fn(),
    grantMember: vi.fn(),
    revokeMember: vi.fn(),
}));

vi.mock("@/client", () => ({
    adminSearchPartnerships: api.search,
    adminGetPartnership: api.detail,
    adminDissolvePartnership: api.dissolve,
    adminGrantPartnershipListingSource: api.grantSource,
    adminRevokePartnershipListingSource: api.revokeSource,
    adminGrantPartnershipMembership: api.grantMember,
    adminRevokePartnershipMembership: api.revokeMember,
}));

const summary = {
    partnershipId: "psh_01",
    party: { partyId: "pty_01", partySlugId: "atelier", name: "Atelier House" },
    memberCount: 120,
    listingSourceGrantCount: 101,
    created: "2026-09-01T10:00:00.000Z",
    updated: "2026-09-02T11:00:00.000Z",
};
const detail = {
    ...summary,
    memberUserIds: Array.from({ length: 100 }, (_, index) => `usr_${index}`),
    listingSourceIds: Array.from({ length: 100 }, (_, index) => `ls_${index}`),
};
const ok = (data?: unknown, status = 200) => ({
    data,
    response: { status, ok: true },
});
const failure = (status: number) => ({
    error: { status, title: "Problem", error: "PROBLEM", detail: "Do not display this" },
    response: { status, ok: false },
});

describe("admin Partnership API", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    it("uses exact filters and preserves the tuple cursor as JSON between pages", async () => {
        api.search
            .mockResolvedValueOnce(
                ok({ items: [summary], size: 21, searchAfter: [summary.created, "psh_01"] }),
            )
            .mockResolvedValueOnce(ok({ items: [], size: 21 }));
        const filters = {
            partyId: "pty_01",
            memberUserId: "usr_01",
            listingSourceId: "ls_01",
        };
        const hook = renderHook(() => useAdminPartnerships(filters), { wrapper });

        await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(1));
        expect(api.search).toHaveBeenLastCalledWith({
            query: { ...filters, size: 21 },
            signal: expect.any(AbortSignal),
        });
        await act(async () => hook.result.current.fetchNextPage());
        expect(api.search).toHaveBeenLastCalledWith({
            query: {
                ...filters,
                searchAfter: JSON.stringify([summary.created, "psh_01"]),
                size: 21,
            },
            signal: expect.any(AbortSignal),
        });
    });

    it("maps summary and detail counts independently from the capped identifier arrays", async () => {
        api.detail.mockResolvedValue(ok(detail));
        const hook = renderHook(() => useAdminPartnership("psh_01"), { wrapper });
        await waitFor(() => expect(hook.result.current.data?.partnershipId).toBe("psh_01"));

        expect(hook.result.current.data).toMatchObject({
            party: { partyId: "pty_01", partySlugId: "atelier", name: "Atelier House" },
            memberCount: 120,
            listingSourceGrantCount: 101,
            memberUserIds: expect.arrayContaining(["usr_0", "usr_99"]),
            listingSourceIds: expect.arrayContaining(["ls_0", "ls_99"]),
        });
        expect(hook.result.current.data?.memberUserIds).toHaveLength(100);
        expect(hook.result.current.data?.listingSourceIds).toHaveLength(100);
        expect(hook.result.current.data?.created).toBeInstanceOf(Date);
        expect(api.detail).toHaveBeenCalledWith({
            path: { partnershipId: "psh_01" },
            signal: expect.any(AbortSignal),
        });
    });

    it("accepts idempotent grant and revoke 204 responses without a JSON body", async () => {
        for (const operation of [
            api.grantMember,
            api.revokeMember,
            api.grantSource,
            api.revokeSource,
        ]) {
            operation.mockResolvedValue(ok(undefined, 204));
        }
        client.setQueryData(OWN_LISTING_SOURCES_QUERY_KEY, [{ listingSourceId: "ls_01" }]);
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const hooks = renderHook(
            () => ({
                grantMember: useGrantAdminPartnershipMembership(),
                revokeMember: useRevokeAdminPartnershipMembership(),
                grantSource: useGrantAdminPartnershipListingSource(),
                revokeSource: useRevokeAdminPartnershipListingSource(),
            }),
            { wrapper },
        );
        const membership = { partnershipId: "psh_01", userId: "usr_01" };
        const source = { partnershipId: "psh_01", listingSourceId: "ls_01" };

        await act(async () => {
            await hooks.result.current.grantMember.mutateAsync(membership);
            await hooks.result.current.revokeMember.mutateAsync(membership);
            await hooks.result.current.grantSource.mutateAsync(source);
            await hooks.result.current.revokeSource.mutateAsync(source);
        });

        expect(api.grantMember).toHaveBeenCalledWith({ path: membership });
        expect(api.revokeMember).toHaveBeenCalledWith({ path: membership });
        expect(api.grantSource).toHaveBeenCalledWith({ path: source });
        expect(api.revokeSource).toHaveBeenCalledWith({ path: source });
        expect(client.getQueryData(OWN_LISTING_SOURCES_QUERY_KEY)).toEqual([]);
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "overview"] });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "partnerships"] });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: OWN_LISTING_SOURCES_QUERY_KEY });
    });

    it("shows the same-party conflict returned by the backend", async () => {
        api.grantSource.mockResolvedValue(failure(409));
        const hook = renderHook(() => useGrantAdminPartnershipListingSource(), { wrapper });

        await act(async () => {
            await expect(
                hook.result.current.mutateAsync({
                    partnershipId: "psh_01",
                    listingSourceId: "ls_wrong",
                }),
            ).rejects.toMatchObject({
                status: 409,
                message: testI18n.t("adminPartnerships.errors.partyConflict"),
            });
        });
    });

    it("reports dissolution failure and refreshes the partnership state", async () => {
        api.dissolve.mockResolvedValue(failure(500));
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const hook = renderHook(() => useDissolveAdminPartnership(), { wrapper });

        await act(async () => {
            await expect(
                hook.result.current.mutateAsync({ partnershipId: "psh_01" }),
            ).rejects.toMatchObject({
                status: 500,
                message: testI18n.t("adminPartnerships.errors.dissolveFailed"),
            });
        });
        expect(api.dissolve).toHaveBeenCalledWith({ path: { partnershipId: "psh_01" } });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "partnerships"] });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "overview"] });
    });
});
