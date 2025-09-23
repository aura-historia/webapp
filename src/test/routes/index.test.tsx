import { LandingPage } from "@/routes";
import { renderWithRouter } from "@/test/utils";
import { act, screen } from "@testing-library/react";
import { beforeEach } from "vitest";

describe("LandingPage", () => {
    beforeEach(async () => {
        await act(() => {
            renderWithRouter(<LandingPage />);
        });
    });

    it("renders the main heading", () => {
        expect(
            screen.getByText("Entdecken, vergleichen, sammeln-", {
                exact: false,
            }),
        ).toBeInTheDocument();
    });

    it("renders the search bar", () => {
        expect(screen.getByPlaceholderText("Ich suche nach...")).toBeInTheDocument();
    });

    it("renders the discover more content section", () => {
        expect(screen.getByText("Discover More Content")).toBeInTheDocument();
        expect(
            screen.getByText("Lorem ipsum dolor sit amet, consectetur adipiscing elit.", {
                exact: false,
            }),
        ).toBeInTheDocument();
    });
});
