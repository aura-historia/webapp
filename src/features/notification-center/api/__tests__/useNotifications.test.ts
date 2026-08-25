import { renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotifications } from "../useNotifications.ts";

const mockGetNotifications = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());
const mockMapToInternalNotificationCollection = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    getNotifications: mockGetNotifications,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

vi.mock("@/data/internal/notification/Notification.ts", () => ({
    mapToInternalNotificationCollection: mockMapToInternalNotificationCollection,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        i18n: { language: "de" },
    }),
}));

vi.mock("@/data/internal/common/Language.ts", () => ({
    parseLanguage: (lang: string) => lang,
}));

describe("useNotifications", () => {
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

    it("should fetch and return notifications", async () => {
        const mockCollection = { items: [{ notificationId: "n1" }], size: 1 };
        mockGetNotifications.mockResolvedValue({ data: {}, error: null });
        mockMapToInternalNotificationCollection.mockReturnValue(mockCollection);

        const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.pages[0]).toEqual(mockCollection);
    });

    it("should call getNotifications with correct query params", async () => {
        mockGetNotifications.mockResolvedValue({ data: {}, error: null });
        mockMapToInternalNotificationCollection.mockReturnValue({ items: [], size: 0 });

        renderHook(() => useNotifications(), { wrapper: createWrapper() });

        await waitFor(() => expect(mockGetNotifications).toHaveBeenCalledTimes(1));

        expect(mockGetNotifications).toHaveBeenCalledWith({
            query: expect.objectContaining({
                language: "de",
                size: 20,
                searchAfter: undefined,
            }),
        });
    });

    it("should throw error when API returns error", async () => {
        mockGetNotifications.mockResolvedValue({
            data: null,
            error: { message: "Unauthorized" },
        });
        mockGetErrorMessage.mockReturnValue("Unauthorized");

        const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error?.message).toBe("Unauthorized");
    });

    it("should indicate next page available when searchAfter is set", async () => {
        const firstPage = { items: [], size: 0, total: 0, searchAfter: "cursor-abc" };
        mockGetNotifications.mockResolvedValue({ data: {}, error: null });
        mockMapToInternalNotificationCollection.mockReturnValue(firstPage);

        const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.hasNextPage).toBe(true);
    });

    it("should indicate no next page when searchAfter is absent", async () => {
        const firstPage = { items: [], size: 0, total: 0, searchAfter: undefined };
        mockGetNotifications.mockResolvedValue({ data: {}, error: null });
        mockMapToInternalNotificationCollection.mockReturnValue(firstPage);

        const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.hasNextPage).toBe(false);
    });
});
