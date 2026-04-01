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

vi.mock("@aws-amplify/ui-react", () => ({
    useAuthenticator: vi.fn(() => ({ user: null })),
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

const mockCategoriesData = [
    {
        categoryId: "jewelry-personal-adornment",
        categoryKey: "JEWELRY_PERSONAL_ADORNMENT",
        name: { text: "Schmuck" },
    },
    { categoryId: "furniture", categoryKey: "FURNITURE", name: { text: "Möbel" } },
    { categoryId: "visual-art", categoryKey: "VISUAL_ART", name: { text: "Bildende Kunst" } },
];

const mockPeriodsData = [
    { periodId: "baroque", periodKey: "BAROQUE", name: { text: "Barock" } },
    { periodId: "art-nouveau", periodKey: "ART_NOUVEAU", name: { text: "Jugendstil" } },
    { periodId: "art-deco", periodKey: "ART_DECO", name: { text: "Art Déco" } },
];

vi.mock("@tanstack/react-query", async () => {
    const actual = await vi.importActual("@tanstack/react-query");
    return {
        ...actual,
        useQuery: vi.fn(({ queryKey }: { queryKey: Array<{ _id?: string }> }) => {
            if (queryKey[0]?._id === "getCategories") {
                return { data: mockCategoriesData };
            }
            if (queryKey[0]?._id === "getPeriods") {
                return { data: mockPeriodsData };
            }
            return { data: undefined };
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
        expect(screen.getByText("Kategorien")).toBeInTheDocument();
        expect(screen.getByText("Epochen & Stile")).toBeInTheDocument();
    });

    it("should render contact email", () => {
        const emailLink = screen.getByText("contact@aura-historia.com");
        expect(emailLink).toHaveAttribute("href", "mailto:contact@aura-historia.com");
    });

    it("should render popular category links", () => {
        const categoriesSection = screen.getByText("Kategorien").closest("div");
        expect(categoriesSection).not.toBeNull();

        expect(screen.getByText("Schmuck")).toBeInTheDocument();
        expect(screen.getByText("Möbel")).toBeInTheDocument();
        expect(screen.getByText("Bildende Kunst")).toBeInTheDocument();

        expect(screen.getByText("Schmuck").closest("a")).toHaveAttribute(
            "href",
            "/categories/jewelry-personal-adornment",
        );
        expect(screen.getByText("Möbel").closest("a")).toHaveAttribute(
            "href",
            "/categories/furniture",
        );
    });

    it("should render popular period links", () => {
        const periodsSection = screen.getByText("Epochen & Stile").closest("div");
        expect(periodsSection).not.toBeNull();

        expect(screen.getByText("Barock")).toBeInTheDocument();
        expect(screen.getByText("Jugendstil")).toBeInTheDocument();
        expect(screen.getByText("Art Déco")).toBeInTheDocument();

        expect(screen.getByText("Barock").closest("a")).toHaveAttribute("href", "/periods/baroque");
        expect(screen.getByText("Jugendstil").closest("a")).toHaveAttribute(
            "href",
            "/periods/art-nouveau",
        );
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
