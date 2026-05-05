import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSearchFilterMatchFeedback } from "../useSearchFilterMatchFeedback.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockUpdateFeedback = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn(() => "Fehler"));
const mockToast = vi.hoisted(() => ({ error: vi.fn() }));
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    updateSearchFilterProductMatchFeedback: mockUpdateFeedback,
}));

vi.mock("@/hooks/common/useApiError", () => ({
    useApiError: () => ({ getErrorMessage: mockGetErrorMessage }),
}));

vi.mock("@/data/internal/hooks/ApiError", () => ({
    mapToInternalApiError: (e: unknown) => e,
}));

vi.mock("sonner", () => ({
    toast: mockToast,
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>();
    return {
        ...actual,
        useQueryClient: () => ({
            invalidateQueries: mockInvalidateQueries,
        }),
    };
});

describe("useSearchFilterMatchFeedback", () => {
    let queryClient: QueryClient;

    const createWrapper =
        () =>
        ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    it("calls API with correct path and body on mutate(true)", async () => {
        mockUpdateFeedback.mockResolvedValue({ data: {}, error: null });

        const { result } = renderHook(
            () => useSearchFilterMatchFeedback("f-1", "shop-1", "prod-1"),
            { wrapper: createWrapper() },
        );

        await act(async () => {
            result.current.mutate(true);
        });

        expect(mockUpdateFeedback).toHaveBeenCalledWith({
            path: { userSearchFilterId: "f-1", shopId: "shop-1", shopsProductId: "prod-1" },
            body: { feedback: true },
        });
    });

    it("calls API with feedback=false on mutate(false)", async () => {
        mockUpdateFeedback.mockResolvedValue({ data: {}, error: null });

        const { result } = renderHook(
            () => useSearchFilterMatchFeedback("f-1", "shop-1", "prod-1"),
            { wrapper: createWrapper() },
        );

        await act(async () => {
            result.current.mutate(false);
        });

        expect(mockUpdateFeedback).toHaveBeenCalledWith(
            expect.objectContaining({ body: { feedback: false } }),
        );
    });

    it("invalidates query on success", async () => {
        mockUpdateFeedback.mockResolvedValue({ data: {}, error: null });

        const { result } = renderHook(
            () => useSearchFilterMatchFeedback("f-1", "shop-1", "prod-1"),
            { wrapper: createWrapper() },
        );

        await act(async () => {
            result.current.mutate(true);
        });

        expect(mockInvalidateQueries).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: ["searchFilterMatchedProducts", "f-1"] }),
        );
    });

    it("shows toast error when API returns error", async () => {
        mockUpdateFeedback.mockResolvedValue({
            data: null,
            error: { status: 400, error: "BAD_REQUEST" },
        });

        const { result } = renderHook(
            () => useSearchFilterMatchFeedback("f-1", "shop-1", "prod-1"),
            { wrapper: createWrapper() },
        );

        await act(async () => {
            result.current.mutate(true);
        });

        expect(mockToast.error).toHaveBeenCalled();
    });

    it("shows toast error on unexpected rejection", async () => {
        mockUpdateFeedback.mockRejectedValue(new Error("Netzwerkfehler"));

        const { result } = renderHook(
            () => useSearchFilterMatchFeedback("f-1", "shop-1", "prod-1"),
            { wrapper: createWrapper() },
        );

        await act(async () => {
            result.current.mutate(true);
        });

        expect(mockToast.error).toHaveBeenCalled();
    });

    it("returns isPending false initially", () => {
        const { result } = renderHook(
            () => useSearchFilterMatchFeedback("f-1", "shop-1", "prod-1"),
            { wrapper: createWrapper() },
        );
        expect(result.current.isPending).toBe(false);
    });
});
