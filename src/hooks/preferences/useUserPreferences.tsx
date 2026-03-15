import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { UserPreferences } from "@/data/internal/preferences/UserPreferences.ts";
import { googleAnalytics } from "@/lib/tracking/googleAnalytics.ts";

const PREFERENCES_STORAGE_KEY = "user-preferences";

const DEFAULT_PREFERENCES: UserPreferences = {};

type UserPreferencesContextValue = {
    preferences: UserPreferences;
    updatePreferences: (updates: Partial<UserPreferences>) => void;
};

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null);

function loadPreferences(): UserPreferences {
    if (import.meta.env.SSR) {
        // TODO: Properly sync this to server when we need to access these in SSR environment
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

export function UserPreferencesProvider({ children }: { readonly children: ReactNode }) {
    const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());

    const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
        setPreferences((prev) => {
            const next = { ...prev, ...updates };

            if (!import.meta.env.SSR) {
                try {
                    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next));
                } catch (e) {
                    console.error("Failed to save user preferences to localStorage", e);
                }

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
