import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import {
    adminListingSourceDetailQueryKey,
    isPublicListingSourceQuery,
    useAdminListingSource,
    useAdminListingSources,
    useCreateAdminListingSource,
    useDeleteAdminListingSource,
    useUpdateAdminListingSource,
} from "../useAdminListingSources.ts";
import {
    createDefaultConfiguration,
    defaultUpdateConfigurations,
    type AdminListingSourceCreateValues,
    type AdminListingSourceDetail,
} from "@/data/internal/listing-source/AdminListingSource.ts";

const api = vi.hoisted(() => ({
    search: vi.fn(),
    detail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
}));
vi.mock("@/client", () => ({
    adminSearchListingSources: api.search,
    adminGetListingSource: api.detail,
    adminCreateListingSource: api.create,
    adminUpdateListingSource: api.update,
    adminDeleteListingSource: api.remove,
}));

const summaryDto = {
    listingSourceId: "ls_01SOURCE",
    listingSourceSlugId: "antique-house",
    name: "Antique House",
    operator: { partyId: "party_01", partySlugId: "antique-house", name: "Antique House Ltd" },
    ingestionMethods: ["WEB_CRAWL", "SHOPIFY"],
    presentation: { url: "https://antique.example" },
    referralConfiguration: { type: "PARTNERIZE", camref: "ref-01" },
    created: "2026-09-01T10:00:00.000Z",
    updated: "2026-09-02T11:00:00.000Z",
};
const detailDto = {
    listingSourceId: "ls_01SOURCE",
    listingSourceSlugId: "antique-house",
    name: "Antique House",
    operator: { partyId: "party_01", partySlugId: "antique-house", name: "Antique House Ltd" },
    ingestionMethods: ["WEB_CRAWL", "SHOPIFY"],
    url: "https://antique.example",
    created: "2026-09-01T10:00:00.000Z",
    updated: "2026-09-02T11:00:00.000Z",
};
const source: AdminListingSourceDetail = {
    listingSourceId: "ls_01SOURCE",
    listingSourceSlugId: "antique-house",
    name: "Antique House",
    operator: { partyId: "party_01", partySlugId: "antique-house", name: "Antique House Ltd" },
    ingestionMethods: ["WEB_CRAWL", "SHOPIFY"],
    presentation: { url: "https://antique.example" },
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-02T11:00:00.000Z"),
};

const ok = (data: unknown, status = 200) => ({ data, response: { status, ok: true } });
const failure = (status: number, detail?: string) => ({
    error: { status, title: "Problem", error: "PROBLEM", detail },
    response: { status, ok: false },
});

