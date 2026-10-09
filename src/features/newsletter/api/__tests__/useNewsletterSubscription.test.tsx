import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { USER_ACCOUNT_QUERY_KEY } from "@/features/account-management/api/accountQueryKeys.ts";
import { useNewsletterSubscription } from "../useNewsletterSubscription.ts";

const putNewsletterSubscription = vi.hoisted(() => vi.fn());
vi.mock("@/client", () => ({ putNewsletterSubscription }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: () => "Subscription failed" }),
}));

describe("newsletter subscription", () => {
    beforeEach(() => {
        putNewsletterSubscription.mockReset();
    });

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

    it("leaves cached account consent untouched after a 204 confirmation request", async () => {
        putNewsletterSubscription.mockResolvedValue({ data: undefined, response: { status: 204 } });
        const client = new QueryClient();
        const account = { email: "u@example.com", marketingEmailConsent: false };
        client.setQueryData(USER_ACCOUNT_QUERY_KEY, account);
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const setQueryData = vi.spyOn(client, "setQueryData");
        const { result } = renderHook(() => useNewsletterSubscription(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={client}>{children}</QueryClientProvider>
            ),
        });

        await act(async () => {
            await result.current.mutateAsync({ email: "u@example.com" });
        });

        expect(putNewsletterSubscription).toHaveBeenLastCalledWith({
            body: { email: "u@example.com" },
        });
        expect(client.getQueryData(USER_ACCOUNT_QUERY_KEY)).toBe(account);
        expect(client.getQueryState(USER_ACCOUNT_QUERY_KEY)?.isInvalidated).toBe(false);
        expect(invalidate).not.toHaveBeenCalled();
        expect(setQueryData).not.toHaveBeenCalled();
    });

    it("surfaces a temporary failure so the form can offer a deliberate retry", async () => {
        putNewsletterSubscription.mockResolvedValue({
            data: undefined,
            error: {
                status: 503,
                title: "Service Unavailable",
                error: "NEWSLETTER_TEMPORARILY_UNAVAILABLE",
            },
            response: { status: 503 },
        });
        const client = new QueryClient();
        const { result } = renderHook(() => useNewsletterSubscription(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={client}>{children}</QueryClientProvider>
            ),
        });

        await expect(
            act(() => result.current.mutateAsync({ email: "u@example.com" })),
        ).rejects.toThrow("Subscription failed");
        expect(putNewsletterSubscription).toHaveBeenCalledTimes(1);
    });
});
