import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { UserPreferencesProvider, useUserPreferences } from "../useUserPreferences.tsx";
import { googleAnalytics } from "@/lib/tracking/googleAnalytics.ts";
import type React from "react";

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <UserPreferencesProvider locale="de-DE">{children}</UserPreferencesProvider>
);

vi.mock("@/lib/tracking/googleAnalytics", () => ({
    googleAnalytics: {
        setConsent: vi.fn(),
    },
}));

describe("useUserPreferences", () => {
    let originalEnvSSR: boolean;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // biome-ignore lint/suspicious/noDocumentCookie: Test cleanup uses direct cookie API
        document.cookie = "user-preferences=; max-age=0";
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
            wrapper,
        });

        expect(googleAnalytics.setConsent).not.toHaveBeenCalled();
    });

    it("should return persisted preferences from localStorage", () => {
        localStorage.setItem("user-preferences", JSON.stringify({ trackingConsent: true }));

        renderHook(() => useUserPreferences(), {
            wrapper,
        });

        expect(googleAnalytics.setConsent).not.toHaveBeenCalled();
    });

    it("should update preferences, persist to localStorage and sync GA on change", async () => {
        const { result } = renderHook(() => useUserPreferences(), {
            wrapper,
        });

        expect(result.current.preferences.trackingConsent).toBeUndefined();
        expect(googleAnalytics.setConsent).not.toHaveBeenCalled();

        await act(async () => {
            result.current.updatePreferences({ trackingConsent: true });
        });

        expect(result.current.preferences.trackingConsent).toBe(true);
        const storedRaw = localStorage.getItem("user-preferences");
        expect(storedRaw).not.toBeNull();
        const stored = JSON.parse(storedRaw ?? "{}");
        expect(stored.trackingConsent).toBe(true);
        expect(stored.currency).toBeDefined();
        expect(googleAnalytics.setConsent).toHaveBeenCalledWith(true);
    });

    it("should write a cookie when preferences are updated", async () => {
        const { result } = renderHook(() => useUserPreferences(), {
            wrapper,
        });

        await act(async () => {
            result.current.updatePreferences({ trackingConsent: true });
        });

        expect(document.cookie).toContain("user-preferences");
    });

    it("should initialise with initialPreferences overriding defaults", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <UserPreferencesProvider initialPreferences={{ trackingConsent: true }} locale="de-DE">
                {children}
            </UserPreferencesProvider>
        );

        const { result } = renderHook(() => useUserPreferences(), { wrapper });

        expect(result.current.preferences.trackingConsent).toBe(true);
    });

    it("should merge initialPreferences on top of localStorage values", () => {
        localStorage.setItem("user-preferences", JSON.stringify({ trackingConsent: false }));

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <UserPreferencesProvider initialPreferences={{ trackingConsent: true }} locale="de-DE">
                {children}
            </UserPreferencesProvider>
        );

        const { result } = renderHook(() => useUserPreferences(), { wrapper });

        // initialPreferences (from server/cookie) wins over localStorage
        expect(result.current.preferences.trackingConsent).toBe(true);
    });

    it("should return default preferences and do nothing else if SSR is true", () => {
        import.meta.env.SSR = true;

        // Let's set something in local-storage to insure it is not read on SSR
        localStorage.setItem("user-preferences", JSON.stringify({ trackingConsent: true }));

        const { result } = renderHook(() => useUserPreferences(), {
            wrapper,
        });

        expect(result.current.preferences.trackingConsent).toBeUndefined();
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
