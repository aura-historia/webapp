import DiscoverSection from "@/components/landing-page/DiscoverSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import { beforeEach } from "vitest";

describe("DiscoverSection", () => {
    beforeEach(async () => {
        await act(() => {
            renderWithRouter(<DiscoverSection />);
        });
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
