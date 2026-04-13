import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CombinationHeaderSkeleton } from "../CombinationHeaderSkeleton.tsx";

describe("CombinationHeaderSkeleton", () => {
    it("renders without crashing", () => {
        const { container } = render(<CombinationHeaderSkeleton />);
        expect(container.firstChild).toBeTruthy();
    });

    it("renders animate-pulse skeleton elements", () => {
        const { container } = render(<CombinationHeaderSkeleton />);
        const skeletons = container.querySelectorAll(".animate-pulse");
        expect(skeletons.length).toBeGreaterThanOrEqual(2);
    });
});
