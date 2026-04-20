import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStripeBilling } from "../useStripeBilling.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockPostBillingCheckout = vi.hoisted(() => vi.fn());
const mockPostBillingPortal = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    error: vi.fn(),
}));

vi.mock("@/client", () => ({
    postBillingCheckout: mockPostBillingCheckout,
    postBillingPortal: mockPostBillingPortal,
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
            expect(mockPostBillingCheckout).not.toHaveBeenCalled();
            expect(mockPostBillingPortal).not.toHaveBeenCalled();
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

    describe("Authenticated user without Stripe customer (checkout flow)", () => {
        it("should redirect to checkout URL on successful checkout", async () => {
            mockPostBillingCheckout.mockResolvedValue({
                data: { url: "https://checkout.stripe.com/c/pay/cs_test_123" },
                error: null,
            });

            const { result } = renderHook(() => useStripeBilling(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.handleSubscribe("PRO", "MONTHLY");
            });

            expect(mockPostBillingCheckout).toHaveBeenCalledWith({
                body: { plan: "PRO", cycle: "MONTHLY" },
            });
            expect(window.location.href).toBe("https://checkout.stripe.com/c/pay/cs_test_123");
            expect(mockPostBillingPortal).not.toHaveBeenCalled();
        });

        it("should pass ULTIMATE plan and YEARLY cycle correctly", async () => {
            mockPostBillingCheckout.mockResolvedValue({
                data: { url: "https://checkout.stripe.com/c/pay/cs_test_456" },
                error: null,
            });

            const { result } = renderHook(() => useStripeBilling(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.handleSubscribe("ULTIMATE", "YEARLY");
            });

            expect(mockPostBillingCheckout).toHaveBeenCalledWith({
                body: { plan: "ULTIMATE", cycle: "YEARLY" },
            });
            expect(window.location.href).toBe("https://checkout.stripe.com/c/pay/cs_test_456");
        });

        it("should set loading state during checkout request", async () => {
            let resolveCheckout: (value: unknown) => void;
            const checkoutPromise = new Promise((resolve) => {
                resolveCheckout = resolve;
            });
            mockPostBillingCheckout.mockReturnValue(checkoutPromise);

            const { result } = renderHook(() => useStripeBilling(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(false);

            let subscribePromise: Promise<void>;
            act(() => {
                subscribePromise = result.current.handleSubscribe("PRO", "MONTHLY");
            });

            expect(result.current.isLoading).toBe(true);

            await act(async () => {
                resolveCheckout!({
                    data: { url: "https://checkout.stripe.com/c/pay/cs_test_123" },
                    error: null,
                });
                await subscribePromise!;
            });

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe("Authenticated user with existing Stripe customer (portal fallback)", () => {
        it("should fall back to portal when checkout returns 409", async () => {
            mockPostBillingCheckout.mockResolvedValue({
                data: null,
                error: {
                    status: 409,
                    error: "STRIPE_CUSTOMER_ALREADY_EXISTS",
                    title: "Conflict",
                    detail: "User has already created a Stripe customer",
                },
            });

            mockPostBillingPortal.mockResolvedValue({
                data: { url: "https://billing.stripe.com/p/session/test_123" },
                error: null,
            });

            const { result } = renderHook(() => useStripeBilling(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.handleSubscribe("PRO", "MONTHLY");
            });

            expect(mockPostBillingCheckout).toHaveBeenCalled();
            expect(mockPostBillingPortal).toHaveBeenCalled();
            expect(window.location.href).toBe("https://billing.stripe.com/p/session/test_123");
        });

        it("should show error toast when portal also fails after 409 checkout", async () => {
            mockPostBillingCheckout.mockResolvedValue({
                data: null,
                error: {
                    status: 409,
                    error: "STRIPE_CUSTOMER_ALREADY_EXISTS",
                    title: "Conflict",
                },
            });

            mockPostBillingPortal.mockResolvedValue({
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
    });

    describe("Error handling", () => {
        it("should show error toast when checkout fails with non-409 error", async () => {
            mockPostBillingCheckout.mockResolvedValue({
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
            expect(mockPostBillingPortal).not.toHaveBeenCalled();
        });

        it("should reset loading state after error", async () => {
            mockPostBillingCheckout.mockResolvedValue({
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
