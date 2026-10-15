import { type InfiniteData, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PartyLocationData } from "@/client";
import { geographyQueryKeys } from "@/data/internal/geography/GeographyQueryKeys.ts";
import type { PartyLocation, PartyLocationPage } from "@/data/internal/geography/PartyLocation.ts";
import testI18n from "@/i18n/i18nForTests";
import { isViewerScopedQuery } from "@/features/authentication/lib/clearViewerScopedQueries.ts";
import {
    PartyLocationRequestError,
    useCorrectPartyLocation,
    useCreatePartyLocation,
    usePartyLocationList,
    useSetPartyLocationLifecycle,
} from "../usePartyLocations.ts";

const api = vi.hoisted(() => ({
    list: vi.fn(),
    create: vi.fn(),
    correct: vi.fn(),
    lifecycle: vi.fn(),
}));
vi.mock("@/client", () => ({
    listPartyLocations: api.list,
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
const partyLocation = (patch: Partial<PartyLocation> = {}): PartyLocation => ({
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

    const listKey = geographyQueryKeys.partyLocationList("user-1", "pty_1");
    const seedList = () =>
        client.setQueryData<InfiniteData<PartyLocationPage, string | undefined>>(listKey, {
            pages: [{ items: [partyLocation()] }],
            pageParams: [undefined],
        });
    const loadedItems = () =>
        client
            .getQueryData<InfiniteData<PartyLocationPage, string | undefined>>(listKey)
            ?.pages.flatMap((page) => page.items);

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
        api.list.mockResolvedValue(failure(403));
        const hook = renderHook(() => usePartyLocationList(scope), { wrapper });

        await waitFor(() => expect(hook.result.current.error).toBeTruthy());
        expect(api.list).toHaveBeenCalledTimes(1);
        expect(hook.result.current.error?.message).not.toContain("Marienplatz");
        expect(hook.result.current.error).toMatchObject({ status: 403, isAccessLoss: true });
    });

    it("rejects a page with a location of another Party", async () => {
        api.list.mockResolvedValue(ok({ items: [dto({ partyId: "pty_other" })], next: null }));
        const hook = renderHook(() => usePartyLocationList(scope), { wrapper });

        await waitFor(() => expect(hook.result.current.error).toBeTruthy());
        expect(hook.result.current.data).toBeUndefined();
    });

    it("creates without an idempotency header and stores the new location", async () => {
        seedList();
        api.create.mockResolvedValueOnce(ok(dto({ id: "ploc_2", revision: 1 }), 201));
        const hook = renderHook(() => useCreatePartyLocation(scope), { wrapper });

        await act(() => hook.result.current.mutateAsync({ label: "Depot" }));

        const request = api.create.mock.calls[0][0];
        expect(request).toMatchObject({
            path: { party_id: "pty_1" },
            body: { label: "Depot" },
            cache: "no-store",
        });
        expect(request.headers).toBeUndefined();
        expect(client.getQueryState(listKey)?.isInvalidated).toBe(true);
    });

    it.each([undefined, 503])(
        "refetches the list for reconciliation after an indefinite create (%s)",
        async (status) => {
            seedList();
            api.create.mockResolvedValueOnce(failure(status));
            const hook = renderHook(() => useCreatePartyLocation(scope), { wrapper });

            await act(() =>
                hook.result.current.mutateAsync({ label: "Depot" }).catch(() => undefined),
            );

            expect(api.create).toHaveBeenCalledTimes(1);
            expect(client.getQueryState(listKey)?.isInvalidated).toBe(true);
        },
    );

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

    it("sends relocation with the expected revision and refreshes the list", async () => {
        seedList();
        api.create.mockResolvedValue(ok(dto({ id: "ploc_2", revision: 1 }), 201));
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
        expect(client.getQueryState(listKey)?.isInvalidated).toBe(true);
    });

    it("reports an unchanged correction separately from a change", async () => {
        seedList();
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
        // The saved location replaces the loaded one before the list refetch completes.
        expect(loadedItems()).toEqual([expect.objectContaining({ label: "Renamed", revision: 4 })]);
    });

    it("keeps a newer loaded revision when an older response arrives", async () => {
        client.setQueryData<InfiniteData<PartyLocationPage, string | undefined>>(listKey, {
            pages: [{ items: [partyLocation({ label: "Gallery", revision: 5 })] }],
            pageParams: [undefined],
        });
        api.correct.mockResolvedValue(ok(dto({ revision: 4, label: "Renamed" })));
        const hook = renderHook(() => useCorrectPartyLocation(scope), { wrapper });

        await act(() =>
            hook.result.current.mutateAsync({
                locationId: "ploc_1",
                input: { expectedRevision: 3, label: "Renamed" },
            }),
        );

        expect(loadedItems()).toEqual([expect.objectContaining({ label: "Gallery", revision: 5 })]);
        expect(client.getQueryState(listKey)?.isInvalidated).toBe(true);
    });

    it("refetches the authoritative locations after a conflict", async () => {
        seedList();
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
        expect(client.getQueryState(listKey)?.isInvalidated).toBe(true);
        expect(loadedItems()).toEqual([expect.objectContaining({ revision: 3 })]);
    });

    it("discards cached locations of the Party when authorization is lost", async () => {
        seedList();
        api.lifecycle.mockResolvedValue(failure(403));
        const hook = renderHook(() => useSetPartyLocationLifecycle(scope), { wrapper });

        await act(() =>
            hook.result.current
                .mutateAsync({ location: partyLocation(), lifecycle: "RETIRED" })
                .catch(() => undefined),
        );

        expect(api.lifecycle.mock.calls[0][0].body).toEqual({
            expectedRevision: 3,
            lifecycle: "RETIRED",
        });
        expect(client.getQueryData(listKey)).toBeUndefined();
    });
});
