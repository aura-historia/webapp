import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FederatedAuthRedirectResult } from "@/features/authentication/lib/federatedAuthRedirect.ts";

const mockNavigate = vi.hoisted(() => vi.fn());
const mockReadFederatedIdentity = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());
const mockStorePendingEmail = vi.hoisted(() => vi.fn());
const mockSubscription = vi.hoisted(() => ({
    subscriber: null as null | ((result: FederatedAuthRedirectResult) => void),
}));

vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock("@/features/authentication/lib/federatedIdentity.ts", () => ({
    readFederatedIdentity: mockReadFederatedIdentity,
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
        mockReadFederatedIdentity.mockResolvedValue({
            email: "user@example.com",
            isNewUser: false,
        });
    });

    it("sends a returning user to the original localized destination", async () => {
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
        expect(mockStorePendingEmail).not.toHaveBeenCalled();
    });

    it("routes a new user through the user-details step even from the sign-in button", async () => {
        mockReadFederatedIdentity.mockResolvedValue({
            email: "new@example.com",
            isNewUser: true,
        });

        emit({
            status: "success",
            state: { version: 1, intent: "sign-in", locale: "fr", redirectPath: "/fr/search" },
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({
                href: "/fr/login?mode=user-details&redirect=%2Ffr%2Fsearch",
                replace: true,
            });
        });
        expect(mockStorePendingEmail).toHaveBeenCalledWith("new@example.com");
    });

    it("routes a new user through the user-details step without a valid state", async () => {
        mockReadFederatedIdentity.mockResolvedValue({
            email: "new@example.com",
            isNewUser: true,
        });

        emit({ status: "success", state: null });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({
                href: "/de/login?mode=user-details",
                replace: true,
            });
        });
    });

    it("falls back to the localized home page for a returning user without a valid state", async () => {
        emit({ status: "success", state: null });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({ href: "/de", replace: true });
        });
    });

    it("routes sign-up intent through the user-details step", async () => {
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

    it("skips user details when the federated identity is unavailable", async () => {
        mockReadFederatedIdentity.mockResolvedValue(null);

        emit({ status: "success", state: { version: 1, intent: "sign-up", locale: "en" } });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({ href: "/en", replace: true });
        });
        expect(mockStorePendingEmail).not.toHaveBeenCalled();
        expect(mockToastError).not.toHaveBeenCalled();
    });

    it("skips user details for a new user without a mapped email", async () => {
        mockReadFederatedIdentity.mockResolvedValue({ isNewUser: true });

        emit({ status: "success", state: { version: 1, intent: "sign-up", locale: "en" } });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({ href: "/en", replace: true });
        });
        expect(mockStorePendingEmail).not.toHaveBeenCalled();
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
        expect(mockReadFederatedIdentity).not.toHaveBeenCalled();
    });
});
