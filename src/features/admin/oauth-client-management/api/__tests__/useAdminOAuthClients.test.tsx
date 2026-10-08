import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    adminOAuthClientDetailQueryKey,
    useAdminOAuthClient,
    useAdminOAuthClients,
    useCreateAdminOAuthClient,
    useDeleteAdminOAuthClient,
    useUpdateAdminOAuthClient,
} from "../useAdminOAuthClients.ts";

const api = vi.hoisted(() => ({
    list: vi.fn(),
    detail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
}));
vi.mock("@/client", () => ({
    adminListOAuthClients: api.list,
    adminGetOAuthClient: api.detail,
    adminCreateOAuthClient: api.create,
    adminPatchOAuthClient: api.update,
    adminDeleteOAuthClient: api.remove,
}));

const clientDto = {
    client_id: "oc_test123",
    client_name: "Cabinet integration",
    tos_uri: "https://cabinet.example/terms",
    policy_uri: "https://cabinet.example/privacy",
    client_uri: "https://cabinet.example",
    logo_uri: "https://cabinet.example/logo.svg",
    redirect_uris: ["https://cabinet.example/oauth/callback"],
    scope: ["product-listings:write"],
    client_id_issued_at: 1_759_000_000,
};
const ok = (data: unknown, status = 200) => ({ data, response: { status, ok: true } });
const noSecretInput = {
    clientName: "Cabinet integration",
    tosUri: "https://cabinet.example/terms",
    policyUri: "https://cabinet.example/privacy",
    clientUri: "https://cabinet.example",
    logoUri: "https://cabinet.example/logo.svg",
    redirectUris: ["https://cabinet.example/oauth/callback"],
    scopes: ["product-listings:write"] as const,
};

describe("admin OAuth client API", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    it("loads secret-free paginated list data with no-store and follows JSON tuple cursors", async () => {
        api.list
            .mockResolvedValueOnce(
                ok({
                    items: [clientDto],
                    size: 1,
                    searchAfter: ["2026-09-04T12:00:00Z", "oc_test123"],
                }),
            )
            .mockResolvedValueOnce(ok({ items: [], size: 0 }));

        const hook = renderHook(
            () => useAdminOAuthClients({ clientId: "oc_test123", name: "Cabinet" }),
            {
                wrapper,
            },
        );
        await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(1));

        expect(api.list).toHaveBeenLastCalledWith({
            query: {
                size: 21,
                clientId: "oc_test123",
                name: "Cabinet",
            },
            signal: expect.any(AbortSignal),
            cache: "no-store",
        });
        expect(hook.result.current.data?.pages[0]?.items[0]).not.toHaveProperty("clientSecret");
        expect(hook.result.current.data?.pages[0]?.total).toBeUndefined();

        await act(async () => hook.result.current.fetchNextPage());
        expect(api.list).toHaveBeenLastCalledWith({
            query: {
                size: 21,
                clientId: "oc_test123",
                name: "Cabinet",
                searchAfter: '["2026-09-04T12:00:00Z","oc_test123"]',
            },
            signal: expect.any(AbortSignal),
            cache: "no-store",
        });
    });

    it("loads detail DTOs with no secret property", async () => {
        api.detail.mockResolvedValue(ok(clientDto));

        const hook = renderHook(() => useAdminOAuthClient("oc_test123"), { wrapper });
        await waitFor(() =>
            expect(hook.result.current.data?.clientName).toBe("Cabinet integration"),
        );

        expect(api.detail).toHaveBeenCalledWith({
            path: { clientId: "oc_test123" },
            signal: expect.any(AbortSignal),
            cache: "no-store",
        });
        expect(hook.result.current.data).not.toHaveProperty("clientSecret");
    });

    it("updates from a secret-free response and preserves an empty scope patch", async () => {
        api.update.mockResolvedValue(ok(clientDto));
        const hook = renderHook(() => useUpdateAdminOAuthClient(), { wrapper });
        let updated: Awaited<ReturnType<typeof hook.result.current.mutateAsync>> | undefined;

        await act(async () => {
            updated = await hook.result.current.mutateAsync({
                clientId: "oc_test123",
                patch: { scopes: [] },
            });
        });

        expect(api.update).toHaveBeenCalledWith({
            path: { clientId: "oc_test123" },
            body: { scope: [] },
            cache: "no-store",
        });
        expect(updated).toMatchObject({ clientId: "oc_test123" });
        expect(updated).not.toHaveProperty("clientSecret");
        expect(client.getQueryData(adminOAuthClientDetailQueryKey("oc_test123"))).toMatchObject({
            clientId: "oc_test123",
        });
        expect(
            client.getQueryData(adminOAuthClientDetailQueryKey("oc_test123")),
        ).not.toHaveProperty("clientSecret");
    });

    it("returns one-time create credentials without placing the response in the query cache", async () => {
        api.create.mockResolvedValue(ok({ ...clientDto, client_secret: "plaintext-once" }, 201));
        const hook = renderHook(() => useCreateAdminOAuthClient(), { wrapper });

        await act(async () => {
            await expect(hook.result.current.mutateAsync(noSecretInput)).resolves.toEqual({
                clientId: "oc_test123",
                clientSecret: "plaintext-once",
            });
        });

        expect(api.create).toHaveBeenCalledWith({
            body: {
                client_name: "Cabinet integration",
                tos_uri: "https://cabinet.example/terms",
                policy_uri: "https://cabinet.example/privacy",
                client_uri: "https://cabinet.example",
                logo_uri: "https://cabinet.example/logo.svg",
                redirect_uris: ["https://cabinet.example/oauth/callback"],
                scope: ["product-listings:write"],
            },
            cache: "no-store",
        });
        const queryData = client
            .getQueryCache()
            .getAll()
            .map((query) => query.state.data);
        expect(JSON.stringify(queryData)).not.toContain("plaintext-once");
    });

    it("deletes through the admin operation with no-store", async () => {
        api.remove.mockResolvedValue({ data: undefined, response: { status: 204, ok: true } });
        const hook = renderHook(() => useDeleteAdminOAuthClient(), { wrapper });

        await act(async () => {
            await expect(hook.result.current.mutateAsync("oc_test123")).resolves.toBe("oc_test123");
        });

        expect(api.remove).toHaveBeenCalledWith({
            path: { clientId: "oc_test123" },
            cache: "no-store",
        });
    });
});
