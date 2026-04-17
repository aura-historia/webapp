import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShopPageSkeleton } from "../ShopPageSkeleton.tsx";

describe("ShopPageSkeleton", () => {
    it("renders without crashing", () => {
        const { container } = render(<ShopPageSkeleton />);
        expect(container.firstChild).toBeTruthy();
    });

    it("renders 8 product grid item skeletons", () => {
        render(<ShopPageSkeleton />);
        expect(screen.getAllByTestId("product-grid-item-skeleton")).toHaveLength(8);
    });

    it("renders a header skeleton (animate-pulse elements for title and description)", () => {
        const { container } = render(<ShopPageSkeleton />);
        const skeletons = container.querySelectorAll(".animate-pulse");
        expect(skeletons.length).toBeGreaterThanOrEqual(2);
    });
});
