import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { UserPreferences } from "@/data/internal/preferences/UserPreferences.ts";
import { inferCurrencyFromLocale } from "@/data/internal/common/Currency.ts";
import { googleAnalytics } from "@/lib/tracking/googleAnalytics.ts";

const PREFERENCES_STORAGE_KEY = "user-preferences";
const PREFERENCES_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

const DEFAULT_PREFERENCES: UserPreferences = {
    currency: "EUR",
};

type UserPreferencesContextValue = {
    preferences: UserPreferences;
    updatePreferences: (updates: Partial<UserPreferences>) => void;
};

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null);

function loadPreferences(locale: string): UserPreferences {
    if (import.meta.env.SSR) {
        return DEFAULT_PREFERENCES;
    }

    try {
        const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (stored) {
            return {
                ...DEFAULT_PREFERENCES,
                currency: inferCurrencyFromLocale(locale),
                ...JSON.parse(stored),
            };
        }
    } catch (e) {
        console.error("Failed to load user preferences from localStorage", e);
    }
    return { ...DEFAULT_PREFERENCES, currency: inferCurrencyFromLocale(locale) };
}

async function syncPreferencesCookie(preferences: UserPreferences) {
    const rawValue = JSON.stringify(preferences);
    const encodedValue = encodeURIComponent(rawValue);
    if ("cookieStore" in globalThis) {
        await globalThis.cookieStore.set({
            name: PREFERENCES_STORAGE_KEY,
            value: encodedValue,
            path: "/",
            expires: Date.now() + PREFERENCES_COOKIE_MAX_AGE * 1000,
        });
    } else {
        // biome-ignore lint/suspicious/noDocumentCookie: Not all browsers support cookieStore API yet
        document.cookie = `${PREFERENCES_STORAGE_KEY}=${encodedValue}; path=/; max-age=${PREFERENCES_COOKIE_MAX_AGE}; SameSite=Lax`;
    }
}

export function UserPreferencesProvider({
    children,
    initialPreferences,
    locale,
}: {
    readonly children: ReactNode;
    readonly initialPreferences?: Partial<UserPreferences>;
    readonly locale: string;
}) {
    const [preferences, setPreferences] = useState<UserPreferences>(() => ({
        ...loadPreferences(locale),
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
