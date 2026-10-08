import { describe, expect, it, vi } from "vitest";
import { createFederatedAuthRedirectTracker } from "@/features/authentication/lib/federatedAuthRedirect.ts";

const customState = JSON.stringify({
    version: 1,
    intent: "sign-up",
    locale: "fr",
    redirectPath: "/de/me/watchlist",
});

const parsedState = {
    version: 1,
    intent: "sign-up",
    locale: "fr",
    redirectPath: "/de/me/watchlist",
};

describe("createFederatedAuthRedirectTracker", () => {
    it.each([
        ["customOAuthState first", ["customOAuthState", "signInWithRedirect"]],
        ["signInWithRedirect first", ["signInWithRedirect", "customOAuthState"]],
    ])("settles exactly once when %s", (_, events) => {
        const tracker = createFederatedAuthRedirectTracker();
        const subscriber = vi.fn();
        tracker.subscribe(subscriber);

        for (const event of events) {
            tracker.handleAuthEvent(event, event === "customOAuthState" ? customState : undefined);
        }
        tracker.handleAuthEvent("signedIn");
        tracker.handleAuthEvent("signInWithRedirect");

        expect(subscriber).toHaveBeenCalledTimes(1);
        expect(subscriber).toHaveBeenCalledWith({ status: "success", state: parsedState });
    });

    it("waits for both events before settling", () => {
        const tracker = createFederatedAuthRedirectTracker();
        const subscriber = vi.fn();
        tracker.subscribe(subscriber);

        tracker.handleAuthEvent("signInWithRedirect");

        expect(subscriber).not.toHaveBeenCalled();
    });

    it("settles with a null state when the returned state is invalid", () => {
        const tracker = createFederatedAuthRedirectTracker();
        const subscriber = vi.fn();
        tracker.subscribe(subscriber);

        tracker.handleAuthEvent("customOAuthState", "https://example.com");
        tracker.handleAuthEvent("signInWithRedirect");

        expect(subscriber).toHaveBeenCalledWith({ status: "success", state: null });
    });

    it("holds the result until a subscriber is attached", () => {
        const tracker = createFederatedAuthRedirectTracker();
        tracker.handleAuthEvent("customOAuthState", customState);
        tracker.handleAuthEvent("signInWithRedirect");

        const subscriber = vi.fn();
        tracker.subscribe(subscriber);
        tracker.subscribe(subscriber);

        expect(subscriber).toHaveBeenCalledTimes(1);
        expect(subscriber).toHaveBeenCalledWith({ status: "success", state: parsedState });
    });

    it("reports redirect failures and discards partial state", () => {
        const tracker = createFederatedAuthRedirectTracker();
        const subscriber = vi.fn();
        tracker.subscribe(subscriber);

        tracker.handleAuthEvent("customOAuthState", customState);
        tracker.handleAuthEvent("signInWithRedirect_failure", { error: new Error("raw") });
        tracker.handleAuthEvent("signInWithRedirect");

        expect(subscriber).toHaveBeenCalledTimes(1);
        expect(subscriber).toHaveBeenCalledWith({ status: "failure" });
    });

    it("stops delivering after unsubscribe", () => {
        const tracker = createFederatedAuthRedirectTracker();
        const subscriber = vi.fn();
        const unsubscribe = tracker.subscribe(subscriber);

        unsubscribe();
        tracker.handleAuthEvent("signInWithRedirect_failure");

        expect(subscriber).not.toHaveBeenCalled();
    });
});
