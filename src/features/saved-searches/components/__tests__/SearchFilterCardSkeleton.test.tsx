import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchFilterCardSkeleton, SearchFilterRowSkeleton } from "../SearchFilterCardSkeleton.tsx";

describe("SearchFilterCardSkeleton", () => {
    it("renders a card skeleton hidden from assistive technology", () => {
        render(<SearchFilterCardSkeleton />);
        expect(screen.getByTestId("search-filter-card-skeleton")).toHaveAttribute(
            "aria-hidden",
            "true",
        );
    });
});

describe("SearchFilterRowSkeleton", () => {
    it("renders a row skeleton hidden from assistive technology", () => {
        render(<SearchFilterRowSkeleton />);
        expect(screen.getByTestId("search-filter-row-skeleton")).toHaveAttribute(
            "aria-hidden",
            "true",
        );
    });
});
