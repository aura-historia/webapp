import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useWatchlistMutation } from "../useWatchlistMutation.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockAddWatchlistProduct = vi.hoisted(() => vi.fn());
const mockDeleteWatchlistProduct = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
}));

vi.mock("@/client", () => ({
    addWatchlistProduct: mockAddWatchlistProduct,
    deleteWatchlistProduct: mockDeleteWatchlistProduct,
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

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("useWatchlistMutation", () => {
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

    describe("addToWatchlist", () => {
        it("should successfully add product to watchlist", async () => {
            const mockResponse = { shopId, shopsProductId };
            mockAddWatchlistProduct.mockResolvedValue({
                data: mockResponse,
                error: null,
            });

            const { result } = renderHook(() => useWatchlistMutation(shopId, shopsProductId), {
                wrapper: createWrapper(),
            });

            result.current.mutate("addToWatchlist");

            await waitFor(() => {
                expect(mockAddWatchlistProduct).toHaveBeenCalledWith({
                    body: { shopId, shopsProductId },
                });
            });
        });

        it("should show info toast on 401 unauthorized", async () => {
            mockAddWatchlistProduct.mockResolvedValue({
                data: null,
                error: { message: "Unauthorized" },
                response: { status: 401 },
            });

            const { result } = renderHook(() => useWatchlistMutation(shopId, shopsProductId), {
                wrapper: createWrapper(),
            });

            result.current.mutate("addToWatchlist");

            await waitFor(() => {
                expect(mockToast.info).toHaveBeenCalledWith("watchlist.loginRequired");
            });
        });

        it("should show warning toast on 422 validation error", async () => {
            const errorMessage = "Validation failed";
            mockAddWatchlistProduct.mockResolvedValue({
                data: null,
                error: { message: errorMessage },
                response: { status: 422 },
            });
            mockGetErrorMessage.mockReturnValue(errorMessage);

            const { result } = renderHook(() => useWatchlistMutation(shopId, shopsProductId), {
                wrapper: createWrapper(),
            });

            result.current.mutate("addToWatchlist");

            await waitFor(() => {
                expect(mockToast.warning).toHaveBeenCalledWith(errorMessage);
            });
        });

        it("should invalidate queries on success", async () => {
            mockAddWatchlistProduct.mockResolvedValue({
                data: { shopId, shopsProductId },
                error: null,
            });

            const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

            const { result } = renderHook(() => useWatchlistMutation(shopId, shopsProductId), {
                wrapper: createWrapper(),
            });

            result.current.mutate("addToWatchlist");

            await waitFor(() => {
                // Check that invalidateQueries was called 3 times
                expect(invalidateQueriesSpy).toHaveBeenCalledTimes(3);
                // Verify it was called for watchlist and search
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["watchlist"] });
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["search"] });
                // The third call should be for getProduct with the query key structure
                expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(3, {
                    queryKey: expect.any(Object),
                });
            });
        });
    });

    describe("deleteFromWatchlist", () => {
        it("should successfully delete product from watchlist", async () => {
            mockDeleteWatchlistProduct.mockResolvedValue({
                data: {},
                error: null,
            });

            const { result } = renderHook(() => useWatchlistMutation(shopId, shopsProductId), {
                wrapper: createWrapper(),
            });

            result.current.mutate("deleteFromWatchlist");

            await waitFor(() => {
                expect(mockDeleteWatchlistProduct).toHaveBeenCalledWith({
                    path: { shopId, shopsProductId },
                });
            });
        });

        it("should show info toast on 401 unauthorized for deletion", async () => {
            mockDeleteWatchlistProduct.mockResolvedValue({
                data: null,
                error: { message: "Unauthorized" },
                response: { status: 401 },
            });

            const { result } = renderHook(() => useWatchlistMutation(shopId, shopsProductId), {
                wrapper: createWrapper(),
            });

            result.current.mutate("deleteFromWatchlist");

            await waitFor(() => {
                expect(mockToast.info).toHaveBeenCalledWith("watchlist.loginRequired");
            });
        });

        it("should invalidate queries after successful deletion", async () => {
            mockDeleteWatchlistProduct.mockResolvedValue({
                data: {},
                error: null,
            });

            const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

            const { result } = renderHook(() => useWatchlistMutation(shopId, shopsProductId), {
                wrapper: createWrapper(),
            });

            result.current.mutate("deleteFromWatchlist");

            await waitFor(() => {
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["watchlist"] });
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["search"] });
            });
        });
    });

    describe("error handling", () => {
        it("should show error toast on mutation error", async () => {
            const errorMessage = "Server error";
            mockAddWatchlistProduct.mockResolvedValue({
                data: null,
                error: { message: errorMessage },
                response: { status: 500 },
            });
            mockGetErrorMessage.mockReturnValue(errorMessage);

            const { result } = renderHook(() => useWatchlistMutation(shopId, shopsProductId), {
                wrapper: createWrapper(),
            });

            result.current.mutate("addToWatchlist");

            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalled();
            });
        });
    });
});
