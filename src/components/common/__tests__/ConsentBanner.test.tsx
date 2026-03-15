import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConsentBanner } from "../ConsentBanner";
import { useUserPreferences } from "@/hooks/useUserPreferences";

vi.mock("@/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: vi.fn(),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("ConsentBanner", () => {
    const mockUpdatePreferences = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: { trackingConsent: undefined },
            updatePreferences: mockUpdatePreferences,
        });
    });

    it("renders when trackingConsent is undefined", () => {
        render(<ConsentBanner />);
        expect(screen.getByText("consent.title")).toBeDefined();
        expect(screen.getByText("consent.description")).toBeDefined();
    });

    it("does not render when trackingConsent is a boolean (true or false)", () => {
        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: { trackingConsent: true },
            updatePreferences: mockUpdatePreferences,
        });
        const { container } = render(<ConsentBanner />);
        expect(container.firstChild).toBeNull();

        vi.mocked(useUserPreferences).mockReturnValue({
            preferences: { trackingConsent: false },
            updatePreferences: mockUpdatePreferences,
        });
        const { container: container2 } = render(<ConsentBanner />);
        expect(container2.firstChild).toBeNull();
    });

    it("calls updatePreferences with true when Accept is clicked", () => {
        render(<ConsentBanner />);
        fireEvent.click(screen.getByText("consent.accept"));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({ trackingConsent: true });
    });

    it("calls updatePreferences with false when Reject is clicked", () => {
        render(<ConsentBanner />);
        fireEvent.click(screen.getByText("consent.reject"));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({ trackingConsent: false });
    });
});
