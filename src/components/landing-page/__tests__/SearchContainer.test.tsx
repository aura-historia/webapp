import SearchContainer from "@/components/landing-page/SearchContainer.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import { beforeEach } from "vitest";

describe("SearchContainer", () => {
    beforeEach(async () => {
        await act(() => {
            renderWithRouter(<SearchContainer />);
        });
    });

    it("renders the main heading", () => {
        expect(
            screen.getByText("Hör auf, Zeit bei der Suche nach Antiquitäten zu verschwenden", {
                exact: false,
            }),
        ).toBeInTheDocument();
    });

    it("renders the search bar", () => {
        expect(screen.getByPlaceholderText("Ich suche nach...")).toBeInTheDocument();
    });
});
