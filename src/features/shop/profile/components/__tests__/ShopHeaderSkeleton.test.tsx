import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShopHeaderSkeleton } from "../ShopHeaderSkeleton.tsx";

describe("ShopHeaderSkeleton", () => {
    it("renders without crashing", () => {
        const { container } = render(<ShopHeaderSkeleton />);
        expect(container.firstChild).toBeTruthy();
    });

    it("renders skeleton elements", () => {
        const { container } = render(<ShopHeaderSkeleton />);
        const skeletons = container.querySelectorAll(".animate-pulse");
        expect(skeletons.length).toBeGreaterThanOrEqual(2);
    });

    it("wraps skeletons in a flex column container", () => {
        const { container } = render(<ShopHeaderSkeleton />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("flex", "flex-col");
    });
});
