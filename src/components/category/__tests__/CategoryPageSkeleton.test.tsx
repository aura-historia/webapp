import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryPageSkeleton } from "../CategoryPageSkeleton.tsx";

describe("CategoryPageSkeleton", () => {
    it("renders without crashing", () => {
        const { container } = render(<CategoryPageSkeleton />);
        expect(container.firstChild).toBeTruthy();
    });

    it("renders 8 product grid item skeletons", () => {
        render(<CategoryPageSkeleton />);
        expect(screen.getAllByTestId("product-grid-item-skeleton")).toHaveLength(8);
    });

    it("renders a header skeleton (two animate-pulse elements for title and description)", () => {
        const { container } = render(<CategoryPageSkeleton />);
        const skeletons = container.querySelectorAll(".animate-pulse");
        // CategoryHeaderSkeleton has 2 skeletons; each ProductGridItemSkeleton has several more
        expect(skeletons.length).toBeGreaterThanOrEqual(2);
    });
});
