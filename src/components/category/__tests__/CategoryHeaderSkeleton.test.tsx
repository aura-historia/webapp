import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryHeaderSkeleton } from "../CategoryHeaderSkeleton.tsx";

describe("CategoryHeaderSkeleton", () => {
    it("renders without crashing", () => {
        const { container } = render(<CategoryHeaderSkeleton />);
        expect(container.firstChild).toBeTruthy();
    });

    it("renders two skeleton elements", () => {
        const { container } = render(<CategoryHeaderSkeleton />);
        // The Skeleton component renders divs with the 'animate-pulse' class
        const skeletons = container.querySelectorAll(".animate-pulse");
        expect(skeletons.length).toBeGreaterThanOrEqual(2);
    });

    it("wraps skeletons in a flex column container", () => {
        const { container } = render(<CategoryHeaderSkeleton />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("flex", "flex-col");
    });
});
