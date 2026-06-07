import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useWatchlistStateMutation } from "../useWatchlistStateMutation.ts";
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

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("useWatchlistStateMutation", () => {
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

    it("sends ACTIVE when activating", async () => {
        mockPatchWatchlistProduct.mockResolvedValue({ data: {}, error: null });

        const { result } = renderHook(() => useWatchlistStateMutation(shopId, shopsProductId), {
            wrapper: createWrapper(),
        });

        result.current.mutate(true);

        await waitFor(() => {
            expect(mockPatchWatchlistProduct).toHaveBeenCalledWith({
                path: { shopId, shopsProductId },
                body: { state: "ACTIVE" },
            });
        });
    });

    it("sends INACTIVE_BY_USER when deactivating", async () => {
        mockPatchWatchlistProduct.mockResolvedValue({ data: {}, error: null });

        const { result } = renderHook(() => useWatchlistStateMutation(shopId, shopsProductId), {
            wrapper: createWrapper(),
        });

        result.current.mutate(false);

        await waitFor(() => {
            expect(mockPatchWatchlistProduct).toHaveBeenCalledWith({
                path: { shopId, shopsProductId },
                body: { state: "INACTIVE_BY_USER" },
            });
        });
    });

    it("shows info toast on 401", async () => {
        mockPatchWatchlistProduct.mockResolvedValue({
            data: null,
            error: { message: "Unauthorized" },
            response: { status: 401 },
        });

        const { result } = renderHook(() => useWatchlistStateMutation(shopId, shopsProductId), {
            wrapper: createWrapper(),
        });

        result.current.mutate(true);

        await waitFor(() => {
            expect(mockToast.info).toHaveBeenCalledWith("watchlist.loginRequired");
        });
    });

    it("invalidates watchlist and search queries on success", async () => {
        mockPatchWatchlistProduct.mockResolvedValue({ data: {}, error: null });

        const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useWatchlistStateMutation(shopId, shopsProductId), {
            wrapper: createWrapper(),
        });

        result.current.mutate(true);

        await waitFor(() => {
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["watchlist"] });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["search"] });
        });
    });

    it("shows error toast on failure", async () => {
        const errorMessage = "Server error";
        mockPatchWatchlistProduct.mockResolvedValue({
            data: null,
            error: { message: errorMessage },
            response: { status: 500 },
        });
        mockGetErrorMessage.mockReturnValue(errorMessage);

        const { result } = renderHook(() => useWatchlistStateMutation(shopId, shopsProductId), {
            wrapper: createWrapper(),
        });

        result.current.mutate(true);

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalled();
        });
    });
});
