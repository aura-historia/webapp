import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDeleteUserAccount } from "../useDeleteUserAccount.ts";

const deleteUser = vi.hoisted(() => vi.fn());
vi.mock("@/client", () => ({ deleteUser }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: () => "Deletion failed" }),
}));

describe("account deletion cache", () => {
    it("accepts an empty 204 and cancels pending queries before clearing private data", async () => {
        deleteUser.mockResolvedValue({ data: undefined, response: { status: 204 } });
        const client = new QueryClient();
        client.setQueryData(["userAccount"], { userId: "u" });
        client.setQueryData(["watchlist", "u"], { image: "private.jpg" });
        let requestSignal: AbortSignal | undefined;
        const pending = client
            .fetchQuery({
                queryKey: ["search", "chair"],
                queryFn: ({ signal }) => {
                    requestSignal = signal;
                    return new Promise(() => {});
                },
            })
            .catch(() => undefined);
        const { result } = renderHook(() => useDeleteUserAccount(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={client}>{children}</QueryClientProvider>
            ),
        });
        await act(async () => {
            await result.current.mutateAsync();
        });
        await pending;
        expect(deleteUser).toHaveBeenCalledWith();
        expect(requestSignal?.aborted).toBe(true);
        expect(client.getQueryCache().getAll()).toHaveLength(0);
    });

    it("keeps account data if deletion fails", async () => {
        deleteUser.mockResolvedValue({
            error: { status: 500, error: "UNEXPECTED", title: "Failure" },
        });
        const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
        client.setQueryData(["userAccount"], { userId: "u" });
        const { result } = renderHook(() => useDeleteUserAccount(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={client}>{children}</QueryClientProvider>
            ),
        });
        await act(async () => {
            await expect(result.current.mutateAsync()).rejects.toThrow("Deletion failed");
        });
        expect(client.getQueryData(["userAccount"])).toEqual({ userId: "u" });
    });
});
