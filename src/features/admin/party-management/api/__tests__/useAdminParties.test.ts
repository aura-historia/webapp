import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { clearViewerScopedQueries } from "@/features/authentication/lib/clearViewerScopedQueries.ts";
import {
    adminPartyDetailQueryKey,
    useAdminParties,
    useAdminParty,
    useCreateAdminParty,
    useDeleteAdminParty,
    useUpdateAdminParty,
} from "../useAdminParties.ts";

const api = vi.hoisted(() => ({
    search: vi.fn(),
    detail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
}));
vi.mock("@/client", () => ({
    adminSearchParties: api.search,
    adminGetParty: api.detail,
    adminCreateParty: api.create,
    adminUpdateParty: api.update,
    adminDeleteParty: api.remove,
}));

const partyDto = {
    partyId: "party_01",
    partySlugId: "atelier-bleu",
    name: "Atelier Bleu",
    contact: { email: "info@example.test", phone: "+33 1 23 45 67 89" },
    created: "2026-09-01T10:00:00.000Z",
    updated: "2026-09-02T11:00:00.000Z",
};
const ok = (data: unknown, status = 200) => ({ data, response: { status, ok: true } });
const failure = (status: number, detail?: string) => ({
    error: { status, title: "Problem", error: "PROBLEM", detail },
    response: { status, ok: false },
});

describe("admin Party API", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    it("searches with filters and reuses the opaque string cursor", async () => {
        api.search
            .mockResolvedValueOnce(
                ok({
                    items: [partyDto],
                    size: 1,
                    total: 4,
                    searchAfter: "opaque/cursor+1",
                }),
            )
            .mockResolvedValueOnce(ok({ items: [], size: 0 }));
        const hook = renderHook(
            () =>
                useAdminParties({
                    query: "atelier",
                    phone: "123",
                    createdFrom: "2026-09-01",
                    sort: "name",
                    order: "asc",
                }),
            { wrapper },
        );

        await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(1));
        expect(api.search).toHaveBeenLastCalledWith({
            query: {
                size: 25,
                query: "atelier",
                phone: "123",
                "created[min]": "2026-09-01T00:00:00.000Z",
                sort: "name",
                order: "asc",
            },
            signal: expect.any(AbortSignal),
        });
        expect(hook.result.current.data?.pages[0]?.total).toBe(4);
        expect(hook.result.current.hasNextPage).toBe(true);

        await act(async () => {
            await hook.result.current.fetchNextPage();
        });
        expect(api.search).toHaveBeenLastCalledWith({
            query: {
                size: 25,
                query: "atelier",
                phone: "123",
                "created[min]": "2026-09-01T00:00:00.000Z",
                sort: "name",
                order: "asc",
                searchAfter: "opaque/cursor+1",
            },
            signal: expect.any(AbortSignal),
        });
        await waitFor(() => expect(hook.result.current.hasNextPage).toBe(false));
    });

    it("maps the detail response and aborts private reads when viewer queries clear", async () => {
        api.detail.mockImplementation(
            ({ signal }: { signal: AbortSignal }) =>
                new Promise((_resolve, reject) => {
                    signal.addEventListener("abort", () => reject(new Error("aborted")), {
                        once: true,
                    });
                }),
        );
        const hook = renderHook(() => useAdminParty("party_01"), { wrapper });
        await waitFor(() => expect(api.detail).toHaveBeenCalled());
        const signal: AbortSignal = api.detail.mock.calls[0]?.[0].signal;

        await act(async () => {
            clearViewerScopedQueries(client);
        });
        expect(signal.aborted).toBe(true);
        expect(client.getQueryData(adminPartyDetailQueryKey("party_01"))).toBeUndefined();
        hook.unmount();

        api.detail.mockResolvedValue(ok(partyDto));
        const loaded = renderHook(() => useAdminParty("party_01"), { wrapper });
        await waitFor(() => expect(loaded.result.current.data?.partySlugId).toBe("atelier-bleu"));
        expect(loaded.result.current.data?.contact.email).toBe("info@example.test");
    });

    it("shows a fixed forbidden message without exposing returned error details", async () => {
        api.search.mockResolvedValue(failure(403, "Private address info@example.test"));
        const hook = renderHook(() => useAdminParties({}), { wrapper });
        await waitFor(() => expect(hook.result.current.error).toBeTruthy());
        expect(hook.result.current.error?.message).toBe(
            testI18n.t("adminParties.errors.forbidden"),
        );
        expect(hook.result.current.error?.message).not.toContain("info@example.test");
    });

    it("creates only supplied contacts and refreshes the list and overview", async () => {
        api.create.mockResolvedValue(ok(partyDto, 201));
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const hook = renderHook(() => useCreateAdminParty(), { wrapper });
        let createdId: string | undefined;
        await act(async () => {
            createdId = await hook.result.current.mutateAsync({
                name: " Atelier Bleu ",
                phone: " ",
                email: " info@example.test ",
            });
        });
        expect(api.create).toHaveBeenCalledWith({
            body: { name: "Atelier Bleu", email: "info@example.test" },
        });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "parties", "list"] });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "overview"] });
        expect(createdId).toBe("party_01");
    });

    it("updates only changed fields and sends null to clear a contact", async () => {
        api.update.mockResolvedValue(ok({ ...partyDto, contact: { email: "info@example.test" } }));
        const hook = renderHook(() => useUpdateAdminParty(), { wrapper });
        await act(async () => {
            await hook.result.current.mutateAsync({
                partyId: "party_01",
                patch: { phone: null },
            });
        });
        expect(api.update).toHaveBeenCalledWith({
            path: { partyId: "party_01" },
            body: { phone: null },
        });
    });

    it("accepts a bodyless 204 delete response", async () => {
        api.remove.mockResolvedValue({ data: undefined, response: { status: 204, ok: true } });
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const hook = renderHook(() => useDeleteAdminParty(), { wrapper });
        await act(async () => {
            await expect(hook.result.current.mutateAsync("party_01")).resolves.toBe("party_01");
        });
        expect(api.remove).toHaveBeenCalledWith({ path: { partyId: "party_01" } });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "overview"] });
    });

    it("reports delete conflicts without implying related records were removed", async () => {
        api.remove.mockResolvedValue(failure(409, "Contact info@example.test is retained"));
        const hook = renderHook(() => useDeleteAdminParty(), { wrapper });
        await act(async () => {
            await expect(hook.result.current.mutateAsync("party_01")).rejects.toMatchObject({
                status: 409,
                message: testI18n.t("adminParties.errors.deleteConflict"),
            });
        });
        expect(hook.result.current.error?.message).not.toContain("info@example.test");
    });
});
