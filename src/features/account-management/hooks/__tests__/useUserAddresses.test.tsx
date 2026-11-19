import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserAddress as UserAddressDto } from "@/client";
import { geographyQueryKeys } from "@/data/internal/geography/GeographyQueryKeys.ts";
import { mapToUserAddress, type UserAddressInput } from "@/data/internal/geography/UserAddress.ts";
import { isViewerScopedQuery } from "@/features/authentication/lib/clearViewerScopedQueries.ts";
import {
    useCreateUserAddress,
    useDeleteUserAddress,
    UserAddressRequestError,
    useUpdateUserAddress,
    useUserAddressList,
} from "../useUserAddresses.ts";

const api = vi.hoisted(() => ({
    list: vi.fn(),
    create: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
}));
vi.mock("@/client", () => ({
    listUserAddresses: api.list,
    createUserAddress: api.create,
    getUserAddress: api.get,
    updateUserAddress: api.update,
    deleteUserAddress: api.remove,
}));

const VIEWER = "user-1";
const dto = (patch: Partial<UserAddressDto> = {}): UserAddressDto => ({
    addressId: "uaddr_1",
    label: "Home",
    geography: { referenceRelease: "iso-codes-4.20.1", addressText: "Torstraße 12\n10119 Berlin" },
    inputRevision: 1,
    version: 3,
    preferred: false,
    resolution: { status: "PENDING" },
    ...patch,
});
const ok = (data: unknown, status = 200) => ({ data, response: { status } });
const failure = (status?: number) => ({
    error: { title: "Problem", detail: "Torstraße 12" },
    response: status === undefined ? undefined : { status },
});
const input: UserAddressInput = {
    label: "Home",
    geography: { addressText: "Torstraße 12" },
};

