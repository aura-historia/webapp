import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CombinationPageSkeleton } from "../CombinationPageSkeleton.tsx";

describe("CombinationPageSkeleton", () => {
    it("renders without crashing", () => {
        const { container } = render(<CombinationPageSkeleton />);
        expect(container.firstChild).toBeTruthy();
    });

    it("renders 8 product grid item skeletons", () => {
        render(<CombinationPageSkeleton />);
        expect(screen.getAllByTestId("product-grid-item-skeleton")).toHaveLength(8);
    });

    it("renders a header skeleton (two animate-pulse elements for title and description)", () => {
        const { container } = render(<CombinationPageSkeleton />);
        const skeletons = container.querySelectorAll(".animate-pulse");
        // CombinationHeaderSkeleton has skeletons; each ProductGridItemSkeleton has several more
        expect(skeletons.length).toBeGreaterThanOrEqual(2);
    });
});
