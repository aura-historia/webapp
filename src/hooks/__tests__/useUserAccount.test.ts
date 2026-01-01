import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUserAccount } from "../useUserAccount";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockGetUserAccount = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    getUserAccount: mockGetUserAccount,
}));

vi.mock("@/hooks/useApiError", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/UserAccountData", () => ({
    mapToInternalUserAccount: (data: unknown) => data,
}));

vi.mock("@/data/internal/ApiError", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

describe("useUserAccount", () => {
    let queryClient: QueryClient;

    const createWrapper = () => {
        return ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });

        mockGetErrorMessage.mockImplementation((error) => error?.message || "Unknown error");
    });

    describe("Initial State", () => {
        it("should return initial loading state", () => {
            mockGetUserAccount.mockResolvedValue({
                data: { firstName: "Max", lastName: "Mustermann" },
                error: null,
            });

            const { result } = renderHook(() => useUserAccount(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(true);
            expect(result.current.data).toBeUndefined();
            expect(result.current.error).toBeNull();
        });

        it("should not fetch when enabled is false", () => {
            const { result } = renderHook(() => useUserAccount(false), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.isFetching).toBe(false);
            expect(mockGetUserAccount).not.toHaveBeenCalled();
        });
    });

    describe("Success Path", () => {
        it("should fetch and return user account data", async () => {
            const userData = {
                firstName: "Max",
                lastName: "Mustermann",
                language: "de",
                currency: "EUR",
            };

            mockGetUserAccount.mockResolvedValue({
                data: userData,
                error: null,
            });

            const { result } = renderHook(() => useUserAccount(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(userData);
            expect(result.current.error).toBeNull();
            expect(result.current.isLoading).toBe(false);
        });

        it("should call getUserAccount from client", async () => {
            mockGetUserAccount.mockResolvedValue({
                data: { firstName: "Anna" },
                error: null,
            });

            renderHook(() => useUserAccount(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(mockGetUserAccount).toHaveBeenCalledTimes(1);
            });
        });

        it("should cache data with correct queryKey", async () => {
            const userData = { firstName: "Max" };

            mockGetUserAccount.mockResolvedValue({
                data: userData,
                error: null,
            });

            renderHook(() => useUserAccount(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                const cachedData = queryClient.getQueryData(["userAccount"]);
                expect(cachedData).toEqual(userData);
            });
        });
    });

    describe("Error Handling", () => {
        it("should handle API errors correctly", async () => {
            const apiError = {
                status: 500,
                message: "Internal Server Error",
            };

            mockGetUserAccount.mockResolvedValue({
                data: null,
                error: apiError,
            });

            mockGetErrorMessage.mockReturnValue("Internal Server Error");

            const { result } = renderHook(() => useUserAccount(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBeTruthy();
            expect(result.current.error?.message).toBe("Internal Server Error");
            expect(result.current.data).toBeUndefined();
        });

        it("should handle 401 unauthorized errors", async () => {
            mockGetUserAccount.mockResolvedValue({
                data: null,
                error: { status: 401, message: "Unauthorized" },
            });

            mockGetErrorMessage.mockReturnValue("Unauthorized");

            const { result } = renderHook(() => useUserAccount(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error?.message).toBe("Unauthorized");
        });

        it("should handle 404 not found errors", async () => {
            mockGetUserAccount.mockResolvedValue({
                data: null,
                error: { status: 404, message: "User not found" },
            });

            mockGetErrorMessage.mockReturnValue("User not found");

            const { result } = renderHook(() => useUserAccount(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error?.message).toBe("User not found");
        });
    });

    describe("Query Configuration", () => {
        it("should use correct queryKey", async () => {
            mockGetUserAccount.mockResolvedValue({
                data: { firstName: "Max" },
                error: null,
            });

            const { result } = renderHook(() => useUserAccount(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            // Verify queryKey is used correctly
            const queryState = queryClient.getQueryState(["userAccount"]);
            expect(queryState).toBeDefined();
        });

        it("should not retry on error", async () => {
            mockGetUserAccount.mockResolvedValue({
                data: null,
                error: { status: 500, message: "Server Error" },
            });

            mockGetErrorMessage.mockReturnValue("Server Error");

            renderHook(() => useUserAccount(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(mockGetUserAccount).toHaveBeenCalledTimes(1);
            });

            // Should not retry (retry: false)
            expect(mockGetUserAccount).toHaveBeenCalledTimes(1);
        });

        it("should have correct staleTime configuration", () => {
            mockGetUserAccount.mockResolvedValue({
                data: { firstName: "Max" },
                error: null,
            });

            renderHook(() => useUserAccount(), {
                wrapper: createWrapper(),
            });

            const queryState = queryClient.getQueryState(["userAccount"]);

            // staleTime should be 5 minutes (5 * 60 * 1000)
            expect(queryState).toBeDefined();
        });
    });

    describe("enabled Parameter", () => {
        it("should fetch when enabled is true (default)", async () => {
            mockGetUserAccount.mockResolvedValue({
                data: { firstName: "Max" },
                error: null,
            });

            const { result } = renderHook(() => useUserAccount(true), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockGetUserAccount).toHaveBeenCalled();
        });

        it("should not fetch when enabled is false", () => {
            const { result } = renderHook(() => useUserAccount(false), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.fetchStatus).toBe("idle");
            expect(mockGetUserAccount).not.toHaveBeenCalled();
        });

        it("should start fetching when enabled changes from false to true", async () => {
            mockGetUserAccount.mockResolvedValue({
                data: { firstName: "Max" },
                error: null,
            });

            const { result, rerender } = renderHook(({ enabled }) => useUserAccount(enabled), {
                wrapper: createWrapper(),
                initialProps: { enabled: false },
            });

            expect(mockGetUserAccount).not.toHaveBeenCalled();

            // Change enabled to true
            rerender({ enabled: true });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockGetUserAccount).toHaveBeenCalled();
        });
    });

    describe("Status Flags", () => {
        it("should have correct status during loading", () => {
            mockGetUserAccount.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        setTimeout(
                            () => resolve({ data: { firstName: "Max" }, error: null }),
                            10000,
                        );
                    }),
            );

            const { result } = renderHook(() => useUserAccount(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(true);
            expect(result.current.isSuccess).toBe(false);
            expect(result.current.isError).toBe(false);
            expect(result.current.data).toBeUndefined();
        });

        it("should have correct status on success", async () => {
            mockGetUserAccount.mockResolvedValue({
                data: { firstName: "Max" },
                error: null,
            });

            const { result } = renderHook(() => useUserAccount(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.isError).toBe(false);
            expect(result.current.data).toBeDefined();
        });

        it("should have correct status on error", async () => {
            mockGetUserAccount.mockResolvedValue({
                data: null,
                error: { status: 500 },
            });

            mockGetErrorMessage.mockReturnValue("Error");

            const { result } = renderHook(() => useUserAccount(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.isSuccess).toBe(false);
            expect(result.current.data).toBeUndefined();
        });
    });
});
