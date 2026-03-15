import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ReactGA from "react-ga4";

// 1. Mock the react-ga4 module
vi.mock("react-ga4", () => ({
    default: {
        initialize: vi.fn(),
        gtag: vi.fn(),
    },
}));

vi.mock("@/env.ts", () => ({
    env: {
        VITE_APP_URL: "https://test.com",
    },
}));

describe("Google Analytics Consent", () => {
    let originalEnv: any;

    beforeEach(() => {
        vi.clearAllMocks();
        // Save global state
        originalEnv = import.meta.env.SSR;

        // Reset the module loaded state by clearing it from the required cache
        vi.resetModules();
    });

    afterEach(() => {
        // Restore global state
        import.meta.env.SSR = originalEnv;
    });

    it("should initialize default consent and call ReactGA.initialize when not SSR", async () => {
        import.meta.env.SSR = false;

        // Dynamic import to allow re-evaluating the top level execution
        const { initGoogleAnalytics } = await import("@/lib/tracking/googleAnalytics.ts");
        initGoogleAnalytics(false);

        expect(ReactGA.gtag).toHaveBeenCalledWith("consent", "default", {
            ad_storage: "denied",
            analytics_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
        });

        expect(ReactGA.initialize).toHaveBeenCalledTimes(1);
    });

    it("should do nothing on initialization when SSR", async () => {
        import.meta.env.SSR = true;

        const { initGoogleAnalytics } = await import("@/lib/tracking/googleAnalytics.ts");
        initGoogleAnalytics(false);

        expect(ReactGA.gtag).not.toHaveBeenCalled();
        expect(ReactGA.initialize).not.toHaveBeenCalled();
    });

    it("should update consent mode via ReactGA.gtag", async () => {
        import.meta.env.SSR = false;
        const { setGoogleAnalyticsConsent } = await import("@/lib/tracking/googleAnalytics.ts");

        setGoogleAnalyticsConsent(true);

        expect(ReactGA.gtag).toHaveBeenCalledWith("consent", "update", {
            ad_storage: "granted",
            analytics_storage: "granted",
            ad_user_data: "granted",
            ad_personalization: "granted",
        });
    });

    it("should do nothing in setGoogleAnalyticsConsent when SSR", async () => {
        import.meta.env.SSR = true;
        const { setGoogleAnalyticsConsent } = await import("@/lib/tracking/googleAnalytics.ts");

        setGoogleAnalyticsConsent(true);

        expect(ReactGA.gtag).not.toHaveBeenCalled();
    });
});
