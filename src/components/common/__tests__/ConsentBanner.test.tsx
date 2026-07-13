import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConsentBanner } from "../ConsentBanner";
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

describe("ConsentBanner", () => {
    const mockUpdatePreferences = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: {
                trackingConsent: undefined,
                externalMapConsent: undefined,
                currency: "EUR",
            },
            updatePreferences: mockUpdatePreferences,
        });
    });

    it("renders when optional consent decisions are missing", () => {
        render(<ConsentBanner />);
        expect(screen.getByText("consent.title")).toBeDefined();
        expect(screen.getByText("consent.description")).toBeDefined();
        expect(screen.getByText("consent.analyticsLabel")).toBeDefined();
        expect(screen.getByText("consent.externalMapsLabel")).toBeDefined();
    });

    it("does not render when both optional consent decisions exist", () => {
        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: { trackingConsent: true, externalMapConsent: false, currency: "EUR" },
            updatePreferences: mockUpdatePreferences,
        });
        const { container } = render(<ConsentBanner />);
        expect(container.firstChild).toBeNull();
    });

    it("still renders when only analytics consent has been decided", () => {
        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: { trackingConsent: false, externalMapConsent: undefined, currency: "EUR" },
            updatePreferences: mockUpdatePreferences,
        });
        render(<ConsentBanner />);
        expect(screen.getByText("consent.title")).toBeDefined();
    });

    it("starts optional toggles unchecked", () => {
        render(<ConsentBanner />);
        expect(
            screen
                .getByRole("switch", { name: "consent.analyticsLabel" })
                .getAttribute("aria-checked"),
        ).toBe("false");
        expect(
            screen
                .getByRole("switch", { name: "consent.externalMapsLabel" })
                .getAttribute("aria-checked"),
        ).toBe("false");
    });

    it("saves the selected consent purposes", () => {
        render(<ConsentBanner />);
        fireEvent.click(screen.getByRole("switch", { name: "consent.externalMapsLabel" }));
        fireEvent.click(screen.getByText("consent.saveSelection"));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({
            trackingConsent: false,
            externalMapConsent: true,
        });
    });

    it("accepts all optional consent purposes", () => {
        render(<ConsentBanner />);
        fireEvent.click(screen.getByText("consent.acceptAll"));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({
            trackingConsent: true,
            externalMapConsent: true,
        });
    });

    it("rejects all optional consent purposes", () => {
        render(<ConsentBanner />);
        fireEvent.click(screen.getByText("consent.rejectAll"));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({
            trackingConsent: false,
            externalMapConsent: false,
        });
    });
});
