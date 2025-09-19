import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Footer } from "../Footer";

describe("Footer Component", () => {
    test("renders all navigation links with correct text", async () => {
        await act(() => {
            renderWithRouter(<Footer />);
        });

        expect(screen.getByText("Impressum")).toBeInTheDocument();
        expect(screen.getByText("AGB")).toBeInTheDocument();
    });

    test("renders copyright text with correct year", async () => {
        await act(() => {
            renderWithRouter(<Footer />);
        });

        expect(screen.getByText("© 2025 Blitzfilter")).toBeInTheDocument();
    });

    test("renders navigation links with correct href attributes", async () => {
        await act(() => {
            renderWithRouter(<Footer />);
        });

        expect(screen.getByText("Impressum").closest("a")).toHaveAttribute("href", "/imprint");
        expect(screen.getByText("AGB").closest("a")).toHaveAttribute("href", "/terms");
    });
});
