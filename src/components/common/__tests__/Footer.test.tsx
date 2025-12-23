import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Footer } from "../Footer.tsx";
import { t } from "i18next";

const { changeLanguageMock } = vi.hoisted(() => ({
    changeLanguageMock: vi.fn(),
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
        await act(() => {
            renderWithRouter(<Footer />);
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        Reflect.deleteProperty(globalThis, "cookieStore");
    });

    it("should render all navigation links with correct text", () => {
        expect(screen.getByText("Impressum")).toBeInTheDocument();
        expect(screen.getByText("AGB")).toBeInTheDocument();
    });

    it("should render copyright text with correct year", () => {
        expect(screen.getByText(`© ${new Date().getFullYear()} Aura Historia`)).toBeInTheDocument();
    });

    it("should render navigation links with correct href attributes", () => {
        expect(screen.getByText("Impressum").closest("a")).toHaveAttribute("href", "/imprint");
        expect(screen.getByText("AGB").closest("a")).toHaveAttribute("href", "/terms");
    });

    it("should change language using cookieStore API when available", async () => {
        const user = userEvent.setup();
        const setCookieMock = vi.fn();
        (globalThis as unknown as { cookieStore: { set: typeof setCookieMock } }).cookieStore = {
            set: setCookieMock,
        };

        // Open the select
        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        // Select English (assuming default is German)
        const option = screen.getByLabelText("Zu Sprache en wechseln");
        await user.click(option);

        expect(setCookieMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "i18next",
                value: "en",
            }),
        );
        expect(changeLanguageMock).toHaveBeenCalledWith("en");
    });

    it("should change language using document.cookie when cookieStore API is not available", async () => {
        const user = userEvent.setup();
        // Ensure cookieStore is not available
        Reflect.deleteProperty(globalThis, "cookieStore");

        // Open the select
        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        // Select English
        const option = screen.getByLabelText("Zu Sprache en wechseln");
        await user.click(option);

        expect(document.cookie).toContain("i18next=en");
        expect(changeLanguageMock).toHaveBeenCalledWith("en");
    });
});
