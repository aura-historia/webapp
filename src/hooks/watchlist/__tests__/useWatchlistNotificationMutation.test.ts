import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useWatchlistNotificationMutation } from "../useWatchlistNotificationMutation.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockPatchWatchlistProduct = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    info: vi.fn(),
    error: vi.fn(),
}));

vi.mock("@/client", () => ({
    patchWatchlistProduct: mockPatchWatchlistProduct,
}));

vi.mock("sonner", () => ({
    toast: mockToast,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

vi.mock("@/data/internal/common/Language.ts", () => ({
    parseLanguage: (lang: string) => lang,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

describe("useWatchlistNotificationMutation", () => {
    let queryClient: QueryClient;
    const shopId = "test-shop-id";
    const shopsProductId = "test-product-id";

    const createWrapper = () => {
        return ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });

        mockGetErrorMessage.mockImplementation((error) => error?.message || "Unknown error");
    });

    describe("toggle notifications", () => {
        it("should successfully enable notifications", async () => {
            const mockResponse = { notifications: true };
            mockPatchWatchlistProduct.mockResolvedValue({
                data: mockResponse,
                error: null,
            });

            const { result } = renderHook(
                () => useWatchlistNotificationMutation(shopId, shopsProductId),
                {
                    wrapper: createWrapper(),
                },
            );

            result.current.mutate(true);

            await waitFor(() => {
                expect(mockPatchWatchlistProduct).toHaveBeenCalledWith({
                    path: { shopId, shopsProductId },
                    body: { notifications: true },
                });
            });
        });

        it("should successfully disable notifications", async () => {
            const mockResponse = { notifications: false };
            mockPatchWatchlistProduct.mockResolvedValue({
                data: mockResponse,
                error: null,
            });

            const { result } = renderHook(
                () => useWatchlistNotificationMutation(shopId, shopsProductId),
                {
                    wrapper: createWrapper(),
                },
            );

            result.current.mutate(false);

            await waitFor(() => {
                expect(mockPatchWatchlistProduct).toHaveBeenCalledWith({
                    path: { shopId, shopsProductId },
                    body: { notifications: false },
                });
            });
        });

        it("should show info toast on 401 unauthorized", async () => {
            mockPatchWatchlistProduct.mockResolvedValue({
                data: null,
                error: { message: "Unauthorized" },
                response: { status: 401 },
            });

            const { result } = renderHook(
                () => useWatchlistNotificationMutation(shopId, shopsProductId),
                {
                    wrapper: createWrapper(),
                },
            );

            result.current.mutate(true);

            await waitFor(() => {
                expect(mockToast.info).toHaveBeenCalledWith("watchlist.loginRequired");
            });
        });

        it("should call setQueryData on success", async () => {
            const mockResponse = { notifications: true };
            mockPatchWatchlistProduct.mockResolvedValue({
                data: mockResponse,
                error: null,
            });

            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

            const { result } = renderHook(
                () => useWatchlistNotificationMutation(shopId, shopsProductId),
                {
                    wrapper: createWrapper(),
                },
            );

            result.current.mutate(true);

            await waitFor(() => {
                // Verify setQueryData was called to update the product cache
                expect(setQueryDataSpy).toHaveBeenCalled();
            });
        });

        it("should invalidate watchlist and search queries on success", async () => {
            mockPatchWatchlistProduct.mockResolvedValue({
                data: { notifications: true },
                error: null,
            });

            const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

            const { result } = renderHook(
                () => useWatchlistNotificationMutation(shopId, shopsProductId),
                {
                    wrapper: createWrapper(),
                },
            );

            result.current.mutate(true);

            await waitFor(() => {
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["watchlist"] });
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["search"] });
            });
        });
    });

    describe("error handling", () => {
        it("should show error toast on mutation error", async () => {
            const errorMessage = "Server error";
            mockPatchWatchlistProduct.mockResolvedValue({
                data: null,
                error: { message: errorMessage },
                response: { status: 500 },
            });
            mockGetErrorMessage.mockReturnValue(errorMessage);

            const { result } = renderHook(
                () => useWatchlistNotificationMutation(shopId, shopsProductId),
                {
                    wrapper: createWrapper(),
                },
            );

            result.current.mutate(true);

            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalled();
            });
        });

        it("should not update query data when response is null", async () => {
            mockPatchWatchlistProduct.mockResolvedValue({
                data: null,
                error: { message: "Unauthorized" },
                response: { status: 401 },
            });

            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

            const { result } = renderHook(
                () => useWatchlistNotificationMutation(shopId, shopsProductId),
                {
                    wrapper: createWrapper(),
                },
            );

            result.current.mutate(true);

            await waitFor(() => {
                expect(mockToast.info).toHaveBeenCalled();
            });

            // Should not call setQueryData when data is null
            expect(setQueryDataSpy).not.toHaveBeenCalled();
        });
    });
});
