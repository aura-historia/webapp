import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStripeBilling } from "../useStripeBilling.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockPostBillingManage = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    error: vi.fn(),
}));

vi.mock("@/client", () => ({
    postBillingManage: mockPostBillingManage,
}));

vi.mock("@aws-amplify/ui-react", () => ({
    useAuthenticator: vi.fn(() => ({
        user: { username: "test-user" },
    })),
}));

vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock("@/hooks/common/useApiError", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

vi.mock("sonner", () => ({
    toast: mockToast,
}));

const { useAuthenticator } = await import("@aws-amplify/ui-react");
const mockUseAuthenticator = vi.mocked(useAuthenticator);

describe("useStripeBilling", () => {
    let queryClient: QueryClient;

    const createWrapper = () => {
        return ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });

        mockUseAuthenticator.mockReturnValue({
            user: { username: "test-user" },
        } as ReturnType<typeof useAuthenticator>);

        mockGetErrorMessage.mockImplementation(() => "An error occurred");

        Object.defineProperty(window, "location", {
            value: { href: "" },
            writable: true,
        });
    });

    describe("Anonymous user", () => {
        it("should navigate to login when user is not authenticated", async () => {
            mockUseAuthenticator.mockReturnValue({
                user: undefined,
            } as unknown as ReturnType<typeof useAuthenticator>);

            const { result } = renderHook(() => useStripeBilling(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.handleSubscribe("PRO", "MONTHLY");
            });

            expect(mockNavigate).toHaveBeenCalledWith({
                to: "/login",
                search: { redirect: "/" },
            });
            expect(mockPostBillingManage).not.toHaveBeenCalled();
        });

        it("should not set loading state for anonymous user redirect", async () => {
            mockUseAuthenticator.mockReturnValue({
                user: undefined,
            } as unknown as ReturnType<typeof useAuthenticator>);

            const { result } = renderHook(() => useStripeBilling(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(false);

            await act(async () => {
                await result.current.handleSubscribe("PRO", "YEARLY");
            });

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe("Authenticated user", () => {
        it("should redirect to checkout URL on successful billing manage request", async () => {
            mockPostBillingManage.mockResolvedValue({
                data: { url: "https://checkout.stripe.com/c/pay/cs_test_123" },
                error: null,
            });

            const { result } = renderHook(() => useStripeBilling(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.handleSubscribe("PRO", "MONTHLY");
            });

            expect(mockPostBillingManage).toHaveBeenCalledWith({
                body: { plan: "PRO", cycle: "MONTHLY" },
            });
            expect(window.location.href).toBe("https://checkout.stripe.com/c/pay/cs_test_123");
        });

        it("should pass ULTIMATE plan and YEARLY cycle correctly", async () => {
            mockPostBillingManage.mockResolvedValue({
                data: { url: "https://checkout.stripe.com/c/pay/cs_test_456" },
                error: null,
            });

            const { result } = renderHook(() => useStripeBilling(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.handleSubscribe("ULTIMATE", "YEARLY");
            });

            expect(mockPostBillingManage).toHaveBeenCalledWith({
                body: { plan: "ULTIMATE", cycle: "YEARLY" },
            });
            expect(window.location.href).toBe("https://checkout.stripe.com/c/pay/cs_test_456");
        });

        it("should redirect to portal URL when billing manage returns portal session", async () => {
            mockPostBillingManage.mockResolvedValue({
                data: { url: "https://billing.stripe.com/p/session/manage_paid" },
                error: null,
            });

            const { result } = renderHook(() => useStripeBilling(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.handleSubscribe("PRO", "MONTHLY");
            });

            expect(mockPostBillingManage).toHaveBeenCalledWith({
                body: { plan: "PRO", cycle: "MONTHLY" },
            });
            expect(window.location.href).toBe("https://billing.stripe.com/p/session/manage_paid");
        });

        it("should set loading state during billing manage request", async () => {
            let resolveBillingManage!: (value: unknown) => void;
            const billingPromise = new Promise((resolve) => {
                resolveBillingManage = resolve;
            });
            mockPostBillingManage.mockReturnValue(billingPromise);

            const { result } = renderHook(() => useStripeBilling(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(false);

            let subscribePromise!: Promise<void>;
            act(() => {
                subscribePromise = result.current.handleSubscribe("PRO", "MONTHLY");
            });

            expect(result.current.isLoading).toBe(true);

            await act(async () => {
                resolveBillingManage({
                    data: { url: "https://checkout.stripe.com/c/pay/cs_test_123" },
                    error: null,
                });
                await subscribePromise;
            });

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe("Error handling", () => {
        it("should show error toast when billing manage fails", async () => {
            mockPostBillingManage.mockResolvedValue({
                data: null,
                error: {
                    status: 500,
                    error: "INTERNAL_SERVER_ERROR",
                    title: "Internal Server Error",
                },
            });

            const { result } = renderHook(() => useStripeBilling(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.handleSubscribe("PRO", "MONTHLY");
            });

            expect(mockToast.error).toHaveBeenCalled();
        });

        it("should reset loading state after error", async () => {
            mockPostBillingManage.mockResolvedValue({
                data: null,
                error: {
                    status: 500,
                    error: "INTERNAL_SERVER_ERROR",
                    title: "Internal Server Error",
                },
            });

            const { result } = renderHook(() => useStripeBilling(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.handleSubscribe("PRO", "MONTHLY");
            });

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe("Initial state", () => {
        it("should return isLoading as false initially", () => {
            const { result } = renderHook(() => useStripeBilling(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(false);
            expect(typeof result.current.handleSubscribe).toBe("function");
        });
    });
});
