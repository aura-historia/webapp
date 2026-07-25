import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchFilterCardSkeleton } from "../SearchFilterCardSkeleton.tsx";

describe("SearchFilterCardSkeleton", () => {
    it("renders a single full-width skeleton bar for the card's CTA button", () => {
        const { container } = render(<SearchFilterCardSkeleton />);
        const footer = container.querySelector(".mt-auto");
        expect(footer?.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(1);
    });
});
