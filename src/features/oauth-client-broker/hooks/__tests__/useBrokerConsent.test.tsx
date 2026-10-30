import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    BrokerConsentUnavailableError,
    useBrokerConsent,
} from "@/features/oauth-client-broker/hooks/useBrokerConsent.ts";

const TRANSACTION_ID = "q2Jv7Wl3N1m8b0bTt0lpbq3c7S8Dzvq7m3x8W4cnD8I";

describe("useBrokerConsent", () => {
    const fetchMock = vi.fn();
    let client: QueryClient;

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
        client = new QueryClient();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function wrapper({ children }: { children: ReactNode }) {
        return createElement(QueryClientProvider, { client }, children);
    }

    it("reads the transaction's consent context with the session, never from a cache", async () => {
        fetchMock.mockResolvedValue(
            new Response(
                JSON.stringify({
                    status: "pending",
                    transaction_id: TRANSACTION_ID,
                    client_id: "oc_x",
                    merchant_redirect_uri: "https://shop.example/wp-admin/admin.php",
                    recipient: "https://shop.example",
                    scope: "product-listings:write",
                }),
            ),
        );

        const { result } = renderHook(() => useBrokerConsent(TRANSACTION_ID), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toMatchObject({
            status: "pending",
            recipient: "https://shop.example",
        });
        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe(`/api/oauth/broker/woocommerce/consent?transaction_id=${TRANSACTION_ID}`);
        expect(init).toMatchObject({ credentials: "same-origin", cache: "no-store" });
    });

    it("maps an invalid reference to the invalid state", async () => {
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify({ status: "invalid" }), { status: 400 }),
        );

        const { result } = renderHook(() => useBrokerConsent(TRANSACTION_ID), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({ status: "invalid" });
    });

    it.each([
        ["an unavailable store", () => Promise.resolve(new Response("{}", { status: 503 }))],
        ["a lost session", () => Promise.resolve(new Response("{}", { status: 401 }))],
        ["a network failure", () => Promise.reject(new TypeError("network"))],
    ])("reports %s as unavailable without retrying", async (_, respond) => {
        fetchMock.mockImplementation(respond);

        const { result } = renderHook(() => useBrokerConsent(TRANSACTION_ID), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toBeInstanceOf(BrokerConsentUnavailableError);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