describe("admin ListingSource API", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    it("searches supported filters and follows cursor pages unchanged", async () => {
        api.search
            .mockResolvedValueOnce(
                ok({ items: [summaryDto], size: 1, total: 2, searchAfter: "opaque/cursor+1" }),
            )
            .mockResolvedValueOnce(ok({ items: [], size: 0 }));
        const hook = renderHook(
            () =>
                useAdminListingSources({
                    query: "antique",
                    name: "house",
                    listingSourceId: "ls_01SOURCE",
                    listingSourceSlugId: "antique-house",
                    operatorPartyId: "party_01",
                    ingestionMethod: "SHOPIFY",
                    sort: "updated",
                    order: "desc",
                }),
            { wrapper },
        );
        await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(1));
        expect(api.search).toHaveBeenLastCalledWith({
            query: {
                size: 25,
                query: "antique",
                name: "house",
                listingSourceId: "ls_01SOURCE",
                listingSourceSlugId: "antique-house",
                operatorPartyId: "party_01",
                ingestionMethod: "SHOPIFY",
                sort: "updated",
                order: "desc",
            },
            signal: expect.any(AbortSignal),
        });
        await act(async () => hook.result.current.fetchNextPage());
        expect(api.search).toHaveBeenLastCalledWith({
            query: {
                size: 25,
                query: "antique",
                name: "house",
                listingSourceId: "ls_01SOURCE",
                listingSourceSlugId: "antique-house",
                operatorPartyId: "party_01",
                ingestionMethod: "SHOPIFY",
                sort: "updated",
                order: "desc",
                searchAfter: "opaque/cursor+1",
            },
            signal: expect.any(AbortSignal),
        });
    });

    it("maps detail reads independently from search summaries", async () => {
        api.detail.mockResolvedValue(ok(detailDto));
        const hook = renderHook(() => useAdminListingSource("ls_01SOURCE"), { wrapper });
        await waitFor(() =>
            expect(hook.result.current.data?.operator.name).toBe("Antique House Ltd"),
        );
        expect(api.detail).toHaveBeenCalledWith({
            path: { listingSourceId: "ls_01SOURCE" },
            signal: expect.any(AbortSignal),
        });
        expect(hook.result.current.data).not.toHaveProperty("referralConfiguration");
        expect(hook.result.current.data).not.toHaveProperty("ingestionConfiguration");
    });

    it("accepts reference-only create responses and invalidates related admin data", async () => {
        api.create.mockResolvedValue(
            ok({ listingSourceId: "ls_02SOURCE", listingSourceSlugId: "new-source" }, 201),
        );
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const hook = renderHook(() => useCreateAdminListingSource(), { wrapper });
        const values: AdminListingSourceCreateValues = {
            name: "New Source",
            operatorType: "EXISTING",
            operatorPartyId: "party_02",
            operatorName: "",
            operatorPhone: "",
            operatorEmail: "",
            configurations: [createDefaultConfiguration("UNCONFIGURED", "WEB_CRAWL")],
            url: "",
            image: "",
            partnerizeCamref: "",
        };
        let reference: { listingSourceId: string; listingSourceSlugId: string } | undefined;
        await act(async () => {
            reference = await hook.result.current.mutateAsync(values);
        });
        expect(api.create).toHaveBeenCalledWith({
            body: {
                name: "New Source",
                operator: { type: "EXISTING", partyId: "party_02" },
                ingestionConfiguration: [{ type: "UNCONFIGURED", ingestionMethod: "WEB_CRAWL" }],
            },
        });
        expect(reference).toEqual({
            listingSourceId: "ls_02SOURCE",
            listingSourceSlugId: "new-source",
        });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "listing-sources", "list"] });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "partnerships"] });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "overview"] });
    });

    it("updates only intentional values and accepts the reference-only response", async () => {
        api.update.mockResolvedValue(
            ok({ listingSourceId: "ls_01SOURCE", listingSourceSlugId: "antique-house" }),
        );
        const hook = renderHook(() => useUpdateAdminListingSource(), { wrapper });
        await act(async () => {
            await expect(
                hook.result.current.mutateAsync({
                    source,
                    values: {
                        name: "Renamed House",
                        url: "https://antique.example",
                        image: "",
                        referralAction: "KEEP",
                        partnerizeCamref: "",
                        replaceIngestionConfiguration: false,
                        configurations: defaultUpdateConfigurations(source.ingestionMethods),
                    },
                }),
            ).resolves.toEqual({
                listingSourceId: "ls_01SOURCE",
                listingSourceSlugId: "antique-house",
            });
        });
        expect(api.update).toHaveBeenCalledWith({
            path: { listingSourceId: "ls_01SOURCE" },
            body: { name: "Renamed House" },
        });
    });

    it("handles bodyless delete success and fixed conflict feedback", async () => {
        api.remove.mockResolvedValueOnce({ data: undefined, response: { status: 204, ok: true } });
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const hook = renderHook(() => useDeleteAdminListingSource(), { wrapper });
        await act(async () => {
            await expect(hook.result.current.mutateAsync("ls_01SOURCE")).resolves.toBe(
                "ls_01SOURCE",
            );
        });
        expect(api.remove).toHaveBeenCalledWith({ path: { listingSourceId: "ls_01SOURCE" } });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "partnerships"] });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin", "overview"] });
        expect(invalidate).toHaveBeenCalledWith({
            queryKey: ["admin", "partnership-applications"],
        });

        api.remove.mockResolvedValueOnce(failure(409, "private provider configuration"));
        await act(async () => {
            await expect(hook.result.current.mutateAsync("ls_01SOURCE")).rejects.toMatchObject({
                status: 409,
                message: testI18n.t("adminListingSources.errors.deleteConflict"),
            });
        });
        expect(hook.result.current.error?.message).not.toContain("private provider configuration");
    });

    it("invalidates cached public ListingSource data after a mutation", async () => {
        const publicKeys = [
            ["publicListingSourceSearch", "antique", 20],
            ["public-listing-source-selection", "antique"],
            [{ _id: "searchPublicListingSources", query: { query: "antique" } }],
            [
                {
                    _id: "getPublicListingSourceBySlug",
                    path: { listingSourceSlugId: "antique-house" },
                },
            ],
        ];
        const unrelatedKey = [{ _id: "getProductListing" }];
        for (const queryKey of [...publicKeys, unrelatedKey]) {
            client.setQueryData(queryKey, { cached: true });
        }
        api.remove.mockResolvedValueOnce({ data: undefined, response: { status: 204, ok: true } });
        const hook = renderHook(() => useDeleteAdminListingSource(), { wrapper });
        await act(async () => {
            await hook.result.current.mutateAsync("ls_01SOURCE");
        });
        for (const queryKey of publicKeys) {
            expect(client.getQueryState(queryKey)?.isInvalidated).toBe(true);
        }
        expect(client.getQueryState(unrelatedKey)?.isInvalidated).toBe(false);
        expect(isPublicListingSourceQuery(["admin", "listing-sources"])).toBe(false);
        expect(isPublicListingSourceQuery([null])).toBe(false);
    });

    it("reports authorization failures without exposing API details", async () => {
        api.search.mockResolvedValue(failure(403, "private configuration"));
        const hook = renderHook(() => useAdminListingSources({}), { wrapper });
        await waitFor(() => expect(hook.result.current.error).toBeTruthy());
        expect(hook.result.current.error?.message).toBe(
            testI18n.t("adminListingSources.errors.forbidden"),
        );
        expect(hook.result.current.error?.message).not.toContain("private configuration");
    });

    it("keeps normalized detail in its namespaced admin cache", async () => {
        api.detail.mockResolvedValue(ok(detailDto));
        const detailQuery = renderHook(() => useAdminListingSource("ls_01SOURCE"), { wrapper });
        await waitFor(() => expect(detailQuery.result.current.data?.name).toBe("Antique House"));
        expect(client.getQueryData(adminListingSourceDetailQueryKey("ls_01SOURCE"))).toMatchObject({
            listingSourceSlugId: "antique-house",
        });
    });
});
