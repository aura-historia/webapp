import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PartyLocationData } from "@/client";
import { geographyQueryKeys } from "@/data/internal/geography/GeographyQueryKeys.ts";
import type { PartyLocation } from "@/data/internal/geography/PartyLocation.ts";
import testI18n from "@/i18n/i18nForTests";
import { isViewerScopedQuery } from "@/features/authentication/lib/clearViewerScopedQueries.ts";
import {
    PartyLocationRequestError,
    useCorrectPartyLocation,
    useCreatePartyLocation,
    usePartyLocation,
    usePartyLocationList,
    useSetPartyLocationLifecycle,
} from "../usePartyLocations.ts";

const api = vi.hoisted(() => ({
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    correct: vi.fn(),
    lifecycle: vi.fn(),
}));
vi.mock("@/client", () => ({
    listPartyLocations: api.list,
    getPartyLocation: api.get,
    createPartyLocation: api.create,
    correctPartyLocation: api.correct,
    setPartyLocationLifecycle: api.lifecycle,
}));

const scope = { viewerCacheKey: "user-1", partyId: "pty_1" };
const dto = (patch: Partial<PartyLocationData> = {}): PartyLocationData => ({
    id: "ploc_1",
    partyId: "pty_1",
    label: "Showroom",
    roles: ["BUSINESS_PREMISES"],
    lifecycle: "ACTIVE",
    revision: 3,
    inputRevision: 1,
    ...patch,
});
const ok = (data: unknown, status = 200) => ({ data, response: { status } });
const failure = (status?: number) => ({
    error: { title: "Problem", detail: "Marienplatz 1" },
    response: status === undefined ? undefined : { status },
});
const site = (patch: Partial<PartyLocation> = {}): PartyLocation => ({
    id: "ploc_1",
    partyId: "pty_1",
    label: "Showroom",
    roles: ["BUSINESS_PREMISES"],
    lifecycle: "ACTIVE",
    revision: 3,
    inputRevision: 1,
    hasUnsupportedValues: false,
    ...patch,
});

