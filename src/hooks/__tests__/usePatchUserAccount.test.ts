import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUpdateUserAccount } from "../account/usePatchUserAccount.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockUpdateUserAccount = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    error: vi.fn(),
}));

vi.mock("@/client", () => ({
    updateUserAccount: mockUpdateUserAccount,
}));

vi.mock("@/hooks/useApiError", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("sonner", () => ({
    toast: mockToast,
}));

vi.mock("@/data/internal/UserAccountData", () => ({
    mapToInternalUserAccount: (data: unknown) => data,
    mapToBackendUserAccountPatch: (data: unknown) => data,
}));

vi.mock("@/data/internal/ApiError", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

describe("useUpdateUserAccount", () => {
    let queryClient: QueryClient;

    const createWrapper = () => {
        return ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                mutations: { retry: false },
            },
        });

        mockGetErrorMessage.mockImplementation((error) => error?.message || "Unknown error");
    });

    describe("Initial State", () => {
        it("should return initial mutation state", () => {
            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isPending).toBe(false);
            expect(result.current.isSuccess).toBe(false);
            expect(result.current.isError).toBe(false);
            expect(result.current.data).toBeUndefined();
            expect(result.current.error).toBeNull();
        });

        it("should have mutate and mutateAsync functions", () => {
            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            expect(typeof result.current.mutate).toBe("function");
            expect(typeof result.current.mutateAsync).toBe("function");
        });
    });

    describe("Success Path", () => {
        it("should successfully update user account", async () => {
            const patchData = {
                firstName: "Max",
                lastName: "Mustermann",
            };

            const updatedData = {
                firstName: "Max",
                lastName: "Mustermann",
                language: "de",
                currency: "EUR",
            };

            mockUpdateUserAccount.mockResolvedValue({
                data: updatedData,
                error: null,
            });

            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.mutateAsync(patchData);
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(updatedData);
            expect(mockUpdateUserAccount).toHaveBeenCalledWith({ body: patchData });
        });

        it("should update query cache on success", async () => {
            const updatedData = {
                firstName: "Anna",
                lastName: "Schmidt",
            };

            mockUpdateUserAccount.mockResolvedValue({
                data: updatedData,
                error: null,
            });

            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.mutateAsync({ firstName: "Anna" });
            });

            // Check if cache was updated
            const cachedData = queryClient.getQueryData(["userAccount"]);
            expect(cachedData).toEqual(updatedData);
        });

        it("should call mutationFn with correct patch data", async () => {
            const patchData = {
                language: "en",
                currency: "USD",
            } as const;

            mockUpdateUserAccount.mockResolvedValue({
                data: patchData,
                error: null,
            });

            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.mutateAsync(patchData);
            });

            expect(mockUpdateUserAccount).toHaveBeenCalledWith({ body: patchData });
        });
    });

    describe("Error Handling", () => {
        it("should handle API errors", async () => {
            const apiError = {
                status: 500,
                message: "Internal Server Error",
            };

            mockUpdateUserAccount.mockResolvedValue({
                data: null,
                error: apiError,
            });

            mockGetErrorMessage.mockReturnValue("Internal Server Error");

            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                try {
                    await result.current.mutateAsync({ firstName: "Max" });
                } catch (_error) {
                    // Expected to throw
                }
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error?.message).toBe("Internal Server Error");
        });

        it("should show error toast on failure", async () => {
            const errorMessage = "Update failed";

            mockUpdateUserAccount.mockResolvedValue({
                data: null,
                error: { status: 400, message: errorMessage },
            });

            mockGetErrorMessage.mockReturnValue(errorMessage);

            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                try {
                    await result.current.mutateAsync({ firstName: "Max" });
                } catch (_error) {
                    // Expected to throw
                }
            });

            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith(errorMessage);
            });
        });

        it("should log error to console on failure", async () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            mockUpdateUserAccount.mockResolvedValue({
                data: null,
                error: { status: 500, message: "Server error" },
            });

            mockGetErrorMessage.mockReturnValue("Server error");

            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                try {
                    await result.current.mutateAsync({ firstName: "Max" });
                } catch (_error) {
                    // Expected to throw
                }
            });

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    "[useUpdateUserAccount]",
                    expect.any(Error),
                );
            });

            consoleErrorSpy.mockRestore();
        });

        it("should handle 401 unauthorized errors", async () => {
            mockUpdateUserAccount.mockResolvedValue({
                data: null,
                error: { status: 401, message: "Unauthorized" },
            });

            mockGetErrorMessage.mockReturnValue("Unauthorized");

            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                try {
                    await result.current.mutateAsync({ firstName: "Max" });
                } catch (_error) {
                    // Expected
                }
            });

            await waitFor(() => {
                expect(result.current.error?.message).toBe("Unauthorized");
            });
        });

        it("should NOT update cache on error", async () => {
            // Set initial cache data
            queryClient.setQueryData(["userAccount"], { firstName: "Initial" });

            mockUpdateUserAccount.mockResolvedValue({
                data: null,
                error: { status: 500, message: "Error" },
            });

            mockGetErrorMessage.mockReturnValue("Error");

            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                try {
                    await result.current.mutateAsync({ firstName: "Max" });
                } catch (_error) {
                    // Expected
                }
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            // Cache should NOT be updated
            const cachedData = queryClient.getQueryData(["userAccount"]);
            expect(cachedData).toEqual({ firstName: "Initial" });
        });
    });

    describe("Status Flags", () => {
        it("should have isPending true during mutation", async () => {
            mockUpdateUserAccount.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        setTimeout(() => resolve({ data: { firstName: "Max" }, error: null }), 100);
                    }),
            );

            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                result.current.mutate({ firstName: "Max" });
            });

            await waitFor(() => {
                expect(result.current.isPending).toBe(true);
            });

            expect(result.current.isSuccess).toBe(false);
            expect(result.current.isError).toBe(false);
        });

        it("should have isSuccess true after successful mutation", async () => {
            mockUpdateUserAccount.mockResolvedValue({
                data: { firstName: "Max" },
                error: null,
            });

            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.mutateAsync({ firstName: "Max" });
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.isPending).toBe(false);
            expect(result.current.isError).toBe(false);
        });

        it("should have isError true after failed mutation", async () => {
            mockUpdateUserAccount.mockResolvedValue({
                data: null,
                error: { status: 500 },
            });

            mockGetErrorMessage.mockReturnValue("Error");

            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                try {
                    await result.current.mutateAsync({ firstName: "Max" });
                } catch (_error) {
                    // Expected
                }
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.isPending).toBe(false);
            expect(result.current.isSuccess).toBe(false);
        });
    });

    describe("Multiple Updates", () => {
        it("should handle sequential updates correctly", async () => {
            mockUpdateUserAccount
                .mockResolvedValueOnce({
                    data: { firstName: "Max" },
                    error: null,
                })
                .mockResolvedValueOnce({
                    data: { firstName: "Anna" },
                    error: null,
                });

            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            // First update
            await act(async () => {
                await result.current.mutateAsync({ firstName: "Max" });
            });

            await waitFor(() => {
                expect(result.current.data).toEqual({ firstName: "Max" });
            });

            // Second update
            await act(async () => {
                await result.current.mutateAsync({ firstName: "Anna" });
            });

            await waitFor(() => {
                expect(result.current.data).toEqual({ firstName: "Anna" });
            });

            expect(mockUpdateUserAccount).toHaveBeenCalledTimes(2);
        });

        it("should update cache correctly for each mutation", async () => {
            mockUpdateUserAccount
                .mockResolvedValueOnce({
                    data: { firstName: "Max", language: "de" },
                    error: null,
                })
                .mockResolvedValueOnce({
                    data: { firstName: "Max", language: "en" },
                    error: null,
                });

            const { result } = renderHook(() => useUpdateUserAccount(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.mutateAsync({ language: "de" } as const);
            });

            await waitFor(() => {
                expect(queryClient.getQueryData(["userAccount"])).toEqual({
                    firstName: "Max",
                    language: "de",
                });
            });

            await act(async () => {
                await result.current.mutateAsync({ language: "en" } as const);
            });

            await waitFor(() => {
                expect(queryClient.getQueryData(["userAccount"])).toEqual({
                    firstName: "Max",
                    language: "en",
                });
            });
        });
    });
});
