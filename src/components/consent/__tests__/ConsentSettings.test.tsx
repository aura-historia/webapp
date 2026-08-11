import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConsentSettings } from "../ConsentSettings";
import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";

vi.mock("@/hooks/preferences/useUserPreferences.tsx", () => ({
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

describe("ConsentSettings", () => {
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
        render(<ConsentSettings />);
        expect(screen.getByText("consentSettings.title")).toBeDefined();
        expect(screen.getByText("consentSettings.description")).toBeDefined();
    });

    it("renders the analytics and external maps labels and descriptions", () => {
        render(<ConsentSettings />);
        expect(screen.getByText("consentSettings.analyticsLabel")).toBeDefined();
        expect(screen.getByText("consentSettings.analyticsDescription")).toBeDefined();
        expect(screen.getByText("consentSettings.externalMapsLabel")).toBeDefined();
        expect(screen.getByText("consentSettings.externalMapsDescription")).toBeDefined();
    });

    it("analytics switch is unchecked when trackingConsent is undefined", () => {
        render(<ConsentSettings />);
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
        render(<ConsentSettings />);
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
        render(<ConsentSettings />);
        const switchEl = screen.getByRole("switch", {
            name: "consentSettings.analyticsLabel",
        });
        expect((switchEl as HTMLButtonElement).getAttribute("aria-checked")).toBe("false");
    });

    it("calls updatePreferences with true when analytics switch is toggled on", () => {
        render(<ConsentSettings />);
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
        render(<ConsentSettings />);
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
        render(<ConsentSettings />);
        const switchEl = screen.getByRole("switch", {
            name: "consentSettings.externalMapsLabel",
        });
        expect((switchEl as HTMLButtonElement).getAttribute("aria-checked")).toBe("true");
    });

    it("calls updatePreferences when external maps switch is toggled", () => {
        render(<ConsentSettings />);
        fireEvent.click(screen.getByRole("switch", { name: "consentSettings.externalMapsLabel" }));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({ externalMapConsent: true });
    });
});
