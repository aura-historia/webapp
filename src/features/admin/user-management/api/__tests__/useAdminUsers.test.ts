import { act, renderHook, waitFor } from "@testing-library/react";
import { type InfiniteData, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminUserPage } from "../useAdminUsers.ts";
import {
    useAdminUser,
    useAdminUsers,
    useDeleteAdminUser,
    usePatchAdminUser,
} from "../useAdminUsers.ts";

const mockAdminSearchUsers = vi.hoisted(() => vi.fn());
const mockAdminGetUser = vi.hoisted(() => vi.fn());
const mockAdminPatchUser = vi.hoisted(() => vi.fn());
const mockAdminDeleteUser = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    error: vi.fn(),
}));

vi.mock("@/client", () => ({
    adminSearchUsers: mockAdminSearchUsers,
    adminGetUser: mockAdminGetUser,
    adminPatchUser: mockAdminPatchUser,
    adminDeleteUser: mockAdminDeleteUser,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

vi.mock("sonner", () => ({
    toast: mockToast,
}));

describe("useAdminUsers hooks", () => {
    let queryClient: QueryClient;

    const createWrapper =
        () =>
        ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
        mockGetErrorMessage.mockImplementation((error: unknown) =>
            error && typeof error === "object" && "message" in error
                ? String((error as { message?: unknown }).message)
                : "Unknown error",
        );
    });

    it("searches and maps admin users", async () => {
        mockAdminSearchUsers.mockResolvedValue({
            data: {
                items: [
                    {
                        userId: "user-1",
                        email: "ada@example.com",
                        firstName: "Ada",
                        lastName: "Lovelace",
                        language: "en",
                        currency: "EUR",
                        prohibitedContentConsent: true,
                        tier: "PRO",
                        role: "ADMIN",
                        stripeCustomerId: "cus_123",
                        created: "2024-01-01T00:00:00Z",
                        updated: "2024-01-02T00:00:00Z",
                    },
                ],
                total: 1,
                searchAfter: undefined,
            },
            error: null,
        });

        const { result } = renderHook(
            () => useAdminUsers({ query: "ada", sort: "updated", order: "desc" }),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockAdminSearchUsers).toHaveBeenCalledWith({
            query: expect.objectContaining({
                query: "ada",
                sort: "updated",
                order: "desc",
                size: 25,
            }),
        });
        expect(result.current.data?.pages[0]?.items[0]).toMatchObject({
            userId: "user-1",
            email: "ada@example.com",
            tier: "PRO",
            role: "ADMIN",
        });
    });

    it("loads a single admin user", async () => {
        mockAdminGetUser.mockResolvedValue({
            data: {
                userId: "user-2",
                email: "grace@example.com",
                firstName: "Grace",
                lastName: "Hopper",
                language: "en",
                currency: "USD",
                prohibitedContentConsent: false,
                tier: "ULTIMATE",
                role: "USER",
                stripeCustomerId: null,
                created: "2024-01-01T00:00:00Z",
                updated: "2024-01-02T00:00:00Z",
            },
            error: null,
        });

        const { result } = renderHook(() => useAdminUser("user-2"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toMatchObject({
            userId: "user-2",
            email: "grace@example.com",
            tier: "ULTIMATE",
        });
    });

    it("updates cached admin users after a patch", async () => {
        mockAdminPatchUser.mockResolvedValue({
            data: {
                userId: "user-3",
                email: "patch@example.com",
                firstName: "Patchy",
                lastName: "McPatch",
                language: "en",
                currency: "EUR",
                prohibitedContentConsent: true,
                tier: "PRO",
                role: "ADMIN",
                stripeCustomerId: "cus_patch",
                created: "2024-01-01T00:00:00Z",
                updated: "2024-01-03T00:00:00Z",
            },
            error: null,
        });

        queryClient.setQueryData(["admin", "users", "detail", "user-3"], {
            userId: "user-3",
            email: "old@example.com",
        });
        queryClient.setQueryData<InfiniteData<AdminUserPage>>(
            ["admin", "users", { sort: "updated", order: "desc" }],
            {
                pageParams: [undefined],
                pages: [
                    {
                        items: [
                            {
                                userId: "user-3",
                                email: "old@example.com",
                                prohibitedContentConsent: false,
                                tier: "FREE",
                                role: "USER",
                                created: new Date("2024-01-01T00:00:00Z"),
                                updated: new Date("2024-01-01T00:00:00Z"),
                            },
                        ],
                        total: 1,
                        searchAfter: undefined,
                    },
                ],
            },
        );

        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => usePatchAdminUser(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await result.current.mutateAsync({
                userId: "user-3",
                firstName: "Patchy",
                role: "ADMIN",
            });
        });

        expect(queryClient.getQueryData(["admin", "users", "detail", "user-3"])).toMatchObject({
            email: "patch@example.com",
            role: "ADMIN",
        });
        expect(
            queryClient.getQueryData<InfiniteData<AdminUserPage>>([
                "admin",
                "users",
                { sort: "updated", order: "desc" },
            ])?.pages[0].items[0],
        ).toMatchObject({
            email: "patch@example.com",
            role: "ADMIN",
        });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin", "users"] });
    });

    it("removes cached admin users after deletion", async () => {
        mockAdminDeleteUser.mockResolvedValue({ data: null, error: null });

        queryClient.setQueryData(["admin", "users", "detail", "user-4"], {
            userId: "user-4",
        });
        queryClient.setQueryData<InfiniteData<AdminUserPage>>(
            ["admin", "users", { sort: "updated", order: "desc" }],
            {
                pageParams: [undefined],
                pages: [
                    {
                        items: [
                            {
                                userId: "user-4",
                                email: "delete@example.com",
                                prohibitedContentConsent: false,
                                tier: "FREE",
                                role: "USER",
                                created: new Date("2024-01-01T00:00:00Z"),
                                updated: new Date("2024-01-01T00:00:00Z"),
                            },
                        ],
                        total: 1,
                        searchAfter: undefined,
                    },
                ],
            },
        );

        const { result } = renderHook(() => useDeleteAdminUser(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await result.current.mutateAsync("user-4");
        });

        expect(queryClient.getQueryData(["admin", "users", "detail", "user-4"])).toBeUndefined();
        expect(
            queryClient.getQueryData<InfiniteData<AdminUserPage>>([
                "admin",
                "users",
                { sort: "updated", order: "desc" },
            ])?.pages[0].items,
        ).toEqual([]);
    });

    it("shows an error toast when patching fails", async () => {
        mockAdminPatchUser.mockResolvedValue({
            data: null,
            error: { message: "Patch failed" },
        });
        mockGetErrorMessage.mockReturnValue("Patch failed");

        const { result } = renderHook(() => usePatchAdminUser(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            try {
                await result.current.mutateAsync({
                    userId: "user-5",
                    role: "ADMIN",
                });
            } catch {
                // expected
            }
        });

        expect(mockToast.error).toHaveBeenCalledWith("Patch failed");
    });
});
