import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyPartnerShops } from "../useMyPartnerShops.ts";

const mockGetMyPartnerShops = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    getMyPartnerShops: mockGetMyPartnerShops,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

describe("useMyPartnerShops", () => {
    let queryClient: QueryClient;

    const createWrapper =
        () =>
        ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        mockGetErrorMessage.mockImplementation((error: unknown) =>
            error && typeof error === "object" && "message" in error
                ? String((error as { message?: unknown }).message)
                : "Unknown error",
        );
    });

    it("maps the list of partner shops", async () => {
        mockGetMyPartnerShops.mockResolvedValue({
            data: [
                {
                    shopId: "shop-1",
                    shopSlugId: "aurora-antiques",
                    name: "Aurora Antiques",
                    shopType: "AUCTION_HOUSE",
                    partnerStatus: "PARTNERED",
                    domains: ["aurora.example.com"],
                    created: "2026-04-25T00:00:00Z",
                    updated: "2026-04-26T00:00:00Z",
                },
            ],
            error: null,
        });

        const { result } = renderHook(() => useMyPartnerShops(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toMatchObject([
            { shopId: "shop-1", name: "Aurora Antiques", shopType: "AUCTION_HOUSE" },
        ]);
    });

    it("surfaces an error message when loading fails", async () => {
        mockGetMyPartnerShops.mockResolvedValue({
            data: null,
            error: { message: "Not authorized" },
        });
        mockGetErrorMessage.mockReturnValue("Not authorized");

        const { result } = renderHook(() => useMyPartnerShops(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await Promise.resolve();
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe("Not authorized");
    });
});
