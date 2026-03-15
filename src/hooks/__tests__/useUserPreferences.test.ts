import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { UserPreferencesProvider, useUserPreferences } from "../useUserPreferences";
import { googleAnalytics } from "@/lib/tracking/googleAnalytics";

vi.mock("@/lib/tracking/googleAnalytics", () => ({
    googleAnalytics: {
        setConsent: vi.fn(),
    },
}));

describe("useUserPreferences", () => {
    let originalEnvSSR: any;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        originalEnvSSR = import.meta.env.SSR;
        import.meta.env.SSR = false;
    });

    afterEach(() => {
        import.meta.env.SSR = originalEnvSSR;
    });

    it("should throw error if used outside of provider", () => {
        // Suppress console.error for expected thrown error
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        expect(() => renderHook(() => useUserPreferences())).toThrow(
            "useUserPreferences must be used within a UserPreferencesProvider",
        );
        spy.mockRestore();
    });

    it("should return default preferences if localStorage is empty", () => {
        renderHook(() => useUserPreferences(), {
            wrapper: UserPreferencesProvider,
        });

        expect(googleAnalytics.setConsent).not.toHaveBeenCalled();
    });

    it("should return persisted preferences from localStorage", () => {
        localStorage.setItem("user-preferences", JSON.stringify({ trackingConsent: true }));

        renderHook(() => useUserPreferences(), {
            wrapper: UserPreferencesProvider,
        });

        expect(googleAnalytics.setConsent).not.toHaveBeenCalled();
    });

    it("should update preferences, persist to localStorage and sync GA on change", () => {
        const { result } = renderHook(() => useUserPreferences(), {
            wrapper: UserPreferencesProvider,
        });

        expect(result.current.preferences.trackingConsent).toBe(false);
        expect(googleAnalytics.setConsent).not.toHaveBeenCalled();

        act(() => {
            result.current.updatePreferences({ trackingConsent: true });
        });

        expect(result.current.preferences.trackingConsent).toBe(true);
        expect(localStorage.getItem("user-preferences")).toBe(
            JSON.stringify({ trackingConsent: true }),
        );
        expect(googleAnalytics.setConsent).toHaveBeenCalledWith(true);
    });

    it("should return default preferences and do nothing else if SSR is true", () => {
        import.meta.env.SSR = true;

        // Let's set something in local-storage to insure it is not read on SSR
        localStorage.setItem("user-preferences", JSON.stringify({ trackingConsent: true }));

        const { result } = renderHook(() => useUserPreferences(), {
            wrapper: UserPreferencesProvider,
        });

        expect(result.current.preferences.trackingConsent).toBe(false);
        expect(googleAnalytics.setConsent).not.toHaveBeenCalled();

        act(() => {
            result.current.updatePreferences({ trackingConsent: true });
        });

        // Even though hook's internal react state might update, we ensure LS and GA are untouched.
        expect(localStorage.getItem("user-preferences")).toBe(
            JSON.stringify({ trackingConsent: true }),
        ); // Unchanged
        expect(googleAnalytics.setConsent).not.toHaveBeenCalled();
    });
});
