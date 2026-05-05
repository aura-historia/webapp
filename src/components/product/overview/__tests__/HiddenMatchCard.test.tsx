import { screen, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HiddenMatchCard } from "../HiddenMatchCard.tsx";
import { renderWithRouter } from "@/test/utils.tsx";

describe("HiddenMatchCard", () => {
    it("renders as an article element", async () => {
        await act(() => {
            renderWithRouter(<HiddenMatchCard />);
        });
        expect(document.querySelector("article")).toBeInTheDocument();
    });

    it("renders the lock icon", async () => {
        await act(() => {
            renderWithRouter(<HiddenMatchCard />);
        });
        expect(document.querySelector("svg")).toBeInTheDocument();
    });

    it("renders the title text", async () => {
        await act(() => {
            renderWithRouter(<HiddenMatchCard />);
        });
        expect(screen.getByText(/Verborgen/i)).toBeInTheDocument();
    });

    it("renders the description text", async () => {
        await act(() => {
            renderWithRouter(<HiddenMatchCard />);
        });
        expect(screen.getByText(/Kontingent/i)).toBeInTheDocument();
    });

    it("renders the upgrade button as a link to /#pricing", async () => {
        await act(() => {
            renderWithRouter(<HiddenMatchCard />);
        });
        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();
        expect(link.getAttribute("href")).toContain("#pricing");
    });
});
