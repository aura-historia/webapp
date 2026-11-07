import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShopPageSkeleton } from "../ShopPageSkeleton.tsx";

describe("ShopPageSkeleton", () => {
    it("announces that the provider is loading", () => {
        render(<ShopPageSkeleton />);

        const status = screen.getByRole("status");
        expect(status).toHaveAttribute("aria-busy", "true");
        expect(status).toHaveTextContent("Anbieter wird geladen");
    });

    it("renders a hidden header skeleton", () => {
        render(<ShopPageSkeleton />);

        expect(screen.getByTestId("shop-header-skeleton")).toHaveAttribute("aria-hidden", "true");
    });

    it("renders four listing card skeletons", () => {
        render(<ShopPageSkeleton />);

        expect(screen.getAllByTestId("search-result-skeleton")).toHaveLength(4);
    });
});
