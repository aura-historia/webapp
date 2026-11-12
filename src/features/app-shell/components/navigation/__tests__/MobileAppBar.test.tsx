import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileAppBar } from "../MobileAppBar.tsx";

const mockSearch = vi.hoisted(() => ({ isOnShopSearch: false }));

vi.mock("@/features/search/common/hooks/useGlobalSearchSubmit.ts", () => ({
    useGlobalSearchSubmit: () => ({
        currentQuery: "",
        isOnShopSearch: mockSearch.isOnShopSearch,
        isPending: false,
        submit: vi.fn(),
    }),
}));

vi.mock("@/features/search/common/hooks/useSearchQueryContext.tsx", () => ({
    useSearchQueryContext: () => ({ setQuery: vi.fn() }),
}));

describe("MobileAppBar", () => {
    beforeEach(() => {
        mockSearch.isOnShopSearch = false;
    });

    it("names objects and providers in the field and shows the filter button with filters", () => {
        render(<MobileAppBar filterCount={2} filtersOpen={false} onFilters={vi.fn()} />);
        expect(screen.getByPlaceholderText("Objekte oder Anbieter suchen")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Filter/ })).toBeInTheDocument();
    });

    it("drops the filter button and searches providers by name on provider search", () => {
        mockSearch.isOnShopSearch = true;
        render(<MobileAppBar />);
        expect(screen.getByPlaceholderText("Anbieter nach Namen suchen")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Filter/ })).not.toBeInTheDocument();
    });
});
