import { renderWithRouter } from "@/test/utils.tsx";
import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Footer } from "../Footer.tsx";
import { t } from "i18next";
import userEvent from "@testing-library/user-event";

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
    beforeEach(() => {
        changeLanguageMock.mockClear();
        renderWithRouter(<Footer />);
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
