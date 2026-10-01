import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useNewsletterSubscription } from "../useNewsletterSubscription.ts";

const putNewsletterSubscription = vi.hoisted(() => vi.fn());
vi.mock("@/client", () => ({ putNewsletterSubscription }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: () => "Subscription failed" }),
}));

describe("newsletter subscription", () => {
    it("maps preferences and accepts the empty 204 response", async () => {
        putNewsletterSubscription.mockResolvedValue({ data: undefined, response: { status: 204 } });
        const client = new QueryClient();
        const { result } = renderHook(() => useNewsletterSubscription(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={client}>{children}</QueryClientProvider>
            ),
        });
        await act(async () => {
            await result.current.mutateAsync({
                email: "u@example.com",
                language: "de",
                currency: "EUR",
            });
        });
        expect(putNewsletterSubscription).toHaveBeenCalledWith({
            body: { email: "u@example.com", language: "de", currency: "EUR" },
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
});
