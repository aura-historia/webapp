import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConsentBanner } from "../ConsentBanner";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import type { UserPreferences } from "@/features/preferences/types/UserPreferences.ts";

vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: vi.fn(),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
    Trans: ({ i18nKey }: { i18nKey: string }) => <>{i18nKey}</>,
}));

vi.mock("@tanstack/react-router", () => ({
    Link: ({ children }: { children?: React.ReactNode }) => <a href="/">{children}</a>,
}));

function mockPreferences(consent: Pick<UserPreferences, "trackingConsent" | "externalMapConsent">) {
    vi.mocked(useUserPreferences).mockReturnValue({
        preferences: { ...consent, currency: "EUR", unitSystem: "METRIC" },
        updatePreferences: mockUpdatePreferences,
    });
}

const mockUpdatePreferences = vi.fn();

describe("ConsentBanner", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPreferences({ trackingConsent: undefined, externalMapConsent: undefined });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders a labelled region when optional consent decisions are missing", () => {
        render(<ConsentBanner />);
        expect(screen.getByRole("region", { name: "consent.heading" })).toBeDefined();
        expect(screen.getByText("consent.eyebrow")).toBeDefined();
        expect(screen.getByText("consent.description")).toBeDefined();
        expect(screen.getByText("consent.analyticsLabel")).toBeDefined();
        expect(screen.getByText("consent.externalMapsLabel")).toBeDefined();
    });

    it("does not render when both optional consent decisions exist", () => {
        mockPreferences({ trackingConsent: true, externalMapConsent: false });
        const { container } = render(<ConsentBanner />);
        expect(container.firstChild).toBeNull();
    });

    it("still renders when only analytics consent has been decided", () => {
        mockPreferences({ trackingConsent: false, externalMapConsent: undefined });
        render(<ConsentBanner />);
        expect(screen.getByRole("region", { name: "consent.heading" })).toBeDefined();
    });

    it("starts each switch from the stored choice and unchecked without one", () => {
        mockPreferences({ trackingConsent: true, externalMapConsent: undefined });
        render(<ConsentBanner />);
        expect(
            screen
                .getByRole("switch", { name: "consent.analyticsLabel" })
                .getAttribute("aria-checked"),
        ).toBe("true");
        expect(
            screen
                .getByRole("switch", { name: "consent.externalMapsLabel" })
                .getAttribute("aria-checked"),
        ).toBe("false");
    });

    it("saves the selected consent purposes", () => {
        render(<ConsentBanner />);
        fireEvent.click(screen.getByRole("switch", { name: "consent.externalMapsLabel" }));
        fireEvent.click(screen.getByRole("button", { name: "consent.saveSelection" }));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({
            trackingConsent: false,
            externalMapConsent: true,
        });
    });

    it("accepts all optional consent purposes", () => {
        render(<ConsentBanner />);
        fireEvent.click(screen.getByRole("button", { name: "consent.acceptAll" }));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({
            trackingConsent: true,
            externalMapConsent: true,
        });
    });

    it("rejects all optional consent purposes", () => {
        render(<ConsentBanner />);
        fireEvent.click(screen.getByRole("button", { name: "consent.rejectAll" }));
        expect(mockUpdatePreferences).toHaveBeenCalledWith({
            trackingConsent: false,
            externalMapConsent: false,
        });
    });

    it("gives reject all and accept all the same styling", () => {
        render(<ConsentBanner />);
        expect(screen.getByRole("button", { name: "consent.rejectAll" }).className).toBe(
            screen.getByRole("button", { name: "consent.acceptAll" }).className,
        );
    });

    it("keeps the purposes and save selection folded on small screens until opened", () => {
        render(<ConsentBanner />);
        const disclosure = screen.getByRole("button", { name: "consent.choosePurposes" });
        const purposes = document.getElementById(
            disclosure.getAttribute("aria-controls") ?? "",
        ) as HTMLElement;
        const save = screen.getByRole("button", { name: "consent.saveSelection" });

        expect(disclosure.getAttribute("aria-expanded")).toBe("false");
        expect(purposes.className).toContain("hidden md:flex");
        expect(save.className).toMatch(/(^|\s)hidden(\s|$)/);

        fireEvent.click(disclosure);

        const open = screen.getByRole("button", { name: "consent.hidePurposes" });
        expect(open.getAttribute("aria-expanded")).toBe("true");
        expect(purposes.className).not.toContain("hidden");
        expect(save.className).not.toMatch(/(^|\s)hidden(\s|$)/);
    });

    it("links to the cookie settings", () => {
        render(<ConsentBanner />);
        expect(screen.getAllByText("consent.changeLater").length).toBeGreaterThan(0);
    });

    it("fades out after a decision and then unmounts", () => {
        vi.useFakeTimers();
        const { container, rerender } = render(<ConsentBanner />);

        fireEvent.click(screen.getByRole("button", { name: "consent.acceptAll" }));
        mockPreferences({ trackingConsent: true, externalMapConsent: true });
        rerender(<ConsentBanner />);

        expect(container.firstChild).not.toBeNull();

        act(() => {
            vi.advanceTimersByTime(150);
        });

        expect(container.firstChild).toBeNull();
    });
});
