import { renderWithRouter } from "@/test/utils.tsx";
import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Footer } from "../Footer.tsx";
import { t } from "i18next";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { useLocation } from "@tanstack/react-router";

const { changeLanguageMock } = vi.hoisted(() => ({
    changeLanguageMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/hooks/auth/useAuth", () => ({
    useAuth: vi.fn(() => ({ user: null, isLoading: false, signOut: vi.fn() })),
}));

vi.mock("@/hooks/account/usePatchUserAccount.ts", () => ({
    useUpdateUserAccount: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("@/hooks/account/useUserAccount.ts", () => ({
    useUserAccount: vi.fn(() => ({ data: undefined })),
}));

vi.mock("@/components/common/CurrencySelector.tsx", () => ({
    CurrencySelector: () => null,
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
        expect(screen.getByText("AGB")).toBeInTheDocument();
        expect(screen.getByText("Cookie-Einstellungen")).toBeInTheDocument();
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
        expect(screen.getByText("AGB").closest("a")).toHaveAttribute(
            "href",
            "/terms-and-conditions",
        );
        expect(screen.getByText("Cookie-Einstellungen").closest("a")).toHaveAttribute(
            "href",
            "/consent-settings",
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

    it("should render all social links in follow us section", () => {
        expect(screen.getByLabelText("X")).toBeInTheDocument();
        expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
        expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
        expect(screen.getByLabelText("Facebook")).toBeInTheDocument();
        expect(screen.getByLabelText("Pinterest")).toBeInTheDocument();
        expect(screen.getByLabelText("Reddit")).toBeInTheDocument();
        expect(screen.getByLabelText("YouTube")).toBeInTheDocument();
        expect(screen.getByLabelText("TikTok")).toBeInTheDocument();
    });

    it("should render footer section headings", () => {
        expect(screen.getByText("Unternehmen")).toBeInTheDocument();
        expect(screen.getByText("Mehr entdecken")).toBeInTheDocument();
        expect(screen.getByText("Folge uns")).toBeInTheDocument();
        expect(screen.getByText("Kontakt")).toBeInTheDocument();
    });

    it("should render landing page fragment links", () => {
        expect(screen.getByText("Neueste Zugänge").closest("a")).toHaveAttribute(
            "href",
            "/#recently-added",
        );
        expect(screen.getByText("Transparenz").closest("a")).toHaveAttribute("href", "/#discover");
        expect(screen.getByText("Funktionen").closest("a")).toHaveAttribute("href", "/#features");
        expect(screen.getByText("So funktioniert's").closest("a")).toHaveAttribute(
            "href",
            "/#how-it-works",
        );
        expect(screen.getByText("Nutzerstimmen").closest("a")).toHaveAttribute(
            "href",
            "/#testimonials",
        );
        expect(screen.getByText("Preise").closest("a")).toHaveAttribute("href", "/#pricing");
        expect(screen.getByText("Newsletter").closest("a")).toHaveAttribute("href", "/#newsletter");
        expect(screen.getByText("FAQ").closest("a")).toHaveAttribute("href", "/#faq");
    });

    it("should navigate to the landing page fragment from another route", async () => {
        cleanup();
        const user = userEvent.setup();

        await act(async () => {
            renderWithRouter(
                <>
                    <Footer />
                    <LocationProbe />
                </>,
                { initialEntries: ["/test"] },
            );
        });

        await user.click(screen.getByText("Preise"));

        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("/");
            expect(screen.getByTestId("location-probe")).toHaveTextContent("pricing");
        });
    });

    it("should render contact email", () => {
        const emailLink = screen.getByText("contact@aura-historia.com");
        expect(emailLink).toHaveAttribute("href", "mailto:contact@aura-historia.com");
    });

    it("should render company and contact sections stacked", () => {
        const companyHeading = screen.getByText("Unternehmen");
        const contactHeading = screen.getByText("Kontakt");
        const companyContainer = companyHeading.closest("div")?.parentElement;
        const contactContainer = contactHeading.closest("div")?.parentElement;
        expect(companyContainer).toBe(contactContainer);
    });

    it("should change language", async () => {
        const user = userEvent.setup();

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        const option = screen.getByLabelText("Zu English wechseln");
        await user.click(option);

        await waitFor(() => {
            expect(changeLanguageMock).toHaveBeenCalledWith("en");
        });
    });
});

function LocationProbe() {
    const location = useLocation();

    return (
        <div data-testid="location-probe">
            {JSON.stringify({
                pathname: location.pathname,
                hash: location.hash,
            })}
        </div>
    );
}
