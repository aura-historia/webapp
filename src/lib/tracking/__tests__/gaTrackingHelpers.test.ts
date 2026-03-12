import { describe, it, expect, vi, beforeEach } from "vitest";
import ReactGA from "react-ga4";
import { sendPageViewEvent } from "@/lib/tracking/gaTrackingHelpers.ts";

// 1. Mock the react-ga4 module so we don't send real analytics during tests
vi.mock("react-ga4", () => ({
    default: {
        send: vi.fn(),
    },
}));

describe("sendPageViewEvent", () => {
    // Clear the mock history before each test to ensure they don't interfere with each other
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("sends a basic pageview with just the path and language", () => {
        sendPageViewEvent("/", "en", {});

        expect(ReactGA.send).toHaveBeenCalledWith({
            hitType: "pageview",
            page: "/",
            language: "en",
        });
        expect(ReactGA.send).toHaveBeenCalledTimes(1);
    });

    it("includes safe search parameters in the GA4 payload", () => {
        const safeParams = { q: "table", sortField: "RELEVANCE" };
        sendPageViewEvent("/search", "de", safeParams);

        expect(ReactGA.send).toHaveBeenCalledWith({
            hitType: "pageview",
            page: "/search",
            language: "de",
            q: "table",
            sortField: "RELEVANCE",
        });
    });

    it("completely strips forbidden parameters from the payload", () => {
        const dangerousParams = {
            token: "12345abc",
            password: "my_secret_password",
            email: "user@example.com",
        };
        sendPageViewEvent("/reset-password", "en", dangerousParams);

        expect(ReactGA.send).toHaveBeenCalledWith({
            hitType: "pageview",
            page: "/reset-password",
            language: "en",
        });
    });

    it("strips forbidden parameters case-insensitively while keeping safe ones", () => {
        const mixedParams = {
            SESSION_ID: "xyz987",
            PassWord: "secret_password",
            Reset_Key: "key123",
            sortField: "RELEVANCE", // Safe
            sortOrder: "DESC", // Safe
        };

        sendPageViewEvent("/checkout", "fr", mixedParams);

        expect(ReactGA.send).toHaveBeenCalledWith({
            hitType: "pageview",
            page: "/checkout",
            language: "fr",
            sortField: "RELEVANCE",
            sortOrder: "DESC",
        });
    });
});
