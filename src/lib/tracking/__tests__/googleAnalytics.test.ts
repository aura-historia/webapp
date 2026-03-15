import { describe, it, expect, vi, beforeEach } from "vitest";
import ReactGA from "react-ga4";

vi.mock("react-ga4", () => ({
    default: {
        initialize: vi.fn(),
        gtag: vi.fn(),
        send: vi.fn(),
        isInitialized: false,
    },
}));

vi.mock("@/env.ts", () => ({
    env: {
        VITE_APP_URL: "https://test.com",
    },
}));

/**
 * Re-imports the module fresh so each test gets a clean singleton and
 * ReactGA.isInitialized is reset to false.
 */
async function freshGA() {
    vi.resetModules();
    (ReactGA as unknown as { isInitialized: boolean }).isInitialized = false;
    const mod = await import("@/lib/tracking/googleAnalytics.ts");
    return mod.googleAnalytics;
}

describe("GoogleAnalytics.init", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("sets default consent to denied and initialises ReactGA when consent is false", async () => {
        import.meta.env.SSR = false;
        const ga = await freshGA();

        ga.init(false);

        expect(ReactGA.gtag).toHaveBeenCalledWith("consent", "default", {
            ad_storage: "denied",
            analytics_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
        });
        expect(ReactGA.initialize).toHaveBeenCalledTimes(1);
    });

    it("sets default consent to granted and initialises ReactGA when consent is true", async () => {
        import.meta.env.SSR = false;
        const ga = await freshGA();

        ga.init(true);

        expect(ReactGA.gtag).toHaveBeenCalledWith("consent", "default", {
            ad_storage: "granted",
            analytics_storage: "granted",
            ad_user_data: "granted",
            ad_personalization: "granted",
        });
        expect(ReactGA.initialize).toHaveBeenCalledTimes(1);
    });

    it("is idempotent — a second init call does nothing", async () => {
        import.meta.env.SSR = false;
        const ga = await freshGA();

        ga.init(false);
        (ReactGA as unknown as { isInitialized: boolean }).isInitialized = true;
        ga.init(true);

        expect(ReactGA.initialize).toHaveBeenCalledTimes(1);
    });

    it("does nothing when SSR is true", async () => {
        import.meta.env.SSR = true;
        const ga = await freshGA();

        ga.init(true);

        expect(ReactGA.gtag).not.toHaveBeenCalled();
        expect(ReactGA.initialize).not.toHaveBeenCalled();
    });
});

describe("GoogleAnalytics.setConsent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("sends a consent update with granted when called with true", async () => {
        import.meta.env.SSR = false;
        const ga = await freshGA();

        ga.setConsent(true);

        expect(ReactGA.gtag).toHaveBeenCalledWith("consent", "update", {
            ad_storage: "granted",
            analytics_storage: "granted",
            ad_user_data: "granted",
            ad_personalization: "granted",
        });
    });

    it("sends a consent update with denied when called with false", async () => {
        import.meta.env.SSR = false;
        const ga = await freshGA();

        ga.setConsent(false);

        expect(ReactGA.gtag).toHaveBeenCalledWith("consent", "update", {
            ad_storage: "denied",
            analytics_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
        });
    });

    it("does nothing when SSR is true", async () => {
        import.meta.env.SSR = true;
        const ga = await freshGA();

        ga.setConsent(true);

        expect(ReactGA.gtag).not.toHaveBeenCalled();
    });
});

describe("GoogleAnalytics.sendPageView", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("sends a basic pageview with path and language", async () => {
        import.meta.env.SSR = false;
        const ga = await freshGA();

        ga.sendPageView("/", "en", {});

        expect(ReactGA.send).toHaveBeenCalledWith({
            hitType: "pageview",
            page: "/",
            language: "en",
        });
    });

    it("includes safe search parameters in the payload", async () => {
        import.meta.env.SSR = false;
        const ga = await freshGA();

        ga.sendPageView("/search", "de", { q: "table", sortField: "RELEVANCE" });

        expect(ReactGA.send).toHaveBeenCalledWith({
            hitType: "pageview",
            page: "/search",
            language: "de",
            q: "table",
            sortField: "RELEVANCE",
        });
    });

    it("strips forbidden parameters from the payload", async () => {
        import.meta.env.SSR = false;
        const ga = await freshGA();

        ga.sendPageView("/reset-password", "en", {
            token: "12345abc",
            password: "my_secret_password",
            email: "user@example.com",
        });

        expect(ReactGA.send).toHaveBeenCalledWith({
            hitType: "pageview",
            page: "/reset-password",
            language: "en",
        });
    });

    it("strips forbidden parameters case-insensitively while keeping safe ones", async () => {
        import.meta.env.SSR = false;
        const ga = await freshGA();

        ga.sendPageView("/checkout", "fr", {
            SESSION_ID: "xyz987",
            PassWord: "secret_password",
            Reset_Key: "key123",
            sortField: "RELEVANCE",
            sortOrder: "DESC",
        });

        expect(ReactGA.send).toHaveBeenCalledWith({
            hitType: "pageview",
            page: "/checkout",
            language: "fr",
            sortField: "RELEVANCE",
            sortOrder: "DESC",
        });
    });

    it("does nothing when SSR is true", async () => {
        import.meta.env.SSR = true;
        const ga = await freshGA();

        ga.sendPageView("/", "en", {});

        expect(ReactGA.send).not.toHaveBeenCalled();
    });
});
