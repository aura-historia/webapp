import ReactGA from "react-ga4";
import { env } from "@/env.ts";

const TRACKING_TAG_STAGE = "G-25SPFBNNC2";
const TRACKING_TAG = "G-HL1MJKQBZR";

const FORBIDDEN_PARAMS = new Set(["token", "password", "email", "reset_key", "session_id"]);

const isRunningInProd = env.VITE_APP_URL === "https://aura-historia.com";

class GoogleAnalytics {
    private consent = false;

    /**
     * Initialises Google Analytics with the user's initial consent value.
     * Must be called once on the client side; subsequent calls are no-ops.
     * @param initialConsent True if the user has granted tracking consent.
     */
    init(initialConsent: boolean): void {
        if (import.meta.env.SSR) return;
        if (ReactGA.isInitialized) return;

        this.consent = initialConsent;
        const consentState = initialConsent ? "granted" : "denied";

        // According to Google Analytics 4 docs, the default consent command must run before initialization
        ReactGA.gtag("consent", "default", {
            ad_storage: consentState,
            analytics_storage: consentState,
            ad_user_data: consentState,
            ad_personalization: consentState,
        });

        ReactGA.initialize(isRunningInProd ? TRACKING_TAG : TRACKING_TAG_STAGE, {
            gtagOptions: { send_page_view: false },
        });
    }

    /**
     * Updates the consent state and synchronises it with Google Analytics.
     * @param granted True to grant tracking consent, false to deny.
     */
    setConsent(granted: boolean): void {
        if (import.meta.env.SSR) return;

        this.consent = granted;
        const consentState = granted ? "granted" : "denied";

        ReactGA.gtag("consent", "update", {
            ad_storage: consentState,
            analytics_storage: consentState,
            ad_user_data: consentState,
            ad_personalization: consentState,
        });
    }

    /**
     * Sends a page-view event. Silently skips when consent has not been granted.
     * Sensitive search parameters are stripped before sending.
     * @param path The current page path.
     * @param language The active UI language.
     * @param searchParams The current URL search parameters.
     */
    sendPageView(path: string, language: string, searchParams: Record<string, unknown>): void {
        if (import.meta.env.SSR) return;
        if (!this.consent) return;

        console.log("Sending page view...");

        const safeParams = Object.keys(searchParams).reduce(
            (acc, key) => {
                if (!FORBIDDEN_PARAMS.has(key.toLowerCase())) {
                    acc[key] = searchParams[key];
                }
                return acc;
            },
            {} as Record<string, unknown>,
        );

        ReactGA.send({
            hitType: "pageview",
            page: path,
            language: language,
            ...safeParams,
        });
    }
}

export const googleAnalytics = new GoogleAnalytics();
