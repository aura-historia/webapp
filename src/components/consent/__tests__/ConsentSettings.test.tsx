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
            preferences: { trackingConsent: undefined, currency: "EUR" },
            updatePreferences: mockUpdatePreferences,
        });
    });

    it("renders the title and description", () => {
        render(<ConsentSettings />);
        expect(screen.getByText("consentSettings.title")).toBeDefined();
        expect(screen.getByText("consentSettings.description")).toBeDefined();
    });

    it("renders the analytics label and description", () => {
        render(<ConsentSettings />);
        expect(screen.getByText("consentSettings.analyticsLabel")).toBeDefined();
        expect(screen.getByText("consentSettings.analyticsDescription")).toBeDefined();
    });

    it("switch is unchecked when trackingConsent is undefined", () => {
        render(<ConsentSettings />);
        const switchEl = screen.getByRole("switch");
        expect((switchEl as HTMLButtonElement).getAttribute("aria-checked")).toBe("false");
    });

    it("switch is checked when trackingConsent is true", () => {
        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: { trackingConsent: true, currency: "EUR" },
            updatePreferences: mockUpdatePreferences,
        });
        render(<ConsentSettings />);
        const switchEl = screen.getByRole("switch");
        expect((switchEl as HTMLButtonElement).getAttribute("aria-checked")).toBe("true");
    });

    it("switch is unchecked when trackingConsent is false", () => {
        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: { trackingConsent: false, currency: "EUR" },
            updatePreferences: mockUpdatePreferences,
        });
        render(<ConsentSettings />);
        const switchEl = screen.getByRole("switch");
        expect((switchEl as HTMLButtonElement).getAttribute("aria-checked")).toBe("false");
    });

    it("calls updatePreferences with true when switch is toggled on", () => {
        render(<ConsentSettings />);
        fireEvent.click(screen.getByRole("switch"));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({ trackingConsent: true });
    });

    it("calls updatePreferences with false when switch is toggled off", () => {
        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: { trackingConsent: true, currency: "EUR" },
            updatePreferences: mockUpdatePreferences,
        });
        render(<ConsentSettings />);
        fireEvent.click(screen.getByRole("switch"));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({ trackingConsent: false });
    });
});
