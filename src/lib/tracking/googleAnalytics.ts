import ReactGA from "react-ga4";
import { env } from "@/env.ts";

const TRACKING_TAG_STAGE = "G-25SPFBNNC2";
const TRACKING_TAG = "G-HL1MJKQBZR";

const isRunningInProd = env.VITE_APP_URL === "https://aura-historia.com";

export function initGoogleAnalytics(initialConsent: boolean) {
    if (import.meta.env.SSR) return;
    if (ReactGA.isInitialized) return;

    const consentState = initialConsent ? "granted" : "denied";

    // According to Google Analytics 4 docs, the default consent command must run before initialization
    ReactGA.gtag("consent", "default", {
        ad_storage: consentState,
        analytics_storage: consentState,
        ad_user_data: consentState,
        ad_personalization: consentState,
    });

    // Initialize GA
    ReactGA.initialize(isRunningInProd ? TRACKING_TAG : TRACKING_TAG_STAGE, {
        gtagOptions: { send_page_view: false },
    });
}

/**
 * Updates the consent status for Google Analytics.
 * @param granted True to grant tracking consent, false to deny.
 */
export function setGoogleAnalyticsConsent(granted: boolean) {
    if (import.meta.env.SSR) return;

    const consentState = granted ? "granted" : "denied";

    ReactGA.gtag("consent", "update", {
        ad_storage: consentState,
        analytics_storage: consentState,
        ad_user_data: consentState,
        ad_personalization: consentState,
    });
}
