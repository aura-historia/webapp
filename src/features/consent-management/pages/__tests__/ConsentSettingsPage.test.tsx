import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConsentSettingsPage } from "../ConsentSettingsPage.tsx";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";

vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: vi.fn(),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
    Trans: ({ i18nKey }: { i18nKey: string }) => <>{i18nKey}</>,
}));

vi.mock("sonner", () => ({
    toast: { success: vi.fn() },
}));

describe("ConsentSettingsPage", () => {
    const mockUpdatePreferences = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: {
                trackingConsent: undefined,
                externalMapConsent: undefined,
                currency: "EUR",
                unitSystem: "METRIC",
            },
            updatePreferences: mockUpdatePreferences,
        });
    });

    it("renders the title and description", () => {
        render(<ConsentSettingsPage />);
        expect(screen.getByText("consentSettings.title")).toBeDefined();
        expect(screen.getByText("consentSettings.description")).toBeDefined();
    });

    it("renders the analytics and external maps labels and descriptions", () => {
        render(<ConsentSettingsPage />);
        expect(screen.getByText("consentSettings.analyticsLabel")).toBeDefined();
        expect(screen.getByText("consentSettings.analyticsDescription")).toBeDefined();
        expect(screen.getByText("consentSettings.externalMapsLabel")).toBeDefined();
        expect(screen.getByText("consentSettings.externalMapsDescription")).toBeDefined();
    });

    it("analytics switch is unchecked when trackingConsent is undefined", () => {
        render(<ConsentSettingsPage />);
        const switchEl = screen.getByRole("switch", {
            name: "consentSettings.analyticsLabel",
        });
        expect((switchEl as HTMLButtonElement).getAttribute("aria-checked")).toBe("false");
    });

    it("analytics switch is checked when trackingConsent is true", () => {
        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: {
                trackingConsent: true,
                externalMapConsent: undefined,
                currency: "EUR",
                unitSystem: "METRIC",
            },
            updatePreferences: mockUpdatePreferences,
        });
        render(<ConsentSettingsPage />);
        const switchEl = screen.getByRole("switch", {
            name: "consentSettings.analyticsLabel",
        });
        expect((switchEl as HTMLButtonElement).getAttribute("aria-checked")).toBe("true");
    });

    it("analytics switch is unchecked when trackingConsent is false", () => {
        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: {
                trackingConsent: false,
                externalMapConsent: undefined,
                currency: "EUR",
                unitSystem: "METRIC",
            },
            updatePreferences: mockUpdatePreferences,
        });
        render(<ConsentSettingsPage />);
        const switchEl = screen.getByRole("switch", {
            name: "consentSettings.analyticsLabel",
        });
        expect((switchEl as HTMLButtonElement).getAttribute("aria-checked")).toBe("false");
    });

    it("calls updatePreferences with true when analytics switch is toggled on", () => {
        render(<ConsentSettingsPage />);
        fireEvent.click(screen.getByRole("switch", { name: "consentSettings.analyticsLabel" }));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({ trackingConsent: true });
    });

    it("calls updatePreferences with false when analytics switch is toggled off", () => {
        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: {
                trackingConsent: true,
                externalMapConsent: undefined,
                currency: "EUR",
                unitSystem: "METRIC",
            },
            updatePreferences: mockUpdatePreferences,
        });
        render(<ConsentSettingsPage />);
        fireEvent.click(screen.getByRole("switch", { name: "consentSettings.analyticsLabel" }));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({ trackingConsent: false });
    });

    it("external maps switch reflects externalMapConsent", () => {
        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: {
                trackingConsent: undefined,
                externalMapConsent: true,
                currency: "EUR",
                unitSystem: "METRIC",
            },
            updatePreferences: mockUpdatePreferences,
        });
        render(<ConsentSettingsPage />);
        const switchEl = screen.getByRole("switch", {
            name: "consentSettings.externalMapsLabel",
        });
        expect((switchEl as HTMLButtonElement).getAttribute("aria-checked")).toBe("true");
    });

    it("calls updatePreferences when external maps switch is toggled", () => {
        render(<ConsentSettingsPage />);
        fireEvent.click(screen.getByRole("switch", { name: "consentSettings.externalMapsLabel" }));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({ externalMapConsent: true });
    });
});
