import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Footer } from "../Footer.tsx";

describe("Footer Component", () => {
    beforeEach(async () => {
        await act(() => {
            renderWithRouter(<Footer />);
        });
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
});
