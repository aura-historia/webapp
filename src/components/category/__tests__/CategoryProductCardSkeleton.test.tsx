import { render } from "@testing-library/react";
import { CategoryProductCardSkeleton } from "../CategoryProductCardSkeleton.tsx";

describe("CategoryProductCardSkeleton", () => {
    it("should render without errors", () => {
        const { container } = render(<CategoryProductCardSkeleton />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it("should render skeleton elements", () => {
        const { container } = render(<CategoryProductCardSkeleton />);
        const skeletons = container.querySelectorAll("[data-slot='skeleton']");
        expect(skeletons.length).toBeGreaterThan(0);
    });
});
