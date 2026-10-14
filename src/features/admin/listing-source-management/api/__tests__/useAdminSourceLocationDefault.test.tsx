import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SourceLocationDefaultData } from "@/client";
import { geographyQueryKeys } from "@/data/internal/geography/GeographyQueryKeys.ts";
import type { SourceLocationDefault } from "@/data/internal/geography/SourceLocationDefault.ts";
import { isViewerScopedQuery } from "@/features/authentication/lib/clearViewerScopedQueries.ts";
import testI18n from "@/i18n/i18nForTests";
import { adminListingSourceDetailQueryKey } from "../useAdminListingSources.ts";
import {
    AdminSourceLocationDefaultRequestError,
    useAdminSourceLocationDefault,
    useAssignAdminSourceLocationDefault,
    useChangeAdminSourceLocationDefaultApplicability,
    useClearAdminSourceLocationDefault,
} from "../useAdminSourceLocationDefault.ts";

const api = vi.hoisted(() => ({
    get: vi.fn(),
    assign: vi.fn(),
    change: vi.fn(),
    clear: vi.fn(),
}));
vi.mock("@/client", () => ({
    adminGetSourceLocationDefault: api.get,
    adminAssignSourceLocationDefault: api.assign,
    adminChangeSourceLocationDefaultApplicability: api.change,
    adminClearSourceLocationDefault: api.clear,
}));

const t = (key: string) => testI18n.t(key);
const scope = { viewerCacheKey: "user-1", listingSourceId: "ls_1", operatorPartyId: "pty_1" };
const defaultKey = geographyQueryKeys.adminSourceLocationDefault("ls_1");
const locationsKey = geographyQueryKeys.partyLocationList("user-1", "pty_1");
const dto = (patch: Partial<SourceLocationDefaultData> = {}): SourceLocationDefaultData =>
    ({
        listingSourceId: "ls_1",
        revision: 3,
        assignment: {
            partyLocationId: "ploc_1",
            advertisedInventory: { reference: "catalogue", scope: "ADVERTISED_INVENTORY" },
        },
        eligibility: "ACTIVE",
        ...patch,
    }) as SourceLocationDefaultData;
const ok = (data: unknown) => ({ data, response: { status: 200 } });
const failure = (status?: number, code = "CONFLICT") => ({
    error: { title: "Problem", error: code, detail: "evidence: catalogue p. 4" },
    response: status === undefined ? undefined : { status },
});

