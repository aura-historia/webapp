import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FederatedAuthRedirectResult } from "@/features/authentication/lib/federatedAuthRedirect.ts";

const mockNavigate = vi.hoisted(() => vi.fn());
const mockFetchUserAttributes = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());
const mockStorePendingEmail = vi.hoisted(() => vi.fn());
const mockSubscription = vi.hoisted(() => ({
    subscriber: null as null | ((result: FederatedAuthRedirectResult) => void),
}));

vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock("aws-amplify/auth", () => ({
    fetchUserAttributes: mockFetchUserAttributes,
}));

vi.mock("sonner", () => ({
    toast: { error: mockToastError },
}));

vi.mock("@/features/authentication/components/pendingSignUpEmail.ts", () => ({
    storePendingEmail: mockStorePendingEmail,
}));

vi.mock("@/features/authentication/lib/federatedAuthRedirect.ts", () => ({
    federatedAuthRedirect: {
        subscribe: (subscriber: (result: FederatedAuthRedirectResult) => void) => {
            mockSubscription.subscriber = subscriber;
            return () => {
                mockSubscription.subscriber = null;
            };
        },
    },
}));

import { useFederatedAuthRedirectCompletion } from "@/features/authentication/hooks/useFederatedAuthRedirectCompletion.ts";

function emit(result: FederatedAuthRedirectResult) {
    renderHook(() => useFederatedAuthRedirectCompletion());
    mockSubscription.subscriber?.(result);
}

describe("useFederatedAuthRedirectCompletion", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSubscription.subscriber = null;
    });

    it("sends sign-in intent to the original localized destination", async () => {
        emit({
            status: "success",
            state: {
                version: 1,
                intent: "sign-in",
                locale: "fr",
                redirectPath: "/de/me/watchlist?sort=recent",
            },
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({
                href: "/fr/me/watchlist?sort=recent",
                replace: true,
            });
        });
        expect(mockFetchUserAttributes).not.toHaveBeenCalled();
    });

    it("falls back to the localized home page without a valid state", async () => {
        emit({ status: "success", state: null });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({ href: "/de", replace: true });
        });
    });

    it("routes sign-up intent through the user-details step", async () => {
        mockFetchUserAttributes.mockResolvedValue({ email: "user@example.com" });

        emit({
            status: "success",
            state: { version: 1, intent: "sign-up", locale: "it", redirectPath: "/it/me" },
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({
                href: "/it/login?mode=user-details&redirect=%2Fit%2Fme",
                replace: true,
            });
        });
        expect(mockStorePendingEmail).toHaveBeenCalledWith("user@example.com");
    });

    it("skips user details when the mapped email is unavailable", async () => {
        mockFetchUserAttributes.mockRejectedValue(new Error("raw Cognito detail"));

        emit({ status: "success", state: { version: 1, intent: "sign-up", locale: "en" } });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({ href: "/en", replace: true });
        });
        expect(mockStorePendingEmail).not.toHaveBeenCalled();
        expect(mockToastError).not.toHaveBeenCalled();
    });

    it("returns to the localized login page with a generic error on failure", async () => {
        const consoleError = vi.spyOn(console, "error");

        emit({ status: "failure" });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({ href: "/de/login", replace: true });
        });
        expect(mockToastError).toHaveBeenCalledWith(
            "Die Anmeldung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut oder melden Sie sich mit Ihrer E-Mail-Adresse an.",
        );
        expect(consoleError).not.toHaveBeenCalled();
    });
});
