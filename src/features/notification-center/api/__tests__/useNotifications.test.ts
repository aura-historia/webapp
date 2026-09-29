import { renderHook, waitFor, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotifications } from "../useNotifications.ts";
import { notificationDto } from "../../__tests__/fixtures.ts";
const mocks = vi.hoisted(() => ({
    list: vi.fn(),
    user: { userId: "user-1" } as { userId: string } | null,
    loading: false,
    language: "en",
}));
vi.mock("@/client", () => ({ listNotifications: mocks.list }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: () => "Request failed" }),
}));
vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ i18n: { language: mocks.language } }),
}));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ user: mocks.user, isLoading: mocks.loading }),
}));
describe("useNotifications", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.user = { userId: "user-1" };
        mocks.loading = false;
        mocks.language = "en";
        client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        mocks.list.mockResolvedValue({ data: { items: [notificationDto()], size: 1 } });
    });
    it("maps DTOs into domain models and sends no currency or sort", async () => {
        const { result } = renderHook(() => useNotifications(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(mocks.list).toHaveBeenCalledWith({
            query: { language: "en", searchAfter: undefined },
        });
        expect(result.current.data?.pages[0].items[0].created).toBeInstanceOf(Date);
        await waitFor(() => expect(result.current.hasNextPage).toBe(false));
    });
    it("serializes tuple cursors for the next request and stops on null", async () => {
        const cursor = ["2026-09-10T10:00:00Z", "notification-1"];
        mocks.list
            .mockResolvedValueOnce({
                data: { items: [notificationDto()], size: 1, searchAfter: cursor },
            })
            .mockResolvedValueOnce({ data: { items: [], size: 0, searchAfter: null } });
        const { result } = renderHook(() => useNotifications(), { wrapper });
        await waitFor(() => expect(result.current.hasNextPage).toBe(true));
        await act(() => result.current.fetchNextPage());
        expect(mocks.list).toHaveBeenLastCalledWith({
            query: { language: "en", searchAfter: JSON.stringify(cursor) },
        });
        await waitFor(() => expect(result.current.hasNextPage).toBe(false));
    });
    it("stops if the backend repeats a cursor", async () => {
        mocks.list.mockResolvedValue({
            data: { items: [notificationDto()], size: 1, searchAfter: ["date", "id"] },
        });
        const { result } = renderHook(() => useNotifications(), { wrapper });
        await waitFor(() => expect(result.current.hasNextPage).toBe(true));
        await act(() => result.current.fetchNextPage());
        await waitFor(() => expect(result.current.hasNextPage).toBe(false));
    });
    it("reports API failures", async () => {
        mocks.list.mockResolvedValue({ error: { status: 503 } });
        const { result } = renderHook(() => useNotifications(), { wrapper });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe("Request failed");
    });
    it("does not request notifications for anonymous viewers", () => {
        mocks.user = null;
        renderHook(() => useNotifications(), { wrapper });
        expect(mocks.list).not.toHaveBeenCalled();
    });
    it("separates cached notifications by viewer and language", async () => {
        const { result, rerender } = renderHook(() => useNotifications(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        mocks.user = { userId: "user-2" };
        mocks.language = "de";
        mocks.list.mockResolvedValue({
            data: { items: [notificationDto({ notificationId: "user-2-notification" })], size: 1 },
        });
        rerender();
        await waitFor(() =>
            expect(result.current.data?.pages[0].items[0].notificationId).toBe(
                "user-2-notification",
            ),
        );
        expect(client.getQueryData(["getNotifications", "user-1", "en"])).toBeDefined();
        expect(client.getQueryData(["getNotifications", "user-2", "de"])).toBeDefined();
    });
});