describe("admin source location default API", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const isInvalidated = (queryKey: readonly unknown[]) =>
        client.getQueryState(queryKey)?.isInvalidated;
    const seed = () => {
        client.setQueryData(defaultKey, { listingSourceId: "ls_1", revision: 3 });
        client.setQueryData(locationsKey, { pages: [], pageParams: [] });
        client.setQueryData(adminListingSourceDetailQueryKey("ls_1"), { listingSourceId: "ls_1" });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient();
    });

    it("reads through the admin route as private, cancellable data under the admin root", async () => {
        api.get.mockResolvedValue(ok(dto()));
        const { result } = renderHook(() => useAdminSourceLocationDefault("ls_1"), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.get).toHaveBeenCalledWith(
            expect.objectContaining({
                path: { listing_source_id: "ls_1" },
                cache: "no-store",
                signal: expect.any(AbortSignal),
            }),
        );
        expect(result.current.data).toMatchObject({
            revision: 3,
            eligibility: "ACTIVE",
            assignment: { partyLocationId: "ploc_1", advertisedInventory: "catalogue" },
        });
        expect(defaultKey[0]).toBe("admin");
        expect(isViewerScopedQuery(defaultKey)).toBe(true);
    });

    it("rejects a response for another source and never shows problem details", async () => {
        api.get.mockResolvedValueOnce(ok(dto({ listingSourceId: "ls_2" })));
        const { result } = renderHook(() => useAdminSourceLocationDefault("ls_1"), { wrapper });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.data).toBeUndefined();

        api.get.mockResolvedValueOnce(failure(403, "FORBIDDEN"));
        const { error } = await act(() => result.current.refetch());
        expect(error).toBeInstanceOf(AdminSourceLocationDefaultRequestError);
        expect(error).toMatchObject({ reason: "forbidden", isAccessLoss: true });
        expect(error?.message).toBe(t("adminListingSources.locationDefault.errors.forbidden"));
        expect(error?.message).not.toContain("catalogue");
    });

    it("assigns with the expected revision and both scoped assertions", async () => {
        api.assign.mockResolvedValue(ok(dto({ revision: 4 })));
        seed();
        const { result } = renderHook(() => useAssignAdminSourceLocationDefault(scope), {
            wrapper,
        });

        await act(() =>
            result.current.mutateAsync({
                expectedRevision: 3,
                partyLocationId: "ploc_1",
                advertisedInventory: "catalogue",
            }),
        );

        expect(api.assign).toHaveBeenCalledWith(
            expect.objectContaining({
                path: { listing_source_id: "ls_1" },
                cache: "no-store",
                body: {
                    expectedRevision: 3,
                    partyLocationId: "ploc_1",
                    businessAssociation: null,
                    advertisedInventory: {
                        reference: "catalogue",
                        scope: "ADVERTISED_INVENTORY",
                    },
                },
            }),
        );
        expect(client.getQueryData<SourceLocationDefault>(defaultKey)?.revision).toBe(4);
    });

    it("rejects invalid evidence before sending", async () => {
        const { result } = renderHook(() => useAssignAdminSourceLocationDefault(scope), {
            wrapper,
        });

        await expect(
            result.current.mutateAsync({
                expectedRevision: 3,
                partyLocationId: "ploc_1",
                businessAssociation: "line\nbreak",
            }),
        ).rejects.toMatchObject({ reason: "invalid" });
        expect(api.assign).not.toHaveBeenCalled();
    });

    it("changes only the supplied assertions: omitted keeps, null removes", async () => {
        api.change.mockResolvedValue(ok(dto({ revision: 4 })));
        const { result } = renderHook(
            () => useChangeAdminSourceLocationDefaultApplicability(scope),
            { wrapper },
        );

        await act(() =>
            result.current.mutateAsync({ expectedRevision: 3, advertisedInventory: null }),
        );

        expect(api.change.mock.calls[0][0].body).toEqual({
            expectedRevision: 3,
            advertisedInventory: null,
        });
    });

    it("clears a retired reference at the expected revision", async () => {
        api.clear.mockResolvedValue(ok(dto({ revision: 5, assignment: null })));
        const { result } = renderHook(() => useClearAdminSourceLocationDefault(scope), {
            wrapper,
        });

        const cleared = await act(() => result.current.mutateAsync(4));

        expect(api.clear.mock.calls[0][0]).toMatchObject({
            path: { listing_source_id: "ls_1" },
            body: { expectedRevision: 4 },
        });
        expect(cleared.assignment).toBeUndefined();
    });

    it("never replaces a newer loaded revision with an older response", async () => {
        api.change.mockResolvedValue(ok(dto({ revision: 4 })));
        client.setQueryData(defaultKey, { listingSourceId: "ls_1", revision: 6 });
        const { result } = renderHook(
            () => useChangeAdminSourceLocationDefaultApplicability(scope),
            { wrapper },
        );

        await act(() => result.current.mutateAsync({ expectedRevision: 3 }));

        expect(client.getQueryData<SourceLocationDefault>(defaultKey)?.revision).toBe(6);
    });

    it("refetches the default and the operator's locations after a conflict", async () => {
        api.assign.mockResolvedValue(failure(409));
        seed();
        const { result } = renderHook(() => useAssignAdminSourceLocationDefault(scope), {
            wrapper,
        });

        const error = await act(() =>
            result.current
                .mutateAsync({ expectedRevision: 3, partyLocationId: "ploc_1" })
                .catch((error: unknown) => error),
        );

        expect(error).toMatchObject({ reason: "conflict", status: 409 });
        expect((error as Error).message).toBe(
            t("adminListingSources.locationDefault.errors.conflict"),
        );
        expect(isInvalidated(defaultKey)).toBe(true);
        expect(isInvalidated(locationsKey)).toBe(true);
        expect(isInvalidated(adminListingSourceDetailQueryKey("ls_1"))).toBe(false);
    });

    it("reports an inactive or foreign location and refetches the source's operator", async () => {
        api.assign.mockResolvedValue(failure(404, "PARTY_NOT_FOUND"));
        seed();
        const { result } = renderHook(() => useAssignAdminSourceLocationDefault(scope), {
            wrapper,
        });

        const error = await act(() =>
            result.current
                .mutateAsync({ expectedRevision: 3, partyLocationId: "ploc_9" })
                .catch((error: unknown) => error),
        );

        expect(error).toMatchObject({ reason: "locationUnavailable" });
        expect(isInvalidated(locationsKey)).toBe(true);
        expect(isInvalidated(adminListingSourceDetailQueryKey("ls_1"))).toBe(true);
    });

    it("removes the loaded default when administrator authority is missing", async () => {
        api.clear.mockResolvedValue(failure(403, "FORBIDDEN"));
        seed();
        const { result } = renderHook(() => useClearAdminSourceLocationDefault(scope), {
            wrapper,
        });

        const error = await act(() =>
            result.current.mutateAsync(3).catch((error: unknown) => error),
        );

        expect(error).toMatchObject({ reason: "forbidden" });
        expect(client.getQueryData(defaultKey)).toBeUndefined();
    });
});
