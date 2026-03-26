import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import type { UserPreferences } from "@/data/internal/preferences/UserPreferences.ts";

const PREFERENCES_COOKIE_NAME = "user-preferences";

/**
 * Reads user preferences from the cookie set by the client.
 * Returns a partial UserPreferences object, or an empty object if the cookie
 * is absent or cannot be parsed.
 */
export const getServerPreferences = createServerFn({ method: "GET" }).handler(
    async (): Promise<Partial<UserPreferences>> => {
        const raw = getCookie(PREFERENCES_COOKIE_NAME);
        if (!raw) {
            return {};
        }
        try {
            const decoded = decodeURIComponent(raw);
            const parsed = JSON.parse(decoded) as unknown;
            if (parsed === null || typeof parsed !== "object") {
                return {};
            }
            const prefs = parsed as Partial<UserPreferences> & {
                trackingConsent?: unknown;
            };
            if ("trackingConsent" in prefs) {
                prefs.trackingConsent = prefs.trackingConsent === true;
            }
            return prefs;
        } catch {
            return {};
        }
    },
);
