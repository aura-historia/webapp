import { renderWithRouter } from "@/test/utils.tsx";
import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Footer } from "../Footer.tsx";
import { t } from "i18next";
import userEvent from "@testing-library/user-event";
import { act } from "react";

const { changeLanguageMock } = vi.hoisted(() => ({
    changeLanguageMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("react-i18next", async () => {
    const actual = await vi.importActual("react-i18next");
    return {
        ...actual,
        useTranslation: () => ({
            t: (key: string, options?: { year: number }) => {
                return t(key, options);
            },
            i18n: {
                resolvedLanguage: "de",
                language: "de",
                changeLanguage: changeLanguageMock,
            },
        }),
    };
});

describe("Footer Component", () => {
    beforeEach(async () => {
        changeLanguageMock.mockClear();
        await act(async () => {
            renderWithRouter(<Footer />);
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        Reflect.deleteProperty(globalThis, "cookieStore");
    });

    it("should render all navigation links with correct text", () => {
        expect(screen.getByText("Impressum")).toBeInTheDocument();
        expect(screen.getByText("Datenschutzerklärung")).toBeInTheDocument();
    });

    it("should render copyright text with correct year", () => {
        expect(screen.getByText(`© ${new Date().getFullYear()} Aura Historia`)).toBeInTheDocument();
    });

    it("should render navigation links with correct href attributes", () => {
        expect(screen.getByText("Impressum").closest("a")).toHaveAttribute("href", "/imprint");
        expect(screen.getByText("Datenschutzerklärung").closest("a")).toHaveAttribute(
            "href",
            "/privacy",
        );
    });

    it("should render social media icons with correct links", () => {
        const xLink = screen.getByLabelText("X");
        expect(xLink).toHaveAttribute("href", "https://x.com/aurahistoria");
        expect(xLink).toHaveAttribute("target", "_blank");

        const instagramLink = screen.getByLabelText("Instagram");
        expect(instagramLink).toHaveAttribute("href", "https://www.instagram.com/aura_historia/");

        const youtubeLink = screen.getByLabelText("YouTube");
        expect(youtubeLink).toHaveAttribute("href", "https://www.youtube.com/@aurahistoria");
    });

    it("should render social media text links in follow us section", () => {
        const followUsSection = screen.getByText("Folge uns").closest("div");
        expect(followUsSection).not.toBeNull();

        const socialTextLink = followUsSection?.querySelector(
            'a[href="https://x.com/aurahistoria"]',
        );
        expect(socialTextLink).toBeInTheDocument();

        expect(screen.getByText("Instagram")).toBeInTheDocument();
        expect(screen.getByText("YouTube")).toBeInTheDocument();
        expect(screen.getByText("TikTok")).toBeInTheDocument();
    });

    it("should render footer section headings", () => {
        expect(screen.getByText("Unternehmen")).toBeInTheDocument();
        expect(screen.getByText("Folge uns")).toBeInTheDocument();
        expect(screen.getByText("Kontakt")).toBeInTheDocument();
    });

    it("should render contact email", () => {
        const emailLink = screen.getByText("contact@aura-historia.com");
        expect(emailLink).toHaveAttribute("href", "mailto:contact@aura-historia.com");
    });

    it("should change language", async () => {
        const user = userEvent.setup();

        // Open the select
        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        // Select English (assuming default is German)
        const option = screen.getByLabelText("Zu English wechseln");
        await user.click(option);

        await waitFor(() => {
            expect(changeLanguageMock).toHaveBeenCalledWith("en");
        });
    });
});
