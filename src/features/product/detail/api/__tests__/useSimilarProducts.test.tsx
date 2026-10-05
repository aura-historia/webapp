import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSimilarProducts } from "../useSimilarProducts.ts";

const mocks = vi.hoisted(() => ({ initial: vi.fn(), poll: vi.fn() }));
vi.mock("@/client", () => ({ getSimilarProductListings: mocks.initial }));
vi.mock("@/client/client.gen.ts", () => ({
    client: { get: mocks.poll, getConfig: () => ({ baseUrl: "https://api.aura-historia.com" }) },
}));
vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: { currency: "EUR" } }),
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "de" } }) }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: () => "API error" }),
}));
vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));
vi.mock("@/data/internal/product/ProductListing.ts", () => ({
    mapPersonalizedProductListingSummary: (product: unknown) => product,
}));

const listingId = "pl_01TESTLISTING";
const location = `/api/v1/product-listings/${listingId}/similar`;
const pending = (url?: string) => ({
    response: new Response(null, { status: 202, headers: url ? { Location: url } : {} }),
});

function renderSimilar() {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { ...renderHook(() => useSimilarProducts(listingId), { wrapper }), queryClient };
}

describe("useSimilarProducts", () => {
    beforeEach(() => vi.clearAllMocks());

    it("follows an approved same-origin polling location and preserves currency and language", async () => {
        mocks.initial.mockResolvedValue(pending(`https://api.aura-historia.com${location}`));
        mocks.poll.mockResolvedValue({
            data: [{ productListingId: "pl_01SIMILAR" }],
            response: new Response("[]", { status: 200 }),
        });
        const { result } = renderSimilar();
        await waitFor(() => expect(result.current.data?.isEmbeddingsPending).toBe(true));
        expect(mocks.initial).toHaveBeenCalledWith(
            expect.objectContaining({
                path: { productListingId: listingId },
                query: { language: "de", currency: "EUR" },
            }),
        );
        await act(async () => {
            await result.current.refetch();
        });
        expect(mocks.poll).toHaveBeenCalledWith(
            expect.objectContaining({
                url: `${location}?language=de&currency=EUR`,
                security: [{ type: "http", scheme: "bearer" }],
            }),
        );
        await waitFor(() =>
            expect(result.current.data?.products).toEqual([{ productListingId: "pl_01SIMILAR" }]),
        );
        expect(result.current.data?.isEmbeddingsPending).toBe(false);
    });

    it.each([
        undefined,
        "https://untrusted.example/similar",
        "/api/v1/product-listings/pl_OTHER/similar",
    ])("rejects an absent or unsafe polling location: %s", async (url) => {
        mocks.initial.mockResolvedValue(pending(url));
        const { result } = renderSimilar();
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(mocks.poll).not.toHaveBeenCalled();
    });

    it("stops automatic polling after five pending responses", async () => {
        mocks.initial.mockResolvedValue(pending(location));
        mocks.poll.mockResolvedValue(pending());
        const { result } = renderSimilar();
        await waitFor(() => expect(result.current.data?.pendingPollCount).toBe(1));
        for (let count = 2; count <= 5; count++) {
            await act(async () => {
                await result.current.refetch();
            });
            await waitFor(() => expect(result.current.data?.pendingPollCount).toBe(count));
        }
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 2_100));
        });
        expect(mocks.initial).toHaveBeenCalledTimes(1);
        expect(mocks.poll).toHaveBeenCalledTimes(4);
    });
});
