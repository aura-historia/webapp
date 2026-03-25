import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { UserPreferences } from "@/data/internal/preferences/UserPreferences.ts";
import { googleAnalytics } from "@/lib/tracking/googleAnalytics.ts";

const PREFERENCES_STORAGE_KEY = "user-preferences";
const PREFERENCES_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

const DEFAULT_PREFERENCES: UserPreferences = {};

type UserPreferencesContextValue = {
    preferences: UserPreferences;
    updatePreferences: (updates: Partial<UserPreferences>) => void;
};

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null);

function loadPreferences(): UserPreferences {
    if (import.meta.env.SSR) {
        return DEFAULT_PREFERENCES;
    }

    try {
        const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error("Failed to load user preferences from localStorage", e);
    }
    return DEFAULT_PREFERENCES;
}

async function syncPreferencesCookie(preferences: UserPreferences) {
    const value = JSON.stringify(preferences);
    if ("cookieStore" in globalThis) {
        await globalThis.cookieStore.set({
            name: PREFERENCES_STORAGE_KEY,
            value,
            path: "/",
            expires: Date.now() + PREFERENCES_COOKIE_MAX_AGE * 1000,
        });
    } else {
        // biome-ignore lint/suspicious/noDocumentCookie: Not all browsers support cookieStore API yet
        document.cookie = `${PREFERENCES_STORAGE_KEY}=${encodeURIComponent(value)}; path=/; max-age=${PREFERENCES_COOKIE_MAX_AGE}; SameSite=Lax`;
    }
}

export function UserPreferencesProvider({
    children,
    initialPreferences,
}: {
    readonly children: ReactNode;
    readonly initialPreferences?: Partial<UserPreferences>;
}) {
    const [preferences, setPreferences] = useState<UserPreferences>(() => ({
        ...loadPreferences(),
        ...initialPreferences,
    }));

    const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
        setPreferences((prev) => {
            const next = { ...prev, ...updates };

            if (!import.meta.env.SSR) {
                try {
                    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next));
                } catch (e) {
                    console.error("Failed to save user preferences to localStorage", e);
                }

                syncPreferencesCookie(next).catch((e) => {
                    console.error("Failed to sync user preferences cookie", e);
                });

                if (prev.trackingConsent !== next.trackingConsent) {
                    googleAnalytics.setConsent(next.trackingConsent ?? false);
                }
            }

            return next;
        });
    }, []);

    const contextValue = useMemo(
        () => ({ preferences, updatePreferences }),
        [preferences, updatePreferences],
    );

    return (
        <UserPreferencesContext.Provider value={contextValue}>
            {children}
        </UserPreferencesContext.Provider>
    );
}

export function useUserPreferences(): UserPreferencesContextValue {
    const context = useContext(UserPreferencesContext);
    if (!context) {
        throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
    }
    return context;
}