describe("saved address API", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient();
    });

    it("pages with `after` through private, viewer-scoped reads", async () => {
        api.list
            .mockResolvedValueOnce(ok({ items: [dto()], next: "uaddr_1" }))
            .mockResolvedValueOnce(ok({ items: [dto({ addressId: "uaddr_2" })] }));
        const hook = renderHook(() => useUserAddressList(VIEWER), { wrapper });

        await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(1));
        expect(api.list).toHaveBeenCalledWith(
            expect.objectContaining({
                query: { limit: 25 },
                cache: "no-store",
                signal: expect.any(AbortSignal),
            }),
        );
        await act(() => hook.result.current.fetchNextPage());
        expect(api.list).toHaveBeenLastCalledWith(
            expect.objectContaining({ query: { limit: 25, after: "uaddr_1" } }),
        );
        await waitFor(() => expect(hook.result.current.hasNextPage).toBe(false));
        expect(isViewerScopedQuery(geographyQueryKeys.userAddressPage(VIEWER))).toBe(true);
        expect(isViewerScopedQuery(geographyQueryKeys.userAddress(VIEWER, "uaddr_1"))).toBe(true);
    });

    it("reports lost access with fixed copy and does not retry", async () => {
        api.list.mockResolvedValue(failure(403));
        const hook = renderHook(() => useUserAddressList(VIEWER), { wrapper });

        await waitFor(() => expect(hook.result.current.error).toBeTruthy());
        expect(api.list).toHaveBeenCalledTimes(1);
        expect(hook.result.current.error?.message).not.toContain("Torstraße");
        expect(hook.result.current.error).toMatchObject({ status: 403, isAccessLoss: true });
    });

    it("creates without an idempotency key, never selecting a browsing destination", async () => {
        api.create.mockResolvedValue(ok(dto({ addressId: "uaddr_new" }), 201));
        const hook = renderHook(() => useCreateUserAddress(VIEWER), { wrapper });

        await act(
            () =>
                new Promise<void>((resolve) =>
                    hook.result.current.mutate(input, { onSettled: () => resolve() }),
                ),
        );
        expect(api.create).toHaveBeenCalledTimes(1);
        const [request] = api.create.mock.calls[0];
        expect(request).toEqual({
            body: {
                label: "Home",
                geography: { addressText: "Torstraße 12", referenceRelease: "iso-codes-4.20.1" },
            },
            cache: "no-store",
        });
        expect(request.headers).toBeUndefined();
    });

    it("ignores a second submission while a create is pending", async () => {
        let finish: (value: unknown) => void = () => undefined;
        api.create.mockReturnValue(new Promise((resolve) => (finish = resolve)));
        const hook = renderHook(() => useCreateUserAddress(VIEWER), { wrapper });

        act(() => {
            hook.result.current.mutate(input);
            hook.result.current.mutate(input);
        });
        await act(async () => finish(ok(dto(), 201)));
        expect(api.create).toHaveBeenCalledTimes(1);
    });

    it("refreshes the list after a lost create and never resubmits it", async () => {
        api.create.mockResolvedValue(failure(undefined));
        api.list.mockResolvedValue(ok({ items: [dto()] }));
        const hook = renderHook(() => useCreateUserAddress(VIEWER), { wrapper });

        await act(
            () =>
                new Promise<void>((resolve) =>
                    hook.result.current.mutate(input, { onSettled: () => resolve() }),
                ),
        );
        await waitFor(() => expect(hook.result.current.reconciliation.status).toBe("refreshed"));
        expect(api.create).toHaveBeenCalledTimes(1);
        expect(hook.result.current.error).toMatchObject({ isIndefinite: true });
    });

    it("leaves the outcome unresolved when the refresh fails, until a later refresh succeeds", async () => {
        api.create.mockResolvedValue(failure(503));
        api.list.mockResolvedValueOnce(failure(503)).mockResolvedValue(ok({ items: [] }));
        const hook = renderHook(() => useCreateUserAddress(VIEWER), { wrapper });

        await act(
            () =>
                new Promise<void>((resolve) =>
                    hook.result.current.mutate(input, { onSettled: () => resolve() }),
                ),
        );
        await waitFor(() => expect(hook.result.current.reconciliation.status).toBe("failed"));
        await act(() => hook.result.current.refresh());
        expect(hook.result.current.reconciliation.status).toBe("refreshed");
    });

    it("replaces at the expected version and loads the current one after a conflict", async () => {
        api.update.mockResolvedValue(failure(409));
        api.get.mockResolvedValue(ok(dto({ version: 5, label: "Home (new)" })));
        const hook = renderHook(() => useUpdateUserAddress(VIEWER), { wrapper });

        await act(
            () =>
                new Promise<void>((resolve) =>
                    hook.result.current.mutate(
                        { addressId: "uaddr_1", input, expectedVersion: 3 },
                        { onSettled: () => resolve() },
                    ),
                ),
        );
        expect(api.update).toHaveBeenCalledWith(
            expect.objectContaining({
                path: { address_id: "uaddr_1" },
                body: expect.objectContaining({ expectedVersion: 3, label: "Home" }),
                cache: "no-store",
            }),
        );
        await waitFor(() => expect(hook.result.current.conflict?.current.version).toBe(5));
        // Nothing is resubmitted on its own.
        expect(api.update).toHaveBeenCalledTimes(1);
        expect(hook.result.current.missing).toBe(false);
    });

    it("marks the address missing when it disappeared before the replace", async () => {
        api.update.mockResolvedValue(failure(404));
        const hook = renderHook(() => useUpdateUserAddress(VIEWER), { wrapper });

        act(() => hook.result.current.mutate({ addressId: "uaddr_1", input, expectedVersion: 3 }));
        await waitFor(() => expect(hook.result.current.missing).toBe(true));
    });

    it("deletes at the expected version and refreshes the addresses and browsing destination", async () => {
        api.remove.mockResolvedValue({ data: undefined, response: { status: 204 } });
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const hook = renderHook(() => useDeleteUserAddress(VIEWER), { wrapper });

        await act(() => hook.result.current.mutateAsync(mapToUserAddress(dto())));
        expect(api.remove).toHaveBeenCalledWith({
            path: { address_id: "uaddr_1" },
            body: { expectedVersion: 3 },
            cache: "no-store",
        });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["userAddresses", VIEWER] });
        expect(invalidate).toHaveBeenCalledWith({
            queryKey: geographyQueryKeys.browsingDestination(VIEWER),
        });
    });

    it("resets cached addresses when access is lost during a write", async () => {
        api.remove.mockResolvedValue(failure(401));
        const reset = vi.spyOn(client, "resetQueries");
        const hook = renderHook(() => useDeleteUserAddress(VIEWER), { wrapper });

        await act(async () => {
            await hook.result.current
                .mutateAsync(mapToUserAddress(dto()))
                .catch((error: unknown) => {
                    expect(error).toBeInstanceOf(UserAddressRequestError);
                });
        });
        expect(reset).toHaveBeenCalledWith({ queryKey: ["userAddresses", VIEWER] });
    });
});
