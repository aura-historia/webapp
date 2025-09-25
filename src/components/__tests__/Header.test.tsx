import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Header } from "../common/Header.tsx";

describe("Header Component", () => {
    beforeEach(async () => {
        await act(() => {
            renderWithRouter(<Header />);
        });
    });

    it("should render Blitzfilter logo link", () => {
        const logoLink = screen.getByText("Blitzfilter");
        expect(logoLink).toBeInTheDocument();
        expect(logoLink.closest("a")).toHaveAttribute("href", "/");
    });

    it("should renders auth buttons with correct text", () => {
        expect(screen.getByText("Registrieren")).toBeInTheDocument();
        expect(screen.getByText("Einloggen")).toBeInTheDocument();
    });
});
