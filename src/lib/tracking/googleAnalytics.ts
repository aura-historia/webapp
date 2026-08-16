import ReactGA from "react-ga4";
import { env } from "@/env.ts";

const TRACKING_TAG_STAGE = "G-25SPFBNNC2";
const TRACKING_TAG = "G-HL1MJKQBZR";

const FORBIDDEN_PARAMS = new Set(["token", "password", "email", "reset_key", "session_id"]);

const isRunningInProd = env.VITE_APP_URL === "https://aura-historia.com";

class GoogleAnalytics {
    private hasInitialized = false;
    private pendingConsent: boolean | undefined;

    /**
     * Initialises Google Analytics with the user's initial consent value.
     * GA is always loaded — consent mode handles what data is sent internally:
     * "denied" → cookieless anonymised pings; "granted" → full cookie-based tracking.
     * Must be called once on the client side; subsequent calls are no-ops.
     * @param initialConsent True if the user has granted tracking consent.
     */
    init(initialConsent?: boolean): void {
        if (import.meta.env.SSR) return;
        if (this.hasInitialized || ReactGA.isInitialized) {
            this.flushPendingConsent();
            return;
        }

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

        this.hasInitialized = true;
        this.flushPendingConsent();
    }

    /**
     * Updates the consent state and synchronises it with Google Analytics.
     * @param granted True to grant tracking consent, false to deny.
     */
    setConsent(granted: boolean): void {
        if (import.meta.env.SSR) return;

        if (!this.hasInitialized && !ReactGA.isInitialized) {
            this.pendingConsent = granted;
            return;
        }

        this.sendConsentUpdate(granted);
    }

    private flushPendingConsent(): void {
        if (this.pendingConsent === undefined) return;

        this.sendConsentUpdate(this.pendingConsent);
        this.pendingConsent = undefined;
    }

    private sendConsentUpdate(granted: boolean): void {
        const consentState = granted ? "granted" : "denied";

        ReactGA.gtag("consent", "update", {
            ad_storage: consentState,
            analytics_storage: consentState,
            ad_user_data: consentState,
            ad_personalization: consentState,
        });
    }

    /**
     * Sends a page-view event.
     * No consent guard is applied here — page path and language are not personal
     * data, and GA4 Consent Mode handles compliance internally based on the
     * consent state set via init() / setConsent().
     * Sensitive search parameters are stripped before sending.
     * @param path The current page path.
     * @param language The active UI language.
     * @param searchParams The current URL search parameters.
     */
    sendPageView(path: string, language: string, searchParams: Record<string, unknown>): void {
        if (import.meta.env.SSR) return;

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