describe("Party-location API", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient();
    });

    it("pages with `after`, private requests and viewer-scoped keys", async () => {
        api.list
            .mockResolvedValueOnce(ok({ items: [dto()], next: "ploc_1" }))
            .mockResolvedValueOnce(ok({ items: [dto({ id: "ploc_2" })], next: null }));
        const hook = renderHook(() => usePartyLocationList(scope), { wrapper });

        await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(1));
        expect(api.list).toHaveBeenCalledWith(
            expect.objectContaining({
                path: { party_id: "pty_1" },
                query: { limit: 25 },
                cache: "no-store",
                signal: expect.any(AbortSignal),
            }),
        );
        expect(hook.result.current.hasNextPage).toBe(true);

        await act(() => hook.result.current.fetchNextPage());
        expect(api.list).toHaveBeenLastCalledWith(
            expect.objectContaining({ query: { limit: 25, after: "ploc_1" } }),
        );
        await waitFor(() => expect(hook.result.current.hasNextPage).toBe(false));
        expect(isViewerScopedQuery(geographyQueryKeys.partyLocationList("user-1", "pty_1"))).toBe(
            true,
        );
    });

    it("shows fixed copy instead of problem details and does not retry reads", async () => {
        api.get.mockResolvedValue(failure(403));
        const hook = renderHook(() => usePartyLocation(scope, "ploc_1"), { wrapper });

        await waitFor(() => expect(hook.result.current.error).toBeTruthy());
        expect(api.get).toHaveBeenCalledTimes(1);
        expect(hook.result.current.error?.message).not.toContain("Marienplatz");
        expect(hook.result.current.error).toMatchObject({ status: 403, isAccessLoss: true });
    });

    it("rejects a site that belongs to another Party", async () => {
        api.get.mockResolvedValue(ok(dto({ partyId: "pty_other" })));
        const hook = renderHook(() => usePartyLocation(scope, "ploc_1"), { wrapper });

        await waitFor(() => expect(hook.result.current.error).toBeTruthy());
        expect(hook.result.current.data).toBeUndefined();
    });

    it("reuses the creation key only while the unchanged command has no definite outcome", async () => {
        api.create
            .mockResolvedValueOnce(failure())
            .mockResolvedValueOnce(failure(503))
            .mockResolvedValueOnce(ok(dto({ id: "ploc_2", revision: 1 }), 201))
            .mockResolvedValueOnce(failure(400))
            .mockResolvedValueOnce(failure(400));
        const hook = renderHook(() => useCreatePartyLocation(scope), { wrapper });
        const create = async (label: string) => {
            await act(() => hook.result.current.mutateAsync({ label }).catch(() => undefined));
        };
        const keyOf = (call: number) => api.create.mock.calls[call][0].headers["Idempotency-Key"];

        await create("Depot");
        await create("Depot");
        await create("Depot");
        await create("Depot");
        await create("Depot");

        expect(keyOf(0)).toMatch(/^[A-Za-z0-9_.:-]+$/);
        expect(keyOf(1)).toBe(keyOf(0));
        expect(keyOf(2)).toBe(keyOf(0));
        // A completed create discards the key; a definite rejection does too.
        expect(keyOf(3)).not.toBe(keyOf(2));
        expect(keyOf(4)).not.toBe(keyOf(3));
        expect(api.create.mock.calls[0][0]).toMatchObject({
            path: { party_id: "pty_1" },
            body: { label: "Depot" },
            cache: "no-store",
        });
        expect(
            client.getQueryData(geographyQueryKeys.partyLocation("user-1", "pty_1", "ploc_2")),
        ).toMatchObject({ id: "ploc_2" });
    });

    it("reports an unknown creation outcome only when the outcome is indefinite", async () => {
        api.create.mockResolvedValueOnce(failure(502)).mockResolvedValueOnce(failure(422));
        const hook = renderHook(() => useCreatePartyLocation(scope), { wrapper });
        const errorOf = (label: string) =>
            act(() => hook.result.current.mutateAsync({ label }).catch((error: unknown) => error));

        expect(await errorOf("Depot")).toMatchObject({
            isIndefinite: true,
            message: testI18n.t("partyLocations.errors.createIndefinite"),
        });
        expect(await errorOf("Depot")).toMatchObject({
            isIndefinite: false,
            message: testI18n.t("partyLocations.errors.requestFailed"),
        });
    });

    it("uses a new key when the command changes", async () => {
        api.create.mockResolvedValue(failure());
        const hook = renderHook(() => useCreatePartyLocation(scope), { wrapper });

        await act(() => hook.result.current.mutateAsync({ label: "Depot" }).catch(() => undefined));
        await act(() =>
            hook.result.current.mutateAsync({ label: "Depot 2" }).catch(() => undefined),
        );

        expect(api.create.mock.calls[1][0].headers["Idempotency-Key"]).not.toBe(
            api.create.mock.calls[0][0].headers["Idempotency-Key"],
        );
    });

    it("sends relocation with the expected revision and refreshes the retired site", async () => {
        client.setQueryData(geographyQueryKeys.partyLocation("user-1", "pty_1", "ploc_1"), site());
        api.create.mockResolvedValue(ok(dto({ id: "ploc_2", revision: 1 }), 201));
        api.get.mockResolvedValue(ok(dto({ lifecycle: "RETIRED", revision: 4 })));
        const hook = renderHook(() => useCreatePartyLocation(scope), { wrapper });

        await act(() =>
            hook.result.current.mutateAsync({
                label: "New showroom",
                relocates: { id: "ploc_1", revision: 3 },
            }),
        );

        expect(api.create.mock.calls[0][0].body).toEqual({
            label: "New showroom",
            relocates: { id: "ploc_1", revision: 3 },
        });
        expect(
            client.getQueryState(geographyQueryKeys.partyLocation("user-1", "pty_1", "ploc_1"))
                ?.isInvalidated,
        ).toBe(true);
    });

    it("reports an unchanged correction separately from a change", async () => {
        api.correct
            .mockResolvedValueOnce(ok(dto({ revision: 3 })))
            .mockResolvedValueOnce(ok(dto({ revision: 4, label: "Renamed" })));
        const hook = renderHook(() => useCorrectPartyLocation(scope), { wrapper });

        const unchanged = await act(() =>
            hook.result.current.mutateAsync({
                locationId: "ploc_1",
                input: { expectedRevision: 3, label: "Showroom" },
            }),
        );
        const changed = await act(() =>
            hook.result.current.mutateAsync({
                locationId: "ploc_1",
                input: { expectedRevision: 3, label: "Renamed" },
            }),
        );

        expect(unchanged.unchanged).toBe(true);
        expect(changed.unchanged).toBe(false);
        expect(api.correct.mock.calls[0][0]).toMatchObject({
            path: { party_id: "pty_1", location_id: "ploc_1" },
            body: { expectedRevision: 3, correction: "SAME_SITE", label: "Showroom" },
            cache: "no-store",
        });
    });

    it("refetches the authoritative site after a conflict", async () => {
        const key = geographyQueryKeys.partyLocation("user-1", "pty_1", "ploc_1");
        client.setQueryData(key, site());
        api.correct.mockResolvedValue(failure(409));
        const hook = renderHook(() => useCorrectPartyLocation(scope), { wrapper });

        await act(() =>
            hook.result.current
                .mutateAsync({ locationId: "ploc_1", input: { expectedRevision: 3, label: "X" } })
                .catch(() => undefined),
        );

        // Observers are notified asynchronously; wait instead of reading the state right after act.
        await waitFor(() =>
            expect(hook.result.current.error).toBeInstanceOf(PartyLocationRequestError),
        );
        expect(hook.result.current.error).toMatchObject({ isConflict: true });
        expect(client.getQueryState(key)?.isInvalidated).toBe(true);
        expect(client.getQueryData(key)).toMatchObject({ revision: 3 });
    });

    it("discards cached sites of the Party when authorization is lost", async () => {
        const key = geographyQueryKeys.partyLocation("user-1", "pty_1", "ploc_1");
        client.setQueryData(key, site());
        api.lifecycle.mockResolvedValue(failure(403));
        const hook = renderHook(() => useSetPartyLocationLifecycle(scope), { wrapper });

        await act(() =>
            hook.result.current
                .mutateAsync({ location: site(), lifecycle: "RETIRED" })
                .catch(() => undefined),
        );

        expect(api.lifecycle.mock.calls[0][0].body).toEqual({
            expectedRevision: 3,
            lifecycle: "RETIRED",
        });
        expect(client.getQueryData(key)).toBeUndefined();
    });
});
